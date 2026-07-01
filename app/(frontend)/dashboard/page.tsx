"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, FileText, TrendingUp, Clock, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";

type TransactionItem = {
  jumlah: number;
  subtotal: number;
  product?: {
    nama_produk?: string | null;
  } | null;
};

type Transaction = {
  id: number;
  tanggal: string;
  total_harga: number;
  status: string;
  nama_pembeli?: string | null;
  items?: TransactionItem[];
};

const getTodayInputValue = () => new Date().toISOString().split("T")[0];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => getTodayInputValue());
  const [transaksi, setTransaksi] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Sapaan "Selamat datang" sekali setelah login berhasil (dari halaman login).
  const [welcome, setWelcome] = useState<string | null>(null);

  useEffect(() => {
    let name: string | null = null;
    try {
      name = sessionStorage.getItem("welcomeToast");
    } catch {
      name = null;
    }
    if (!name) return;
    try {
      sessionStorage.removeItem("welcomeToast");
    } catch {
      /* abaikan */
    }
    setWelcome(name);
    const timer = window.setTimeout(() => setWelcome(null), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedDate) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/transaksi?startDate=${selectedDate}&endDate=${selectedDate}`, { cache: 'no-store' });
        const data = await res.json();
        setTransaksi(Array.isArray(data) ? data : []);
      } catch {
        console.error("Gagal memuat data dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedDate]);

  const transaksiLunas = transaksi.filter(t => t.status === "Paid");
  const totalTransaksi = transaksi.length;
  const pendapatan = transaksiLunas.reduce((sum, t) => sum + t.total_harga, 0);

  const getTopProduk = () => {
    const produkCount: Record<string, { nama: string, qty: number, revenue: number }> = {};
    transaksiLunas.forEach(t => {
      t.items?.forEach((item) => {
        const namaProduk = item.product?.nama_produk || "Produk Dihapus";
        if (!produkCount[namaProduk]) {
          produkCount[namaProduk] = { nama: namaProduk, qty: 0, revenue: 0 };
        }
        produkCount[namaProduk].qty += item.jumlah;
        produkCount[namaProduk].revenue += item.subtotal;
      });
    });
    return Object.values(produkCount).sort((a, b) => b.qty - a.qty).slice(0, 5);
  };

  const topProduk = getTopProduk();
  const transaksiTerbaru = [...transaksi].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 5);

  return (
    <div className="lina-page-stack space-y-6 text-slate-800 p-2">
      {welcome && (
        <div className="welcome-toast" role="status" aria-live="polite">
          <span className="welcome-toast-icon">✓</span>
          <span className="welcome-toast-text">Selamat datang, {welcome}!</span>
          <span className="welcome-toast-shine" />
        </div>
      )}
      <style jsx>{`
        .welcome-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-radius: 12px;
          background: #16a34a;
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          box-shadow: 0 12px 34px rgba(22, 163, 74, 0.35);
          overflow: hidden;
          max-width: 92vw;
          animation: welcome-life 5s ease forwards;
        }
        .welcome-toast-icon {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          display: grid;
          place-items: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .welcome-toast-text { position: relative; z-index: 1; }
        /* Cahaya yang menyapu dari kanan ke kiri selama toast tampil */
        .welcome-toast-shine {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 70%;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.15) 42%,
            rgba(255, 255, 255, 0.75) 50%,
            rgba(255, 255, 255, 0.15) 58%,
            transparent 75%
          );
          transform: skewX(-15deg);
          animation: welcome-shine 1.6s ease-in-out infinite;
        }
        @keyframes welcome-shine {
          0% { right: -80%; }
          100% { right: 120%; }
        }
        @keyframes welcome-life {
          0% { opacity: 0; transform: translateX(48px); }
          6% { opacity: 1; transform: translateX(0); }
          90% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(24px); }
        }
      `}</style>
      {/* Header Section */}
      <div className="lina-panel rounded-2xl border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-pink-500" /> Ringkasan Bisnis
          </h2>
          <p className="text-slate-500 text-sm mt-1">Pantau performa harian Lina Flowers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="lina-soft-field flex items-center gap-3 p-2 rounded-xl border">
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="bg-white border border-pink-100 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:border-pink-500"
          />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="lina-panel border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center"><Calendar size={28} /></div>
          <div><p className="text-sm font-medium text-slate-500">Total Transaksi</p><h3 className="text-2xl font-bold">{totalTransaksi}</h3></div>
        </div>
        <div className="lina-panel border rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center"><FileText size={28} /></div>
          <div><p className="text-sm font-medium text-slate-500">Transaksi Lunas</p><h3 className="text-2xl font-bold">{transaksiLunas.length}</h3></div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 shadow-lg text-white flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"><TrendingUp size={28} /></div>
          <div><p className="text-sm font-medium text-pink-100">Total Pendapatan</p><h3 className="text-2xl font-bold">Rp {pendapatan.toLocaleString("id-ID")}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lina-panel lg:col-span-2 border rounded-2xl overflow-hidden">
          <div className="lina-panel-header p-5 border-b flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><Clock className="text-pink-500" size={20}/> Transaksi Terbaru</h3>
            <Link href="/penjualan" className="text-xs font-bold text-pink-600 flex items-center gap-1">Lihat Semua <ChevronRight size={14}/></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pink-50 text-pink-900 text-[10px] uppercase font-bold border-b border-pink-100">
                <tr><th className="p-4">Waktu</th><th className="p-4">Pelanggan</th><th className="p-4">Total</th><th className="p-4">Status</th></tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Memuat...</td></tr>
                ) : transaksiTerbaru.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50">
                    <td className="p-4 text-slate-500">{new Date(t.tanggal).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4 font-bold">{t.nama_pembeli}</td>
                    <td className="p-4 text-pink-600 font-bold">Rp {t.total_harga.toLocaleString("id-ID")}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${t.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="lina-panel border rounded-2xl">
          <div className="lina-panel-header p-5 border-b">
            <h3 className="font-bold flex items-center gap-2"><Trophy className="text-pink-500" size={20}/> Top 5 Produk</h3>
          </div>
          <div className="p-5 space-y-4">
            {isLoading ? (
              <p className="text-center text-slate-400 text-sm">Memuat...</p>
            ) : topProduk.length === 0 ? (
              <p className="text-center text-slate-400 text-sm">Belum ada data.</p>
            ) : (
              topProduk.map((produk, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center text-xs font-bold">{index + 1}</div>
                  <div className="flex-1"><p className="font-bold text-sm truncate">{produk.nama}</p></div>
                  <div className="text-right"><p className="font-bold text-pink-600 text-sm">{produk.qty}</p></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
