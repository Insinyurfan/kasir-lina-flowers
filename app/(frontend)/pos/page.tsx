"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCartStore, SATUAN_LABELS, hitungHargaSatuan, type CartItem } from "@/lib/store";
import { Search, Plus, Minus, Trash2, ShoppingCart, Flower2, Wallet, User, UserCheck, LogOut, Camera, X, Pencil, Check } from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";

type Variant = {
  id: number;
  name: string;
  priceModifier: number | null;
};

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
  variants?: Variant[];
};

type UserSession = {
  id: number;
  username: string;
  fullName?: string | null;
  role: string;
};

// Tampilkan harga di grid POS: rentang termurah–termahal jika produk punya variasi
const formatHargaPos = (p: Product) => {
  const vs = (p.variants ?? []).map((v) => v.priceModifier).filter((x): x is number => x != null);
  if (vs.length > 0) {
    const min = Math.min(...vs);
    const max = Math.max(...vs);
    return min === max
      ? `Rp ${min.toLocaleString("id-ID")}`
      : `Rp ${min.toLocaleString("id-ID")} - ${max.toLocaleString("id-ID")}`;
  }
  return `Rp ${p.harga.toLocaleString("id-ID")}`;
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

// Nama produk yang panjang: auto-scroll pelan ke kiri-kanan, dan bisa digeser manual (klik-tahan / swipe).
const ScrollingName = ({ text }: { text: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);
  const pausedRef = useRef(false);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });

  useEffect(() => {
    const el = containerRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const check = () => setOverflow(inner.scrollWidth > el.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [text]);

  useEffect(() => {
    if (!overflow) return;
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    let dir = 1;
    const step = () => {
      if (!pausedRef.current) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          el.scrollLeft += 0.4 * dir;
          if (el.scrollLeft >= max) dir = -1;
          else if (el.scrollLeft <= 0) dir = 1;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [overflow]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el || !overflow) return;
    dragRef.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
    pausedRef.current = true;
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el || !dragRef.current.active) return;
    el.scrollLeft = dragRef.current.startScroll - (e.clientX - dragRef.current.startX);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    pausedRef.current = false;
    containerRef.current?.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`overflow-x-hidden whitespace-nowrap select-none touch-pan-x ${overflow ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <span ref={innerRef} className="inline-block">{text}</span>
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
  const [priceEditItem, setPriceEditItem] = useState<CartItem | null>(null); // item yang sedang disesuaikan harganya
  const [priceEditDraft, setPriceEditDraft] = useState("");
  // Harga khusus tersimpan untuk pelanggan sesi ini: key `${productId}-${variantId}` -> harga dasar.
  const [rememberedPrices, setRememberedPrices] = useState<Record<string, number>>({});
  const [rememberForCustomer, setRememberForCustomer] = useState(false);
  const [qtyDraft, setQtyDraft] = useState<Record<number, string>>({});
  const [isPosCartLoaded, setIsPosCartLoaded] = useState(false);

  // Edit nama pelanggan langsung dari dalam keranjang (tanpa menutup sesi).
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerDraft, setCustomerDraft] = useState("");
  // Tambah varian cepat langsung dari modal POS (tanpa ke halaman Produk).
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false); // STATE BUKA/TUTUP KERANJANG
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null); // PRODUK YANG SEDANG PILIH VARIASI
  const [animations, setAnimations] = useState<{id: number, x: number, y: number, img: string | null}[]>([]); // STATE ANIMASI TERBANG
  const animationIdRef = useRef(0);
  // Tanda ada perubahan keranjang lokal yang belum tersimpan ke server.
  // Dipakai agar auto-refresh (saat halaman kembali fokus) tidak menimpa
  // pilihan varian/harga yang barusan diubah tapi belum sempat tersinkron.
  const cartDirtyRef = useRef(false);

  const { cart, addToCart, removeFromCart, updateQuantity, updateHargaBase, updateSatuanPesan, setCart, getTotal, clearCart } = useCartStore();

  // MENGHITUNG TOTAL BARANG DI KERANJANG UNTUK BADGE
  const totalBarang = cart.reduce((total, item) => total + item.quantity, 0);

  // Hapus draft jumlah untuk satu item (dipakai saat tekan +/-)
  const clearQtyDraft = (id: number) =>
    setQtyDraft((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

  // Simpan hasil ketik manual jumlah ke keranjang
  const commitQtyDraft = (id: number) => {
    setQtyDraft((prev) => {
      if (!(id in prev)) return prev;
      const parsed = parseInt(prev[id], 10);
      if (!isNaN(parsed) && parsed >= 1) updateQuantity(id, parsed);
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleQtyStep = (id: number, nextQty: number) => {
    clearQtyDraft(id);
    updateQuantity(id, nextQty);
  };

  const clearSavedPosCart = async () => {
    if (!user?.id) return;

    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, scope: "pos" }),
    });
  };

  const fetchProduk = useCallback(async (): Promise<Product[]> => {
    const res = await fetch("/api/produk");
    const data = await res.json();
    const list: Product[] = Array.isArray(data) ? data : [];
    setProduk(list);
    return list;
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
                 if (matchedProduct.variants && matchedProduct.variants.length > 0) {
                   setVariantModalProduct(matchedProduct);
                   alert(`✅ ${matchedProduct.nama_produk} — silakan pilih variasi.`);
                 } else {
                   addToCart(matchedProduct);
                   alert(`✅ ${matchedProduct.nama_produk} otomatis masuk keranjang!`);
                 }
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

  // Harga khusus pelanggan: kunci & resolusi (varian spesifik → level produk → harga default).
  const priceKey = (productId: number, variantId: number) => `${productId}-${variantId}`;
  const resolveRememberedBase = (productId: number, variantId: number | null | undefined, fallback: number) => {
    const vId = variantId ?? 0;
    return rememberedPrices[priceKey(productId, vId)] ?? rememberedPrices[priceKey(productId, 0)] ?? fallback;
  };

  // Muat harga khusus untuk pelanggan sesi ini. Kalau kosong, alur harga = seperti biasa.
  useEffect(() => {
    const name = namaPembeli.trim();
    if (!name || !isSessionStarted) {
      setRememberedPrices({});
      return;
    }
    let cancelled = false;
    fetch(`/api/harga-pelanggan?customerName=${encodeURIComponent(name)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((rows) => {
        if (cancelled || !Array.isArray(rows)) return;
        const map: Record<string, number> = {};
        for (const row of rows) {
          map[priceKey(Number(row.productId), Number(row.variantId))] = Number(row.price);
        }
        setRememberedPrices(map);
      })
      .catch(() => {
        /* abaikan kegagalan jaringan; pakai harga default */
      });
    return () => {
      cancelled = true;
    };
  }, [namaPembeli, isSessionStarted]);

  // Ambil keranjang tersimpan dari server (per akun) — dipakai saat mount & auto-refresh.
  // force=true (saat mount) tetap memuat walau ada perubahan lokal; saat auto-refresh
  // (force=false) dilewati bila ada perubahan lokal belum tersimpan agar tidak menimpa.
  const refreshSavedCart = useCallback(async (force = false) => {
    if (!user?.id) return;
    if (!force && cartDirtyRef.current) return;
    try {
      const res = await fetch(`/api/cart?userId=${user.id}&scope=pos`, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.items)) {
        // Gabungkan dengan keranjang lokal: server jadi acuan lintas-perangkat, TAPI info
        // varian/harga dari lokal dipertahankan bila server kehilangannya (mis. JOIN varian
        // stale / belum tersinkron). Ini mencegah nama varian hilang dari struk/nota/surat jalan.
        const localCart = useCartStore.getState().cart;
        const localById = new Map(localCart.map((item) => [item.id, item]));
        const serverItems = data.items as CartItem[];
        const serverIds = new Set(serverItems.map((item) => item.id));
        const merged: CartItem[] = serverItems.map((srv) => {
          const local = localById.get(srv.id);
          if (!local) return srv;
          return {
            ...srv,
            variantId: srv.variantId ?? local.variantId ?? null,
            variantName: srv.variantName ?? local.variantName ?? null,
          };
        });
        // Pertahankan baris lokal yang belum sempat tersimpan ke server (mis. varian baru dipilih).
        for (const local of localCart) {
          if (!serverIds.has(local.id)) merged.push(local);
        }
        setCart(merged);
        setNamaPembeli((prev) => data.customerName || prev || "");
        setMetodePembayaran(data.paymentMethod || "Tunai");
        setIsSessionStarted(Boolean(data.sessionActive || data.customerName || merged.length > 0));
      }
    } catch {
      /* abaikan kegagalan jaringan */
    }
  }, [setCart, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      const timeoutId = window.setTimeout(() => setIsPosCartLoaded(true), 0);
      return () => window.clearTimeout(timeoutId);
    }

    let isCancelled = false;
    (async () => {
      await refreshSavedCart(true);
      if (!isCancelled) setIsPosCartLoaded(true);
    })();

    return () => {
      isCancelled = true;
    };
  }, [refreshSavedCart, user?.id]);

  // Auto-refresh keranjang saat halaman kembali fokus (mis. balik dari tab/HP lain),
  // sehingga akun yang sama tetap sinkron antar perangkat tanpa polling boros.
  useEffect(() => {
    if (!user?.id) return;

    const handleFocus = () => {
      if (document.visibilityState !== "visible") return;
      if (!isPosCartLoaded || isProcessing) return;
      // Jangan ganggu saat ada modal aktif agar data tidak berubah di tengah interaksi.
      if (variantModalProduct || priceEditItem || isCheckoutConfirmOpen || showScanner) return;
      refreshSavedCart();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [user?.id, isPosCartLoaded, isProcessing, variantModalProduct, priceEditItem, isCheckoutConfirmOpen, showScanner, refreshSavedCart]);

  useEffect(() => {
    if (!user?.id || !isPosCartLoaded || isProcessing) return;

    // Ada perubahan yang belum tersimpan → tahan auto-refresh agar tidak menimpa.
    cartDirtyRef.current = true;

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
      })
        .then(() => {
          // Tersimpan → aman untuk disinkron ulang dari server.
          cartDirtyRef.current = false;
        })
        .catch(() => {
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
      setPriceEditItem(null);
      setPriceEditDraft("");
      clearCart();
    }
  };

  const resetCheckoutFlow = () => {
    setIsCheckoutConfirmOpen(false);
    setPriceEditItem(null);
    setPriceEditDraft("");
  };

  // Buka penyesuaian harga untuk SATU item saja (berbasis harga dasar / per satuanHarga).
  const openPriceEdit = (item: CartItem) => {
    setPriceEditItem(item);
    setPriceEditDraft(String(item.hargaBase ?? item.harga));
    setRememberForCustomer(false);
    setIsCartOpen(true);
  };

  // Simpan harga khusus pelanggan ke server + cache lokal (dipakai otomatis berikutnya).
  // Disimpan di level PRODUK (variantId 0) agar berlaku untuk SEMUA varian/kode produk ini —
  // varian Aneka hanya kode pelanggan, jadi harganya sama untuk semua kode.
  const persistCustomerPrice = async (item: CartItem, price: number) => {
    const name = namaPembeli.trim();
    if (!name) return;
    const productId = item.productId ?? item.id;
    setRememberedPrices((prev) => {
      const next: Record<string, number> = {};
      const prefix = `${productId}-`;
      // Buang entri per-varian lama untuk produk ini agar harga level produk jadi acuan tunggal.
      for (const [key, value] of Object.entries(prev)) {
        if (!key.startsWith(prefix)) next[key] = value;
      }
      next[priceKey(productId, 0)] = price;
      return next;
    });
    try {
      await fetch("/api/harga-pelanggan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name, productId, variantId: 0, price }),
      });
    } catch {
      /* abaikan; cache lokal sudah diperbarui */
    }
  };

  // Simpan penyesuaian → harga tersimpan di keranjang, kembali ke keranjang (tidak loncat ke checkout).
  const savePriceEdit = () => {
    if (!priceEditItem) return;
    const value = Number(priceEditDraft);
    if (!Number.isFinite(value) || value < 0) {
      alert(`Harga ${priceEditItem.nama_produk} belum valid.`);
      return;
    }
    updateHargaBase(priceEditItem.id, value);
    if (rememberForCustomer) void persistCustomerPrice(priceEditItem, Math.round(value));
    setPriceEditItem(null);
    setPriceEditDraft("");
    setRememberForCustomer(false);
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
          cart, metode_pembayaran: metodePembayaran, nama_pembeli: namaPembeli.toUpperCase(),
          nama_kasir: cashierDisplayName?.toUpperCase(), status: statusTransaksi, status_pengiriman: "Sedang Disiapkan",
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

  // Klik produk → jika punya variasi, buka modal pilih variasi dulu. Jika tidak, langsung masuk keranjang.
  const handleProductClick = (e: React.MouseEvent, p: Product) => {
    if (p.variants && p.variants.length > 0) {
      setVariantModalProduct(p);
      return;
    }
    triggerFlyAnimation(e, p);
    const base = resolveRememberedBase(p.id, 0, p.harga);
    addToCart({ ...p, satuanPesan: p.satuanHarga ?? "pcs", hargaBase: base });
  };

  // Setelah memilih variasi → masuk keranjang dengan harga & nama variasi
  const handleVariantSelected = (p: Product, variant: Variant) => {
    const hargaVarian = variant.priceModifier ?? p.harga;
    const base = resolveRememberedBase(p.id, variant.id, hargaVarian);
    addToCart({
      ...p,
      harga: base,
      hargaBase: base,
      satuanPesan: p.satuanHarga ?? "pcs",
      variantId: variant.id,
      variantName: variant.name,
    });
    setVariantModalProduct(null);
  };

  // Simpan perubahan nama pelanggan dari dalam keranjang.
  const startEditCustomer = () => {
    setCustomerDraft(namaPembeli);
    setIsEditingCustomer(true);
  };
  const commitCustomerEdit = () => {
    const next = customerDraft.trim();
    if (!next) {
      alert("⚠️ Nama pelanggan tidak boleh kosong!");
      return;
    }
    setNamaPembeli(next);
    setIsEditingCustomer(false);
  };

  // Tambah varian baru langsung dari modal POS, lalu refresh produk & modal.
  const handleAddVariantInline = async () => {
    if (!variantModalProduct) return;
    const name = newVariantName.trim();
    if (!name) {
      alert("⚠️ Nama varian/kode tidak boleh kosong!");
      return;
    }
    setIsAddingVariant(true);
    try {
      const res = await fetch(`/api/produk/${variantModalProduct.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(newVariantPrice) || variantModalProduct.harga,
          ...actorPayload,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Gagal menambah varian.");
        return;
      }
      const created = (await res.json()) as Variant;
      // Perbarui daftar produk dari server lalu sinkronkan modal yang sedang terbuka.
      const refreshed = await fetchProduk();
      const updated = Array.isArray(refreshed)
        ? refreshed.find((p) => p.id === variantModalProduct.id)
        : undefined;
      setVariantModalProduct(updated ?? {
        ...variantModalProduct,
        variants: [...(variantModalProduct.variants ?? []), created],
      });
      setNewVariantName("");
      setNewVariantPrice("");
    } catch {
      alert("Gagal menambah varian.");
    } finally {
      setIsAddingVariant(false);
    }
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

      {/* MODAL PILIH VARIASI */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setVariantModalProduct(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-4 text-white">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Pilih Variasi</p>
                <h3 className="font-black text-lg leading-tight truncate">{variantModalProduct.nama_produk}</h3>
              </div>
              <button onClick={() => setVariantModalProduct(null)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full shrink-0"><X size={20} /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {(variantModalProduct.variants || []).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVariantSelected(variantModalProduct, v)}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-amber-200 bg-amber-50 px-3 py-4 hover:border-amber-400 hover:bg-amber-100 active:scale-95 transition-all"
                >
                  <span className="text-base font-black text-slate-800">{v.name}</span>
                  <span className="text-sm font-bold text-amber-600">
                    Rp {(v.priceModifier ?? variantModalProduct.harga).toLocaleString("id-ID")}
                    {(variantModalProduct.satuanHarga ?? "pcs") !== "pcs" && (
                      <span className="text-[10px] text-slate-400"> /{SATUAN_LABELS[variantModalProduct.satuanHarga] ?? variantModalProduct.satuanHarga}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
            {/* TAMBAH VARIAN CEPAT — tanpa harus ke halaman Produk */}
            <div className="border-t border-amber-100 bg-amber-50/50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Tambah Varian / Kode Baru</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  placeholder="Nama / kode (mis. SMT)"
                  className="flex-1 min-w-[120px] rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddVariantInline(); }}
                />
                <input
                  type="number"
                  value={newVariantPrice}
                  onChange={(e) => setNewVariantPrice(e.target.value)}
                  placeholder={`Harga (${(variantModalProduct.harga ?? 0).toLocaleString("id-ID")})`}
                  className="w-28 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddVariantInline(); }}
                />
                <button
                  type="button"
                  onClick={handleAddVariantInline}
                  disabled={isAddingVariant}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
                >
                  {isAddingVariant ? "..." : "+ Tambah"}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] font-semibold text-slate-400">Kosongkan harga untuk pakai harga dasar produk.</p>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => { setIsCheckoutConfirmOpen(false); setIsCartOpen(true); }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ShoppingCart size={17} /> Kembali ke Keranjang
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

            <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
              Untuk mengubah harga, kembali ke keranjang lalu tekan ikon ✏️ pada produk yang ingin disesuaikan.
            </p>
          </div>
        </div>
      )}

      {priceEditItem && (() => {
        // Pakai data terbaru dari keranjang (jumlah/satuan bisa berubah), fallback ke snapshot.
        const liveItem = cart.find((i) => i.id === priceEditItem.id) ?? priceEditItem;
        const satuanHarga = liveItem.satuanHarga ?? "pcs";
        const satuanPesan = liveItem.satuanPesan ?? "pcs";
        const draftBase = Number(priceEditDraft || 0);
        const hargaPerPesan = hitungHargaSatuan(draftBase, satuanHarga, satuanPesan);
        const subtotalBaru = hargaPerPesan * liveItem.quantity;
        const beda = satuanPesan !== satuanHarga;
        const baseAsli = liveItem.hargaBaseAsli ?? liveItem.hargaBase ?? liveItem.harga;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setPriceEditItem(null)}>
            <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between border-b border-slate-100 p-5">
                <div className="min-w-0">
                  <h3 className="font-black text-slate-800">Sesuaikan Harga</h3>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {liveItem.nama_produk}
                    {liveItem.variantName && <span className="text-amber-600"> ({liveItem.variantName})</span>}
                  </p>
                </div>
                <button onClick={() => setPriceEditItem(null)} className="ml-3 rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 shrink-0">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                  <span>Jumlah dipesan</span>
                  <span className="font-black text-slate-700">{liveItem.quantity} {SATUAN_LABELS[satuanPesan] ?? satuanPesan}</span>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Harga per {SATUAN_LABELS[satuanHarga] ?? satuanHarga}
                  </label>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    autoFocus
                    value={priceEditDraft}
                    onChange={(event) => setPriceEditDraft(event.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") savePriceEdit(); }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-black text-slate-700 outline-none focus:border-pink-500"
                  />
                  <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                    Harga katalog: Rp {baseAsli.toLocaleString("id-ID")} / {SATUAN_LABELS[satuanHarga] ?? satuanHarga}
                  </p>
                </div>

                <div className="space-y-1.5 rounded-2xl border border-pink-100 bg-pink-50/60 p-4">
                  {beda && (
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Harga per {SATUAN_LABELS[satuanPesan] ?? satuanPesan}</span>
                      <span className="font-black text-slate-700">Rp {hargaPerPesan.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-pink-500">Subtotal Baru</span>
                    <span className="text-xl font-black text-pink-700">Rp {subtotalBaru.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-white p-5 space-y-3">
                <label className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberForCustomer}
                    onChange={(e) => setRememberForCustomer(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-amber-500 shrink-0"
                  />
                  <span className="text-xs leading-snug">
                    <b className="text-amber-700">Ingat harga ini untuk {namaPembeli || "pelanggan"}</b>
                    <span className="block text-slate-500 mt-0.5">Berlaku untuk <b>semua varian/kode</b> produk ini, dan otomatis dipakai lagi saat membuat orderan untuk pelanggan yang sama.</span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={savePriceEdit}
                  className="w-full rounded-2xl bg-pink-600 py-4 text-sm font-black text-white shadow-lg shadow-pink-200 transition-colors hover:bg-pink-700"
                >
                  Simpan Penyesuaian
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* GRID PRODUK: 2 kolom (mobile), 4 kolom (desktop) - Disamakan dengan halaman Katalog */}
<div
  className="
    p-3
    overflow-y-auto
    grid
    grid-cols-2
    sm:grid-cols-3
    lg:grid-cols-4
    xl:grid-cols-5
    gap-4
    auto-rows-max
    items-start
    pb-36
  "
>          {filteredProduk.map((p) => (
           <article
  key={p.id}
  onClick={(e) => handleProductClick(e, p)}
  className="
    group
    flex
    flex-col
    rounded-2xl
    bg-white
    border
    border-pink-100
    overflow-hidden
    shadow-sm
    hover:shadow-lg
    hover:border-pink-300
    transition-all
    duration-200
    cursor-pointer
    h-full
  "
>
              {/* FOTO: Menggunakan aspect-square persis seperti halaman utama */}
              <div className="relative w-full aspect-square bg-pink-50 overflow-hidden shrink-0">
  {p.gambar ? (
    <img
      src={p.gambar}
      alt={p.nama_produk}
      className="
        absolute
        inset-0
        w-full
        h-full
        object-cover
        transition-transform
        duration-300
        group-hover:scale-105
      "
      style={{
        objectPosition: `${p.gambarPosX ?? 50}% ${p.gambarPosY ?? 50}%`,
      }}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <Flower2 size={42} className="text-pink-200" />
    </div>
  )}
</div>

              {/* INFO PRODUK & HARGA */}
          <div className="p-3 flex flex-col flex-1">
  <p
    className="
      text-sm
      font-bold
      text-slate-800
      line-clamp-2
      min-h-[40px]
    "
  >
    {p.nama_produk}
  </p>

  <div className="mt-auto">
    <p className="font-black text-pink-600">
      {formatHargaPos(p)}
    </p>
  </div>
</div>
            </article>
          ))}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON & POP-UP KERANJANG DI POJOK KANAN BAWAH */}
      <div className="fixed bottom-[4.5rem] right-5 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
         
         {/* POP-UP KERANJANG */}
         {isCartOpen && (
            <div className="bg-white rounded-3xl shadow-2xl border border-pink-100 w-[90vw] sm:w-[400px] mb-4 flex flex-col h-[60vh] sm:h-[65vh] max-h-[700px] overflow-hidden transform origin-bottom-right transition-all animate-in slide-in-from-bottom-5">

              <div className="p-2 sm:p-4 bg-pink-600 text-white font-bold flex justify-between items-center gap-2 shadow-md z-10">
                {isEditingCustomer ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <User size={14} className="text-pink-200 shrink-0" />
                    <input
                      type="text"
                      value={customerDraft}
                      onChange={(e) => setCustomerDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") commitCustomerEdit(); if (e.key === "Escape") setIsEditingCustomer(false); }}
                      autoFocus
                      className="flex-1 min-w-0 rounded-lg bg-pink-700/60 px-2 py-1 text-xs sm:text-sm text-white placeholder-pink-200 outline-none border border-pink-300/40 focus:border-white"
                      placeholder="Nama pelanggan"
                    />
                    <button onClick={commitCustomerEdit} className="bg-white/20 hover:bg-white/30 p-1 rounded-full shrink-0" title="Simpan nama"><Check size={16} /></button>
                  </div>
                ) : (
                  <button onClick={startEditCustomer} className="flex items-center gap-2 text-xs sm:text-sm min-w-0 group" title="Klik untuk ubah nama pelanggan">
                    <User size={14} className="text-pink-200 shrink-0" />
                    <span className="truncate">{namaPembeli}</span>
                    <Pencil size={12} className="text-pink-200 opacity-70 group-hover:opacity-100 shrink-0" />
                  </button>
                )}
                <button onClick={() => setIsCartOpen(false)} className="text-pink-200 hover:text-white bg-pink-700/50 p-1 rounded-full shrink-0"><X size={16}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 bg-pink-50/50">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="bg-white shadow-sm p-3 rounded-2xl border border-pink-50 space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        {/* FOTO PRODUK DI KERANJANG — biar tahu bentukan barangnya */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-pink-50 border border-pink-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.gambar ? (
                            <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-cover" />
                          ) : (
                            <Flower2 size={22} className="text-pink-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm sm:text-base text-slate-800">
                            <ScrollingName text={item.nama_produk} />
                          </h4>
                          <p className="text-pink-600 text-sm sm:text-base font-extrabold mt-0.5">
                            Rp {(item.harga * item.quantity).toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            Rp {item.harga.toLocaleString("id-ID")} / {SATUAN_LABELS[item.satuanPesan ?? "pcs"] ?? item.satuanPesan ?? "pcs"}
                          </p>
                          {item.hargaBaseAsli != null && item.hargaBase != null && item.hargaBase !== item.hargaBaseAsli && (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-black text-green-600">✓ Harga disesuaikan</span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                <span className="line-through">Rp {item.hargaBaseAsli.toLocaleString("id-ID")}</span>
                                {" → "}
                                <span className="font-black text-slate-600">Rp {item.hargaBase.toLocaleString("id-ID")}</span>
                                {" / "}{SATUAN_LABELS[item.satuanHarga ?? "pcs"] ?? item.satuanHarga}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Badge variasi: di kanan bersama tombol aksi, ringkas & selalu terlihat */}
                          {item.variantName && (
                            <span className="max-w-[72px] truncate rounded-lg bg-amber-50 border border-amber-200 text-amber-600 px-2 py-1 text-xs font-black mr-0.5" title={item.variantName}>
                              {item.variantName}
                            </span>
                          )}
                          <button onClick={() => openPriceEdit(item)} className="p-2.5 text-slate-400 hover:bg-pink-50 hover:text-pink-600 rounded-xl" title="Sesuaikan harga"><Pencil size={18} /></button>
                          <button onClick={() => removeFromCart(item.id)} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl" title="Hapus"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Ganti satuan (hanya untuk produk non-pcs) */}
                        {(item.satuanHarga ?? "pcs") !== "pcs" && (
                          <select
                            value={item.satuanPesan ?? item.satuanHarga ?? "pcs"}
                            onChange={(e) => updateSatuanPesan(item.id, e.target.value)}
                            className="text-xs sm:text-sm font-bold border border-pink-200 rounded-xl px-2.5 py-2 bg-pink-50 text-pink-600 outline-none cursor-pointer min-w-0"
                          >
                            {(["gross", "setengah_gross", "lusin", "pcs"] as const).map(s => (
                              <option key={s} value={s}>
                                {SATUAN_LABELS[s]} — Rp {hitungHargaSatuan(item.hargaBase ?? item.harga, item.satuanHarga ?? "pcs", s).toLocaleString("id-ID")}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 ml-auto">
                          <button onClick={() => handleQtyStep(item.id, item.quantity - 1)} className="p-2 bg-white shadow-sm rounded-lg text-slate-500 active:scale-95" aria-label="Kurangi"><Minus size={16}/></button>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={qtyDraft[item.id] ?? String(item.quantity)}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "");
                              setQtyDraft((prev) => ({ ...prev, [item.id]: digits }));
                            }}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => commitQtyDraft(item.id)}
                            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                            className="w-12 text-center text-sm font-bold bg-transparent outline-none text-slate-700"
                            aria-label="Jumlah"
                          />
                          <button onClick={() => handleQtyStep(item.id, item.quantity + 1)} className="p-2 bg-white shadow-sm rounded-lg text-pink-600 active:scale-95" aria-label="Tambah"><Plus size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                     <ShoppingCart size={36} className="opacity-50" />
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Keranjang Kosong</p>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-5 bg-white border-t border-pink-100 space-y-3 sm:space-y-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                 <div className="bg-pink-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-pink-100">
                  <label className="text-[9px] sm:text-[10px] uppercase font-extrabold text-slate-400 mb-0.5 sm:mb-1 flex items-center gap-1"><Wallet size={10}/> Metode Pembayaran</label>
                  <select value={metodePembayaran} onChange={(e) => setMetodePembayaran(e.target.value)} className="w-full bg-transparent outline-none font-bold text-pink-600 text-xs sm:text-sm cursor-pointer">
                    <option value="Tunai">💵 Tunai (Cash)</option><option value="QRIS">📱 QRIS / E-Wallet</option><option value="Transfer Bank">🏦 Transfer Bank</option><option value="Belum Bayar">🔴 Belum Bayar (Piutang)</option>
                  </select>
                </div>

                <div className="flex justify-between items-end px-1">
                  <span className="text-slate-500 font-bold text-[9px] sm:text-xs uppercase">Total Tagihan</span>
                  <span className="text-lg sm:text-2xl font-black text-pink-600">Rp {getTotal().toLocaleString("id-ID")}</span>
                </div>

                <button onClick={handleCheckout} disabled={isProcessing || cart.length === 0} className="w-full py-3 sm:py-4 bg-pink-600 text-white rounded-xl font-bold text-xs sm:text-base shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all active:scale-[0.98] disabled:opacity-50">
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
