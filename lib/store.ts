import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeCartRowId, hitungHargaSatuan } from "@/lib/satuan";

// Re-export agar import lama `from "@/lib/store"` tetap berfungsi.
export { PCS_PER_UNIT, SATUAN_LABELS, computeCartRowId, hitungHargaSatuan } from "@/lib/satuan";

export type CartItem = {
  id: string;          // unique cart-row id (produk + varian + satuan + kode pelanggan)
  productId?: number;  // id produk asli (untuk variasi)
  variantId?: number | null;
  variantName?: string | null;
  label?: string | null; // kode pelanggan per baris (Aneka), terpisah dari variasi
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

// Id baris keranjang dihitung di lib/satuan.ts (produk + varian + satuan pesan),
// sehingga varian sama dengan satuan berbeda menjadi baris terpisah.

interface CartState {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updatePrice: (id: string, price: number) => void;
  updateHargaBase: (id: string, hargaBase: number) => void;
  updateSatuanPesan: (id: string, satuanPesan: string) => void;
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
        const rowId = computeCartRowId(product.id, product.variantId, satuanPesan, product.label);
        const existingItem = cart.find((item) => item.id === rowId);

        if (existingItem) {
          // Id sudah mengodekan satuan → baris yang ketemu pasti satuannya sama: cukup tambah jumlah.
          // (Varian sama dengan satuan berbeda otomatis menjadi baris terpisah.)
          if (existingItem.quantity < product.stok) {
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
                  label: product.label ?? null,
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
        set((state) => {
          const item = state.cart.find((i) => i.id === id);
          if (!item) return { cart: state.cart };
          const satuanHarga = item.satuanHarga ?? "pcs";
          const hargaBase = item.hargaBase ?? item.hargaAwal ?? item.harga;
          const hargaBaseAsli = item.hargaBaseAsli ?? hargaBase;
          // Id ikut satuan → ganti satuan berarti id baris berubah.
          const newId = computeCartRowId(item.productId ?? 0, item.variantId, satuanPesan, item.label);
          const updated = {
            ...item,
            id: newId,
            satuanPesan,
            harga: hitungHargaSatuan(hargaBase, satuanHarga, satuanPesan),
            hargaAwal: hitungHargaSatuan(hargaBaseAsli, satuanHarga, satuanPesan),
          };
          // Jika sudah ada baris lain dengan varian + satuan tujuan, gabungkan jumlahnya.
          const clash = state.cart.find((i) => i.id !== id && i.id === newId);
          if (clash) {
            return {
              cart: state.cart
                .filter((i) => i.id !== id)
                .map((i) => (i.id === newId ? { ...i, quantity: i.quantity + item.quantity } : i)),
            };
          }
          return { cart: state.cart.map((i) => (i.id === id ? updated : i)) };
        }),
      setCart: (cart) => set({ cart }),
      clearCart: () => set({ cart: [] }),
      getTotal: () => get().cart.reduce((total, item) => total + item.harga * item.quantity, 0),
    }),
    {
      name: "lina-cart-storage",
    }
  )
);
