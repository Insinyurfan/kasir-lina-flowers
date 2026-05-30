import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); 

    let startDate, endDate;
    
    if (dateParam) {
      startDate = new Date(dateParam + "T00:00:00.000Z");
      endDate = new Date(dateParam + "T23:59:59.999Z");
    } else {
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      startDate = new Date(dateString + "T00:00:00.000Z");
      endDate = new Date(dateString + "T23:59:59.999Z");
    }

    // Ambil SEMUA barang yang terjual (Transaction Item) dari transaksi yang LUNAS pada tanggal tersebut
    const terjual = await prisma.transactionItem.findMany({
      where: {
        transaction: {
          tanggal: { gte: startDate, lte: endDate },
          status: "Paid",
        },
      },
      include: {
        product: true, // Ambil juga detail produknya (nama bunga)
      },
    });

    // Mengelompokkan data (Misal: 2 struk berbeda beli mawar, kita gabungkan jumlahnya)
    const rekapLaporan: Record<number, any> = {};

    terjual.forEach((item) => {
      const pId = item.productId;
      if (!rekapLaporan[pId]) {
        rekapLaporan[pId] = {
          id: pId,
          nama_produk: item.product.nama_produk,
          jumlah_terjual: 0,
          total_pendapatan: 0,
        };
      }
      rekapLaporan[pId].jumlah_terjual += item.jumlah;
      rekapLaporan[pId].total_pendapatan += item.subtotal;
    });

    // Ubah format objek menjadi array agar mudah ditampilkan di tabel frontend
    const hasilAkhir = Object.values(rekapLaporan).sort((a: any, b: any) => b.jumlah_terjual - a.jumlah_terjual); // Urutkan dari yang paling laris

    return NextResponse.json(hasilAkhir);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data laporan" },
      { status: 500 }
    );
  }
}