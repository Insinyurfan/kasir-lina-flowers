"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ImageOff,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";
import { formatQtySatuan } from "@/lib/satuan";

type PackingItem = {
  id: number;
  nama_produk: string;
  variantName?: string | null;
  label?: string | null;
  jumlah: number;
  satuan?: string | null;
  gambar?: string | null;
  gambarPosX?: number | null;
  gambarPosY?: number | null;
  packed: boolean;
  packedAt?: string | null;
};

type PackingTransaction = {
  id: number;
  trxNumber?: number | null;
  tanggal: string;
  nama_pembeli?: string | null;
  status_pengiriman: string;
  totalItems: number;
  packedItems: number;
  items: PackingItem[];
};

const trxLabel = (t: PackingTransaction) => `TRX-${String(t.trxNumber ?? t.id).padStart(4, "0")}`;

export default function PackingPage() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [rows, setRows] = useState<PackingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hideComplete, setHideComplete] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [busyItem, setBusyItem] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedUser = getSavedUserSession<{ role?: string }>();
      if (!savedUser || savedUser.role === "Tamu") {
        window.location.replace("/produk");
        return;
      }
      setUser(savedUser);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/packing", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setRows(data as PackingTransaction[]);
    } catch {
      /* diamkan */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [user, load]);

  // Sinkron lintas perangkat: muat ulang saat halaman kembali fokus.
  useEffect(() => {
    if (!user) return;
    const onFocus = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [user, load]);

  const toggleItem = async (trxId: number, item: PackingItem) => {
    const next = !item.packed;
    setBusyItem(item.id);
    // Optimistic update.
    setRows((prev) =>
      prev.map((t) =>
        t.id !== trxId
          ? t
          : {
              ...t,
              packedItems: t.packedItems + (next ? 1 : -1),
              items: t.items.map((i) => (i.id === item.id ? { ...i, packed: next } : i)),
            }
      )
    );
    try {
      const res = await fetch("/api/packing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionItemId: item.id, checked: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Rollback bila gagal.
      setRows((prev) =>
        prev.map((t) =>
          t.id !== trxId
            ? t
            : {
                ...t,
                packedItems: t.packedItems + (next ? -1 : 1),
                items: t.items.map((i) => (i.id === item.id ? { ...i, packed: !next } : i)),
              }
        )
      );
    } finally {
      setBusyItem(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((t) => {
      if (hideComplete && t.totalItems > 0 && t.packedItems === t.totalItems) return false;
      if (!q) return true;
      return (
        (t.nama_pembeli || "").toLowerCase().includes(q) || trxLabel(t).toLowerCase().includes(q)
      );
    });
  }, [rows, search, hideComplete]);

  const isExpanded = (t: PackingTransaction) => expanded[t.id] ?? true;

  if (!user) return null;

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
            <PackageCheck className="text-pink-600" /> Checklist Packing
          </h1>
          <p className="text-sm text-slate-500">
            Centang barang yang sudah masuk mobil. Cetak dokumen tetap dari Riwayat Penjualan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm font-bold text-pink-600 hover:bg-pink-50"
        >
          <RefreshCw size={16} /> Muat ulang
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari toko / no. transaksi…"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-pink-400 focus:outline-none"
          />
        </div>
        <label className="flex cursor-pointer select-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={hideComplete}
            onChange={(e) => setHideComplete(e.target.checked)}
            className="h-4 w-4 accent-pink-600"
          />
          Sembunyikan yang lengkap
        </label>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Memuat…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-pink-100 bg-white py-16 text-center text-slate-400">
          <Truck size={40} className="text-slate-300" />
          <p className="text-sm font-semibold">Tidak ada pengiriman aktif untuk di-packing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const complete = t.totalItems > 0 && t.packedItems === t.totalItems;
            const pct = t.totalItems ? Math.round((t.packedItems / t.totalItems) * 100) : 0;
            const open = isExpanded(t);
            return (
              <div
                key={t.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                  complete ? "border-emerald-200" : "border-pink-100"
                }`}
              >
                {/* Header kartu */}
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [t.id]: !open }))}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-base font-black text-slate-800">
                        {t.nama_pembeli || "Tanpa nama"}
                      </span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500">
                        {trxLabel(t)}
                      </span>
                      <span className="rounded-md bg-pink-50 px-1.5 py-0.5 text-[11px] font-bold text-pink-600">
                        {t.status_pengiriman}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            complete ? "bg-emerald-500" : "bg-pink-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-black ${complete ? "text-emerald-600" : "text-slate-500"}`}
                      >
                        {t.packedItems}/{t.totalItems}
                        {complete ? " ✓" : ""}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Daftar item */}
                {open && (
                  <div className="border-t border-slate-100">
                    {t.items.map((item) => {
                      const busy = busyItem === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={busy}
                          onClick={() => void toggleItem(t.id, item)}
                          className={`flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left transition-colors last:border-b-0 ${
                            item.packed ? "bg-emerald-50/60" : "hover:bg-pink-50/40"
                          }`}
                        >
                          {/* Checkbox besar */}
                          <span
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
                              item.packed
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-300 bg-white text-transparent"
                            }`}
                          >
                            <Check size={20} strokeWidth={3} />
                          </span>

                          {/* Thumbnail */}
                          <span className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            {item.gambar ? (
                              <img
                                src={item.gambar}
                                alt=""
                                className="h-full w-full object-cover"
                                style={{
                                  objectPosition: `${item.gambarPosX ?? 50}% ${item.gambarPosY ?? 50}%`,
                                }}
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-slate-300">
                                <ImageOff size={16} />
                              </span>
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate font-semibold ${
                                item.packed ? "text-slate-500 line-through" : "text-slate-800"
                              }`}
                            >
                              {item.nama_produk}
                              {item.variantName ? ` (${item.variantName})` : ""}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-pink-600">
                                {formatQtySatuan(item.jumlah, item.satuan)}
                              </span>
                              {item.label && (
                                <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[10px] font-black text-pink-700">
                                  {item.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
