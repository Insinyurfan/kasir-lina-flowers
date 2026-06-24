import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hitungHargaSatuan } from "@/lib/satuan";

// Re-export agar import lama `from "@/lib/store"` tetap berfungsi.
export { PCS_PER_UNIT, SATUAN_LABELS, hitungHargaSatuan } from "@/lib/satuan";

export type CartItem = {
  id: number;          // unique cart-row id (= productId untuk non-variasi, komposit untuk variasi)
  productId?: number;  // id produk asli (untuk variasi)
  variantId?: number | null;
  variantName?: string | null;
  nama_produk: string;
  harga: number;          // harga efektif per satuan pesan
  hargaAwal?: number;     // harga asli per satuan pesan (sebelum penyesuaian)
  hargaBase?: number;     // harga dasar efektif (per satuanHarga), bisa disesuaikan
  hargaBaseAsli?: number; // harga dasar katalog (per satuanHarga), tidak berubah
  satuanHarga?: string;
  satuanPesan?: string;
  quantity: number;
  stok: number;
  gambar?: string | null;
};

type CartProduct = Omit<CartItem, "quantity" | "hargaAwal" | "id"> & {
  id: number;          // productId
  hargaAwal?: number;
  satuanPesan?: string;
};

// Hitung id baris keranjang: produk variasi dapat id komposit agar varian berbeda jadi baris terpisah
const computeCartRowId = (productId: number, variantId?: number | null) =>
  variantId ? productId * 1000000 + variantId : productId;

interface CartState {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updatePrice: (id: number, price: number) => void;
  updateHargaBase: (id: number, hargaBase: number) => void;
  updateSatuanPesan: (id: number, satuanPesan: string) => void;
  setCart: (cart: CartItem[]) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product) => {
        const cart = get().cart;
        const satuanPesan = product.satuanPesan ?? product.satuanHarga ?? "pcs";
        const hargaBase = product.hargaBase ?? product.harga;
        const hargaDihitung = hitungHargaSatuan(hargaBase, product.satuanHarga ?? "pcs", satuanPesan);
        const rowId = computeCartRowId(product.id, product.variantId);
        const existingItem = cart.find((item) => item.id === rowId);

        if (existingItem) {
          // Jika satuan berubah, reset quantity ke 1 dengan harga baru
          if (existingItem.satuanPesan !== satuanPesan) {
            // Saat ganti satuan, hitung ulang dari harga dasar efektif (mempertahankan penyesuaian).
            const hargaBaseEfektif = existingItem.hargaBase ?? hargaBase;
            const hargaBaseAsli = existingItem.hargaBaseAsli ?? hargaBase;
            set({
              cart: cart.map((item) =>
                item.id === rowId
                  ? {
                      ...item,
                      satuanPesan,
                      harga: hitungHargaSatuan(hargaBaseEfektif, product.satuanHarga ?? "pcs", satuanPesan),
                      hargaAwal: hitungHargaSatuan(hargaBaseAsli, product.satuanHarga ?? "pcs", satuanPesan),
                      quantity: 1,
                    }
                  : item
              ),
            });
          } else if (existingItem.quantity < product.stok) {
            set({
              cart: cart.map((item) =>
                item.id === rowId ? { ...item, quantity: item.quantity + 1 } : item
              ),
            });
          } else {
            alert(`Stok tidak cukup! Sisa stok: ${product.stok}`);
          }
        } else {
          if (product.stok > 0) {
            set({
              cart: [
                ...cart,
                {
                  ...product,
                  id: rowId,
                  productId: product.id,
                  variantId: product.variantId ?? null,
                  variantName: product.variantName ?? null,
                  harga: hargaDihitung,
                  hargaAwal: hargaDihitung,
                  hargaBase,
                  hargaBaseAsli: hargaBase,
                  satuanPesan,
                  quantity: 1,
                },
              ],
            });
          } else {
            alert("Stok produk habis!");
          }
        }
      },
      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => {
          const item = state.cart.find((i) => i.id === id);
          if (quantity <= 0) return { cart: state.cart.filter((i) => i.id !== id) };
          if (item && quantity > item.stok) {
            alert(`Maksimal stok yang tersedia adalah ${item.stok}`);
            return { cart: state.cart };
          }
          return {
            cart: state.cart.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        }),
      updatePrice: (id, price) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, harga: Math.max(0, Math.round(price)) } : item
          ),
        })),
      // Sesuaikan HARGA DASAR (per satuanHarga, mis. per Gross). Harga per satuan pesan ikut dihitung ulang.
      updateHargaBase: (id, hargaBase) =>
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id !== id) return item;
            const baseBaru = Math.max(0, Math.round(hargaBase));
            const satuanHarga = item.satuanHarga ?? "pcs";
            const satuanPesan = item.satuanPesan ?? "pcs";
            return {
              ...item,
              hargaBase: baseBaru,
              harga: hitungHargaSatuan(baseBaru, satuanHarga, satuanPesan),
            };
          }),
        })),
      updateSatuanPesan: (id, satuanPesan) =>
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id !== id) return item;
            const satuanHarga = item.satuanHarga ?? "pcs";
            const hargaBase = item.hargaBase ?? item.hargaAwal ?? item.harga;
            const hargaBaseAsli = item.hargaBaseAsli ?? hargaBase;
            return {
              ...item,
              satuanPesan,
              harga: hitungHargaSatuan(hargaBase, satuanHarga, satuanPesan),
              hargaAwal: hitungHargaSatuan(hargaBaseAsli, satuanHarga, satuanPesan),
            };
          }),
        })),
      setCart: (cart) => set({ cart }),
      clearCart: () => set({ cart: [] }),
      getTotal: () => get().cart.reduce((total, item) => total + item.harga * item.quantity, 0),
    }),
    {
      name: "lina-cart-storage",
    }
  )
);
