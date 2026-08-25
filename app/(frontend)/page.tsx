"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flower2,
  Search,
  LogIn,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ArrowLeft,
  PackageSearch,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShoppingCart,
  Eye,
  Menu,
} from "lucide-react";
import { useTampilBertahap } from "@/lib/tampilBertahap";
import { urlGambar } from "@/lib/gambar";

type Variant = {
  id: number;
  name: string;
};

// Harga sengaja TIDAK ada di tipe ini: /api/produk?public=1 memang tidak
// mengirimnya (harga toko ini ditentukan per pelanggan lewat negosiasi).
// `tersedia` menggantikan angka stok — cukup untuk menandai produk habis
// tanpa mengungkap jumlah persediaan ke publik.
type Product = {
  id: number;
  nama_produk: string;
  tersedia: boolean;
  gambar: string | null;
  gambarPosX?: number;
  gambarPosY?: number;
  variants?: Variant[];
};

type StoreInfo = {
  brand: string;
  logo: string | null;
  whatsapp: string | null;
};

// variantId 0 = produk tanpa varian, mengikuti konvensi yang dipakai di
// basis data (CustomerPrice dan OrderRequestItem).
type CartItem = {
  productId: number;
  variantId: number;
  productName: string;
  variantName: string | null;
  gambar: string | null;
  quantity: number;
};

type SortKey = "name-asc" | "name-desc" | "newest" | "oldest";

type SortOption = { key: SortKey; label: string; icon: React.ReactNode };

type CheckoutStep = "keranjang" | "identitas" | "selesai";

const SORT_OPTIONS: SortOption[] = [
  { key: "name-asc", label: "A → Z", icon: <ArrowUp size={13} /> },
  { key: "name-desc", label: "Z → A", icon: <ArrowDown size={13} /> },
  { key: "newest", label: "Terbaru", icon: null },
  { key: "oldest", label: "Terlama", icon: null },
];

const CART_STORAGE_KEY = "lina_katalog_keranjang";
// Diisi oleh halaman /orderan saat pembeli menekan "Ubah Orderan Ini". Selama
// kunci ini ada, menyimpan berarti MEMPERBARUI orderan tersebut — bukan membuat
// orderan baru dengan kode lain.
const EDIT_CODE_KEY = "lina_katalog_kode_orderan";
// Katalog dibuka dalam mode LIHAT-LIHAT. Tombol tambah, keranjang, dan seluruh
// jalan menuju pemesanan baru muncul setelah pengunjung menyalakannya sendiri —
// sebagian besar yang mampir cuma ingin melihat produk, dan menyodorkan tombol
// beli sejak detik pertama membuat halaman terasa mendesak.
const MODE_BELANJA_KEY = "lina_katalog_mode_belanja";
const MAX_QUANTITY_PER_ITEM = 99;

const cartItemKey = (productId: number, variantId: number) => `${productId}:${variantId}`;

const readStoredCart = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Isi localStorage bisa berasal dari versi lama atau disunting manual,
    // jadi tiap baris disaring ulang alih-alih dipercaya apa adanya.
    return parsed.flatMap((item): CartItem[] => {
      if (!item || typeof item !== "object") return [];
      const row = item as Partial<CartItem>;
      const productId = Number(row.productId);
      const quantity = Number(row.quantity);
      if (!Number.isInteger(productId) || productId <= 0) return [];
      if (!Number.isInteger(quantity) || quantity <= 0) return [];
      return [
        {
          productId,
          variantId: Number.isInteger(Number(row.variantId)) ? Number(row.variantId) : 0,
          productName: String(row.productName || "Produk"),
          variantName: row.variantName ? String(row.variantName) : null,
          gambar: row.gambar ? String(row.gambar) : null,
          quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM),
        },
      ];
    });
  } catch {
    return [];
  }
};

export default function KatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({ brand: "Lina Flowers", logo: null, whatsapp: null });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name-asc");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Menu urutan sekarang tinggal di header (sticky), jadi tidak perlu scroll
  // ke atas dulu untuk ganti urutan produk.
  const [isSortOpen, setIsSortOpen] = useState(false);
  // Laci nav khusus layar sempit. Lacak Pesanan dan Login tidak muat
  // berdampingan di bawah 640px, jadi keduanya dikumpulkan di sini.
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Varian & jumlah yang sedang dipilih di dalam modal produk.
  const [selectedVariantId, setSelectedVariantId] = useState(0);
  const [modalQuantity, setModalQuantity] = useState(1);

  const [cart, setCart] = useState<CartItem[]>([]);
  // Keranjang baru boleh ditulis balik ke localStorage setelah sekali dibaca,
  // supaya render pertama (yang masih kosong) tidak menimpa isi tersimpan.
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("keranjang");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [toast, setToast] = useState("");
  // Kode orderan yang sedang disunting. Kosong = keranjang baru.
  const [kodeEdit, setKodeEdit] = useState("");
  const [modeBelanja, setModeBelanja] = useState(false);
  // Foto yang sedang dibuka layar penuh. null = penampil tertutup.
  const [fotoLayarPenuh, setFotoLayarPenuh] = useState<{ src: string; judul: string } | null>(null);

  useEffect(() => {
    Promise.all([
      // Katalog publik tidak perlu segar tiap detik. `no-store` membuat setiap
      // pemuatan halaman menembus ke database; 60 detik sudah lebih dari cukup
      // untuk daftar produk yang jarang berubah.
      fetch("/api/produk?public=1", { next: { revalidate: 60 } }).then((r) => r.json()),
      fetch("/api/pengaturan?tampilan=1", { next: { revalidate: 300 } }).then((r) => r.json()),
    ])
      .then(([prods, settings]) => {
        setProducts(Array.isArray(prods) ? prods : []);
        setStoreInfo({
          brand: settings?.brand || "Lina Flowers",
          logo: settings?.logo || null,
          whatsapp: settings?.whatsapp || null,
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // localStorage baru bisa dibaca di browser, jadi tidak boleh jadi nilai awal
  // useState — server merender keranjang kosong dan isinya akan bentrok saat
  // hidrasi. Pembacaannya ditunda keluar dari badan efek (pola yang sama
  // dipakai keranjang tamu di halaman produk) supaya tidak memicu render
  // beruntun.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const tersimpan = readStoredCart();
      setCart(tersimpan);

      let kode = "";
      let modeTersimpan = false;
      try {
        kode = window.localStorage.getItem(EDIT_CODE_KEY) || "";
        modeTersimpan = window.localStorage.getItem(MODE_BELANJA_KEY) === "1";
      } catch {
        // Penyimpanan tidak bisa dibaca: mulai dari mode lihat-lihat.
      }
      setKodeEdit(kode);
      // Mode dinyalakan lagi bila pengunjung sudah pernah menyalakannya, ATAU
      // bila ada keranjang/orderan yang belum selesai. Tanpa aturan kedua,
      // menyegarkan halaman akan menyembunyikan keranjang yang masih berisi dan
      // membuatnya tampak hilang.
      setModeBelanja(modeTersimpan || tersimpan.length > 0 || Boolean(kode));
      setIsCartLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isCartLoaded) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Mode penyamaran atau kuota penuh: keranjang tetap jalan di memori,
      // hanya tidak bertahan setelah halaman ditutup. Tidak perlu diributkan.
    }
  }, [cart, isCartLoaded]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  // Modal dan panel keranjang mengunci scroll latar supaya isi di belakangnya
  // tidak ikut bergeser saat panel di-scroll.
  useEffect(() => {
    const isPanelOpen = isCartOpen || selectedProduct !== null || fotoLayarPenuh !== null;
    document.body.style.overflow = isPanelOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen, selectedProduct, fotoLayarPenuh]);

  const ubahModeBelanja = (aktif: boolean) => {
    setModeBelanja(aktif);
    try {
      window.localStorage.setItem(MODE_BELANJA_KEY, aktif ? "1" : "0");
    } catch {
      // Pilihan tetap berlaku selama sesi ini walau tidak bisa disimpan.
    }
    if (!aktif) setIsCartOpen(false);
  };

  const naturalCompare = (a: string, b: string): number => {
    const re = /(\d+)/g;
    const ax = a.split(re);
    const bx = b.split(re);
    for (let i = 0; i < Math.max(ax.length, bx.length); i++) {
      const ac = ax[i] ?? "";
      const bc = bx[i] ?? "";
      if (ac === bc) continue;
      const an = parseInt(ac, 10);
      const bn = parseInt(bc, 10);
      if (!isNaN(an) && !isNaN(bn)) return an - bn;
      return ac.localeCompare(bc, "id");
    }
    return 0;
  };

  const activeSort = SORT_OPTIONS.find((o) => o.key === sortBy) ?? SORT_OPTIONS[0];

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    const list = kw ? products.filter((p) => p.nama_produk.toLowerCase().includes(kw)) : [...products];
    switch (sortBy) {
      case "name-asc": list.sort((a, b) => naturalCompare(a.nama_produk, b.nama_produk)); break;
      case "name-desc": list.sort((a, b) => naturalCompare(b.nama_produk, a.nama_produk)); break;
      case "newest": list.sort((a, b) => b.id - a.id); break;
      case "oldest": list.sort((a, b) => a.id - b.id); break;
    }
    return list;
  }, [products, search, sortBy]);

  // Kartu produk dirender sepotong demi sepotong mengikuti gulungan, jadi
  // membuka katalog tidak lagi menembakkan puluhan permintaan gambar sekaligus.
  const { tampil: produkTampil, adaLagi, penandaRef } = useTampilBertahap(filtered, 16);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  // Tanpa nomor WhatsApp tersimpan, katalog otomatis kembali jadi "lihat-lihat
  // saja": semua jalan menuju pemesanan disembunyikan, bukan dibiarkan
  // mengarah ke tautan wa.me yang rusak.
  const canOrder = Boolean(storeInfo.whatsapp);
  // Dua syarat: tokonya memang menerima pesanan (nomor WhatsApp terisi) DAN
  // pengunjung sudah menyalakan mode pesan.
  const bisaPesan = canOrder && modeBelanja;

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariantId(0);
    setModalQuantity(1);
  };

  const addToCart = (product: Product, variantId: number, quantity: number) => {
    const variant = product.variants?.find((v) => v.id === variantId) || null;
    setCart((current) => {
      const key = cartItemKey(product.id, variantId);
      const existing = current.find((item) => cartItemKey(item.productId, item.variantId) === key);
      if (existing) {
        return current.map((item) =>
          cartItemKey(item.productId, item.variantId) === key
            ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY_PER_ITEM) }
            : item
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          variantId,
          productName: product.nama_produk,
          variantName: variant?.name ?? null,
          gambar: product.gambar,
          quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM),
        },
      ];
    });
    setToast(`${product.nama_produk}${variant ? ` (${variant.name})` : ""} masuk keranjang`);
  };

  // Dari kartu produk: yang punya varian harus lewat modal dulu, karena
  // variannya wajib dipilih — server menolak pesanan tanpa varian.
  const handleQuickAdd = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      openProduct(product);
      return;
    }
    addToCart(product, 0, 1);
  };

  const handleAddFromModal = () => {
    if (!selectedProduct) return;
    const hasVariants = Boolean(selectedProduct.variants && selectedProduct.variants.length > 0);
    if (hasVariants && selectedVariantId === 0) return;
    addToCart(selectedProduct, selectedVariantId, modalQuantity);
    setSelectedProduct(null);
  };

  const updateQuantity = (key: string, nextQuantity: number) => {
    setCart((current) =>
      current.flatMap((item) => {
        if (cartItemKey(item.productId, item.variantId) !== key) return [item];
        if (nextQuantity <= 0) return [];
        return [{ ...item, quantity: Math.min(nextQuantity, MAX_QUANTITY_PER_ITEM) }];
      })
    );
  };

  const removeFromCart = (key: string) => {
    setCart((current) => current.filter((item) => cartItemKey(item.productId, item.variantId) !== key));
  };

  const openCart = () => {
    setStep("keranjang");
    setFormError("");
    setIsCartOpen(true);
  };

  const buildWhatsappText = (code: string, name: string, adalahPerubahan: boolean) => {
    const lines = cart
      .map((item, index) => {
        const variantLine = item.variantName ? `\n   Variasi: ${item.variantName}` : "";
        return `${index + 1}. ${item.productName}${variantLine}\n   Jumlah: ${item.quantity}`;
      })
      .join("\n\n");

    return [
      adalahPerubahan
        ? `Halo ${storeInfo.brand}, saya memperbarui orderan saya menjadi:`
        : `Halo ${storeInfo.brand}, saya ingin memesan produk berikut:`,
      "",
      lines,
      "",
      `Kode orderan: ${code}`,
      ...(name ? [`Nama: ${name}`] : []),
      `Buka orderan: ${window.location.origin}/orderan`,
      "",
      "Mohon info harga dan ketersediaannya ya. Terima kasih.",
    ].join("\n");
  };

  const itemsUntukApi = () =>
    cart.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

  const handleSubmitOrder = async () => {
    // Saat menyunting, nama & nomor HP sudah tersimpan sejak orderan dibuat —
    // pembeli tidak perlu (dan tidak boleh) mengisinya ulang, jadi langkah
    // identitas dilewati sepenuhnya.
    const sedangEdit = Boolean(kodeEdit);
    const cleanName = customerName.trim();
    const cleanPhoneNumber = phone.replace(/[^\d+]/g, "");

    if (!sedangEdit) {
      if (cleanName.length < 2) {
        setFormError("Nama wajib diisi minimal 2 karakter.");
        return;
      }
      if (cleanPhoneNumber.length < 8) {
        setFormError("Nomor HP belum valid.");
        return;
      }
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/request-pesanan", {
        method: sedangEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          sedangEdit
            ? { code: kodeEdit, items: itemsUntukApi() }
            : { customerName: cleanName, phone: cleanPhoneNumber, items: itemsUntukApi() }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data?.error || "Orderan gagal disimpan. Coba lagi sebentar lagi.");
        return;
      }
      // Orderan sudah tersimpan di sistem SEBELUM WhatsApp dibuka. Kalau
      // pembeli batal mengirim chatnya, orderan tetap masuk ke pemilik lengkap
      // dengan nama & nomor HP — tidak ada calon pembeli yang hilang.
      setOrderCode(data.code);
      setStep("selesai");
    } catch {
      setFormError("Tidak bisa terhubung. Periksa koneksi internetmu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hapusPenandaEdit = () => {
    try {
      window.localStorage.removeItem(EDIT_CODE_KEY);
    } catch {
      // Tidak apa-apa: state di memori sudah dibersihkan, dan penandanya
      // hanya berumur satu sesi kalau penyimpanan memang tidak bisa ditulis.
    }
    setKodeEdit("");
  };

  const batalkanEdit = () => {
    hapusPenandaEdit();
    setCart([]);
    setIsCartOpen(false);
    setStep("keranjang");
    setToast("Penyuntingan dibatalkan, keranjang dikosongkan");
  };

  // Dibuka lewat klik tombol, bukan otomatis sesudah `await`: jendela yang
  // dibuka tanpa gerakan pengguna langsung diblokir browser.
  const handleOpenWhatsapp = () => {
    if (!storeInfo.whatsapp) return;
    const text = encodeURIComponent(buildWhatsappText(orderCode, customerName.trim(), Boolean(kodeEdit)));
    window.open(`https://wa.me/${storeInfo.whatsapp}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleFinish = () => {
    hapusPenandaEdit();
    setCart([]);
    setIsCartOpen(false);
    setStep("keranjang");
    setCustomerName("");
    setPhone("");
    setOrderCode("");
  };

  // Esc menutup lapisan PALING ATAS saja, bukan semuanya sekaligus. Urutannya
  // mengikuti apa yang terlihat: penampil foto menimpa modal produk, sedangkan
  // panel keranjang berdiri sendiri. Penampil foto sudah menangani Esc-nya
  // sendiri, jadi di sini sengaja dilewati — tanpa itu, sekali tekan akan
  // menutup foto DAN modal produknya sekaligus.
  //
  // Ditempatkan setelah handleFinish karena memanggilnya; `const` tidak
  // terangkat, jadi menaruh efek ini lebih dulu membuatnya gagal dikompilasi.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (fotoLayarPenuh) return;
      if (isCartOpen) {
        // Menyamakan perilaku dengan tombol X di panel: setelah orderan
        // tersimpan, menutup berarti sekalian membereskan keranjangnya.
        if (step === "selesai") handleFinish();
        else setIsCartOpen(false);
        return;
      }
      if (selectedProduct) setSelectedProduct(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotoLayarPenuh, isCartOpen, selectedProduct, step]);

  const modalHasVariants = Boolean(selectedProduct?.variants && selectedProduct.variants.length > 0);
  const canAddFromModal = Boolean(selectedProduct?.tersedia) && (!modalHasVariants || selectedVariantId > 0);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm shadow-pink-100">
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8 py-3">
          {/* Baris 1: logo + nama toko, lalu (di layar lebar) search & urutan, lalu login. */}
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-3 min-w-0 shrink-0">
              <div className="w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden border-2 border-pink-200 bg-white flex items-center justify-center shadow-sm">
                {storeInfo.logo ? (
                  <img src={storeInfo.logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
                ) : (
                  <Flower2 size={22} className="text-pink-500" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-black text-rose-950 leading-tight text-base truncate">{storeInfo.brand}</h1>
                <p className="text-[11px] text-pink-500 font-semibold">Katalog Produk</p>
              </div>
            </div>

            {/* Layar lebar: search & urutan sebaris dengan logo. */}
            <div className="hidden md:flex flex-1 items-center gap-2 min-w-0">
              <SearchBox search={search} setSearch={setSearch} />
              <SortButton
                options={SORT_OPTIONS}
                activeSort={activeSort}
                sortBy={sortBy}
                setSortBy={setSortBy}
                isOpen={isSortOpen}
                setIsOpen={setIsSortOpen}
              />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-0">
              {/* Sakelar mode pesan. Teksnya disembunyikan di layar sempit dan
                  menyisakan ikon saja, supaya header tetap muat bersama tombol
                  Lacak Pesanan dan Login tanpa berdesakan. Saat sedang menyunting
                  orderan tersimpan, sakelarnya disembunyikan — mode pesan wajib
                  menyala di situ dan mematikannya hanya membingungkan. */}
              {canOrder && !kodeEdit && (
                bisaPesan ? (
                  <button
                    type="button"
                    onClick={() => ubahModeBelanja(false)}
                    title="Kembali ke mode lihat-lihat"
                    className="flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-3 sm:px-3.5 py-2.5 text-sm font-bold text-pink-600 shadow-sm transition-colors hover:bg-pink-50"
                  >
                    <Eye size={16} />
                    <span className="hidden lg:inline">Lihat-lihat</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => ubahModeBelanja(true)}
                    title={totalItems > 0 ? "Lanjutkan pesananmu" : "Aktifkan mode pesan"}
                    className="relative flex items-center gap-2 rounded-xl bg-pink-600 px-3 sm:px-3.5 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-200 transition-colors hover:bg-pink-700"
                  >
                    <ShoppingCart size={16} />
                    <span className="hidden lg:inline">{totalItems > 0 ? "Lanjutkan Pesanan" : "Mau Pesan"}</span>
                    {totalItems > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white">
                        {totalItems}
                      </span>
                    )}
                  </button>
                )
              )}
              {canOrder && (
                <Link
                  href="/orderan"
                  className="hidden sm:flex items-center gap-2 bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 text-sm font-bold px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
                  title="Lacak orderan yang sudah kamu simpan"
                >
                  <PackageSearch size={16} />
                  <span className="hidden lg:inline">Lacak Pesanan</span>
                </Link>
              )}

              {/* Login berdiri sendiri mulai 640px ke atas. Di bawah itu ia
                  pindah ke dalam laci — lihat blok berikutnya. */}
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-pink-200"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>

              {/* LACI NAV — HANYA LAYAR SEMPIT.
                  Di bawah 640px tombol Lacak Pesanan sebelumnya hilang sama
                  sekali (`hidden sm:flex`) karena headernya tidak muat, jadi
                  pembeli yang sudah menyimpan orderan tidak punya jalan masuk
                  dari HP. Keduanya dikumpulkan di sini. Polanya menyalin
                  SortButton yang sudah ada: lapisan tak terlihat untuk menutup
                  saat diketuk di luar. */}
              <div className="relative flex-shrink-0 sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsNavOpen(!isNavOpen)}
                  aria-haspopup="menu"
                  aria-expanded={isNavOpen}
                  aria-label="Menu"
                  title="Menu"
                  className={`flex items-center justify-center rounded-xl border p-2.5 transition-colors ${
                    isNavOpen
                      ? "bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-200"
                      : "bg-white border-pink-200 text-pink-600 shadow-sm hover:bg-pink-50"
                  }`}
                >
                  <Menu size={20} />
                </button>

                {isNavOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNavOpen(false)} />
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-pink-100 bg-white p-1.5 shadow-xl shadow-pink-100"
                    >
                      {canOrder && (
                        <Link
                          href="/orderan"
                          role="menuitem"
                          onClick={() => setIsNavOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
                        >
                          <PackageSearch size={17} />
                          Lacak Pesanan
                        </Link>
                      )}
                      <Link
                        href="/login"
                        role="menuitem"
                        onClick={() => setIsNavOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-bold text-pink-600 transition-colors hover:bg-pink-50"
                      >
                        <LogIn size={17} />
                        Login
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Layar kecil: search & urutan turun ke baris kedua supaya tidak sempit. */}
          <div className="md:hidden mt-2.5 flex items-center gap-2">
            <SearchBox search={search} setSearch={setSearch} />
            <SortButton
              options={SORT_OPTIONS}
              activeSort={activeSort}
              sortBy={sortBy}
              setSortBy={setSortBy}
              isOpen={isSortOpen}
              setIsOpen={setIsSortOpen}
            />
          </div>
        </div>
      </header>

      {/* Lebar katalog dinaikkan dari 1024px (max-w-5xl) ke 1600px supaya monitor
          lebar tidak terlalu kosong, tapi TIDAK full-width — kartu produk tetap
          besar dan enak dilihat, mengikuti pola kyou.id. Mau lebih lebar/sempit?
          Cukup ubah angka 1600px di sini DAN di header agar tetap sejajar. */}
      <main className="flex-1 mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8 py-6 pb-28">
        {/* SPANDUK MODE SUNTING — supaya pembeli tidak bingung kenapa
            keranjangnya sudah terisi begitu halaman dibuka. */}
        {kodeEdit && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-black text-amber-800">Sedang mengubah orderan {kodeEdit}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-amber-600">
                Tambah atau kurangi produk, lalu simpan. Kodenya tetap sama.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={batalkanEdit}
                className="rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={openCart}
                className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-white transition-colors hover:bg-amber-600"
              >
                Lihat & Simpan
              </button>
            </div>
          </div>
        )}

        {/* JUDUL — sakelar mode pesan sudah pindah ke header supaya tetap
            terjangkau walau sudah menggulung jauh ke bawah. */}
        <div className="mb-5 text-center">
          <p className="text-slate-500 text-sm">
            {bisaPesan
              ? "Ketuk + pada produk untuk memasukkannya ke keranjang"
              : "Temukan produk pilihan kami di bawah ini"}
          </p>
        </div>

        {/* Search & urutan sudah pindah ke header agar tetap terjangkau
            walau sudah scroll jauh ke bawah. */}

        {/* GRID PRODUK */}
        {isLoading ? (
          <div className="katalog-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-pink-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-pink-50" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-pink-100 rounded-full w-3/4" />
                  <div className="h-3 bg-pink-50 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Flower2 size={52} className="mx-auto mb-4 text-pink-200" />
            <p className="font-bold text-base">Produk tidak ditemukan.</p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 text-sm text-pink-500 font-semibold hover:underline"
              >
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 font-semibold mb-3">{filtered.length} produk{search ? ` untuk "${search}"` : ""}</p>
            <div className="katalog-grid">
              {produkTampil.map((product) => (
                <article
                  key={product.id}
                  onClick={() => openProduct(product)}
                  className="group rounded-2xl bg-white border border-pink-100 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-pink-100 hover:border-pink-300 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                    {product.gambar ? (
                      <Image
                        src={product.gambar}
                        alt={product.nama_produk}
                        fill
                        // Kartu katalog paling lebar ~300px; `sizes` mencegah
                        // Vercel mengirim versi besar ke layar kecil.
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        style={{ objectPosition: `${product.gambarPosX ?? 50}% ${product.gambarPosY ?? 50}%` }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Flower2 size={42} className="text-pink-200" />
                      </div>
                    )}
                    {product.variants && product.variants.length > 0 && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-0.5 text-[10px] font-black text-white shadow-md shadow-amber-300/50 ring-1 ring-white/40">
                        ✦ {product.variants.length} Variasi
                      </span>
                    )}
                    {!product.tersedia && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="rounded-full bg-slate-800/85 px-3 py-1 text-[11px] font-black text-white">
                          Stok Habis
                        </span>
                      </div>
                    )}
                    {bisaPesan && product.tersedia && (
                      <button
                        type="button"
                        aria-label={`Tambah ${product.nama_produk} ke keranjang`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdd(product);
                        }}
                        className="absolute bottom-2 right-2 p-2.5 rounded-full bg-pink-600 text-white shadow-lg shadow-pink-300/60 hover:bg-pink-700 active:scale-90 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{product.nama_produk}</p>
                  </div>
                </article>
              ))}
            </div>

            {/* Penanda sekaligus kerangka potongan berikutnya. Bentuknya sengaja
                menyerupai kartu asli supaya tinggi halaman tidak melonjak saat
                produk berikutnya menggantikannya. */}
            {adaLagi && (
              <div ref={penandaRef} className="katalog-grid mt-4" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-pink-100 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-pink-50" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-pink-100 rounded-full w-3/4" />
                      <div className="h-3 bg-pink-50 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-pink-100 bg-white py-5 text-center">
        <p className="text-xs text-slate-400">© {storeInfo.brand} · Copyright 2026</p>
      </footer>

      {/* TOMBOL KERANJANG MENGAMBANG */}
      {bisaPesan && totalItems > 0 && !isCartOpen && (
        <button
          type="button"
          onClick={openCart}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-pink-600 pl-5 pr-6 py-4 text-white font-black shadow-2xl shadow-pink-400/50 hover:bg-pink-700 active:scale-95 transition-all"
        >
          <span className="relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-2 -right-2.5 min-w-[19px] h-[19px] px-1 rounded-full bg-white text-pink-600 text-[11px] font-black flex items-center justify-center border-2 border-pink-600">
              {totalItems}
            </span>
          </span>
          <span className="text-sm">Lihat Pesanan</span>
        </button>
      )}

      {/* TOAST RINGAN saat produk masuk keranjang */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-sm max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      {/* MODAL DETAIL PRODUK */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-rose-50 overflow-hidden">
              {selectedProduct.gambar ? (
                <Image
                  src={selectedProduct.gambar}
                  alt={selectedProduct.nama_produk}
                  fill
                  sizes="(max-width: 640px) 100vw, 384px"
                  className="object-cover"
                  style={{ objectPosition: `${selectedProduct.gambarPosX ?? 50}% ${selectedProduct.gambarPosY ?? 50}%` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Flower2 size={72} className="text-pink-200" />
                </div>
              )}
              {/* URUTAN LAPISAN penting di sini. Lapisan ketuk-untuk-perbesar
                  menutupi seluruh foto, jadi tanpa z-index yang tegas ia akan
                  menimpa tombol X dan Perbesar yang ditulis lebih dulu —
                  menekan X justru membuka foto. Tanda "Stok Habis" dibuat
                  tembus-klik supaya produk yang habis pun fotonya tetap bisa
                  diperbesar. */}
              {selectedProduct.gambar && (
                <button
                  type="button"
                  aria-label="Perbesar foto"
                  onClick={() =>
                    setFotoLayarPenuh({ src: selectedProduct.gambar!, judul: selectedProduct.nama_produk })
                  }
                  className="absolute inset-0 z-10 cursor-zoom-in"
                />
              )}
              {!selectedProduct.tersedia && (
                <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                  <span className="rounded-full bg-slate-800/85 px-4 py-1.5 text-xs font-black text-white">
                    Stok Habis
                  </span>
                </div>
              )}
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <X size={18} />
              </button>
              {selectedProduct.gambar && (
                <button
                  type="button"
                  onClick={() =>
                    setFotoLayarPenuh({ src: selectedProduct.gambar!, judul: selectedProduct.nama_produk })
                  }
                  className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-2 text-[11px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/75"
                >
                  <Maximize2 size={14} /> Perbesar
                </button>
              )}
            </div>
            <div className="p-5">
              <h2 className="font-black text-slate-800 text-lg leading-snug">{selectedProduct.nama_produk}</h2>

              {modalHasVariants ? (
                <div className="mt-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-amber-600 mb-2">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[9px]">✦</span>
                    Pilih Variasi
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                    {selectedProduct.variants!.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        aria-pressed={selectedVariantId === v.id}
                        className={`snap-start shrink-0 rounded-full border px-4 py-2 transition-colors ${
                          selectedVariantId === v.id
                            ? "border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-200"
                            : "border-amber-200 bg-amber-50 text-slate-800 hover:border-amber-400"
                        }`}
                      >
                        <span className="text-sm font-black whitespace-nowrap">{v.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-400 font-medium">Ketuk foto untuk memperbesar</p>
              )}

              {!bisaPesan && canOrder && (
                <button
                  type="button"
                  onClick={() => ubahModeBelanja(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 py-3 text-sm font-black text-pink-600 transition-colors hover:bg-pink-100"
                >
                  <ShoppingCart size={16} /> Mau Pesan Produk Ini?
                </button>
              )}

              {bisaPesan && selectedProduct.tersedia && (
                <>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-500">Jumlah</span>
                    <div className="flex items-center gap-1 rounded-xl border border-pink-100 bg-pink-50/60 p-1">
                      <button
                        type="button"
                        aria-label="Kurangi jumlah"
                        onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 rounded-lg text-pink-600 hover:bg-white transition-colors disabled:opacity-40"
                        disabled={modalQuantity <= 1}
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-9 text-center text-sm font-black text-slate-800">{modalQuantity}</span>
                      <button
                        type="button"
                        aria-label="Tambah jumlah"
                        onClick={() => setModalQuantity((q) => Math.min(MAX_QUANTITY_PER_ITEM, q + 1))}
                        className="p-2 rounded-lg text-pink-600 hover:bg-white transition-colors disabled:opacity-40"
                        disabled={modalQuantity >= MAX_QUANTITY_PER_ITEM}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddFromModal}
                    disabled={!canAddFromModal}
                    className="mt-3 w-full py-3 rounded-xl bg-pink-600 text-white font-black text-sm hover:bg-pink-700 transition-colors disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={17} />
                    {modalHasVariants && selectedVariantId === 0 ? "Pilih variasi dulu" : "Masukkan Keranjang"}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-slate-400 font-medium">
                    Harga dikonfirmasi pemilik lewat WhatsApp
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="mt-3 w-full py-3 rounded-xl bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm hover:bg-pink-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOTO LAYAR PENUH — di atas modal produk (z-60 vs z-50) supaya modalnya
          tetap terbuka di belakang dan pengunjung kembali ke sana saat menutup. */}
      {fotoLayarPenuh && (
        <PenampilFoto
          src={fotoLayarPenuh.src}
          judul={fotoLayarPenuh.judul}
          onClose={() => setFotoLayarPenuh(null)}
        />
      )}

      {/* PANEL KERANJANG & CHECKOUT */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-pink-100 px-5 py-4">
              {step !== "keranjang" && step !== "selesai" && (
                <button
                  type="button"
                  aria-label="Kembali ke keranjang"
                  onClick={() => setStep("keranjang")}
                  className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-black text-rose-950 text-base leading-tight">
                  {step === "keranjang" && (kodeEdit ? "Ubah Orderan" : "Keranjang Pesanan")}
                  {step === "identitas" && "Data Pemesan"}
                  {step === "selesai" && (kodeEdit ? "Perubahan Tersimpan" : "Orderan Tersimpan")}
                </h2>
                <p className="text-[11px] text-pink-500 font-semibold">
                  {step === "keranjang" && (kodeEdit ? kodeEdit : `${totalItems} barang dipilih`)}
                  {step === "identitas" && "Supaya pemilik bisa menghubungimu"}
                  {step === "selesai" && "Simpan kode orderanmu"}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup keranjang"
                onClick={() => (step === "selesai" ? handleFinish() : setIsCartOpen(false))}
                className="p-2 rounded-xl text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-colors"
              >
                <X size={19} />
              </button>
            </div>

            {step === "keranjang" && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {cart.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                      <ShoppingBag size={46} className="mx-auto mb-3 text-pink-200" />
                      <p className="font-bold text-sm">Keranjangmu masih kosong.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {cart.map((item) => {
                        const key = cartItemKey(item.productId, item.variantId);
                        return (
                          <li key={key} className="flex gap-3 rounded-2xl border border-pink-100 bg-pink-50/40 p-3">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                              {item.gambar ? (
                                <Image src={item.gambar} alt={item.productName} fill sizes="64px" className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Flower2 size={22} className="text-pink-200" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold leading-snug text-slate-800 line-clamp-2">{item.productName}</p>
                              {item.variantName && (
                                <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                                  {item.variantName}
                                </span>
                              )}
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1 rounded-lg border border-pink-100 bg-white p-0.5">
                                  <button
                                    type="button"
                                    aria-label="Kurangi jumlah"
                                    onClick={() => updateQuantity(key, item.quantity - 1)}
                                    className="p-1.5 rounded-md text-pink-600 hover:bg-pink-50 transition-colors"
                                  >
                                    <Minus size={13} />
                                  </button>
                                  <span className="w-7 text-center text-sm font-black text-slate-800">{item.quantity}</span>
                                  <button
                                    type="button"
                                    aria-label="Tambah jumlah"
                                    onClick={() => updateQuantity(key, item.quantity + 1)}
                                    className="p-1.5 rounded-md text-pink-600 hover:bg-pink-50 transition-colors disabled:opacity-40"
                                    disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
                                  >
                                    <Plus size={13} />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  aria-label={`Hapus ${item.productName}`}
                                  onClick={() => removeFromCart(key)}
                                  className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="border-t border-pink-100 px-5 py-4">
                  <p className="mb-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-[11px] font-semibold text-amber-700">
                    Belum ada pembayaran di sini. Pemilik akan mengirim rincian harga lewat WhatsApp.
                  </p>
                  {formError && (
                    <p className="mb-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600">
                      {formError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      // Saat menyunting, data pemesan sudah ada sejak orderan
                      // dibuat — langsung simpan tanpa menanyakannya lagi.
                      if (kodeEdit) {
                        void handleSubmitOrder();
                        return;
                      }
                      setStep("identitas");
                    }}
                    disabled={cart.length === 0 || isSubmitting}
                    className="w-full rounded-xl bg-pink-600 py-3.5 text-sm font-black text-white transition-colors hover:bg-pink-700 disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {kodeEdit ? (isSubmitting ? "Menyimpan..." : "Simpan Perubahan") : "Lanjut Isi Data"}
                  </button>
                  {kodeEdit && (
                    <button
                      type="button"
                      onClick={batalkanEdit}
                      className="mt-2 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
                    >
                      Batalkan Penyuntingan
                    </button>
                  )}
                </div>
              </>
            )}

            {step === "identitas" && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">Nama</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama lengkapmu"
                      maxLength={100}
                      className="mt-1.5 w-full rounded-xl border border-pink-100 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-400"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-xs font-black text-slate-600">Nomor HP / WhatsApp</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      maxLength={20}
                      className="mt-1.5 w-full rounded-xl border border-pink-100 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-400"
                    />
                    <span className="mt-1.5 block text-[11px] text-slate-400 font-medium">
                      Dipakai pemilik untuk menghubungimu, dan untuk melacak pesanan nanti.
                    </span>
                  </label>

                  {formError && (
                    <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600">
                      {formError}
                    </p>
                  )}

                  <div className="mt-5 rounded-2xl border border-pink-100 bg-pink-50/50 p-3.5">
                    <p className="text-[11px] font-black uppercase tracking-wide text-pink-500">Ringkasan</p>
                    <ul className="mt-2 space-y-1.5">
                      {cart.map((item) => (
                        <li key={cartItemKey(item.productId, item.variantId)} className="flex justify-between gap-3 text-xs">
                          <span className="min-w-0 font-semibold text-slate-700">
                            {item.productName}
                            {item.variantName ? ` · ${item.variantName}` : ""}
                          </span>
                          <span className="shrink-0 font-black text-slate-500">×{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-t border-pink-100 px-5 py-4">
                  <button
                    type="button"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-pink-600 py-3.5 text-sm font-black text-white transition-colors hover:bg-pink-700 disabled:bg-slate-300"
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Pesanan"}
                  </button>
                </div>
              </>
            )}

            {step === "selesai" && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-slate-800">
                    {kodeEdit ? "Perubahanmu tersimpan!" : "Orderanmu sudah masuk!"}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 font-medium">
                    Simpan kode ini — dengan kode ini kamu bisa membuka dan mengubah orderanmu kapan saja.
                  </p>

                  <div className="mt-4 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50 px-4 py-4">
                    <p className="text-[11px] font-black uppercase tracking-wide text-pink-500">Kode Pesanan</p>
                    <p className="mt-1 text-lg font-black tracking-wide text-rose-950 break-all">{orderCode}</p>
                  </div>

                  <p className="mt-4 text-xs text-slate-500 font-medium leading-relaxed">
                    Langkah terakhir: kirim pesanan ini lewat WhatsApp supaya pemilik bisa langsung membalas dengan
                    rincian harganya.
                  </p>

                  <button
                    type="button"
                    onClick={handleOpenWhatsapp}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-black text-white transition-colors hover:bg-green-700"
                  >
                    <MessageCircle size={18} />
                    Kirim Lewat WhatsApp
                  </button>

                  <Link
                    href="/orderan"
                    className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white py-3 text-sm font-bold text-pink-600 transition-colors hover:bg-pink-50"
                  >
                    <PackageSearch size={16} />
                    Buka Orderan Ini Nanti
                  </Link>
                </div>
                <div className="border-t border-pink-100 px-5 py-4">
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="w-full rounded-xl bg-pink-50 border border-pink-100 py-3 text-sm font-bold text-pink-600 transition-colors hover:bg-pink-100"
                  >
                    Selesai & Kosongkan Keranjang
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Penampil foto layar penuh dengan perbesaran.
//
// Kartu katalog memang kecil, padahal yang dijual adalah barang yang perlu
// dilihat detailnya. Di sini foto ditampilkan sebesar layar, bisa diperbesar
// sampai 5x, lalu digeser untuk melihat bagiannya.
//
// Memakai <img> polos, BUKAN next/image: fotonya ditampilkan pada ukuran yang
// berubah-ubah mengikuti perbesaran, jadi tidak ada satu ukuran yang bisa
// diminta ke pengoptimal.
//
// Alamatnya WAJIB lewat urlGambar(). Kartu katalog aman memakai URL R2 mentah
// karena next/image membuat SERVER yang mengambilnya, tapi <img> di sini
// membuat PERAMBAN yang menembak langsung ke r2.dev — dan host itu diblokir
// sebagian ISP (termasuk jaringan tempat proyek ini dikembangkan). Tanpa
// penyaluran, tombol "Perbesar" hanya menampilkan foto rusak bagi pemakai itu.
const SKALA_MIN = 1;
const SKALA_MAKS = 5;

function PenampilFoto({ src, judul, onClose }: { src: string; judul: string; onClose: () => void }) {
  const [skala, setSkala] = useState(1);
  const [geser, setGeser] = useState({ x: 0, y: 0 });
  // Dipakai untuk mematikan animasi selama jari masih menempel — kalau tidak,
  // gerakan menggeser terasa tertinggal dari jarinya. Disimpan sebagai state,
  // bukan dibaca dari ref saat render: nilai ref tidak memicu render ulang,
  // jadi animasinya tidak akan pernah menyala kembali setelah dilepas.
  const [sedangSentuh, setSedangSentuh] = useState(false);

  // Jejak jari/kursor yang sedang menyentuh layar. Satu titik = menggeser,
  // dua titik = mencubit untuk memperbesar.
  const titikAktif = useRef(new Map<number, { x: number; y: number }>());
  const jarakAwal = useRef(0);
  const skalaAwal = useRef(1);
  const geserAwal = useRef({ x: 0, y: 0 });
  const titikSeretAwal = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Saat kembali ke ukuran asli, geserannya ikut dinolkan — kalau tidak, foto
  // bisa tertinggal di luar layar dan tampak hilang.
  const terapkanSkala = (berikutnya: number) => {
    const bersih = Math.min(SKALA_MAKS, Math.max(SKALA_MIN, berikutnya));
    setSkala(bersih);
    if (bersih === SKALA_MIN) setGeser({ x: 0, y: 0 });
    return bersih;
  };

  const jarakDuaTitik = () => {
    const [a, b] = [...titikAktif.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    titikAktif.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setSedangSentuh(true);

    if (titikAktif.current.size === 2) {
      jarakAwal.current = jarakDuaTitik();
      skalaAwal.current = skala;
    } else if (titikAktif.current.size === 1) {
      titikSeretAwal.current = { x: e.clientX, y: e.clientY };
      geserAwal.current = geser;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!titikAktif.current.has(e.pointerId)) return;
    titikAktif.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (titikAktif.current.size === 2 && jarakAwal.current > 0) {
      terapkanSkala((skalaAwal.current * jarakDuaTitik()) / jarakAwal.current);
      return;
    }
    // Menggeser hanya masuk akal saat fotonya lebih besar dari layar.
    if (titikAktif.current.size === 1 && skala > 1) {
      setGeser({
        x: geserAwal.current.x + (e.clientX - titikSeretAwal.current.x),
        y: geserAwal.current.y + (e.clientY - titikSeretAwal.current.y),
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    titikAktif.current.delete(e.pointerId);
    jarakAwal.current = 0;
    if (titikAktif.current.size === 0) setSedangSentuh(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95" role="dialog" aria-label={`Foto ${judul}`}>
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <p className="min-w-0 flex-1 truncate text-sm font-bold text-white/90">{judul}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup foto"
          className="rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25"
        >
          <X size={20} />
        </button>
      </div>

      <div
        className="relative flex-1 touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => terapkanSkala(skala > 1 ? 1 : 2.5)}
        onWheel={(e) => terapkanSkala(skala + (e.deltaY < 0 ? 0.3 : -0.3))}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urlGambar(src)}
          alt={judul}
          draggable={false}
          className="absolute inset-0 m-auto max-h-full max-w-full select-none object-contain"
          style={{
            transform: `translate(${geser.x}px, ${geser.y}px) scale(${skala})`,
            cursor: skala > 1 ? "grab" : "zoom-in",
            transition: sedangSentuh ? "none" : "transform 120ms ease-out",
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-2 px-4 py-4">
        <button
          type="button"
          onClick={() => terapkanSkala(skala - 0.5)}
          disabled={skala <= SKALA_MIN}
          aria-label="Perkecil"
          className="rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/25 disabled:opacity-35"
        >
          <ZoomOut size={18} />
        </button>
        <span className="w-16 text-center text-sm font-black text-white/90">{Math.round(skala * 100)}%</span>
        <button
          type="button"
          onClick={() => terapkanSkala(skala + 0.5)}
          disabled={skala >= SKALA_MAKS}
          aria-label="Perbesar"
          className="rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/25 disabled:opacity-35"
        >
          <ZoomIn size={18} />
        </button>
        <button
          type="button"
          onClick={() => terapkanSkala(1)}
          disabled={skala === SKALA_MIN}
          aria-label="Kembalikan ukuran"
          className="ml-2 rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/25 disabled:opacity-35"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <p className="pb-4 text-center text-[11px] font-medium text-white/45">
        Cubit atau putar roda tetikus untuk memperbesar · seret untuk menggeser · ketuk dua kali untuk cepat
      </p>
    </div>
  );
}

// Kotak pencarian dipakai dua kali (baris atas untuk layar lebar, baris kedua
// untuk layar kecil), jadi dijadikan komponen supaya isinya tidak dobel.
function SearchBox({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari produk..."
        className="w-full pl-10 pr-9 py-2.5 bg-white border border-pink-100 rounded-xl outline-none focus:border-pink-400 text-sm shadow-sm transition-all"
      />
      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          aria-label="Hapus pencarian"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

// Tombol urutan di header. Empat pilihan lama dipindah ke dalam dropdown supaya
// header tetap ringkas tapi urutan tetap bisa diganti dari mana saja.
function SortButton({
  options,
  activeSort,
  sortBy,
  setSortBy,
  isOpen,
  setIsOpen,
}: {
  options: SortOption[];
  activeSort: SortOption;
  sortBy: SortKey;
  setSortBy: (key: SortKey) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
          isOpen
            ? "bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-200"
            : "bg-white border-pink-100 text-slate-600 hover:border-pink-300 hover:text-pink-600 shadow-sm"
        }`}
        title={`Urutkan: ${activeSort.label}`}
      >
        <ArrowUpDown size={16} />
        <span className="hidden lg:inline">{activeSort.label}</span>
      </button>

      {isOpen && (
        <>
          {/* Lapisan tak terlihat: ketuk di luar menu untuk menutup. */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 z-50 w-44 rounded-2xl border border-pink-100 bg-white p-1.5 shadow-xl shadow-pink-100"
          >
            <p className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400">Urutkan produk</p>
            {options.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setSortBy(key);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-bold transition-colors ${
                  sortBy === key ? "bg-pink-50 text-pink-600" : "text-slate-600 hover:bg-pink-50/60"
                }`}
              >
                {icon}
                <span className="flex-1 text-left">{label}</span>
                {sortBy === key && <Check size={15} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
