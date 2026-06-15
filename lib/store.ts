import { create } from "zustand";
import { persist } from "zustand/middleware";

export const PCS_PER_UNIT: Record<string, number> = { pcs: 1, lusin: 12, gross: 144 };
export const SATUAN_LABELS: Record<string, string> = { pcs: "Pcs", lusin: "Lusin", gross: "Gross" };

export function hitungHargaSatuan(hargaBase: number, satuanHarga: string, satuanPesan: string): number {
  const perHarga = PCS_PER_UNIT[satuanHarga] ?? 1;
  const perPesan = PCS_PER_UNIT[satuanPesan] ?? 1;
  return Math.round((hargaBase * perPesan) / perHarga);
}

export type CartItem = {
  id: number;
  nama_produk: string;
  harga: number;
  hargaAwal?: number;
  hargaBase?: number;
  satuanHarga?: string;
  satuanPesan?: string;
  quantity: number;
  stok: number;
  gambar?: string | null;
};

type CartProduct = Omit<CartItem, "quantity" | "hargaAwal"> & {
  hargaAwal?: number;
  satuanPesan?: string;
};

interface CartState {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updatePrice: (id: number, price: number) => void;
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
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
          // Jika satuan berubah, reset quantity ke 1 dengan harga baru
          if (existingItem.satuanPesan !== satuanPesan) {
            set({
              cart: cart.map((item) =>
                item.id === product.id
                  ? { ...item, satuanPesan, harga: hargaDihitung, hargaAwal: hargaDihitung, quantity: 1 }
                  : item
              ),
            });
          } else if (existingItem.quantity < product.stok) {
            set({
              cart: cart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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
                  harga: hargaDihitung,
                  hargaAwal: hargaDihitung,
                  hargaBase,
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
      updateSatuanPesan: (id, satuanPesan) =>
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id !== id) return item;
            const hargaBase = item.hargaBase ?? item.hargaAwal ?? item.harga;
            const satuanHarga = item.satuanHarga ?? "pcs";
            const hargaBaru = hitungHargaSatuan(hargaBase, satuanHarga, satuanPesan);
            return { ...item, satuanPesan, harga: hargaBaru, hargaAwal: hargaBaru };
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
