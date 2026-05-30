import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); 

    let startDate, endDate;
    
    if (dateParam) {
      // Jika kasir memilih tanggal tertentu
      startDate = new Date(dateParam + "T00:00:00.000Z");
      endDate = new Date(dateParam + "T23:59:59.999Z");
    } else {
      // Default: Hari ini
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
      startDate = new Date(dateString + "T00:00:00.000Z");
      endDate = new Date(dateString + "T23:59:59.999Z");
    }

    // Menghitung jumlah transaksi dan menjumlahkan total uang (khusus yang Lunas/Paid)
    const aggregations = await prisma.transaction.aggregate({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
        status: "Paid" 
      },
      _count: {
        id: true,
      },
      _sum: {
        total_harga: true,
      },
    });

    return NextResponse.json({
      periode: dateParam || new Date().toISOString().split('T')[0],
      totalTransaksi: aggregations._count.id || 0,
      pendapatan: aggregations._sum.total_harga || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard" },
      { status: 500 }
    );
  }
}