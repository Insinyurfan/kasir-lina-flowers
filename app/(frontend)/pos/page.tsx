"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCartStore, PCS_PER_UNIT, SATUAN_LABELS, hitungHargaSatuan } from "@/lib/store";
import { Search, Plus, Minus, Trash2, ShoppingCart, Flower2, Wallet, User, UserCheck, LogOut, Camera, X, Pencil, Check } from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";

type Product = {
  id: number;
  nama_produk: string;
  harga: number;
  satuanHarga: string;
  stok: number;
  barcode: string | null;
  gambar: string | null;
  gambarPosX?: number;
  gambarPosY?: number;
};

type UserSession = {
  id: number;
  username: string;
  fullName?: string | null;
  role: string;
};

// KOMPONEN UNTUK ANIMASI TERBANG (FLYING ITEM)
const FlyingItem = ({ startX, startY, img }: { startX: number, startY: number, img: string | null }) => {
  const [style, setStyle] = useState({
    left: startX, top: startY, transform: 'scale(1)', opacity: 1
  });

  useEffect(() => {
    // Jalankan animasi sesaat setelah komponen dimounting
    requestAnimationFrame(() => {
      setStyle({
        left: window.innerWidth - 60, // Menuju pojok kanan bawah (posisi ikon keranjang)
        top: window.innerHeight - 60,
        transform: 'scale(0.1)', // Mengecil saat terbang
        opacity: 0.3
      });
    });
  }, []);

  return (
    <div 
      className="fixed z-[999] w-20 h-20 rounded-2xl shadow-2xl pointer-events-none transition-all duration-700 ease-in-out border-2 border-pink-400 bg-white overflow-hidden flex items-center justify-center"
      style={style}
    >
      {img ? (
        <img src={img} alt="" className="w-full h-full object-cover" />
      ) : (
        <Flower2 className="w-full h-full text-pink-300 p-4" />
      )}
    </div>
  );
};

export default function PosPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const cashierDisplayName = user?.fullName || user?.username || "Admin";
  const actorPayload = {
    actorId: user?.id,
    actorName: user?.fullName || user?.username,
    actorRole: user?.role,
  };
  const [namaPembeli, setNamaPembeli] = useState(""); 
  const [metodePembayaran, setMetodePembayaran] = useState("Tunai"); 
  const [isSessionStarted, setIsSessionStarted] = useState(false); 
  
  const [showScanner, setShowScanner] = useState(false);
  const [produk, setProduk] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); 
  const [isCheckoutConfirmOpen, setIsCheckoutConfirmOpen] = useState(false);
  const [isPriceAdjustOpen, setIsPriceAdjustOpen] = useState(false);
  const [priceDraft, setPriceDraft] = useState<Record<number, string>>({});
  const [isPosCartLoaded, setIsPosCartLoaded] = useState(false);
  
  const [isCartOpen, setIsCartOpen] = useState(false); // STATE BUKA/TUTUP KERANJANG
  const [animations, setAnimations] = useState<{id: number, x: number, y: number, img: string | null}[]>([]); // STATE ANIMASI TERBANG
  const animationIdRef = useRef(0);
  
  const { cart, addToCart, removeFromCart, updateQuantity, updatePrice, updateSatuanPesan, setCart, getTotal, clearCart } = useCartStore();

  // MENGHITUNG TOTAL BARANG DI KERANJANG UNTUK BADGE
  const totalBarang = cart.reduce((total, item) => total + item.quantity, 0);

  const clearSavedPosCart = async () => {
    if (!user?.id) return;

    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, scope: "pos" }),
    });
  };

  const fetchProduk = useCallback(async () => {
    const res = await fetch("/api/produk");
    const data = await res.json();
    setProduk(data);
  }, []);

  // EFEK SCANNER KAMERA API LANGSUNG (TANPA UPLOAD GALERI)
  useEffect(() => {
    let html5QrCode: import("html5-qrcode").Html5Qrcode | null = null;
    let isCancelled = false;

    if (showScanner) {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        alert("Kamera hanya bisa dibuka lewat HTTPS atau localhost. Untuk HP, gunakan URL HTTPS/tunnel seperti ngrok atau deploy production.");
        window.setTimeout(() => setShowScanner(false), 0);
        return;
      }

      import("html5-qrcode")
        .then(({ Html5Qrcode }) => {
          if (isCancelled) return;

          html5QrCode = new Html5Qrcode("reader");
          return html5QrCode.start(
            { facingMode: "environment" }, // Pakai kamera belakang jika di HP
            { fps: 10, qrbox: { width: 250, height: 100 } },
            (decodedText) => {
              // JIKA BERHASIL SCAN:
              const matchedProduct = produk.find(p => p.barcode === decodedText);
              if (matchedProduct) {
                 addToCart(matchedProduct);
                 alert(`✅ ${matchedProduct.nama_produk} otomatis masuk keranjang!`);
              } else {
                 alert(`❌ Barcode ${decodedText} tidak ditemukan!`);
              }
              setShowScanner(false);
            },
            () => { /* Abaikan error tiap frame saat kamera mencari barcode */ }
          );
        })
        .catch(() => {
          alert("Gagal membuka kamera. Pastikan browser diizinkan mengakses kamera.");
          setShowScanner(false);
        });
    }

    return () => {
      isCancelled = true;
      const scanner = html5QrCode;
      if (scanner?.isScanning) {
        scanner.stop().then(() => scanner.clear()).catch(console.error);
      }
    };
  }, [showScanner, produk, addToCart]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedUser = getSavedUserSession<UserSession>();
      if (savedUser) setUser(savedUser);

      const savedCustomer = localStorage.getItem("pos_customer_name");
      const savedSession = localStorage.getItem("pos_session_active");
      if (savedSession === "true" && savedCustomer) {
        setNamaPembeli(savedCustomer);
        setIsSessionStarted(true);
      }
      fetchProduk();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchProduk]);

  useEffect(() => {
    if (isSessionStarted) {
      localStorage.setItem("pos_customer_name", namaPembeli);
      localStorage.setItem("pos_session_active", "true");
    }
  }, [namaPembeli, isSessionStarted]);

  useEffect(() => {
    if (!user?.id) {
      const timeoutId = window.setTimeout(() => setIsPosCartLoaded(true), 0);
      return () => window.clearTimeout(timeoutId);
    }

    let isCancelled = false;

    const fetchSavedCart = async () => {
      try {
        const res = await fetch(`/api/cart?userId=${user.id}&scope=pos`, { cache: "no-store" });
        const data = await res.json();
        if (!isCancelled && Array.isArray(data.items)) {
          setCart(data.items);
          setNamaPembeli(data.customerName || "");
          setMetodePembayaran(data.paymentMethod || "Tunai");
          setIsSessionStarted(Boolean(data.sessionActive || data.customerName || data.items.length > 0));
        }
      } finally {
        if (!isCancelled) setIsPosCartLoaded(true);
      }
    };

    fetchSavedCart();

    return () => {
      isCancelled = true;
    };
  }, [setCart, user?.id]);

  useEffect(() => {
    if (!user?.id || !isPosCartLoaded || isProcessing) return;

    const timeoutId = window.setTimeout(() => {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          scope: "pos",
          items: cart,
          customerName: namaPembeli,
          paymentMethod: metodePembayaran,
          sessionActive: isSessionStarted,
        }),
      }).catch(() => {
        console.error("Gagal menyimpan keranjang kasir");
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [cart, isPosCartLoaded, isProcessing, isSessionStarted, metodePembayaran, namaPembeli, user?.id]);

  const handleLogoutSession = () => {
    if (confirm("Apakah Anda ingin menutup sesi pesanan ini?")) {
      clearSavedPosCart().catch(() => {
        console.error("Gagal menghapus sesi keranjang kasir");
      });
      localStorage.removeItem("pos_customer_name");
      localStorage.removeItem("pos_session_active");
      setNamaPembeli("");
      setIsSessionStarted(false);
      setIsCheckoutConfirmOpen(false);
      setIsPriceAdjustOpen(false);
      setPriceDraft({});
      clearCart();
    }
  };

  const resetCheckoutFlow = () => {
    setIsCheckoutConfirmOpen(false);
    setIsPriceAdjustOpen(false);
    setPriceDraft({});
  };

  const openPriceAdjustment = () => {
    setPriceDraft(
      cart.reduce<Record<number, string>>((draft, item) => {
        draft[item.id] = String(item.harga);
        return draft;
      }, {})
    );
    setIsCheckoutConfirmOpen(false);
    setIsPriceAdjustOpen(true);
    setIsCartOpen(true);
  };

  const savePriceAdjustment = () => {
    for (const item of cart) {
      const value = Number(priceDraft[item.id]);
      if (!Number.isFinite(value) || value < 0) {
        alert(`Harga ${item.nama_produk} belum valid.`);
        return;
      }
    }

    cart.forEach((item) => updatePrice(item.id, Number(priceDraft[item.id])));
    setIsPriceAdjustOpen(false);
    setIsCheckoutConfirmOpen(true);
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    if (!namaPembeli.trim()) return alert("Nama pembeli harus diisi!");

    setIsCheckoutConfirmOpen(true);
  };

  const processCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    if (!namaPembeli.trim()) return alert("Nama pembeli harus diisi!");

    setIsProcessing(true);
    setIsCheckoutConfirmOpen(false);
    const statusTransaksi = metodePembayaran === "Belum Bayar" ? "Unpaid" : "Paid";
    
    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cart, metode_pembayaran: metodePembayaran, nama_pembeli: namaPembeli,
          nama_kasir: cashierDisplayName, status: statusTransaksi, status_pengiriman: "Sedang Disiapkan",
          ...actorPayload,
        }),
      });

      if (res.ok) {
        await res.json();
        await clearSavedPosCart();
        alert(`🎉 Transaksi atas nama ${namaPembeli} Berhasil!`);
        localStorage.removeItem("pos_customer_name");
        localStorage.removeItem("pos_session_active");
        window.dispatchEvent(new Event("lina_notifications_updated"));
        localStorage.setItem("lina_notifications_refresh_at", String(Date.now()));
        clearCart(); setNamaPembeli(""); setMetodePembayaran("Tunai"); setIsSessionStarted(false); setIsCartOpen(false); resetCheckoutFlow();
      } else {
        alert("Gagal memproses transaksi.");
      }
    } finally { setIsProcessing(false); }
  };

  const triggerFlyAnimation = (e: React.MouseEvent, p: Product) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    animationIdRef.current += 1;
    const newAnim = { id: animationIdRef.current, x: rect.left + rect.width / 2 - 40, y: rect.top + rect.height / 2 - 40, img: p.gambar };
    setAnimations(prev => [...prev, newAnim]);
    setTimeout(() => {
      setAnimations(prev => prev.filter(anim => anim.id !== newAnim.id));
    }, 700);
  };

  // Klik produk → langsung masuk keranjang dengan satuan default produk + animasi terbang
  const handleProductClick = (e: React.MouseEvent, p: Product) => {
    triggerFlyAnimation(e, p);
    addToCart({ ...p, satuanPesan: p.satuanHarga ?? "pcs", hargaBase: p.harga });
  };

  const filteredProduk = produk.filter(p => 
    p.nama_produk.toLowerCase().includes(search.toLowerCase()) || 
    (p.barcode && p.barcode.includes(search))
  );

  // TAMPILAN AWAL: INPUT NAMA PELANGGAN
  if (!isSessionStarted) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="lina-panel p-10 rounded-3xl border w-full max-w-md text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck size={40} className="text-pink-600" />
          </div>
          
          {/* SAPAAN NAMA KASIR DITAMBAHKAN DI SINI */}
          <p className="text-pink-500 font-bold mb-1 tracking-wide">Halo, {cashierDisplayName}! 👋</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Mulai Pesanan</h2>
          <p className="text-slate-500 mb-8 text-sm italic">Pastikan nama pelanggan sudah benar sebelum memulai.</p>
          
          <div className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1 tracking-widest">Nama Pelanggan</label>
              <input type="text" value={namaPembeli} onChange={(e) => setNamaPembeli(e.target.value)} placeholder="Masukkan nama..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-pink-500 transition-all font-bold text-slate-700" />
            </div>
            <button onClick={() => { if(!namaPembeli.trim()) return alert("⚠️ Masukkan nama pelanggan!"); setIsSessionStarted(true); }} className="w-full bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all">BUKA KASIR</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lina-page-stack flex flex-col gap-6 h-[calc(100vh-6rem)] relative w-full">
      
      {/* RENDER ANIMASI TERBANG */}
      {animations.map(anim => (
         <FlyingItem key={anim.id} startX={anim.x} startY={anim.y} img={anim.img} />
      ))}

      {/* MODAL SCANNER KAMERA KUSTOM */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Scan Barcode</h3>
                <p className="text-xs text-slate-500">Kamera akan otomatis mendeteksi produk</p>
              </div>
              <button onClick={() => setShowScanner(false)} className="bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-100"><X size={24}/></button>
            </div>
            <div className="rounded-2xl overflow-hidden border-4 border-pink-300">
               {/* Container untuk Html5Qrcode API */}
               <div id="reader" className="w-full bg-black"></div>
            </div>
          </div>
        </div>
      )}

      {isCheckoutConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h3 className="text-lg font-black text-slate-800">Periksa Harga Pesanan</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Pastikan harga untuk <span className="font-black text-pink-600">{namaPembeli}</span> sudah sesuai sebelum transaksi disimpan.
              </p>
            </div>

            <div className="mb-5 max-h-60 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">{item.nama_produk}</p>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {item.quantity} {SATUAN_LABELS[item.satuanPesan ?? "pcs"] ?? item.satuanPesan} x Rp {item.harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-pink-600">Rp {(item.harga * item.quantity).toLocaleString("id-ID")}</p>
                </div>
              ))}
            </div>

            <div className="mb-5 flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3">
              <span className="text-xs font-black uppercase text-pink-500">Total</span>
              <span className="text-xl font-black text-pink-700">Rp {getTotal().toLocaleString("id-ID")}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={openPriceAdjustment}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Pencil size={17} /> Sesuaikan Harga
              </button>
              <button
                type="button"
                onClick={processCheckout}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-pink-200 transition-colors hover:bg-pink-700 disabled:opacity-50"
              >
                <Check size={18} /> Sudah Sesuai
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutConfirmOpen(false)}
              className="mt-3 w-full rounded-2xl border border-pink-100 bg-pink-50/60 px-4 py-3 text-xs font-black text-pink-600 transition-colors hover:bg-pink-100"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {isPriceAdjustOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="font-black text-slate-800">Sesuaikan Harga</h3>
                <p className="mt-1 text-xs text-slate-500">Harga ini hanya berlaku untuk pesanan {namaPembeli}.</p>
              </div>
              <button onClick={() => setIsPriceAdjustOpen(false)} className="rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {cart.map((item) => {
                const draftPrice = Number(priceDraft[item.id] || 0);
                const basePrice = item.hargaAwal ?? item.harga;

                return (
                  <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-800">{item.nama_produk}</p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-400">
                          {item.quantity} {SATUAN_LABELS[item.satuanPesan ?? "pcs"] ?? item.satuanPesan} · harga awal Rp {basePrice.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-black text-pink-600">
                        Rp {(draftPrice * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={priceDraft[item.id] ?? String(item.harga)}
                      onChange={(event) => setPriceDraft((current) => ({ ...current, [item.id]: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-pink-500"
                    />
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400">Total Baru</span>
                <span className="text-2xl font-black text-pink-600">
                  Rp {cart.reduce((total, item) => total + Number(priceDraft[item.id] || 0) * item.quantity, 0).toLocaleString("id-ID")}
                </span>
              </div>
              <button
                type="button"
                onClick={savePriceAdjustment}
                className="w-full rounded-2xl bg-pink-600 py-4 text-sm font-black text-white shadow-lg shadow-pink-200 transition-colors hover:bg-pink-700"
              >
                Simpan Penyesuaian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AREA UTAMA: KATALOG PRODUK */}
      <div className="lina-panel flex-1 flex flex-col rounded-2xl border overflow-hidden w-full">
        <div className="lina-panel-header p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
              <input type="text" placeholder="Ketik atau scan barcode..." className="w-full pl-10 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-pink-400 outline-none text-sm font-medium shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowScanner(true)} className="p-3 bg-white text-pink-600 border border-pink-200 rounded-xl hover:bg-pink-100 shadow-sm" title="Scan Kamera">
              <Camera size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-pink-100 shadow-sm self-end md:self-auto">
             <div className="text-right">
                <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Kasir Aktif</p>
                <p className="text-xs font-bold text-pink-600">{cashierDisplayName}</p>
             </div>
             <button onClick={handleLogoutSession} className="text-slate-300 hover:text-red-500 p-1 border-l pl-3 ml-1" title="Tutup Sesi">
                <LogOut size={20} />
             </button>
          </div>
        </div>

        {/* GRID PRODUK */}
        {/* Mobile: list (1 kolom), Desktop: grid (4-5 kolom) */}
        <div className="p-3 overflow-y-auto grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3 flex-1 content-start pb-32">
          {filteredProduk.map((p) => (
            <article
              key={p.id}
              onClick={(e) => handleProductClick(e, p)}
              className="group flex flex-row md:flex-col items-center md:items-stretch rounded-2xl bg-white border border-pink-100 overflow-hidden shadow-sm hover:shadow-md hover:border-pink-300 transition-all duration-200 cursor-pointer active:scale-[0.97]"
            >
              {/* FOTO: kecil di kiri (mobile), full-width di atas (desktop) */}
              <div className="relative w-16 h-16 md:w-full md:h-44 overflow-hidden bg-pink-50 flex-shrink-0 rounded-xl md:rounded-none m-2 md:m-0">
                {p.gambar ? (
                  <img
                    src={p.gambar}
                    alt={p.nama_produk}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ objectPosition: `${p.gambarPosX ?? 50}% ${p.gambarPosY ?? 50}%` }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Flower2 size={24} className="text-pink-200" />
                  </div>
                )}
              </div>

              {/* INFO: rata kiri (mobile), rata tengah (desktop) */}
              <div className="flex-1 flex flex-col justify-center px-2 py-1 md:items-center md:text-center md:p-3 md:gap-1 min-w-0">
                <h3
                  className="font-semibold text-sm line-clamp-2 text-slate-900 leading-snug md:min-h-[2.4em]"
                  title={p.nama_produk}
                >
                  {p.nama_produk}
                </h3>
                <p className="font-extrabold text-sm md:text-base text-pink-600 mt-0.5 md:mt-0 leading-none">
                  Rp {p.harga.toLocaleString("id-ID")}
                </p>
                {(p.satuanHarga ?? "pcs") !== "pcs" && (
                  <p className="text-[9px] text-pink-400 font-medium mt-0.5">
                    /{SATUAN_LABELS[p.satuanHarga]}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON & POP-UP KERANJANG DI POJOK KANAN BAWAH */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
         
         {/* POP-UP KERANJANG */}
         {isCartOpen && (
            <div className="bg-white rounded-3xl shadow-2xl border border-pink-100 w-[90vw] sm:w-[400px] mb-4 flex flex-col h-[65vh] max-h-[600px] overflow-hidden transform origin-bottom-right transition-all animate-in slide-in-from-bottom-5">
              
              <div className="p-4 bg-pink-600 text-white font-bold flex justify-between items-center shadow-md z-10">
                <span className="flex items-center gap-2 text-sm"><User size={16} className="text-pink-200"/> {namaPembeli}</span>
                <button onClick={() => setIsCartOpen(false)} className="text-pink-200 hover:text-white bg-pink-700/50 p-1 rounded-full"><X size={18}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-pink-50/50">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="bg-white shadow-sm p-3 rounded-2xl border border-pink-50 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-800 truncate">{item.nama_produk}</h4>
                          <p className="text-pink-600 text-[11px] font-extrabold mt-0.5">
                            Rp {(item.harga * item.quantity).toLocaleString("id-ID")}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400">
                            Rp {item.harga.toLocaleString("id-ID")} / {SATUAN_LABELS[item.satuanPesan ?? "pcs"] ?? item.satuanPesan ?? "pcs"}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button onClick={openPriceAdjustment} className="p-1.5 text-slate-400 hover:bg-pink-50 hover:text-pink-600 rounded-lg" title="Sesuaikan harga"><Pencil size={13} /></button>
                          <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Ganti satuan (hanya untuk produk non-pcs) */}
                        {(item.satuanHarga ?? "pcs") !== "pcs" && (
                          <select
                            value={item.satuanPesan ?? item.satuanHarga ?? "pcs"}
                            onChange={(e) => updateSatuanPesan(item.id, e.target.value)}
                            className="text-[11px] font-bold border border-pink-200 rounded-lg px-2 py-1 bg-pink-50 text-pink-600 outline-none cursor-pointer"
                          >
                            {(["gross", "lusin", "pcs"] as const).map(s => (
                              <option key={s} value={s}>
                                {SATUAN_LABELS[s]} — Rp {hitungHargaSatuan(item.hargaBase ?? item.harga, item.satuanHarga ?? "pcs", s).toLocaleString("id-ID")}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 ml-auto">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 bg-white shadow-sm rounded-lg text-slate-500"><Minus size={12}/></button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 bg-white shadow-sm rounded-lg text-pink-600"><Plus size={12}/></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                     <ShoppingCart size={48} className="opacity-50" />
                     <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Keranjang Kosong</p>
                  </div>
                )}
              </div>

              <div className="p-5 bg-white border-t border-pink-100 space-y-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                 <div className="bg-pink-50 p-3 rounded-xl border border-pink-100">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400 mb-1 flex items-center gap-1"><Wallet size={12}/> Metode Pembayaran</label>
                  <select value={metodePembayaran} onChange={(e) => setMetodePembayaran(e.target.value)} className="w-full bg-transparent outline-none font-bold text-pink-600 text-sm cursor-pointer">
                    <option value="Tunai">💵 Tunai (Cash)</option><option value="QRIS">📱 QRIS / E-Wallet</option><option value="Transfer Bank">🏦 Transfer Bank</option><option value="Belum Bayar">🔴 Belum Bayar (Piutang)</option>
                  </select>
                </div>
                
                <div className="flex justify-between items-end px-1">
                  <span className="text-slate-500 font-bold text-xs uppercase">Total Tagihan</span>
                  <span className="text-2xl font-black text-pink-600">Rp {getTotal().toLocaleString("id-ID")}</span>
                </div>

                <button onClick={handleCheckout} disabled={isProcessing || cart.length === 0} className="w-full py-4 bg-pink-600 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all active:scale-[0.98] disabled:opacity-50">
                  {isProcessing ? "MEMPROSES..." : "SELESAIKAN PESANAN"}
                </button>
              </div>
            </div>
         )}

         {/* TOMBOL MENGAMBANG KERANJANG */}
         <button 
           onClick={() => setIsCartOpen(!isCartOpen)} 
           className="bg-pink-600 text-white p-4 md:p-5 rounded-full shadow-2xl shadow-pink-400/50 hover:bg-pink-700 hover:scale-105 transition-all active:scale-95 flex items-center justify-center relative z-50 border-4 border-white"
         >
           {isCartOpen ? <X size={28} /> : <ShoppingCart size={28} />}
           
           {/* BADGE JUMLAH BARANG DI KERANJANG */}
           {!isCartOpen && totalBarang > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-pink-600 border-2 border-pink-600 font-black w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md animate-bounce">
                {totalBarang}
              </span>
           )}
         </button>
      </div>

    </div>
  );
}
