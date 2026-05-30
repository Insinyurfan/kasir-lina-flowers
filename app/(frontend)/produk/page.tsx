"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { Package, Plus, Edit, Trash2, X, Search, Camera, Flower2, ShoppingCart, Minus, MessageCircle } from "lucide-react";
import Barcode from "react-barcode";
import { getSavedUserSession } from "@/lib/userSession";

type UserSession = {
  id: number;
  username: string;
  fullName?: string;
  role: string;
};

type Product = {
  id: number;
  nama_produk: string;
  harga: number;
  stok: number;
  barcode?: string | null;
  gambar?: string | null;
};

type GuestCartItem = Product & {
  quantity: number;
};

const WHATSAPP_ORDER_NUMBER = "6281247000600";

const getSavedUser = () => {
  return getSavedUserSession<UserSession>();
};

export default function ManajemenProdukPage() {
  const [user] = useState<UserSession | null>(() => getSavedUser());
  const [produkList, setProdukList] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  // STATE LOADING
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [isGuestCartOpen, setIsGuestCartOpen] = useState(false);
  
  // STATE UNTUK ZOOM FOTO & BARCODE
  const [zoomData, setZoomData] = useState<{ type: 'foto' | 'barcode', content: string, title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: 0,
    nama_produk: "",
    harga: "",
    stok: "",
    barcode: "",
    gambar: ""
  });

  const isGuest = user?.role === "Tamu";
  const isAdmin = user?.role !== "Owner";
  const guestCartTotalItems = guestCart.reduce((total, item) => total + item.quantity, 0);
  const actorPayload = {
    actorId: user?.id,
    actorName: user?.fullName || user?.username,
    actorRole: user?.role,
  };

  const fetchProduk = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/produk", { cache: 'no-store' });
      const data = (await res.json()) as Product[];
      setProdukList(data);
    } catch (error) {
      console.error("Gagal memuat produk", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchProduk, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchProduk]);

  const handleOpenAdd = () => {
    if (isGuest) return;
    setIsEdit(false);
    setFormData({ id: 0, nama_produk: "", harga: "", stok: "", barcode: "", gambar: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (produk: Product) => {
    if (isGuest) return;
    setIsEdit(true);
    setFormData({
      id: produk.id,
      nama_produk: produk.nama_produk,
      harga: produk.harga.toString(),
      stok: produk.stok.toString(),
      barcode: produk.barcode || "",
      gambar: produk.gambar || ""
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("⚠️ Ukuran foto maksimal 3MB agar aplikasi tidak lambat!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, gambar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    setIsSaving(true);
    try {
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch("/api/produk", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ...actorPayload }),
      });

      const result = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchProduk();
      } else {
        alert("❌ Gagal menyimpan: " + (result.error || "Terjadi kesalahan server"));
      }
    } catch {
      alert("❌ Terjadi kesalahan koneksi jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleHapus = async (id: number) => {
    if (isGuest) return;
    if (!confirm("Hapus produk ini secara permanen?")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/produk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...actorPayload }),
      });
      if (res.ok) fetchProduk();
      else alert("Gagal menghapus produk");
    } finally {
      setIsLoading(false);
    }
  };

  const addToGuestCart = (produk: Product) => {
    if (produk.stok <= 0) {
      alert("Stok produk ini sedang habis.");
      return;
    }

    setGuestCart((current) => {
      const existingItem = current.find((item) => item.id === produk.id);
      if (existingItem) {
        if (existingItem.quantity >= produk.stok) {
          alert("Jumlah pesanan sudah sesuai stok tersedia.");
          return current;
        }

        return current.map((item) =>
          item.id === produk.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { ...produk, quantity: 1 }];
    });
    setIsGuestCartOpen(true);
  };

  const updateGuestCartQuantity = (id: number, quantity: number) => {
    setGuestCart((current) =>
      current.flatMap((item) => {
        if (item.id !== id) return [item];
        if (quantity <= 0) return [];
        return [{ ...item, quantity: Math.min(quantity, item.stok) }];
      })
    );
  };

  const removeFromGuestCart = (id: number) => {
    setGuestCart((current) => current.filter((item) => item.id !== id));
  };

  const handleGuestWhatsappCheckout = () => {
    if (guestCart.length === 0) {
      alert("Keranjang masih kosong.");
      return;
    }

    const productLines = guestCart
      .map((item, index) => {
        const codeLine = item.barcode ? `\n   Kode: ${item.barcode}` : "";
        return `${index + 1}. ${item.nama_produk}\n   Jumlah: ${item.quantity} pcs${codeLine}`;
      })
      .join("\n\n");

    const message = [
      "Halo Lina Beauty Accessories, saya ingin bertanya dan memesan produk berikut:",
      "",
      productLines,
      "",
      "Mohon info harga dan ketersediaannya ya. Terima kasih."
    ].join("\n");

    window.open(`https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const filteredProduk = produkList.filter(p => 
    p.nama_produk.toLowerCase().includes(search.toLowerCase()) || 
    (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="lina-panel rounded-2xl p-6 min-h-[80vh] border text-slate-800 relative">
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-40 flex flex-col items-center justify-center rounded-2xl">
          <Flower2 size={50} className="text-pink-500 animate-spin mb-4" />
          <p className="font-bold text-pink-600 animate-pulse">Memuat Data...</p>
        </div>
      )}

      {/* HEADER & PENCARIAN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Package className="text-pink-500" /> Katalog Produk</h2>
          <p className="text-slate-500 text-sm mt-1">
            {isGuest ? `Halo ${user?.fullName || "Tamu"}, silakan lihat produk Lina Flowers.` : "Kelola barang, stok, foto, dan barcode."}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-0 flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Cari nama atau barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-pink-50 border border-pink-100 rounded-xl outline-none focus:border-pink-500 text-sm transition-all" />
          </div>
          
          {!isGuest && (
            <button
              onClick={handleOpenAdd}
              className="group flex h-10 w-11 shrink-0 items-center overflow-hidden rounded-xl bg-pink-600 px-3 text-white shadow-md shadow-pink-200 transition-[width,background-color,transform] duration-300 ease-out hover:w-40 hover:bg-pink-700 focus-visible:w-40 focus-visible:bg-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 active:scale-95"
              title="Tambah Produk"
            >
              <Plus size={18} className="shrink-0" />
              <span className="ml-2 max-w-0 whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 group-hover:max-w-28 group-hover:opacity-100 group-focus-visible:max-w-28 group-focus-visible:opacity-100">
                Tambah Produk
              </span>
            </button>
          )}
        </div>
      </div>

      {isGuest ? (
        <div className="pb-28">
          {filteredProduk.length === 0 && !isLoading ? (
            <div className="rounded-2xl border border-pink-100 bg-pink-50/40 py-12 text-center text-slate-400">
              Produk tidak ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProduk.map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-pink-100 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => p.gambar && setZoomData({ type: 'foto', content: p.gambar, title: p.nama_produk })}
                    className="flex aspect-square w-full items-center justify-center overflow-hidden bg-pink-50"
                    title={p.gambar ? "Lihat foto produk" : p.nama_produk}
                  >
                    {p.gambar ? (
                      <img src={p.gambar} alt={p.nama_produk} className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={34} className="text-pink-200" />
                    )}
                  </button>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-800 leading-snug line-clamp-2">{p.nama_produk}</h3>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${p.stok > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stok > 0 ? "Tersedia" : "Stok Habis"}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToGuestCart(p)}
                      disabled={p.stok <= 0}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-3 py-3 text-sm font-black text-white shadow-md shadow-pink-100 transition-all hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                    >
                      <Plus size={16} /> Masukkan Keranjang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isGuestCartOpen && (
              <div className="mb-4 flex h-[68vh] max-h-[36rem] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-pink-600 px-5 py-4 text-white">
                  <div>
                    <h3 className="text-sm font-black">Keranjang Pemesanan</h3>
                    <p className="text-xs font-semibold text-pink-100">Harga akan dikonfirmasi lewat WhatsApp.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGuestCartOpen(false)}
                    className="rounded-full bg-pink-700/50 p-2 text-pink-100 transition-colors hover:bg-pink-700 hover:text-white"
                    title="Tutup keranjang"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-pink-50/30 p-4">
                  {guestCart.length > 0 ? (
                    guestCart.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-pink-50 bg-white p-3 shadow-sm">
                        <div className="flex gap-3">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-pink-50">
                            {item.gambar ? (
                              <img src={item.gambar} alt={item.nama_produk} className="h-full w-full object-cover" />
                            ) : (
                              <Camera size={22} className="text-pink-200" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-2 text-sm font-black text-slate-800">{item.nama_produk}</h4>
                            <p className="mt-1 text-xs font-semibold text-slate-400">Jumlah pesanan: {item.quantity} pcs</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromGuestCart(item.id)}
                            className="h-9 w-9 shrink-0 rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                            title="Hapus dari keranjang"
                          >
                            <Trash2 size={16} className="mx-auto" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => updateGuestCartQuantity(item.id, item.quantity - 1)}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-500 transition-colors hover:bg-slate-100"
                            title="Kurangi jumlah"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-black text-slate-700">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateGuestCartQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stok}
                            className="rounded-xl border border-pink-100 bg-pink-50 p-2 text-pink-600 transition-colors hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Tambah jumlah"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
                      <ShoppingCart size={48} className="text-pink-200" />
                      <p className="text-xs font-black uppercase tracking-widest">Keranjang Kosong</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-pink-100 bg-white p-5">
                  <button
                    type="button"
                    onClick={handleGuestWhatsappCheckout}
                    disabled={guestCart.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-sm font-black uppercase text-white shadow-lg shadow-green-100 transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    <MessageCircle size={18} /> Tanya & Pesan Lewat WhatsApp
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsGuestCartOpen((current) => !current)}
              className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-pink-600 text-white shadow-2xl shadow-pink-300/70 transition-all hover:scale-105 hover:bg-pink-700 active:scale-95"
              title="Buka keranjang"
            >
              {isGuestCartOpen ? <X size={27} /> : <ShoppingCart size={27} />}
              {!isGuestCartOpen && guestCartTotalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-pink-600 bg-white text-xs font-black text-pink-600 shadow-md">
                  {guestCartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
      <>
        {/* CARD PRODUK MOBILE */}
        <div className="md:hidden space-y-3">
          {filteredProduk.length === 0 && !isLoading ? (
            <div className="rounded-2xl border border-pink-100 bg-pink-50/40 py-12 text-center text-slate-400">
              Pencarian tidak ditemukan...
            </div>
          ) : (
            filteredProduk.map((p) => (
              <div key={p.id} className="rounded-2xl border border-pink-100 bg-white p-3 shadow-sm">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => p.gambar && setZoomData({ type: 'foto', content: p.gambar, title: p.nama_produk })}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-pink-50 flex items-center justify-center"
                    title={p.gambar ? "Lihat foto produk" : p.nama_produk}
                  >
                    {p.gambar ? (
                      <img src={p.gambar} alt={p.nama_produk} className="h-full w-full object-cover" />
                    ) : (
                      <Camera size={28} className="text-pink-200" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 leading-snug line-clamp-2">{p.nama_produk}</h3>
                        <p className="mt-1 font-bold text-pink-600">Rp {p.harga.toLocaleString("id-ID")}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${p.stok > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stok} Pcs
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => p.barcode && setZoomData({ type: 'barcode', content: p.barcode, title: p.nama_produk })}
                      disabled={!p.barcode}
                      className={`mt-3 w-full rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors ${p.barcode ? 'border-slate-200 bg-slate-50 text-slate-600 active:scale-[0.99]' : 'border-slate-100 bg-slate-50/60 text-slate-400'}`}
                      title={p.barcode ? "Lihat barcode" : "Tidak ada barcode"}
                    >
                      <span className="block text-[10px] uppercase tracking-wide text-slate-400">Barcode</span>
                      <span className="block truncate font-mono">{p.barcode || "Tidak ada barcode"}</span>
                    </button>
                  </div>
                </div>

                <div className={`mt-3 grid gap-2 ${isAdmin ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <button onClick={() => handleOpenEdit(p)} className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-600 transition-colors active:scale-[0.98]" title="Edit Data">
                    <Edit size={16} /> Edit
                  </button>

                  {!isAdmin && (
                    <button onClick={() => handleHapus(p.id)} className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600 transition-colors active:scale-[0.98]" title="Hapus Produk">
                      <Trash2 size={16} /> Hapus
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* TABEL PRODUK DESKTOP */}
        <div className="hidden overflow-x-auto rounded-xl border border-pink-100 md:block">
        <table className="w-full text-left">
          <thead className="bg-pink-50 text-pink-900 text-sm border-b border-pink-100">
            <tr>
              <th className="p-4 font-semibold w-20 text-center">Foto</th>
              <th className="p-4 font-semibold">Nama Produk</th>
              <th className="p-4 font-semibold">Harga</th>
              <th className="p-4 font-semibold">Stok</th>
              <th className="p-4 font-semibold text-center">Barcode</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredProduk.length === 0 && !isLoading ? (
               <tr><td colSpan={6} className="text-center py-10 text-slate-400">Pencarian tidak ditemukan...</td></tr>
            ) : (
              filteredProduk.map((p) => (
                <tr key={p.id} className="border-b border-pink-50 hover:bg-pink-50/40 transition-colors">
                  <td className="p-4 text-center">
                     {p.gambar ? (
                       <img 
                         src={p.gambar} 
                         alt={p.nama_produk} 
                         onClick={() => setZoomData({ type: 'foto', content: p.gambar || "", title: p.nama_produk })}
                         className="w-12 h-12 rounded-xl object-cover border border-slate-200 mx-auto bg-white cursor-zoom-in hover:scale-105 transition-transform" 
                       />
                     ) : (
                       <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 mx-auto"><Camera size={20}/></div>
                     )}
                  </td>
                  <td className="p-4 font-bold text-slate-700">{p.nama_produk}</td>
                  <td className="p-4 font-bold text-pink-600">Rp {p.harga.toLocaleString("id-ID")}</td>
                  
                  {/* whitespace-nowrap AGAR PCS TIDAK TERPOTONG */}
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stok > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stok} Pcs</span>
                  </td>
                  
                  <td className="p-4 text-center">
                    {p.barcode ? (
                      <div 
                        onClick={() => setZoomData({ type: 'barcode', content: p.barcode || "", title: p.nama_produk })}
                        className="inline-block bg-white p-1 rounded-lg border border-slate-200 cursor-zoom-in hover:border-pink-400 transition-colors"
                      >
                         <Barcode value={p.barcode} width={1.2} height={30} fontSize={10} background="transparent" />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Tidak ada barcode</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit Data"><Edit size={16} /></button>
                      
                      {/* HANYA OWNER YANG BISA LIHAT TOMBOL HAPUS */}
                      {!isAdmin && (
                         <button onClick={() => handleHapus(p.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus Produk"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </>
      )}

      {/* MODAL TAMBAH/EDIT */}
      {!isGuest && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="lina-panel-header p-5 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">{isEdit ? "Edit Produk" : "Tambah Produk Baru"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSimpan} className="p-6 space-y-5">
              
              {/* UPLOAD GAMBAR */}
              <div className="flex flex-col items-center justify-center mb-2">
                 <div className="relative group cursor-pointer" onClick={() => {
                   // Kunci gambar HANYA JIKA mode EDIT dan user adalah ADMIN
                   if (isEdit && isAdmin) {
                     alert("Hanya Owner yang diizinkan mengubah foto produk yang sudah ada.");
                     return;
                   }
                   fileInputRef.current?.click();
                 }}>
                    {formData.gambar ? (
                      <img src={formData.gambar} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-pink-200 shadow-sm" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 group-hover:border-pink-400 group-hover:text-pink-500 transition-colors">
                        <Camera size={28} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                      </div>
                    )}
                    {/* Tampilkan ikon silang/kunci jika mode edit dan role admin */}
                    {isEdit && isAdmin && (
                       <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <X size={24} className="text-white" />
                       </div>
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 <p className="text-[10px] text-slate-400 mt-3 text-center uppercase font-bold tracking-wide">
                   Format JPG/PNG. Maks 3MB.<br/>
                   {isEdit && isAdmin && <span className="text-red-400">(Hanya Owner yang dapat ubah foto)</span>}
                 </p>
              </div>

              {/* NAMA PRODUK - DIKUNCI JIKA EDIT DAN ADMIN */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Produk</label>
                <input 
                  type="text" 
                  required 
                  value={formData.nama_produk} 
                  onChange={(e) => setFormData({...formData, nama_produk: e.target.value})} 
                  disabled={isEdit && isAdmin}
                  className={`w-full border rounded-xl px-4 py-3 outline-none text-sm font-bold text-slate-700 ${isEdit && isAdmin ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200 focus:border-pink-500'}`} 
                  placeholder="Contoh: Buket Mawar" 
                />
              </div>
              
              <div className="flex gap-4">
                {/* HARGA - SELALU BISA DIEDIT */}
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Harga (Rp)</label>
                  <input type="number" required value={formData.harga} onChange={(e) => setFormData({...formData, harga: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-pink-500 text-sm font-bold text-slate-700" placeholder="0" />
                </div>
                {/* STOK - SELALU BISA DIEDIT */}
                <div className="w-1/3">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stok</label>
                  <input type="number" required value={formData.stok} onChange={(e) => setFormData({...formData, stok: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-pink-500 text-sm font-bold text-slate-700" placeholder="0" />
                </div>
              </div>
              
              {/* BARCODE - DIKUNCI JIKA EDIT DAN ADMIN */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Barcode (Opsional)</label>
                <input 
                  type="text" 
                  value={formData.barcode} 
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})} 
                  placeholder="Kosongkan untuk auto-generate" 
                  disabled={isEdit && isAdmin}
                  className={`w-full border rounded-xl px-4 py-3 outline-none text-sm font-bold font-mono text-slate-700 ${isEdit && isAdmin ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-200 focus:border-pink-500'}`} 
                />
                {!(isEdit && isAdmin) && <p className="text-[10px] text-slate-400 mt-1 italic">Jika dikosongkan, sistem otomatis membuat kode acak unik.</p>}
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm text-slate-600 transition-colors">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 shadow-lg shadow-pink-200 transition-all disabled:opacity-50">
                  {isSaving ? <Flower2 size={18} className="animate-spin" /> : "Simpan"} {isSaving ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP ZOOM LIGHTBOX */}
      {zoomData && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-sm"
          onClick={() => setZoomData(null)}
        >
          <div 
            className="relative bg-white p-6 md:p-8 rounded-3xl max-w-sm md:max-w-md w-full flex flex-col items-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-800 text-xl truncate pr-4">{zoomData.title}</h3>
               <button onClick={() => setZoomData(null)} className="text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 p-2 rounded-full transition-colors">
                 <X size={24}/>
               </button>
            </div>
            
            {zoomData.type === 'foto' ? (
              <img src={zoomData.content} alt={zoomData.title} className="w-full max-h-[60vh] object-contain rounded-2xl bg-slate-50 border border-slate-100" />
            ) : (
              <div className="bg-white p-6 md:p-10 rounded-2xl w-full flex flex-col items-center justify-center border border-slate-200">
                 <Barcode value={zoomData.content} width={2.5} height={120} displayValue={false} background="transparent" />
                 <p className="mt-6 font-bold text-2xl tracking-[8px] text-slate-800 font-mono">{zoomData.content}</p>
                 <p className="text-xs text-slate-400 mt-3 uppercase font-bold tracking-widest text-center">Scan kode ini di halaman Kasir</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
