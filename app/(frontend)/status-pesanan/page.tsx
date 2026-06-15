"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageCheck, Printer, RefreshCw } from "lucide-react";
import { clearSavedUserSession, getSavedUserSession } from "@/lib/userSession";

const statusOptions = ["Sedang Disiapkan", "Siap Dikirim", "Dikirim", "Selesai"];
const normalizeStatus = (status: string) =>
  status === "Diproses" ? "Sedang Disiapkan" : status === "Siap Kirim" ? "Siap Dikirim" : status;

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatTrxCode = (id: number) => `TRX-${String(id).padStart(4, "0")}`;

type UserSession = {
  id: number;
  username: string;
  fullName?: string | null;
  role: string;
};

type StoreInfo = {
  brand: string;
  address: string;
  footer: string;
  logo: string;
  receiptLogo: string;
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
  nama_kasir?: string | null;
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
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    brand: "Lina Flowers",
    address: "",
    footer: "",
    logo: "",
    receiptLogo: "",
  });

  const user = getSavedUserSession<UserSession>();
  const actorPayload = useMemo(
    () => ({
      actorId: user?.id,
      actorName: user?.fullName || user?.username,
      actorRole: user?.role,
    }),
    [user?.fullName, user?.id, user?.role, user?.username]
  );

  const fetchOrders = useCallback(async () => {
    const response = await fetch("/api/status-pesanan", { cache: "no-store" });
    if (response.status === 401) {
      clearSavedUserSession();
      window.location.href = "/login";
      return;
    }
    const data = await response.json();
    setOrders(Array.isArray(data) ? (data as ActiveOrder[]) : []);
    setIsLoading(false);
  }, []);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/pengaturan", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        setStoreInfo({
          brand: data.brand || "Lina Flowers",
          address: data.address || "",
          footer: data.footer || "",
          logo: data.logo || "",
          receiptLogo: data.receiptLogo || "",
        });
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchOrders(), 0);
    const interval = window.setInterval(fetchOrders, 5000);
    fetchSettings();
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(interval);
    };
  }, [fetchOrders, fetchSettings]);

  const updateOrder = async (id: number, payload: { status?: string }) => {
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
    if (!printWindow) return alert("Popup cetak diblokir browser. Izinkan pop-up lalu coba lagi.");

    const logoSrc = storeInfo.receiptLogo || storeInfo.logo;
    const transactionDate = new Date(order.tanggal);
    const itemRows = (order.items || [])
      .map(
        (item) => `
      <tr>
        <td>${escapeHtml(item.product?.nama_produk || "-")}</td>
        <td class="qty">${item.jumlah} Pcs</td>
        <td class="money">Rp ${Number(item.subtotal || 0).toLocaleString("id-ID")}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`<!doctype html><html><head>
      <title>NOTA PESANAN ${formatTrxCode(order.id)}</title>
      <meta charset="UTF-8">
      <style>
        *{box-sizing:border-box}
        body{font-family:Arial,sans-serif;color:#1e293b;margin:0;background:#f8fafc}
        .sheet{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:16mm 18mm}
        .header{display:flex;align-items:flex-start;gap:16px;border-bottom:3px solid #f9a8d4;padding-bottom:14px}
        .logo{width:68px;height:68px;object-fit:contain;border:1px solid #e2e8f0;border-radius:10px;padding:5px;flex-shrink:0}
        .brand{flex:1}.brand h1{margin:0;color:#db2777;font-size:22px;line-height:1.2}.brand p{margin:5px 0 0;color:#475569;white-space:pre-line;line-height:1.45;font-size:13px}
        .doc-title{text-align:right;flex-shrink:0}.doc-title h2{margin:0;color:#0f172a;font-size:20px;letter-spacing:.04em;font-weight:800}.doc-title p{margin:6px 0 0;color:#64748b;font-weight:700;font-size:13px}
        .meta{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:18px 0;border:1px solid #fbcfe8;border-radius:12px;overflow:hidden}
        .meta-cell{padding:12px 16px;background:#fff;font-size:13px;border-right:1px solid #fbcfe8;border-bottom:1px solid #fbcfe8}
        .meta-cell:nth-child(2n){border-right:none}.meta-cell:nth-last-child(-n+2){border-bottom:none}
        .meta-cell b{display:block;margin-bottom:3px;color:#be185d;text-transform:uppercase;font-size:10px;letter-spacing:.07em}
        table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
        th,td{padding:11px 14px;border:1px solid #e2e8f0;text-align:left;vertical-align:top}
        th{background:#fce7f3;color:#be185d;text-transform:uppercase;font-size:11px;letter-spacing:.05em;font-weight:700}
        tr:nth-child(even) td{background:#fdf8fb}
        .qty{text-align:center;white-space:nowrap;width:80px}.money{text-align:right;white-space:nowrap;width:120px}
        .total-row{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:13px 16px;background:#fdf2f8;border:1px solid #fbcfe8;border-radius:10px;color:#be185d;font-size:18px;font-weight:800}
        .notes{margin-top:24px;border:1px dashed #cbd5e1;padding:14px 16px;min-height:72px;border-radius:10px}
        .notes b{color:#475569;font-size:12px;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em}
        .footer-text{margin-top:24px;text-align:center;color:#64748b;white-space:pre-line;font-style:italic;line-height:1.55;font-size:12px;border-top:1px solid #f1f5f9;padding-top:14px}
        @media print{body{background:#fff}.sheet{width:auto;min-height:auto;margin:0;padding:10mm 14mm}@page{size:A4;margin:0}}
      </style>
    </head><body>
      <main class="sheet">
        <section class="header">
          ${logoSrc ? `<img class="logo" src="${logoSrc}" alt="Logo">` : ""}
          <div class="brand">
            <h1>${escapeHtml(storeInfo.brand || "Lina Flowers")}</h1>
            ${storeInfo.address ? `<p>${escapeHtml(storeInfo.address)}</p>` : ""}
          </div>
          <div class="doc-title">
            <h2>NOTA PESANAN</h2>
            <p>${formatTrxCode(order.id)}</p>
          </div>
        </section>
        <section class="meta">
          <div class="meta-cell"><b>No. Transaksi</b>${formatTrxCode(order.id)}</div>
          <div class="meta-cell"><b>Tanggal</b>${escapeHtml(transactionDate.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }))}</div>
          <div class="meta-cell"><b>Pelanggan</b>${escapeHtml(order.nama_pembeli || "-")}</div>
          <div class="meta-cell"><b>Kasir</b>${escapeHtml(order.nama_kasir || "-")}</div>
        </section>
        <table>
          <thead><tr><th>Produk</th><th class="qty">Jumlah</th><th class="money">Subtotal</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div class="total-row">
          <span>Total Pesanan</span>
          <span>Rp ${Number(order.total_harga || 0).toLocaleString("id-ID")}</span>
        </div>
        <div class="notes"><b>Catatan:</b></div>
        ${storeInfo.footer ? `<div class="footer-text">${escapeHtml(storeInfo.footer)}</div>` : ""}
      </main>
      <script>window.onload=function(){window.print();};</script>
    </body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="lina-page-stack space-y-6">
      <header className="lina-panel rounded-2xl border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <PackageCheck className="text-pink-500" /> Status Pesanan
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pesanan aktif akan hilang dari halaman ini setelah berstatus Selesai.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchOrders}
            className="rounded-xl border border-pink-100 bg-white p-3 text-pink-600"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="lina-panel rounded-2xl border p-12 text-center font-bold text-slate-400">
          Memuat pesanan...
        </div>
      ) : orders.length === 0 ? (
        <div className="lina-panel rounded-2xl border p-12 text-center text-slate-400">
          Tidak ada pesanan aktif.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {orders.map((order) => (
            <article key={order.id} className="lina-panel overflow-hidden rounded-2xl border">
              {/* HEADER CARD */}
              <div className="flex flex-col justify-between gap-3 border-b border-pink-100 bg-pink-50 p-5 sm:flex-row">
                <div>
                  <p className="font-mono text-sm font-black text-pink-700">{formatTrxCode(order.id)}</p>
                  {order.orderRequest?.code && (
                    <p className="mt-1 font-mono text-xs font-black text-violet-600">{order.orderRequest.code}</p>
                  )}
                  <h2 className="mt-1 text-lg font-black text-slate-800">{order.nama_pembeli || "Tanpa nama"}</h2>
                  <p className="text-xs text-slate-400">{new Date(order.tanggal).toLocaleString("id-ID")}</p>
                </div>
                <select
                  value={normalizeStatus(order.status_pengiriman)}
                  onChange={(event) => updateOrder(order.id, { status: event.target.value })}
                  disabled={savingId === order.id}
                  className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-sm font-black text-pink-700 outline-none"
                >
                  {statusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* ITEM LIST + FOOTER */}
              <div className="space-y-3 p-5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-pink-50">
                      {item.product.gambar && (
                        <img
                          src={item.product.gambar}
                          alt={item.product.nama_produk}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{item.product.nama_produk}</p>
                      <p className="text-xs text-slate-500">Jumlah: {item.jumlah}</p>
                    </div>
                    <strong className="text-sm text-pink-600">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </strong>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400">Total Pesanan</p>
                    <p className="text-lg font-black text-pink-600">
                      Rp {order.total_harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => printOrderNote(order)}
                    className="flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-black text-pink-700 hover:bg-pink-100 active:scale-95 transition-all"
                  >
                    <Printer size={17} /> Cetak Nota
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
