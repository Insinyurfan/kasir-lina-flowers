"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, RefreshCw, Check, X, Phone, Clock } from "lucide-react";
import { clearSavedUserSession, getSavedUserSession } from "@/lib/userSession";
import { JEDA_POLLING, useIntervalSaatTerlihat } from "@/lib/pollingHemat";
import { toast } from "@/lib/toast";
import { urlGambar } from "@/lib/gambar";

type UserSession = {
  id: number;
  username: string;
  fullName?: string | null;
  role: string;
};

type RequestItem = {
  id: number;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  product?: { gambar?: string | null } | null;
};

type OrderRequest = {
  id: number;
  code: string;
  customerName: string;
  phone: string;
  status: string;
  rejectionReason: string | null;
  totalPrice: number;
  createdAt: string;
  items: RequestItem[];
  transaction: { id: number; trxNumber: number | null } | null;
};

const STATUS_FILTERS = ["Menunggu", "Diterima", "Ditolak", "Semua"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

const formatWaktu = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusStyle = (status: string) => {
  if (status === "Ditolak") return "bg-rose-100 text-rose-700";
  if (status === "Menunggu") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
};

export default function RequestPesananPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Menunggu");
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  // Harga satuan yang sedang diketik, dikunci per id item supaya dua request
  // berbeda tidak saling menimpa isian.
  const [priceDraft, setPriceDraft] = useState<Record<number, string>>({});
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const user = getSavedUserSession<UserSession>();
  const isOwner = user?.role === "Owner";

  const fetchRequests = useCallback(async () => {
    const response = await fetch(`/api/request-pesanan?status=${encodeURIComponent(statusFilter)}`, {
      cache: "no-store",
    });
    if (response.status === 401) {
      clearSavedUserSession();
      window.location.href = "/login";
      return;
    }
    const data = await response.json();
    const rows = Array.isArray(data) ? (data as OrderRequest[]) : [];
    setRequests(rows);
    // Harga awal diisi dari harga produk/varian yang sudah dihitung server saat
    // pesanan masuk. Isian yang sedang diketik pemilik TIDAK ditimpa, supaya
    // polling 30 detik tidak menghapus angka yang belum sempat disimpan.
    setPriceDraft((current) => {
      const next = { ...current };
      for (const request of rows) {
        for (const item of request.items) {
          if (next[item.id] === undefined) next[item.id] = String(item.unitPrice ?? 0);
        }
      }
      return next;
    });
    setIsLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchRequests(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchRequests]);

  useIntervalSaatTerlihat(() => void fetchRequests(), JEDA_POLLING.requestPesanan);

  const totalDraft = useMemo(() => {
    const totals: Record<number, number> = {};
    for (const request of requests) {
      totals[request.id] = request.items.reduce((sum, item) => {
        const price = Number(priceDraft[item.id] ?? item.unitPrice ?? 0);
        return sum + (Number.isFinite(price) ? price : 0) * item.quantity;
      }, 0);
    }
    return totals;
  }, [requests, priceDraft]);

  const submitDecision = async (
    request: OrderRequest,
    body: { action: "accept"; prices: { itemId: number; unitPrice: number }[] } | { action: "reject"; rejectionReason: string }
  ) => {
    setSavingId(request.id);
    try {
      const response = await fetch("/api/request-pesanan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, ...body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Gagal memproses request pesanan.");

      toast.success(
        body.action === "accept"
          ? `Request ${request.code} diterima dan menjadi transaksi.`
          : `Request ${request.code} ditolak.`
      );
      setRejectingId(null);
      setRejectReason("");
      await fetchRequests();
      window.dispatchEvent(new Event("lina_notifications_updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memproses request pesanan.");
    } finally {
      setSavingId(null);
    }
  };

  const handleAccept = (request: OrderRequest) => {
    const prices = request.items.map((item) => ({
      itemId: item.id,
      unitPrice: Math.round(Number(priceDraft[item.id] ?? item.unitPrice ?? 0)),
    }));
    // Server menolak bila ada harga yang tidak valid; disaring lebih dulu di
    // sini supaya pemilik dapat pesan yang jelas, bukan error umum dari API.
    const invalid = prices.find((price) => !Number.isFinite(price.unitPrice) || price.unitPrice < 0);
    if (invalid) {
      toast.error("Ada harga yang belum diisi dengan benar.");
      return;
    }
    void submitDecision(request, { action: "accept", prices });
  };

  const handleReject = (request: OrderRequest) => {
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }
    void submitDecision(request, { action: "reject", rejectionReason: reason });
  };

  return (
    <div className="lina-page-stack space-y-6">
      <header className="lina-panel rounded-2xl border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
              <ClipboardList className="text-pink-500" /> Orderan Manual
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pesanan dari katalog publik. Isi harga tiap produk, lalu terima untuk menjadikannya transaksi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchRequests()}
            aria-label="Muat ulang"
            className="rounded-xl border border-pink-100 bg-white p-3 text-pink-600 hover:bg-pink-50 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-xl px-3.5 py-2 text-xs font-black transition-colors ${
                statusFilter === filter
                  ? "bg-pink-600 text-white shadow-md shadow-pink-200"
                  : "border border-pink-100 bg-white text-slate-600 hover:border-pink-300 hover:text-pink-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="lina-panel rounded-2xl border p-10 text-center text-slate-400">
          <p className="text-sm font-bold">Memuat request pesanan...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="lina-panel rounded-2xl border p-12 text-center text-slate-400">
          <ClipboardList size={46} className="mx-auto mb-3 text-pink-200" />
          <p className="text-sm font-bold">
            {statusFilter === "Menunggu" ? "Belum ada pesanan baru yang menunggu." : `Tidak ada request berstatus ${statusFilter}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const isPending = request.status === "Menunggu";
            const isSaving = savingId === request.id;
            return (
              <section key={request.id} className="lina-panel rounded-2xl border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-800 break-all">{request.code}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${statusStyle(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-700">{request.customerName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} /> {request.phone}
                        {!isOwner && <span className="text-slate-400">(disamarkan)</span>}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} /> {formatWaktu(request.createdAt)}
                      </span>
                    </div>
                  </div>

                  {request.transaction && (
                    <span className="rounded-xl bg-green-50 border border-green-100 px-3 py-2 text-xs font-black text-green-700">
                      TRX-{String(request.transaction.trxNumber ?? request.transaction.id).padStart(4, "0")}
                    </span>
                  )}
                </div>

                {request.status === "Ditolak" && request.rejectionReason && (
                  <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
                    Alasan penolakan: {request.rejectionReason}
                  </p>
                )}

                <ul className="mt-4 space-y-2.5">
                  {request.items.map((item) => {
                    const price = Number(priceDraft[item.id] ?? item.unitPrice ?? 0);
                    const subtotal = (Number.isFinite(price) ? price : 0) * item.quantity;
                    return (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-pink-100 bg-pink-50/40 p-3"
                      >
                        {/* Pakai <img> biasa, BUKAN next/image — sama seperti
                            seluruh halaman lain yang memakai urlGambar().
                            `/gambar?url=…` mengandung query string, dan Next 16
                            MELEMPAR error untuk itu kecuali didaftarkan di
                            images.localPatterns; errornya tak tertangkap
                            sehingga merobohkan seluruh halaman. Lagipula rute
                            /gambar sudah menyajikan WebP dengan cache
                            `immutable`, jadi mengoptimasinya ulang sia-sia. */}
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                          {item.product?.gambar ? (
                            <img
                              src={urlGambar(item.product.gambar)}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-pink-200">—</div>
                          )}
                        </div>

                        <div className="min-w-[9rem] flex-1">
                          <p className="text-sm font-bold text-slate-800">{item.productName}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {item.variantName && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                                {item.variantName}
                              </span>
                            )}
                            <span className="text-xs font-black text-slate-500">×{item.quantity}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400">
                              Harga satuan
                            </label>
                            <input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              value={priceDraft[item.id] ?? ""}
                              disabled={!isPending || isSaving}
                              onChange={(e) => setPriceDraft((current) => ({ ...current, [item.id]: e.target.value }))}
                              className="mt-0.5 w-32 rounded-lg border border-pink-100 bg-white px-3 py-2 text-sm font-bold outline-none transition-colors focus:border-pink-400 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                          </div>
                          <div className="min-w-[6.5rem] text-right">
                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Subtotal</p>
                            <p className="mt-0.5 text-sm font-black text-slate-700">{formatRupiah(subtotal)}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-pink-100 pt-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Total</p>
                    <p className="text-lg font-black text-rose-950">
                      {formatRupiah(isPending ? totalDraft[request.id] ?? 0 : request.totalPrice)}
                    </p>
                  </div>

                  {isPending && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(rejectingId === request.id ? null : request.id);
                          setRejectReason("");
                        }}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-black text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                      >
                        <X size={16} /> Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAccept(request)}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-pink-700 disabled:bg-slate-300"
                      >
                        <Check size={16} /> {isSaving ? "Memproses..." : "Terima Pesanan"}
                      </button>
                    </div>
                  )}
                </div>

                {isPending && rejectingId === request.id && (
                  <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-3">
                    <label className="block text-xs font-black text-rose-700">Alasan penolakan</label>
                    <p className="mt-0.5 text-[11px] font-medium text-rose-500">
                      Alasan ini ikut terlihat oleh pembeli di halaman lacak pesanan.
                    </p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      maxLength={300}
                      placeholder="Contoh: stok bunga sedang kosong sampai minggu depan."
                      className="mt-2 w-full rounded-lg border border-rose-200 px-3 py-2 text-sm outline-none transition-colors focus:border-rose-400"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectingId(null)}
                        className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-white transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(request)}
                        disabled={isSaving}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-rose-700 disabled:bg-slate-300"
                      >
                        Kirim Penolakan
                      </button>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
