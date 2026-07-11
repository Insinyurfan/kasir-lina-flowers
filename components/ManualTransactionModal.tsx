"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";
import { PCS_PER_UNIT, hitungHargaSatuan } from "@/lib/satuan";

export type ManualVariant = {
  id: number;
  name: string;
  priceModifier?: number | null;
};

export type ManualProduct = {
  id: number;
  nama_produk: string;
  harga: number;
  stok: number;
  satuanHarga?: string;
  gambar?: string | null;
  variants?: ManualVariant[];
};

type CashierAccount = {
  id: number;
  username: string;
  fullName?: string | null;
  role: string;
};

type UserSession = {
  id: number;
  username: string;
  fullName?: string | null;
  role: string;
};

export type ManualTransaction = {
  id: number;
  tanggal: string;
  metode_pembayaran: string;
  status: string;
  nama_pembeli?: string | null;
  nama_kasir?: string | null;
  status_pengiriman: string;
  items?: Array<{
    id: number;
    jumlah: number;
    subtotal: number;
    satuanHarga?: string;
    variantId?: number | null;
    variantName?: string | null;
    label?: string | null;
    product: ManualProduct;
  }>;
};

type ManualItem = {
  rowId: string;
  productId: string;
  variantId: string;
  quantity: string;
  harga: string;        // harga per satuan pesan (yang tampil di kolom Harga)
  satuan: string;       // satuan pesan (pcs/lusin/½ gross/gross)
  satuanHarga: string;  // satuan dasar produk (patokan harga) — untuk hitung ulang saat ganti satuan
  hargaBase: string;    // harga dasar per satuanHarga — tetap saat ganti satuan pesan
  label: string; // kode pelanggan per baris (Aneka), terpisah dari variasi
  origVariantName: string; // snapshot variantName asli dari transaksi (untuk migrasi kode lama)
};

// Ubah harga per-satuan-pesan menjadi harga dasar (per satuanHarga produk).
// Kebalikan dari hitungHargaSatuan — dipakai saat harga diketik manual.
const toHargaBase = (hargaSatuan: number, satuanHarga: string, satuanPesan: string): number => {
  const perHarga = PCS_PER_UNIT[satuanHarga] ?? 1;
  const perPesan = PCS_PER_UNIT[satuanPesan] ?? 1;
  return Math.round((hargaSatuan * perHarga) / perPesan);
};

const SATUAN_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "pcs", label: "Pcs" },
  { value: "lusin", label: "Lusin" },
  { value: "setengah_gross", label: "½ Gross" },
  { value: "gross", label: "Gross" },
];

type Props = {
  open: boolean;
  transaction?: ManualTransaction | null;
  title?: string;
  onClose: () => void;
  onSaved: () => void;
};

const formatDateTimeLocal = (date: Date) => {
  // Selalu tampilkan/isi dalam WIB (Asia/Jakarta) apa pun zona perangkat/server.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

const parseISODateTimeLocal = (isoString: string) => {
  // Konversi ISO (UTC) ke komponen waktu LOKAL agar jam di field
  // sama dengan jam yang tampil di daftar riwayat.
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return formatDateTimeLocal(new Date());
  return formatDateTimeLocal(parsed);
};

const newRowId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createEmptyItem = (): ManualItem => ({
  rowId: newRowId(),
  productId: "",
  variantId: "",
  quantity: "1",
  harga: "0",
  satuan: "pcs",
  satuanHarga: "pcs",
  hargaBase: "0",
  label: "",
  origVariantName: "",
});

export default function ManualTransactionModal({ open, transaction, title, onClose, onSaved }: Props) {
  const [currentUser] = useState<UserSession | null>(() => getSavedUserSession<UserSession>());
  const [products, setProducts] = useState<ManualProduct[]>([]);
  const [cashierAccounts, setCashierAccounts] = useState<CashierAccount[]>([]);
  const [tanggal, setTanggal] = useState(formatDateTimeLocal(new Date()));
  const [namaPembeli, setNamaPembeli] = useState("");
  const [namaKasir, setNamaKasir] = useState("");
  const [metode, setMetode] = useState("Tunai");
  const [status, setStatus] = useState("Paid");
  const [pengiriman, setPengiriman] = useState("Selesai");
  const [items, setItems] = useState<ManualItem[]>([createEmptyItem()]);
  const [isSaving, setIsSaving] = useState(false);
  // Pemilih produk yang bisa DIKETIK: baris mana yang dropdown-nya terbuka + teks pencariannya.
  const [pickerRow, setPickerRow] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  // Autocomplete nama pelanggan (dari pelanggan yang sudah pernah diinput di POS).
  const [customerNames, setCustomerNames] = useState<string[]>([]);
  const [namaOpen, setNamaOpen] = useState(false);
  // Autocomplete kode pelanggan per baris (Aneka) + baris mana yang dropdown-nya terbuka.
  const [customerCodes, setCustomerCodes] = useState<string[]>([]);
  const [codeOpenRow, setCodeOpenRow] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    fetch("/api/produk", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));

    fetch("/api/akun", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const accounts = Array.isArray(data)
          ? (data as CashierAccount[]).filter((account) => account.role !== "Tamu")
          : [];
        setCashierAccounts(accounts);
      })
      .catch(() => setCashierAccounts([]));

    fetch("/api/pelanggan", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setCustomerNames(Array.isArray(data) ? data.map((n: string) => String(n).toUpperCase()) : []))
      .catch(() => setCustomerNames([]));

    fetch("/api/kode-pelanggan", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setCustomerCodes(Array.isArray(data) ? data.map((c: string) => String(c).toUpperCase()) : []))
      .catch(() => setCustomerCodes([]));
  }, [open]);

  const getCashierNameFromAccount = useCallback((account: CashierAccount) => account.fullName || account.username, []);

  const normalizeCashierName = useCallback(
    (name?: string | null) => {
      if (!name) return "";
      const account = cashierAccounts.find((item) => item.fullName === name || item.username === name);
      return account ? getCashierNameFromAccount(account) : name;
    },
    [cashierAccounts, getCashierNameFromAccount]
  );

  // Inisialisasi field & item — TIDAK boleh tergantung cashierAccounts,
  // supaya tidak ter-reset (mengembalikan satuan/qty/harga) saat data akun
  // selesai dimuat setelah modal terbuka.
  useEffect(() => {
    if (!open) return;

    if (transaction) {
      setTanggal(parseISODateTimeLocal(transaction.tanggal));
      setNamaPembeli(transaction.nama_pembeli || "");
      setMetode(transaction.metode_pembayaran || "Tunai");
      setStatus(transaction.status || "Paid");
      setPengiriman(transaction.status_pengiriman || "Selesai");
      setItems(
        transaction.items && transaction.items.length > 0
          ? transaction.items.map((item) => {
              const prodSatuan = item.product.satuanHarga || "pcs"; // satuan dasar produk
              const satuanPesan = item.satuanHarga || "pcs";        // satuan yang dipesan
              const hargaSatuan = Math.round(item.jumlah > 0 ? item.subtotal / item.jumlah : item.product.harga);
              return {
                rowId: newRowId(),
                productId: String(item.product.id),
                variantId: item.variantId != null ? String(item.variantId) : "",
                quantity: String(item.jumlah),
                harga: String(hargaSatuan),
                satuan: satuanPesan,
                satuanHarga: prodSatuan,
                // Turunkan harga dasar (per satuan produk) dari data harga yang ada,
                // agar ganti satuan pesan bisa menghitung ulang harga otomatis.
                hargaBase: String(toHargaBase(hargaSatuan, prodSatuan, satuanPesan)),
                label: item.label || "",
                origVariantName: item.variantName || "",
              };
            })
          : [createEmptyItem()]
      );
    } else {
      setTanggal(formatDateTimeLocal(new Date()));
      setNamaPembeli("");
      setMetode("Tunai");
      setStatus("Paid");
      setPengiriman("Selesai");
      setItems([createEmptyItem()]);
    }
  }, [open, transaction]);

  // Nama kasir butuh data akun, jadi dipisah. Hanya menyetel saat modal
  // pertama dibuka / akun dimuat — perubahan field lain tidak terpengaruh.
  useEffect(() => {
    if (!open) return;

    if (transaction) {
      setNamaKasir(normalizeCashierName(transaction.nama_kasir));
    } else {
      setNamaKasir(cashierAccounts[0] ? getCashierNameFromAccount(cashierAccounts[0]) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction, cashierAccounts]);

  const productsById = useMemo(() => {
    return products.reduce<Record<string, ManualProduct>>((result, product) => {
      result[String(product.id)] = product;
      return result;
    }, {});
  }, [products]);

  // Migrasi data lama: dulu kode pelanggan Aneka disimpan sebagai "variasi"
  // (variantName), lalu variasi-kode dihapus saat migrasi. Saat produk sudah
  // dimuat, pindahkan variantName yang BUKAN variasi asli produk ke kolom kode
  // (label) agar tampil & tidak terhapus saat disimpan.
  useEffect(() => {
    if (!open || products.length === 0) return;
    setItems((current) =>
      current.map((it) => {
        if (!it.origVariantName) return it;
        const product = productsById[it.productId];
        const isRealVariant = !!product?.variants?.some(
          (v) => v.name === it.origVariantName || String(v.id) === it.variantId
        );
        if (isRealVariant) return it; // variasi ukuran asli → biarkan
        if (it.label) return it.variantId ? { ...it, variantId: "" } : it;
        return { ...it, label: it.origVariantName, variantId: "" };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, products]);

  const total = items.reduce((sum, item) => sum + Number(item.harga || 0) * Number(item.quantity || 0), 0);

  // Daftar produk terfilter untuk dropdown pencarian (urut alfabet biar tidak berantakan).
  const filteredPickerProducts = useMemo(() => {
    const query = pickerSearch.trim().toLowerCase();
    const sorted = [...products].sort((a, b) => a.nama_produk.localeCompare(b.nama_produk, "id"));
    if (!query) return sorted;
    return sorted.filter((p) => p.nama_produk.toLowerCase().includes(query));
  }, [products, pickerSearch]);

  const openPicker = (rowId: string) => {
    setPickerRow(rowId);
    setPickerSearch("");
  };

  const pickProduct = (rowId: string, productId: number) => {
    updateItem(rowId, "productId", String(productId));
    setPickerRow(null);
    setPickerSearch("");
  };

  const updateItem = (rowId: string, field: keyof ManualItem, value: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.rowId !== rowId) return item;
        if (field === "productId") {
          const selected = productsById[value];
          const prodSatuan = selected?.satuanHarga || "pcs";
          return {
            ...item,
            productId: value,
            variantId: "", // reset variasi karena beda produk beda variasi
            satuanHarga: prodSatuan,
            satuan: prodSatuan,
            hargaBase: selected ? String(selected.harga) : item.hargaBase,
            harga: selected ? String(selected.harga) : item.harga,
          };
        }
        if (field === "satuan") {
          // Ganti satuan pesan → harga ikut dihitung dari harga dasar (mis. ½ Gross = ½ harga Gross).
          const harga = hitungHargaSatuan(Number(item.hargaBase) || 0, item.satuanHarga || "pcs", value);
          return { ...item, satuan: value, harga: String(harga) };
        }
        if (field === "harga") {
          // Harga diketik manual → perbarui harga dasar agar konsisten saat satuan diganti lagi.
          const base = toHargaBase(Number(value) || 0, item.satuanHarga || "pcs", item.satuan || "pcs");
          return { ...item, harga: value, hargaBase: String(base) };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleSave = async () => {
    const cart = items
      .filter((item) => item.productId && Number(item.quantity) > 0)
      .map((item) => {
        const product = productsById[item.productId];
        const variant = product?.variants?.find((v) => String(v.id) === item.variantId);
        return {
          id: Number(item.productId),
          quantity: Number(item.quantity),
          harga: Number(item.harga),
          satuanPesan: item.satuan || "pcs",
          variantId: variant ? variant.id : null,
          variantName: variant ? variant.name : null,
          label: item.label.trim() ? item.label.trim().toUpperCase() : null,
        };
      });

    if (cart.length === 0) {
      alert("Tambahkan minimal satu produk.");
      return;
    }

    if (!namaKasir) {
      alert("Pilih nama kasir dari daftar akun.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/transaksi", {
        method: transaction ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(transaction ? { id: transaction.id } : {}),
          // Input datetime-local diperlakukan sebagai WIB (UTC+7); simpan sebagai ISO UTC
          // agar jam yang dipilih sama persis dengan yang tampil di riwayat.
          tanggal: new Date(`${tanggal}:00+07:00`).toISOString(),
          nama_pembeli: namaPembeli?.toUpperCase() || "-",
          nama_kasir: namaKasir?.toUpperCase() || "-",
          metode_pembayaran: metode,
          status,
          status_pengiriman: pengiriman,
          cart,
          adjustStock: false,
          actorId: currentUser?.id,
          actorName: currentUser?.fullName || currentUser?.username,
          actorRole: currentUser?.role,
        }),
      });

      if (!res.ok) {
        alert("Gagal menyimpan transaksi manual.");
        return;
      }

      onSaved();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 overflow-y-auto flex items-start justify-center">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl my-4 overflow-visible">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-800">{title || (transaction ? "Edit Transaksi Manual" : "Tambah Transaksi Manual")}</h3>
            <p className="text-sm text-slate-500 mt-1">Input penjualan lama tanpa mengubah stok produk saat ini.</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-red-500">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal & Jam</label>
              <input
                type="datetime-local"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pelanggan</label>
              <input
                value={namaPembeli}
                onChange={(e) => { setNamaPembeli(e.target.value.toUpperCase()); setNamaOpen(true); }}
                onFocus={() => setNamaOpen(true)}
                onBlur={() => window.setTimeout(() => setNamaOpen(false), 150)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
                placeholder="Nama pelanggan"
              />
              {namaOpen && (() => {
                const q = namaPembeli.trim().toUpperCase();
                const matches = customerNames.filter((n) => n && n !== q && (q === "" || n.includes(q)));
                if (matches.length === 0) return null;
                return (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    {matches.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setNamaPembeli(n); setNamaOpen(false); }}
                        className="block w-full px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-pink-50"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kasir</label>
              <select
                value={namaKasir}
                onChange={(e) => setNamaKasir(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
              >
                <option value="">Pilih kasir</option>
                {cashierAccounts.map((account) => (
                  <option key={account.id} value={getCashierNameFromAccount(account)}>
                    {getCashierNameFromAccount(account)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Metode</label>
              <select value={metode} onChange={(e) => setMetode(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm">
                <option value="Tunai">Tunai</option>
                <option value="QRIS">QRIS</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Belum Bayar">Belum Bayar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Bayar</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm">
                <option value="Paid">Lunas</option>
                <option value="Unpaid">Belum Lunas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pengiriman</label>
              <select value={pengiriman} onChange={(e) => setPengiriman(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm">
                <option value="Diproses">Diproses</option>
                <option value="Siap Kirim">Siap Kirim</option>
                <option value="Dikirim">Dikirim</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-visible">
            <div className="bg-slate-50 px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h4 className="font-bold text-slate-700">Produk Terjual</h4>
              <button
                type="button"
                onClick={() => setItems((current) => [...current, createEmptyItem()])}
                className="bg-pink-100 text-pink-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <Plus size={16} /> Tambah Produk
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const product = productsById[item.productId];

                return (
                  <div key={item.rowId} className="grid grid-cols-1 lg:grid-cols-[72px_1fr_90px_110px_140px_44px] gap-3 p-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                      {product?.gambar ? (
                        <img src={product.gambar} alt={product.nama_produk} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400">Foto</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {/* Pemilih produk yang bisa diketik (cari nama produk) */}
                      <div className="relative">
                        <input
                          type="text"
                          value={pickerRow === item.rowId ? pickerSearch : (product?.nama_produk ?? "")}
                          placeholder={product ? product.nama_produk : "Ketik untuk cari produk..."}
                          onFocus={() => openPicker(item.rowId)}
                          onChange={(e) => {
                            if (pickerRow !== item.rowId) openPicker(item.rowId);
                            setPickerSearch(e.target.value);
                          }}
                          onBlur={() => window.setTimeout(() => setPickerRow((current) => (current === item.rowId ? null : current)), 150)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && pickerRow === item.rowId && filteredPickerProducts.length > 0) {
                              e.preventDefault();
                              pickProduct(item.rowId, filteredPickerProducts[0].id);
                            }
                            if (e.key === "Escape") setPickerRow(null);
                          }}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
                        />
                        {pickerRow === item.rowId && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                            {filteredPickerProducts.length === 0 ? (
                              <p className="px-3 py-2.5 text-sm text-slate-400">Produk tidak ditemukan.</p>
                            ) : (
                              filteredPickerProducts.slice(0, 50).map((productOption) => (
                                <button
                                  key={productOption.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    pickProduct(item.rowId, productOption.id);
                                  }}
                                  className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-pink-50 ${String(productOption.id) === item.productId ? "bg-pink-50 font-bold text-pink-600" : "text-slate-700"}`}
                                >
                                  <span className="truncate">{productOption.nama_produk}</span>
                                  <span className="shrink-0 text-xs font-semibold text-slate-400">Rp {productOption.harga.toLocaleString("id-ID")}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {product?.variants && product.variants.length > 0 && (
                        <select
                          value={item.variantId}
                          onChange={(e) => updateItem(item.rowId, "variantId", e.target.value)}
                          className="w-full border border-amber-200 bg-amber-50 text-amber-700 rounded-xl px-3 py-2 outline-none focus:border-amber-400 text-sm font-bold"
                          title="Variasi produk"
                        >
                          <option value="">Tanpa variasi</option>
                          {product.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {/* Kode pelanggan per baris (Aneka), terpisah dari variasi ukuran */}
                      <div className="relative">
                        <input
                          type="text"
                          value={item.label}
                          placeholder="Kode pelanggan (opsional)"
                          onChange={(e) => { updateItem(item.rowId, "label", e.target.value.replace(/[^A-Za-z0-9 -]/g, "").toUpperCase()); setCodeOpenRow(item.rowId); }}
                          onFocus={() => setCodeOpenRow(item.rowId)}
                          onBlur={() => window.setTimeout(() => setCodeOpenRow((cur) => (cur === item.rowId ? null : cur)), 150)}
                          className="w-full border border-amber-200 bg-amber-50/60 text-amber-700 rounded-xl px-3 py-2 outline-none focus:border-amber-400 text-sm font-bold placeholder:font-normal placeholder:text-amber-400"
                          title="Kode pelanggan (Aneka)"
                        />
                        {codeOpenRow === item.rowId && (() => {
                          const q = item.label.trim().toUpperCase();
                          const matches = customerCodes.filter((c) => c !== q && (q === "" || c.includes(q)));
                          if (matches.length === 0) return null;
                          return (
                            <div className="absolute left-0 right-0 top-full mt-1 z-40 max-h-56 overflow-y-auto rounded-xl border-2 border-amber-100 bg-white shadow-xl">
                              {matches.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onMouseDown={(e) => { e.preventDefault(); updateItem(item.rowId, "label", c); setCodeOpenRow(null); }}
                                  className="block w-full px-3 py-2 text-left text-sm font-black text-amber-700 hover:bg-amber-50"
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.rowId, "quantity", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
                      placeholder="Qty"
                    />
                    <select
                      value={item.satuan}
                      onChange={(e) => updateItem(item.rowId, "satuan", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
                      title="Satuan harga"
                    >
                      {SATUAN_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={item.harga}
                      onChange={(e) => updateItem(item.rowId, "harga", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
                      placeholder="Harga"
                    />
                    <button
                      type="button"
                      onClick={() => setItems((current) => (current.length > 1 ? current.filter((row) => row.rowId !== item.rowId) : current))}
                      className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <div>
              <p className="text-sm text-slate-500">Total Transaksi</p>
              <p className="text-2xl font-bold text-pink-600">Rp {total.toLocaleString("id-ID")}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-600">
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} /> {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
