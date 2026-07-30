import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import {
  hariKeTenggat,
  jumlahkanSetoran,
  sisaBelumDitugaskan,
  sisaPenugasan,
  terlambat,
} from "@/lib/pengrajin";

export const dynamic = "force-dynamic";

// Pesanan yang sudah Selesai tidak lagi perlu dikerjakan siapa pun.
const PENGIRIMAN_SELESAI = "Selesai";

// GET /api/papan-tugas
//
// Tiga blok sekaligus, karena ketiganya dibaca dalam satu tarikan napas pagi
// hari: apa yang belum dibagi, siapa mengerjakan apa, dan siapa masih kosong.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return auth.response;

    const sekarang = new Date();

    const [barisPesanan, pengrajinAktif] = await Promise.all([
      prisma.transactionItem.findMany({
        where: { transaction: { status_pengiriman: { not: PENGIRIMAN_SELESAI } } },
        select: {
          id: true,
          jumlah: true,
          satuanHarga: true,
          variantName: true,
          label: true,
          packed: true,
          product: { select: { id: true, nama_produk: true } },
          transaction: {
            select: {
              id: true,
              trxNumber: true,
              tanggal: true,
              nama_pembeli: true,
              status_pengiriman: true,
            },
          },
          penugasan: {
            include: {
              pengrajin: { select: { id: true, nama: true, aktif: true } },
              setoran: { select: { jumlah: true } },
            },
            orderBy: { id: "asc" },
          },
        },
        orderBy: { id: "asc" },
      }),
      prisma.pengrajin.findMany({
        where: { aktif: true },
        select: { id: true, nama: true, kelompok: { select: { id: true, nama: true } } },
        orderBy: { nama: "asc" },
      }),
    ]);

    // ---- Blok 1: baris yang belum (atau kurang) ditugaskan ------------------
    const belumDitugaskan = barisPesanan
      .map((baris) => ({
        transactionItemId: baris.id,
        namaProduk: baris.product.nama_produk,
        productId: baris.product.id,
        variantName: baris.variantName,
        label: baris.label,
        satuan: baris.satuanHarga,
        jumlahDipesan: baris.jumlah,
        sisa: sisaBelumDitugaskan(baris.jumlah, baris.penugasan),
        transaksi: baris.transaction,
      }))
      .filter((baris) => baris.sisa > 0)
      // Nota terlama lebih dulu — itu yang paling dekat hari kirimnya.
      .sort((a, b) => a.transaksi.tanggal.getTime() - b.transaksi.tanggal.getTime());

    // ---- Blok 2: pekerjaan aktif per pengrajin ------------------------------
    type BarisTugas = {
      penugasanId: number;
      pengrajinId: number;
      namaPengrajin: string;
      namaProduk: string;
      variantName: string | null;
      satuan: string;
      jumlahDitugaskan: number;
      sudahDisetor: number;
      sisa: number;
      tenggat: Date;
      terlambat: boolean;
      hariKeTenggat: number;
      catatan: string | null;
      transaksi: { id: number; trxNumber: number | null; nama_pembeli: string | null };
      transactionItemId: number;
      packed: boolean;
    };

    const tugasAktif: BarisTugas[] = [];

    for (const baris of barisPesanan) {
      for (const tugas of baris.penugasan) {
        const sisa = sisaPenugasan(tugas.jumlahDitugaskan, tugas.setoran);
        if (sisa <= 0) continue; // sudah tuntas disetor → hilang dari papan

        tugasAktif.push({
          penugasanId: tugas.id,
          pengrajinId: tugas.pengrajin.id,
          namaPengrajin: tugas.pengrajin.nama,
          namaProduk: baris.product.nama_produk,
          variantName: baris.variantName,
          satuan: baris.satuanHarga,
          jumlahDitugaskan: tugas.jumlahDitugaskan,
          sudahDisetor: jumlahkanSetoran(tugas.setoran),
          sisa,
          tenggat: tugas.tenggat,
          terlambat: terlambat(tugas.tenggat, sekarang),
          hariKeTenggat: hariKeTenggat(tugas.tenggat, sekarang),
          catatan: tugas.catatan,
          transaksi: {
            id: baris.transaction.id,
            trxNumber: baris.transaction.trxNumber,
            nama_pembeli: baris.transaction.nama_pembeli,
          },
          transactionItemId: baris.id,
          packed: baris.packed,
        });
      }
    }

    // Terlambat lebih dulu, lalu tenggat terdekat.
    const urutkanTugas = (a: BarisTugas, b: BarisTugas) =>
      Number(b.terlambat) - Number(a.terlambat) || a.tenggat.getTime() - b.tenggat.getTime();

    const perPengrajin = new Map<
      number,
      { pengrajinId: number; nama: string; kelompok: string | null; tugas: BarisTugas[] }
    >();

    const kelompokPerPengrajin = new Map(
      pengrajinAktif.map((p) => [p.id, p.kelompok?.nama ?? null])
    );

    for (const tugas of tugasAktif) {
      const kelompok = perPengrajin.get(tugas.pengrajinId) ?? {
        pengrajinId: tugas.pengrajinId,
        nama: tugas.namaPengrajin,
        kelompok: kelompokPerPengrajin.get(tugas.pengrajinId) ?? null,
        tugas: [],
      };
      kelompok.tugas.push(tugas);
      perPengrajin.set(tugas.pengrajinId, kelompok);
    }

    const pekerjaanPerPengrajin = Array.from(perPengrajin.values())
      .map((p) => ({
        ...p,
        tugas: p.tugas.sort(urutkanTugas),
        adaTerlambat: p.tugas.some((t) => t.terlambat),
      }))
      // Yang punya pekerjaan terlambat naik ke atas.
      .sort(
        (a, b) => Number(b.adaTerlambat) - Number(a.adaTerlambat) || a.nama.localeCompare(b.nama)
      );

    // ---- Blok 3: siapa masih kosong ----------------------------------------
    const bebanKerja = pengrajinAktif
      .map((p) => {
        const miliknya = tugasAktif.filter((t) => t.pengrajinId === p.id);
        return {
          pengrajinId: p.id,
          nama: p.nama,
          kelompok: p.kelompok?.nama ?? null,
          jumlahTugas: miliknya.length,
          sisaUnit: miliknya.reduce((total, t) => total + t.sisa, 0),
          adaTerlambat: miliknya.some((t) => t.terlambat),
          masihKosong: miliknya.length === 0,
        };
      })
      // Paling sedikit dulu — inilah jawaban "siapa yang belum dapat kerjaan".
      .sort((a, b) => a.sisaUnit - b.sisaUnit || a.jumlahTugas - b.jumlahTugas);

    return NextResponse.json({
      belumDitugaskan,
      pekerjaanPerPengrajin,
      bebanKerja,
      ringkasan: {
        barisBelumDibagi: belumDitugaskan.length,
        tugasAktif: tugasAktif.length,
        tugasTerlambat: tugasAktif.filter((t) => t.terlambat).length,
        pengrajinKosong: bebanKerja.filter((p) => p.masihKosong).length,
      },
    });
  } catch (error) {
    console.error("Gagal memuat papan tugas:", error);
    return NextResponse.json({ error: "Gagal memuat papan tugas." }, { status: 500 });
  }
}
