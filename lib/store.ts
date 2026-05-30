import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  nama_produk: string;
  harga: number;
  hargaAwal?: number;
  quantity: number;
  stok: number;
  gambar?: string | null;
};

interface CartState {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updatePrice: (id: number, price: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product) => {
        const cart = get().cart;
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
          if (existingItem.quantity < product.stok) {
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
            set({ cart: [...cart, { ...product, hargaAwal: product.harga, quantity: 1 }] });
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
      clearCart: () => set({ cart: [] }),
      getTotal: () => get().cart.reduce((total, item) => total + item.harga * item.quantity, 0),
    }),
    {
      name: "lina-cart-storage", // Nama penyimpanan di localStorage
    }
  )
);
