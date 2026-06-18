"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Flower2, Search, LogIn, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type Product = {
  id: number;
  nama_produk: string;
  stok: number;
  gambar: string | null;
  gambarPosX?: number;
  gambarPosY?: number;
};

type StoreInfo = {
  brand: string;
  logo: string | null;
};

export default function KatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({ brand: "Lina Flowers", logo: null });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "newest" | "oldest">("name-asc");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    let list = kw ? products.filter((p) => p.nama_produk.toLowerCase().includes(kw)) : [...products];
    switch (sortBy) {
      case "name-asc": list.sort((a, b) => a.nama_produk.localeCompare(b.nama_produk, "id")); break;
      case "name-desc": list.sort((a, b) => b.nama_produk.localeCompare(a.nama_produk, "id")); break;
      case "newest": list.sort((a, b) => b.id - a.id); break;
      case "oldest": list.sort((a, b) => a.id - b.id); break;
    }
    return list;
  }, [products, search, sortBy]);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm shadow-pink-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
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
          <Link
            href="/login"
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-pink-200 flex-shrink-0"
          >
            <LogIn size={16} />
            <span className="hidden sm:inline">Login</span>
            <span className="sm:hidden">Login</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-16">
        {/* JUDUL */}
        <div className="mb-5 text-center">
          <p className="text-slate-500 text-sm">Temukan produk pilihan kami di bawah ini</p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-pink-100 rounded-2xl outline-none focus:border-pink-400 text-sm shadow-sm transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* SORT */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold shrink-0">Urutkan:</span>
          {(
            [
              { key: "name-asc", label: "A → Z", icon: <ArrowUp size={11} /> },
              { key: "name-desc", label: "Z → A", icon: <ArrowDown size={11} /> },
              { key: "newest", label: "Terbaru", icon: null },
              { key: "oldest", label: "Terlama", icon: null },
            ] as const
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortBy(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                sortBy === key
                  ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                  : "bg-white border border-pink-100 text-slate-500 hover:border-pink-300 hover:text-pink-600"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* GRID PRODUK */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
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
              <p className="mt-1 text-xs text-slate-400 font-medium">Ketuk foto untuk memperbesar</p>
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
