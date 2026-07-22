"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Contact,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";

type Customer = {
  id: number;
  name: string;
  phone?: string | null;
  note?: string | null;
};

type Product = {
  id: number;
  nama_produk: string;
  harga: number;
  satuanHarga?: string | null;
  isArchived?: boolean;
};

type CustomerPriceRow = { productId: number; variantId: number; price: number };

const rupiah = (value: number) => `Rp ${Math.round(value || 0).toLocaleString("id-ID")}`;
const normalize = (value: string) => value.trim().toUpperCase();

export default function PelangganPage() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Harga khusus pelanggan terpilih: productId -> price (level produk / variantId 0).
  const [priceByProduct, setPriceByProduct] = useState<Record<number, number>>({});
  const [draftByProduct, setDraftByProduct] = useState<Record<number, string>>({});
  const [codes, setCodes] = useState<string[]>([]);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);

  // Form tambah/edit pelanggan.
  const [formOpen, setFormOpen] = useState(false);
  const [formId, setFormId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBusy, setFormBusy] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const flash = useCallback((type: "ok" | "err", text: string) => {
    setFeedback({ type, text });
    window.setTimeout(() => setFeedback(null), 2800);
  }, []);

  // Hanya Owner/Admin yang boleh mengelola pelanggan & harga.
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

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/pelanggan?master=1", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data as Customer[]);
    } catch {
      /* diamkan; tampilkan kosong */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/pelanggan?master=1", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCustomers(data as Customer[]);
      })
      .catch(() => {
        /* diamkan */
      });
    fetch("/api/produk", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts((data as Product[]).filter((p) => !p.isArchived));
      })
      .catch(() => {
        /* diamkan */
      });
  }, [user]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedId) || null,
    [customers, selectedId]
  );

  // Muat harga khusus + kode pelanggan saat memilih pelanggan. Reset state lama
  // dilakukan di handler klik (bukan di sini) agar tidak setState sinkron dalam effect.
  useEffect(() => {
    if (!selectedCustomer) return;
    let cancelled = false;

    fetch(`/api/harga-pelanggan?customerId=${selectedCustomer.id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((rows: CustomerPriceRow[]) => {
        if (cancelled || !Array.isArray(rows)) return;
        const map: Record<number, number> = {};
        for (const row of rows) {
          // Ambil harga level produk (variantId 0) sebagai acuan tunggal.
          if (Number(row.variantId) === 0) map[Number(row.productId)] = Number(row.price);
        }
        setPriceByProduct(map);
        setDraftByProduct({});
      })
      .catch(() => {
        if (!cancelled) setPriceByProduct({});
      });

    // Kode pelanggan (label baris) diturunkan dari riwayat transaksi pelanggan ini.
    fetch(`/api/transaksi?pelanggan=${encodeURIComponent(selectedCustomer.name)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((txns) => {
        if (cancelled || !Array.isArray(txns)) return;
        const set = new Set<string>();
        for (const txn of txns) {
          for (const item of txn.items || []) {
            const label = typeof item.label === "string" ? item.label.trim().toUpperCase() : "";
            if (label) set.add(label);
          }
        }
        setCodes([...set].sort((a, b) => a.localeCompare(b, "id")));
      })
      .catch(() => {
        if (!cancelled) setCodes([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCustomer]);

  const filteredCustomers = useMemo(() => {
    const q = normalize(customerSearch);
    const list = q ? customers.filter((c) => c.name.includes(q)) : customers;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "id"));
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const list = q ? products.filter((p) => p.nama_produk.toLowerCase().includes(q)) : products;
    return [...list].sort((a, b) => a.nama_produk.localeCompare(b.nama_produk, "id"));
  }, [products, productSearch]);

  const customPriceCount = useMemo(
    () => products.filter((p) => priceByProduct[p.id] !== undefined).length,
    [products, priceByProduct]
  );

  // ---- Aksi harga ----
  const savePrice = async (product: Product) => {
    if (!selectedCustomer) return;
    const raw = draftByProduct[product.id];
    const value = Math.round(Number(raw));
    if (raw === undefined || raw === "" || !Number.isFinite(value) || value < 0) {
      flash("err", `Harga ${product.nama_produk} belum valid.`);
      return;
    }
    setSavingProductId(product.id);
    try {
      const res = await fetch("/api/harga-pelanggan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          productId: product.id,
          variantId: 0,
          price: value,
        }),
      });
      if (!res.ok) throw new Error();
      setPriceByProduct((prev) => ({ ...prev, [product.id]: value }));
      setDraftByProduct((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      flash("ok", `Harga khusus ${product.nama_produk} disimpan.`);
    } catch {
      flash("err", "Gagal menyimpan harga.");
    } finally {
      setSavingProductId(null);
    }
  };

  const removePrice = async (product: Product) => {
    if (!selectedCustomer) return;
    setSavingProductId(product.id);
    try {
      const res = await fetch("/api/harga-pelanggan", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          productId: product.id,
          variantId: 0,
        }),
      });
      if (!res.ok) throw new Error();
      setPriceByProduct((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      setDraftByProduct((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      flash("ok", `Harga ${product.nama_produk} kembali ke harga umum.`);
    } catch {
      flash("err", "Gagal menghapus harga khusus.");
    } finally {
      setSavingProductId(null);
    }
  };

  // ---- Aksi pelanggan ----
  const openAddForm = () => {
    setFormId(null);
    setFormName("");
    setFormPhone("");
    setFormOpen(true);
  };
  const openEditForm = (customer: Customer) => {
    setFormId(customer.id);
    setFormName(customer.name);
    setFormPhone(customer.phone || "");
    setFormOpen(true);
  };

  const submitForm = async () => {
    const name = normalize(formName);
    if (name.length < 2) {
      flash("err", "Nama pelanggan minimal 2 karakter.");
      return;
    }
    setFormBusy(true);
    try {
      const res = await fetch("/api/pelanggan", {
        method: formId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: formId ?? undefined, name, phone: formPhone.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        flash("err", data?.error || "Gagal menyimpan pelanggan.");
        return;
      }
      await loadCustomers();
      if (!formId && data?.id) setSelectedId(data.id);
      setFormOpen(false);
      flash("ok", formId ? "Pelanggan diperbarui." : "Pelanggan ditambahkan.");
    } catch {
      flash("err", "Gagal menyimpan pelanggan.");
    } finally {
      setFormBusy(false);
    }
  };

  const deleteCustomer = async (customer: Customer) => {
    if (!confirm(`Hapus pelanggan "${customer.name}"? Harga khusus miliknya juga akan hilang.`)) return;
    try {
      const res = await fetch("/api/pelanggan", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id }),
      });
      if (!res.ok) throw new Error();
      if (selectedId === customer.id) setSelectedId(null);
      await loadCustomers();
      flash("ok", "Pelanggan dihapus.");
    } catch {
      flash("err", "Gagal menghapus pelanggan.");
    }
  };

  if (!user) return null;

  return (
    <div className="w-full">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-800">
          <Contact className="text-pink-600" /> Pelanggan
        </h1>
        <p className="text-sm text-slate-500">
          Kelola pelanggan dan atur harga khusus per produk agar konsisten & minim salah harga.
        </p>
      </div>

      {feedback && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
            feedback.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:min-h-[80vh] md:grid-cols-[360px_1fr]">
        {/* KIRI: daftar pelanggan */}
        <div className="flex flex-col rounded-2xl border border-pink-100 bg-white p-4 shadow-sm md:min-h-[80vh]">
          <div className="mb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Cari pelanggan…"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-pink-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={openAddForm}
              title="Tambah pelanggan"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-pink-600 text-white shadow-sm hover:bg-pink-700"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 md:max-h-[70vh]">
            {filteredCustomers.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400">
                {customers.length === 0
                  ? "Belum ada pelanggan. Tambahkan lewat tombol ＋ atau otomatis muncul setelah migrasi data."
                  : "Tidak ada yang cocok."}
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const active = customer.id === selectedId;
                return (
                  <div
                    key={customer.id}
                    role="button"
                    onClick={() => {
                      // Reset tampilan sebelum data pelanggan baru dimuat (hindari data lama nyangkut).
                      setSelectedId(customer.id);
                      setPriceByProduct({});
                      setDraftByProduct({});
                      setCodes([]);
                      setProductSearch("");
                    }}
                    className={`group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                      active
                        ? "border-pink-300 bg-pink-50"
                        : "border-transparent bg-slate-50 hover:bg-pink-50/60"
                    }`}
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-pink-500 ring-1 ring-pink-100">
                      <UserRound size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{customer.name}</p>
                      {customer.phone && <p className="truncate text-[11px] text-slate-400">{customer.phone}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditForm(customer);
                      }}
                      className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-pink-600 group-hover:block"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteCustomer(customer);
                      }}
                      className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-600 group-hover:block"
                      title="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KANAN: detail harga */}
        <div className="flex flex-col rounded-2xl border border-pink-100 bg-white p-4 shadow-sm md:min-h-[80vh]">
          {!selectedCustomer ? (
            <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-2 text-center text-slate-400">
              <Contact size={40} className="text-slate-300" />
              <p className="text-sm font-semibold">Pilih pelanggan di kiri untuk mengatur harga.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800">{selectedCustomer.name}</h2>
                  <p className="text-xs text-slate-500">
                    <span className="font-bold text-pink-600">{customPriceCount}</span> dari {products.length} produk
                    punya harga khusus
                    {products.length - customPriceCount > 0 && (
                      <span className="text-slate-400">
                        {" "}
                        · {products.length - customPriceCount} masih harga umum
                      </span>
                    )}
                  </p>
                  {codes.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Tag size={13} className="text-slate-400" />
                      {codes.map((code) => (
                        <span
                          key={code}
                          className="rounded-lg border border-pink-200 bg-pink-50 px-2 py-0.5 text-[11px] font-black text-pink-700"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari produk…"
                    className="w-48 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto md:max-h-[68vh]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-2 font-semibold">Produk</th>
                      <th className="px-2 py-2 font-semibold">Harga umum</th>
                      <th className="px-2 py-2 font-semibold">Harga khusus</th>
                      <th className="px-2 py-2 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          Tidak ada produk.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const custom = priceByProduct[product.id];
                        const hasCustom = custom !== undefined;
                        const draft = draftByProduct[product.id];
                        const satuan = product.satuanHarga || "pcs";
                        const busy = savingProductId === product.id;
                        return (
                          <tr key={product.id} className="border-b border-slate-50 align-middle">
                            <td className="py-2.5 pr-2">
                              <p className="font-semibold text-slate-800">{product.nama_produk}</p>
                              {hasCustom ? (
                                <span className="mt-0.5 inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-600">
                                  HARGA KHUSUS
                                </span>
                              ) : (
                                <span className="mt-0.5 inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-400">
                                  BELUM DIATUR
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2.5 text-slate-500">
                              {rupiah(product.harga)}
                              <span className="text-[11px] text-slate-400">/{satuan}</span>
                            </td>
                            <td className="px-2 py-2.5">
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400">Rp</span>
                                <input
                                  inputMode="numeric"
                                  value={draft ?? (hasCustom ? String(custom) : "")}
                                  onChange={(e) =>
                                    setDraftByProduct((prev) => ({
                                      ...prev,
                                      [product.id]: e.target.value.replace(/[^\d]/g, ""),
                                    }))
                                  }
                                  placeholder={String(product.harga)}
                                  className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-pink-400 focus:outline-none"
                                />
                              </div>
                            </td>
                            <td className="px-2 py-2.5">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  disabled={busy || draft === undefined || draft === ""}
                                  onClick={() => void savePrice(product)}
                                  className="flex items-center gap-1 rounded-lg bg-pink-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-40"
                                  title="Simpan harga khusus"
                                >
                                  <Check size={14} /> Simpan
                                </button>
                                {hasCustom && (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => void removePrice(product)}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-red-600 disabled:opacity-40"
                                    title="Kembalikan ke harga umum"
                                  >
                                    <RotateCcw size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL FORM PELANGGAN */}
      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h3 className="font-black text-slate-800">{formId ? "Edit Pelanggan" : "Tambah Pelanggan"}</h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Nama pelanggan / toko</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="mis. TOKO TIARA"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase focus:border-pink-400 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">No. HP (opsional)</label>
                <input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="08xx"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={formBusy}
                onClick={() => void submitForm()}
                className="flex-1 rounded-xl bg-pink-600 py-2.5 text-sm font-bold text-white hover:bg-pink-700 disabled:opacity-50"
              >
                {formBusy ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
