"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageCheck, Printer, RefreshCw, UserRound } from "lucide-react";
import { clearSavedUserSession, getSavedUserSession } from "@/lib/userSession";

const statusOptions = ["Sedang Disiapkan", "Siap Dikirim", "Dikirim", "Selesai"];
const normalizeStatus = (status: string) => status === "Diproses" ? "Sedang Disiapkan" : status === "Siap Kirim" ? "Siap Dikirim" : status;

type UserSession = {
  id: number;
  username: string;
  fullName?: string | null;
  role: string;
};

type OrderItem = {
  id: number;
  jumlah: number;
  subtotal: number;
  product: {
    nama_produk: string;
    gambar?: string | null;
  };
};

type ActiveOrder = {
  id: number;
  tanggal: string;
  total_harga: number;
  nama_pembeli?: string | null;
  nama_pengrajin?: string | null;
  status_pengiriman: string;
  items: OrderItem[];
  orderRequest?: {
    code: string;
    phone: string;
  } | null;
};

export default function OrderStatusPage() {
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [artisanDraft, setArtisanDraft] = useState<Record<number, string>>({});
  const user = getSavedUserSession<UserSession>();
  const actorPayload = useMemo(() => ({
    actorId: user?.id,
    actorName: user?.fullName || user?.username,
    actorRole: user?.role,
  }), [user?.fullName, user?.id, user?.role, user?.username]);

  const fetchOrders = useCallback(async () => {
    const response = await fetch("/api/status-pesanan", { cache: "no-store" });
    if (response.status === 401) {
      clearSavedUserSession();
      window.location.href = "/login";
      return;
    }
    const data = await response.json();
    const nextOrders = Array.isArray(data) ? data as ActiveOrder[] : [];
    setOrders(nextOrders);
    setArtisanDraft((current) => {
      const next = { ...current };
      nextOrders.forEach((order) => {
        if (next[order.id] === undefined) next[order.id] = order.nama_pengrajin || "";
      });
      return next;
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchOrders(), 0);
    const interval = window.setInterval(fetchOrders, 5000);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(interval);
    };
  }, [fetchOrders]);

  const updateOrder = async (id: number, payload: { status?: string; artisanName?: string }) => {
    setSavingId(id);
    try {
      const response = await fetch("/api/status-pesanan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload, ...actorPayload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memperbarui pesanan.");
      await fetchOrders();
      window.dispatchEvent(new Event("lina_notifications_updated"));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memperbarui pesanan.");
    } finally {
      setSavingId(null);
    }
  };

  const printOrderNote = (order: ActiveOrder) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return alert("Popup cetak diblokir browser.");
    const itemRows = order.items.map((item) => `
      <tr><td>${item.product.nama_produk}</td><td>${item.jumlah}</td><td>Rp ${item.subtotal.toLocaleString("id-ID")}</td></tr>
    `).join("");
    printWindow.document.write(`<!doctype html><html><head><title>Nota TRX-${String(order.id).padStart(4, "0")}</title><style>
      body{font-family:Arial,sans-serif;color:#1e293b;margin:36px}h1{margin:0;color:#db2777}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:24px 0;padding:18px;background:#fdf2f8;border-radius:14px}
      table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:12px;border:1px solid #e2e8f0;text-align:left}th{background:#fce7f3}.total{text-align:right;font-size:20px;font-weight:800;margin-top:18px}
      .notes{margin-top:28px;border:1px dashed #94a3b8;padding:18px;min-height:90px}@media print{body{margin:18mm}}
    </style></head><body>
      <h1>NOTA PRODUKSI PESANAN</h1><p>Lina Flowers</p>
      <div class="meta"><div><b>No. Transaksi</b><br>TRX-${String(order.id).padStart(4, "0")}</div><div><b>Tanggal</b><br>${new Date(order.tanggal).toLocaleString("id-ID")}</div><div><b>Pelanggan</b><br>${order.nama_pembeli || "-"}</div><div><b>Pengrajin</b><br>${order.nama_pengrajin || "Belum ditentukan"}</div></div>
      <table><thead><tr><th>Produk</th><th>Jumlah</th><th>Subtotal</th></tr></thead><tbody>${itemRows}</tbody></table>
      <div class="total">Total: Rp ${order.total_harga.toLocaleString("id-ID")}</div>
      <div class="notes"><b>Catatan Produksi:</b></div>
      <script>window.onload=()=>window.print();</script>
    </body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="lina-page-stack space-y-6">
      <header className="lina-panel rounded-2xl border p-6">
        <div className="flex items-center justify-between gap-4">
          <div><h1 className="flex items-center gap-2 text-2xl font-black text-slate-800"><PackageCheck className="text-pink-500" /> Status Pesanan</h1><p className="mt-1 text-sm text-slate-500">Pesanan aktif akan hilang dari halaman ini setelah berstatus Selesai.</p></div>
          <button type="button" onClick={fetchOrders} className="rounded-xl border border-pink-100 bg-white p-3 text-pink-600"><RefreshCw size={18} /></button>
        </div>
      </header>

      {isLoading ? (
        <div className="lina-panel rounded-2xl border p-12 text-center font-bold text-slate-400">Memuat pesanan...</div>
      ) : orders.length === 0 ? (
        <div className="lina-panel rounded-2xl border p-12 text-center text-slate-400">Tidak ada pesanan aktif.</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {orders.map((order) => (
            <article key={order.id} className="lina-panel overflow-hidden rounded-2xl border">
              <div className="flex flex-col justify-between gap-3 border-b border-pink-100 bg-pink-50 p-5 sm:flex-row">
                <div>
                  <p className="font-mono text-sm font-black text-pink-700">TRX-{String(order.id).padStart(4, "0")}</p>
                  {order.orderRequest?.code && <p className="mt-1 font-mono text-xs font-black text-violet-600">{order.orderRequest.code}</p>}
                  <h2 className="mt-1 text-lg font-black text-slate-800">{order.nama_pembeli || "Tanpa nama"}</h2>
                  <p className="text-xs text-slate-400">{new Date(order.tanggal).toLocaleString("id-ID")}</p>
                </div>
                <select value={normalizeStatus(order.status_pengiriman)} onChange={(event) => updateOrder(order.id, { status: event.target.value })} disabled={savingId === order.id} className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-sm font-black text-pink-700 outline-none">
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>

              <div className="space-y-3 p-5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-pink-50">{item.product.gambar && <img src={item.product.gambar} alt={item.product.nama_produk} className="h-full w-full object-cover" />}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{item.product.nama_produk}</p><p className="text-xs text-slate-500">Jumlah: {item.jumlah}</p></div>
                    <strong className="text-sm text-pink-600">Rp {item.subtotal.toLocaleString("id-ID")}</strong>
                  </div>
                ))}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-500"><UserRound size={15} /> Nama Pengrajin</label>
                  <div className="flex gap-2">
                    <input value={artisanDraft[order.id] || ""} onChange={(event) => setArtisanDraft((current) => ({ ...current, [order.id]: event.target.value }))} placeholder="Masukkan setelah pengrajin ditentukan" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-pink-400" />
                    <button type="button" disabled={savingId === order.id} onClick={() => updateOrder(order.id, { artisanName: artisanDraft[order.id] || "" })} className="rounded-xl bg-pink-600 px-4 text-sm font-black text-white">Simpan</button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div><p className="text-xs font-bold text-slate-400">Total Pesanan</p><p className="text-lg font-black text-pink-600">Rp {order.total_harga.toLocaleString("id-ID")}</p></div>
                  <button type="button" onClick={() => printOrderNote(order)} className="flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-black text-pink-700"><Printer size={17} /> Cetak Nota</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
