"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";

export type ManualProduct = {
  id: number;
  nama_produk: string;
  harga: number;
  stok: number;
  gambar?: string | null;
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
    product: ManualProduct;
  }>;
};

type ManualItem = {
  rowId: string;
  productId: string;
  quantity: string;
  harga: string;
};

type Props = {
  open: boolean;
  transaction?: ManualTransaction | null;
  title?: string;
  onClose: () => void;
  onSaved: () => void;
};

const formatDateTimeLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const parseISODateTimeLocal = (isoString: string) => {
  // Parse ISO string tanpa timezone conversion
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return formatDateTimeLocal(new Date());
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;
};

const newRowId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createEmptyItem = (): ManualItem => ({
  rowId: newRowId(),
  productId: "",
  quantity: "1",
  harga: "0",
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

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      if (transaction) {
        setTanggal(parseISODateTimeLocal(transaction.tanggal));
        setNamaPembeli(transaction.nama_pembeli || "");
        setNamaKasir(normalizeCashierName(transaction.nama_kasir));
        setMetode(transaction.metode_pembayaran || "Tunai");
        setStatus(transaction.status || "Paid");
        setPengiriman(transaction.status_pengiriman || "Selesai");
        setItems(
          transaction.items && transaction.items.length > 0
            ? transaction.items.map((item) => ({
                rowId: newRowId(),
                productId: String(item.product.id),
                quantity: String(item.jumlah),
                harga: String(item.jumlah > 0 ? item.subtotal / item.jumlah : item.product.harga),
              }))
            : [createEmptyItem()]
        );
      } else {
        setTanggal(formatDateTimeLocal(new Date()));
        setNamaPembeli("");
        setNamaKasir(cashierAccounts[0] ? getCashierNameFromAccount(cashierAccounts[0]) : "");
        setMetode("Tunai");
        setStatus("Paid");
        setPengiriman("Selesai");
        setItems([createEmptyItem()]);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cashierAccounts, getCashierNameFromAccount, normalizeCashierName, open, transaction]);

  const productsById = useMemo(() => {
    return products.reduce<Record<string, ManualProduct>>((result, product) => {
      result[String(product.id)] = product;
      return result;
    }, {});
  }, [products]);

  const total = items.reduce((sum, item) => sum + Number(item.harga || 0) * Number(item.quantity || 0), 0);

  const updateItem = (rowId: string, field: keyof ManualItem, value: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.rowId !== rowId) return item;
        if (field === "productId") {
          return {
            ...item,
            productId: value,
            harga: productsById[value] ? String(productsById[value].harga) : item.harga,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleSave = async () => {
    const cart = items
      .filter((item) => item.productId && Number(item.quantity) > 0)
      .map((item) => ({
        id: Number(item.productId),
        quantity: Number(item.quantity),
        harga: Number(item.harga),
      }));

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
          tanggal: new Date(`${tanggal}:00Z`).toISOString(),
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
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl my-4 overflow-hidden">
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
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pelanggan</label>
              <input
                value={namaPembeli}
                onChange={(e) => setNamaPembeli(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
                placeholder="Nama pelanggan"
              />
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

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
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
                  <div key={item.rowId} className="grid grid-cols-1 lg:grid-cols-[72px_1fr_110px_150px_44px] gap-3 p-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                      {product?.gambar ? (
                        <img src={product.gambar} alt={product.nama_produk} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400">Foto</span>
                      )}
                    </div>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(item.rowId, "productId", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
                    >
                      <option value="">Pilih produk</option>
                      {products.map((productOption) => (
                        <option key={productOption.id} value={productOption.id}>
                          {productOption.nama_produk}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.rowId, "quantity", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-500 text-sm"
                      placeholder="Qty"
                    />
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
