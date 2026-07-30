import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";
import { jumlahkanSetoran, normalisasiJumlah, sisaBelumDitugaskan } from "@/lib/pengrajin";
import { dariTanggalInputWIB } from "@/lib/waktu";

export const dynamic = "force-dynamic";

const ambilId = async (params: Promise<{ id: string }>) => {
  const { id } = await params;
  const angka = Number(id);
  return Number.isInteger(angka) ? angka : null;
};

// PATCH /api/penugasan/[id] — pindah pengrajin, ubah jumlah atau tenggat.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const id = await ambilId(params);
    if (id === null) {
      return NextResponse.json({ error: "ID penugasan tidak sah." }, { status: 400 });
    }

    const body = await request.json();

    const hasil = await prisma.$transaction(async (tx) => {
      const sebelum = await tx.penugasan.findUnique({
        where: { id },
        include: {
          pengrajin: { select: { id: true, nama: true } },
          setoran: { select: { jumlah: true } },
          transactionItem: {
            select: {
              id: true,
              jumlah: true,
              satuanHarga: true,
              product: { select: { nama_produk: true } },
              penugasan: { select: { id: true, jumlahDitugaskan: true } },
            },
          },
        },
      });

      if (!sebelum) return { gagal: "Penugasan tidak ditemukan." as const, kodeHttp: 404 };

      const sudahDisetor = jumlahkanSetoran(sebelum.setoran);
      const data: {
        pengrajinId?: number;
        jumlahDitugaskan?: number;
        tenggat?: Date;
        catatan?: string | null;
      } = {};

      // Memindahkan penugasan yang sudah punya setoran akan memutus kaitan
      // antara setoran dan orang yang benar-benar mengerjakannya.
      if (body?.pengrajinId !== undefined) {
        const pengrajinId = Number(body.pengrajinId);
        if (!Number.isInteger(pengrajinId)) {
          return { gagal: "Pengrajin tidak sah." as const, kodeHttp: 400 };
        }
        if (pengrajinId !== sebelum.pengrajinId && sudahDisetor > 0) {
          return {
            gagal:
              `Penugasan ini sudah punya setoran dari ${sebelum.pengrajin.nama}, jadi tidak bisa dipindah. Kurangi jumlahnya lalu buat penugasan baru untuk sisanya.` as const,
            kodeHttp: 400,
          };
        }
        const pengrajin = await tx.pengrajin.findUnique({
          where: { id: pengrajinId },
          select: { id: true, nama: true, aktif: true },
        });
        if (!pengrajin) return { gagal: "Pengrajin tidak ditemukan." as const, kodeHttp: 404 };
        if (!pengrajin.aktif) {
          return {
            gagal: `${pengrajin.nama} sudah tidak aktif.` as const,
            kodeHttp: 400,
          };
        }
        data.pengrajinId = pengrajinId;
      }

      if (body?.jumlahDitugaskan !== undefined) {
        const jumlah = normalisasiJumlah(body.jumlahDitugaskan);
        if (jumlah === null) {
          return {
            gagal: "Jumlah yang ditugaskan harus lebih besar dari nol." as const,
            kodeHttp: 400,
          };
        }

        if (jumlah < sudahDisetor) {
          return {
            gagal:
              `Sudah disetor ${sudahDisetor} ${sebelum.transactionItem.satuanHarga}, jadi jumlah penugasan tidak boleh kurang dari itu.` as const,
            kodeHttp: 400,
          };
        }

        // Total penugasan pada baris ini tidak boleh melebihi jumlah dipesan.
        const penugasanLain = sebelum.transactionItem.penugasan.filter((p) => p.id !== id);
        const sisaUntukPenugasanIni =
          sisaBelumDitugaskan(sebelum.transactionItem.jumlah, penugasanLain);

        if (jumlah > sisaUntukPenugasanIni) {
          return {
            gagal:
              `Maksimal ${sisaUntukPenugasanIni} ${sebelum.transactionItem.satuanHarga} untuk penugasan ini, karena sisanya sudah dipegang pengrajin lain.` as const,
            kodeHttp: 400,
          };
        }

        data.jumlahDitugaskan = jumlah;
      }

      if (body?.tenggat !== undefined) {
        const diurai = dariTanggalInputWIB(String(body.tenggat));
        if (!diurai) {
          return {
            gagal: "Tanggal tenggat tidak sah. Pakai format YYYY-MM-DD." as const,
            kodeHttp: 400,
          };
        }
        data.tenggat = diurai;
      }

      if (body?.catatan !== undefined) {
        data.catatan = typeof body.catatan === "string" ? body.catatan.trim() || null : null;
      }

      const sesudah = await tx.penugasan.update({
        where: { id },
        data,
        include: { pengrajin: { select: { nama: true } } },
      });

      return { sebelum, sesudah };
    });

    if ("gagal" in hasil) {
      return NextResponse.json({ error: hasil.gagal }, { status: hasil.kodeHttp });
    }

    const perubahan: string[] = [];
    if (hasil.sebelum.pengrajinId !== hasil.sesudah.pengrajinId) {
      perubahan.push(`pengrajin ${hasil.sebelum.pengrajin.nama} → ${hasil.sesudah.pengrajin.nama}`);
    }
    if (hasil.sebelum.jumlahDitugaskan !== hasil.sesudah.jumlahDitugaskan) {
      perubahan.push(
        `jumlah ${hasil.sebelum.jumlahDitugaskan} → ${hasil.sesudah.jumlahDitugaskan}`
      );
    }
    if (hasil.sebelum.tenggat.getTime() !== hasil.sesudah.tenggat.getTime()) {
      perubahan.push("tenggat diubah");
    }

    await recordActivityLog({
      action: "UPDATE",
      entity: "Penugasan",
      entityId: id,
      title: `Penugasan diubah: ${hasil.sebelum.transactionItem.product.nama_produk}`,
      description: `${actor.name} mengubah penugasan${perubahan.length ? ` — ${perubahan.join(", ")}` : ""}.`,
      actor,
      metadata: { sebelum: hasil.sebelum, sesudah: hasil.sesudah },
    });

    return NextResponse.json(hasil.sesudah);
  } catch (error) {
    console.error("Gagal mengubah penugasan:", error);
    return NextResponse.json({ error: "Gagal mengubah penugasan." }, { status: 500 });
  }
}

// DELETE /api/penugasan/[id]
//
// Ditolak bila sudah ada setoran: setoran itu sudah menjadi dasar upah yang
// mungkin telah dibayar, jadi menghapusnya akan melubangi saldo.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const id = await ambilId(params);
    if (id === null) {
      return NextResponse.json({ error: "ID penugasan tidak sah." }, { status: 400 });
    }

    const penugasan = await prisma.penugasan.findUnique({
      where: { id },
      include: {
        pengrajin: { select: { nama: true } },
        setoran: { select: { id: true } },
        transactionItem: {
          select: { satuanHarga: true, product: { select: { nama_produk: true } } },
        },
      },
    });

    if (!penugasan) {
      return NextResponse.json({ error: "Penugasan tidak ditemukan." }, { status: 404 });
    }

    if (penugasan.setoran.length > 0) {
      return NextResponse.json(
        {
          error: `Penugasan ini sudah punya ${penugasan.setoran.length} setoran yang menjadi dasar upah ${penugasan.pengrajin.nama}, jadi tidak bisa dihapus. Hapus setorannya lebih dulu bila memang salah catat.`,
        },
        { status: 400 }
      );
    }

    await prisma.penugasan.delete({ where: { id } });

    await recordActivityLog({
      action: "HAPUS",
      entity: "Penugasan",
      entityId: id,
      title: `Penugasan dibatalkan: ${penugasan.transactionItem.product.nama_produk}`,
      description: `${actor.name} membatalkan penugasan ${penugasan.jumlahDitugaskan} ${penugasan.transactionItem.satuanHarga} ${penugasan.transactionItem.product.nama_produk} untuk ${penugasan.pengrajin.nama}.`,
      actor,
    });

    return NextResponse.json({ sukses: true });
  } catch (error) {
    console.error("Gagal menghapus penugasan:", error);
    return NextResponse.json({ error: "Gagal menghapus penugasan." }, { status: 500 });
  }
}
