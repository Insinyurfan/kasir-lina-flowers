"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Flower2, Search, LogIn, X, ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";

type Variant = {
  id: number;
  name: string;
  priceModifier: number | null;
};

type Product = {
  id: number;
  nama_produk: string;
  stok: number;
  gambar: string | null;
  gambarPosX?: number;
  gambarPosY?: number;
  variants?: Variant[];
};

type StoreInfo = {
  brand: string;
  logo: string | null;
};

type SortKey = "name-asc" | "name-desc" | "newest" | "oldest";

type SortOption = { key: SortKey; label: string; icon: React.ReactNode };

const SORT_OPTIONS: SortOption[] = [
  { key: "name-asc", label: "A → Z", icon: <ArrowUp size={13} /> },
  { key: "name-desc", label: "Z → A", icon: <ArrowDown size={13} /> },
  { key: "newest", label: "Terbaru", icon: null },
  { key: "oldest", label: "Terlama", icon: null },
];

export default function KatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({ brand: "Lina Flowers", logo: null });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name-asc");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Menu urutan sekarang tinggal di header (sticky), jadi tidak perlu scroll
  // ke atas dulu untuk ganti urutan produk.
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/produk?public=1", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/pengaturan", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([prods, settings]) => {
        setProducts(Array.isArray(prods) ? prods : []);
        setStoreInfo({
          brand: settings?.brand || "Lina Flowers",
          logo: settings?.logo || null,
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
    let list = kw ? products.filter((p) => p.nama_produk.toLowerCase().includes(kw)) : [...products];
    switch (sortBy) {
      case "name-asc": list.sort((a, b) => naturalCompare(a.nama_produk, b.nama_produk)); break;
      case "name-desc": list.sort((a, b) => naturalCompare(b.nama_produk, a.nama_produk)); break;
      case "newest": list.sort((a, b) => b.id - a.id); break;
      case "oldest": list.sort((a, b) => a.id - b.id); break;
    }
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, search, sortBy]);

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

            <Link
              href="/login"
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-pink-200 flex-shrink-0 ml-auto md:ml-0"
            >
              <LogIn size={16} />
              <span>Login</span>
            </Link>
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
      <main className="flex-1 mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8 py-6 pb-16">
        {/* JUDUL */}
        <div className="mb-5 text-center">
          <p className="text-slate-500 text-sm">Temukan produk pilihan kami di bawah ini</p>
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
              {filtered.map((product) => (
                <article
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group rounded-2xl bg-white border border-pink-100 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-pink-100 hover:border-pink-300 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                    {product.gambar ? (
                      <img
                        src={product.gambar}
                        alt={product.nama_produk}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{product.nama_produk}</p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-pink-100 bg-white py-5 text-center">
        <p className="text-xs text-slate-400">© {storeInfo.brand} · Copyright 2026</p>
      </footer>

      {/* MODAL ZOOM FOTO */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-rose-50 overflow-hidden">
              {selectedProduct.gambar ? (
                <img
                  src={selectedProduct.gambar}
                  alt={selectedProduct.nama_produk}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `${selectedProduct.gambarPosX ?? 50}% ${selectedProduct.gambarPosY ?? 50}%` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Flower2 size={72} className="text-pink-200" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <h2 className="font-black text-slate-800 text-lg leading-snug">{selectedProduct.nama_produk}</h2>
              {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                <div className="mt-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-amber-600 mb-2">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[9px]">✦</span>
                    Pilihan Variasi
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                    {selectedProduct.variants.map((v) => (
                      <div
                        key={v.id}
                        className="snap-start shrink-0 rounded-full border border-amber-200 bg-amber-50 px-4 py-2"
                      >
                        <p className="text-sm font-black text-slate-800 whitespace-nowrap">{v.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-400 font-medium">Ketuk foto untuk memperbesar</p>
              )}
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="mt-4 w-full py-3 rounded-xl bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm hover:bg-pink-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
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
