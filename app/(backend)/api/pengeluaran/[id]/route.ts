import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole } from "@/lib/apiAuth";
import {
  isKategoriPengeluaran,
  isMetodePengeluaran,
  normalisasiNominal,
} from "@/lib/pengeluaran";
import { deleteReceiptImageFromStorage } from "@/lib/supabaseStorage";
import { dariTanggalInputWIB } from "@/lib/waktu";

export const dynamic = "force-dynamic";

const rupiah = (nilai: number) => `Rp${nilai.toLocaleString("id-ID")}`;

// PATCH /api/pengeluaran/[id] — koreksi pengeluaran yang salah catat.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID pengeluaran tidak sah." }, { status: 400 });
    }

    const sebelum = await prisma.expense.findUnique({ where: { id } });
    if (!sebelum) {
      return NextResponse.json({ error: "Pengeluaran tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const data: {
      nominal?: number;
      kategori?: string;
      metode?: string;
      catatan?: string | null;
      fotoUrl?: string | null;
      tanggal?: Date;
    } = {};

    if (body?.nominal !== undefined) {
      const nominal = normalisasiNominal(body.nominal);
      if (nominal === null) {
        return NextResponse.json(
          { error: "Nominal harus berupa angka lebih besar dari nol." },
          { status: 400 }
        );
      }
      data.nominal = nominal;
    }

    if (body?.kategori !== undefined) {
      if (!isKategoriPengeluaran(body.kategori)) {
        return NextResponse.json({ error: "Kategori tidak dikenal." }, { status: 400 });
      }
      data.kategori = body.kategori;
    }

    if (body?.metode !== undefined) {
      if (!isMetodePengeluaran(body.metode)) {
        return NextResponse.json({ error: "Metode pembayaran tidak dikenal." }, { status: 400 });
      }
      data.metode = body.metode;
    }

    if (body?.tanggal !== undefined) {
      const diurai = dariTanggalInputWIB(String(body.tanggal));
      if (!diurai) {
        return NextResponse.json(
          { error: "Tanggal tidak sah. Pakai format YYYY-MM-DD." },
          { status: 400 }
        );
      }
      data.tanggal = diurai;
    }

    if (body?.catatan !== undefined) {
      data.catatan = typeof body.catatan === "string" ? body.catatan.trim() || null : null;
    }

    if (body?.fotoUrl !== undefined) {
      data.fotoUrl = typeof body.fotoUrl === "string" ? body.fotoUrl.trim() || null : null;
    }

    const sesudah = await prisma.expense.update({ where: { id }, data });

    // Foto lama yang diganti tidak perlu ditahan di storage.
    if (data.fotoUrl !== undefined && sebelum.fotoUrl && sebelum.fotoUrl !== sesudah.fotoUrl) {
      await deleteReceiptImageFromStorage(sebelum.fotoUrl).catch(() => {});
    }

    const perubahan: string[] = [];
    if (sebelum.nominal !== sesudah.nominal) {
      perubahan.push(`nominal ${rupiah(sebelum.nominal)} → ${rupiah(sesudah.nominal)}`);
    }
    if (sebelum.kategori !== sesudah.kategori) {
      perubahan.push(`kategori ${sebelum.kategori} → ${sesudah.kategori}`);
    }

    await recordActivityLog({
      action: "UPDATE",
      entity: "Pengeluaran",
      entityId: id,
      title: `Pengeluaran diubah: ${sesudah.kategori}`,
      description: `${actor.name} mengubah pengeluaran ID ${id}${perubahan.length ? ` — ${perubahan.join(", ")}` : ""}.`,
      actor,
      metadata: { sebelum, sesudah },
    });

    return NextResponse.json(sesudah);
  } catch (error) {
    console.error("Gagal mengubah pengeluaran:", error);
    return NextResponse.json({ error: "Gagal mengubah pengeluaran." }, { status: 500 });
  }
}

// DELETE /api/pengeluaran/[id] — hapus pengeluaran salah catat.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID pengeluaran tidak sah." }, { status: 400 });
    }

    const pengeluaran = await prisma.expense.findUnique({ where: { id } });
    if (!pengeluaran) {
      return NextResponse.json({ error: "Pengeluaran tidak ditemukan." }, { status: 404 });
    }

    await prisma.expense.delete({ where: { id } });
    if (pengeluaran.fotoUrl) {
      await deleteReceiptImageFromStorage(pengeluaran.fotoUrl).catch(() => {});
    }

    await recordActivityLog({
      action: "HAPUS",
      entity: "Pengeluaran",
      entityId: id,
      title: `Pengeluaran dihapus: ${pengeluaran.kategori} ${rupiah(pengeluaran.nominal)}`,
      description: `${actor.name} menghapus pengeluaran ${pengeluaran.kategori} sebesar ${rupiah(pengeluaran.nominal)}.`,
      actor,
      metadata: { pengeluaran },
    });

    return NextResponse.json({ sukses: true });
  } catch (error) {
    console.error("Gagal menghapus pengeluaran:", error);
    return NextResponse.json({ error: "Gagal menghapus pengeluaran." }, { status: 500 });
  }
}
