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
import { PCS_PER_UNIT } from "@/lib/satuan";

// Membandingkan beban kerja lintas satuan hanya sah setelah disamakan ke pcs:
// 2 gross dan 5 lusin tidak bisa dijumlahkan mentah-mentah menjadi "7 unit".
const kePcs = (jumlah: number, satuan: string) => jumlah * (PCS_PER_UNIT[satuan] ?? 1);

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

    // ---- Blok 1: SELURUH baris pesanan aktif, dikelompokkan per nota --------
    //
    // Sengaja TIDAK menyaring yang sudah ditugaskan. Dulu baris hilang begitu
    // dapat pengrajin, sehingga kartu sebuah nota makin lama makin kosong dan
    // gambaran utuh pesanan itu justru lenyap — orang jadi tidak tahu lagi
    // siapa yang mengerjakan apa tanpa pindah blok. Sekarang barisnya tetap
    // ada, hanya berganti status dan menyebut pengrajinnya.
    const barisDenganStatus = barisPesanan.map((baris) => {
      const sisaBagi = sisaBelumDitugaskan(baris.jumlah, baris.penugasan);

      const pemegang = baris.penugasan.map((tugas) => {
        const disetor = jumlahkanSetoran(tugas.setoran);
        return {
          penugasanId: tugas.id,
          pengrajinId: tugas.pengrajin.id,
          namaPengrajin: tugas.pengrajin.nama,
          jumlahDitugaskan: tugas.jumlahDitugaskan,
          sudahDisetor: disetor,
          sisa: Math.max(0, tugas.jumlahDitugaskan - disetor),
          tuntas: disetor >= tugas.jumlahDitugaskan,
          tenggat: tugas.tenggat,
          terlambat: terlambat(tugas.tenggat, sekarang),
        };
      });

      const semuaTuntas = pemegang.length > 0 && pemegang.every((p) => p.tuntas);

      // "belum"    → belum ada yang memegang sama sekali
      // "sebagian" → sudah ada yang memegang, tapi masih ada sisa untuk dibagi
      // "dikerjakan" → seluruhnya sudah dibagi, sedang digarap
      // "selesai"  → seluruhnya sudah dibagi DAN sudah disetor
      const status: "belum" | "sebagian" | "dikerjakan" | "selesai" =
        sisaBagi >= baris.jumlah
          ? "belum"
          : sisaBagi > 0
            ? "sebagian"
            : semuaTuntas
              ? "selesai"
              : "dikerjakan";

      return {
        transactionItemId: baris.id,
        namaProduk: baris.product.nama_produk,
        productId: baris.product.id,
        variantName: baris.variantName,
        label: baris.label,
        satuan: baris.satuanHarga,
        jumlahDipesan: baris.jumlah,
        sisa: sisaBagi,
        status,
        packed: baris.packed,
        pemegang,
        transaksi: baris.transaction,
      };
    });

    const urutanStatus = { belum: 0, sebagian: 1, dikerjakan: 2, selesai: 3 } as const;

    const notaAktif = Array.from(
      barisDenganStatus
        .reduce((peta, baris) => {
          const isi = peta.get(baris.transaksi.id) ?? {
            transaksi: baris.transaksi,
            baris: [] as typeof barisDenganStatus,
          };
          isi.baris.push(baris);
          peta.set(baris.transaksi.id, isi);
          return peta;
        }, new Map<number, { transaksi: (typeof barisDenganStatus)[number]["transaksi"]; baris: typeof barisDenganStatus }>())
        .values()
    )
      .map((nota) => ({
        ...nota,
        // Yang belum dibagi naik ke atas supaya tetap menonjol sebagai
        // jaring pengaman, meski barisnya kini bercampur dengan yang lain.
        baris: nota.baris.sort(
          (a, b) => urutanStatus[a.status] - urutanStatus[b.status]
        ),
        jumlahBelumDibagi: nota.baris.filter(
          (b) => b.status === "belum" || b.status === "sebagian"
        ).length,
        jumlahSelesai: nota.baris.filter((b) => b.status === "selesai").length,
      }))
      // Nota terlama lebih dulu — itu yang paling dekat hari kirimnya.
      .sort((a, b) => a.transaksi.tanggal.getTime() - b.transaksi.tanggal.getTime());

    const belumDitugaskan = barisDenganStatus.filter((baris) => baris.sisa > 0);

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
      sisaPcs: number;
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
          sisaPcs: kePcs(sisa, baris.satuanHarga),
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
          // pcs HANYA untuk mengurutkan — supaya 2 gross tidak kalah "sibuk"
          // dari 3 lusin. Angka ini tidak untuk ditampilkan: pemakainya
          // berpikir dalam gross dan lusin, bukan pcs.
          sisaPcs: miliknya.reduce((total, t) => total + t.sisaPcs, 0),
          // Yang DITAMPILKAN: rincian menurut satuan aslinya, mis.
          // "2 Gross · 3 Lusin". Kalau semua pekerjaannya satu satuan, ia
          // otomatis tampil sebagai satu angka saja.
          rincianSatuan: Array.from(
            miliknya
              .reduce((peta, t) => {
                peta.set(t.satuan, (peta.get(t.satuan) ?? 0) + t.sisa);
                return peta;
              }, new Map<string, number>())
              .entries()
          ).map(([satuan, jumlah]) => ({ satuan, jumlah })),
          adaTerlambat: miliknya.some((t) => t.terlambat),
          masihKosong: miliknya.length === 0,
        };
      })
      // Paling sedikit dulu — inilah jawaban "siapa yang belum dapat kerjaan".
      .sort((a, b) => a.sisaPcs - b.sisaPcs || a.jumlahTugas - b.jumlahTugas);

    return NextResponse.json({
      notaAktif,
      pekerjaanPerPengrajin,
      bebanKerja,
      ringkasan: {
        barisBelumDibagi: belumDitugaskan.length,
        notaAktif: notaAktif.length,
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
