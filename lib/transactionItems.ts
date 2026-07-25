// Sinkronisasi item transaksi saat riwayat penjualan diedit.
// Modul murni tanpa dependensi Prisma agar mudah diuji.
//
// Dulu edit orderan menghapus SEMUA item lalu membuatnya ulang, sehingga centang
// checklist packing (kolom packed/packedAt yang menempel di TransactionItem) ikut
// hilang setiap kali orderan diubah. Di sini baris lama yang identitasnya masih
// ada dipakai ulang (UPDATE, id tetap), jadi centang yang sudah diperiksa lestari.

export type ItemIdentity = {
  productId: number;
  variantId: number | null;
  label: string | null;
  satuanHarga: string;
};

// Identitas satu baris pesanan: produk + varian + kode pelanggan + satuan.
// Harga dan jumlah sengaja TIDAK ikut, supaya mengubah harga atau menambah/
// mengurangi jumlah pada baris yang sama tidak menghapus centangnya.
const itemKey = (item: ItemIdentity) =>
  [item.productId, item.variantId ?? "-", item.label ?? "-", item.satuanHarga].join("|");

// Bandingkan item lama dengan isi keranjang terbaru, lalu bagi jadi tiga:
// - update: baris lama yang dipakai ulang (packed & packedAt tidak tersentuh)
// - create: baris yang benar-benar baru
// - removedIds: baris lama yang sudah tidak ada di keranjang
export function diffTransactionItems<T extends ItemIdentity>(
  existing: ReadonlyArray<ItemIdentity & { id: number }>,
  next: ReadonlyArray<T>
) {
  // Antrean id per identitas: satu transaksi bisa punya beberapa baris identik.
  const leftover = new Map<string, number[]>();
  for (const item of existing) {
    const key = itemKey(item);
    const queue = leftover.get(key);
    if (queue) queue.push(item.id);
    else leftover.set(key, [item.id]);
  }

  const update: { where: { id: number }; data: T }[] = [];
  const create: T[] = [];
  for (const item of next) {
    const reusedId = leftover.get(itemKey(item))?.shift();
    if (reusedId !== undefined) update.push({ where: { id: reusedId }, data: item });
    else create.push(item);
  }

  return { update, create, removedIds: Array.from(leftover.values()).flat() };
}
