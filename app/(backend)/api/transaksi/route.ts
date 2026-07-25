import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { recordActivityLog } from "@/lib/activityLog";
import { actorFromUser, requireRole, requireUser } from "@/lib/apiAuth";
import { diffTransactionItems } from "@/lib/transactionItems";

// Paksa Next.js agar TIDAK menyimpan cache untuk API ini
export const dynamic = 'force-dynamic';

const toLocalStartOfDay = (date: string) => new Date(`${date}T00:00:00`);
const toLocalEndOfDay = (date: string) => new Date(`${date}T23:59:59.999`);
const maskPhone = (value: string) => {
  if (value.length <= 6) return `${value.slice(0, 2)}****`;
  return `${value.slice(0, 4)}${"*".repeat(Math.max(4, value.length - 7))}${value.slice(-3)}`;
};
const pengirimanOrder = ["Diproses", "Siap Kirim", "Dikirim", "Selesai"];

const getPengirimanLevel = (status?: string) => {
  const index = pengirimanOrder.indexOf(status || "");
  return index === -1 ? 0 : index;
};

type CartItem = {
  id: number | string;
  productId?: number | string;
  variantId?: number | string | null;
  variantName?: string | null;
  label?: string | null; // kode pelanggan per baris (Aneka), terpisah dari variasi
  harga: number | string;
  hargaBase?: number | string; // harga dasar per satuanHarga (untuk patokan harga per pelanggan)
  quantity: number | string;
  satuanPesan?: string;
};

type TransactionPayload = {
  id?: number | string;
  cart?: CartItem[];
  metode_pembayaran?: string;
  nama_pembeli?: string;
  nama_kasir?: string;
  status?: string;
  status_pengiriman?: string;
  tanggal?: string;
  adjustStock?: boolean;
  actorId?: number | string;
  actorName?: string;
  actorRole?: string;
};

type NotificationRow = {
  id: number;
  transactionId: number | null;
  targetRole: string;
  senderRole: string;
  senderName: string | null;
  statusPengiriman: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

const calculateTotal = (cart: CartItem[]) =>
  cart.reduce((total: number, item: CartItem) => total + Number(item.harga) * Number(item.quantity), 0);

const getNextTrxNumber = async (): Promise<number> => {
  const transactions = await prisma.transaction.findMany({
    select: { id: true, trxNumber: true },
  });
  const usedNumbers = new Set(
    transactions.map((t) => (t.trxNumber !== null ? t.trxNumber : t.id))
  );
  let next = 1;
  while (usedNumbers.has(next)) next++;
  return next;
};

const resolveProductId = (item: CartItem) => Number(item.productId ?? item.id);

const mapCartToItems = (cart: CartItem[]) =>
  cart.map((item: CartItem) => ({
    productId: resolveProductId(item),
    variantId: item.variantId != null ? Number(item.variantId) : null,
    variantName: item.variantName ?? null,
    label: item.label ?? null,
    basePrice: Number(item.harga),
    jumlah: Number(item.quantity),
    subtotal: Number(item.harga) * Number(item.quantity),
    satuanHarga: item.satuanPesan || "pcs",
  }));

// Simpan harga dasar tiap baris sebagai "patokan" harga pelanggan (level produk),
// diambil dari CO terakhir. Dipakai otomatis saat pelanggan yang sama order lagi.
// Pastikan nama pembeli tercatat sebagai master Customer (nama kanonik UPPERCASE),
// lalu kembalikan id-nya. Best-effort: bila gagal, transaksi tetap jalan (customerId null).
const resolveCustomerId = async (namaPembeli: string | undefined | null): Promise<number | null> => {
  const name = String(namaPembeli || "").trim().toUpperCase();
  if (name.length < 2 || name === "-") return null;
  try {
    const customer = await prisma.customer.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });
    return customer.id;
  } catch {
    return null;
  }
};

const rememberCustomerPrices = async (
  namaPembeli: string | undefined | null,
  cart: CartItem[],
  customerId: number | null
) => {
  const customerName = String(namaPembeli || "").trim().toUpperCase();
  if (!customerName) return;
  for (const item of cart) {
    const base = Number(item.hargaBase);
    if (!Number.isFinite(base)) continue; // transaksi manual belum kirim hargaBase → dilewati
    const productId = resolveProductId(item);
    if (!Number.isInteger(productId) || productId <= 0) continue;
    const price = Math.max(0, Math.round(base));
    try {
      await prisma.customerPrice.upsert({
        where: { customerName_productId_variantId: { customerName, productId, variantId: 0 } },
        update: { price, ...(customerId ? { customerId } : {}) },
        create: { customerName, productId, variantId: 0, price, ...(customerId ? { customerId } : {}) },
      });
    } catch {
      /* patokan harga best-effort; jangan gagalkan transaksi */
    }
  }
};

// Tambahkan kode pelanggan baru (label) ke master CustomerCode agar muncul di autocomplete.
const rememberCustomerCodes = async (cart: CartItem[]) => {
  const codes = new Set<string>();
  for (const item of cart) {
    const code = typeof item.label === "string" ? item.label.trim().toUpperCase() : "";
    if (code) codes.add(code);
  }
  for (const code of codes) {
    try {
      await prisma.customerCode.upsert({ where: { code }, update: {}, create: { code } });
    } catch {
      /* best-effort */
    }
  }
};

const getNotificationTargetRoles = async () => {
  try {
    const rows = await prisma.$queryRaw<Array<{ role: string }>>`
      SELECT DISTINCT role
      FROM "User"
      WHERE role IS NOT NULL
        AND role <> 'Tamu'
    `;
    const roles = rows.map((row) => row.role).filter(Boolean);
    return roles.length > 0 ? roles : ["Admin", "Owner"];
  } catch {
    return ["Admin", "Owner"];
  }
};

const transactionInclude = (includeProductImage = false) => ({
  items: {
    include: {
      product: {
        select: {
          id: true,
          nama_produk: true,
          harga: true,
          satuanHarga: true,
          ...(includeProductImage ? { gambar: true } : {}),
        },
      },
    },
  },
  orderRequest: {
    select: {
      code: true,
      phone: true,
    },
  },
});

const attachNotifications = async <T extends { id: number }>(transactions: T[]) => {
  if (transactions.length === 0) return transactions.map((transaction) => ({ ...transaction, notifications: [] }));

  const rows = await prisma.notification.findMany({
    where: {
      transactionId: {
        in: transactions.map((transaction) => transaction.id),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const notificationsByTransaction = rows.reduce<Record<number, NotificationRow[]>>((result, notification) => {
    if (!notification.transactionId) return result;
    if (!result[notification.transactionId]) result[notification.transactionId] = [];
    result[notification.transactionId].push(notification);
    return result;
  }, {});

  return transactions.map((transaction) => ({
    ...transaction,
    notifications: notificationsByTransaction[transaction.id] || [],
  }));
};

const createNewOrderNotifications = async (transaction: {
  id: number;
  trxNumber?: number | null;
  nama_pembeli?: string | null;
  nama_kasir?: string | null;
  senderRole?: string | null;
  senderName?: string | null;
}) => {
  const trxNumber = `TRX-${String(transaction.trxNumber ?? transaction.id).padStart(4, "0")}`;
  const message = `Orderan baru ${trxNumber} - ${transaction.nama_pembeli || "Tanpa nama"}`;
  const senderRole = transaction.senderRole || "Kasir";
  const senderName = transaction.senderName || transaction.nama_kasir || null;
  const targetRoles = (await getNotificationTargetRoles()).filter((targetRole) => targetRole !== senderRole);

  for (const targetRole of targetRoles) {
    await prisma.$executeRaw`
      INSERT INTO "Notification" ("transactionId", "targetRole", "senderRole", "senderName", "statusPengiriman", message, "isRead", "hidden", "createdAt")
      VALUES (${transaction.id}, ${targetRole}, ${senderRole}, ${senderName}, 'Order Baru', ${message}, false, false, NOW())
      ON CONFLICT ("transactionId", "targetRole", "senderRole", "statusPengiriman")
      DO UPDATE SET
        "senderName" = EXCLUDED."senderName",
        message = EXCLUDED.message,
        "isRead" = false,
        "hidden" = false,
        "createdAt" = NOW()
    `;
  }
};

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const metode = searchParams.get("metode");
  const pengiriman = searchParams.get("pengiriman");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const id = searchParams.get("id");
  
  // FITUR BARU: Filter Pelanggan & Urutan (Sort)
  const pelanggan = searchParams.get("pelanggan"); 
  const sort = searchParams.get("sort") || "desc"; 
  const includeProductImage = searchParams.get("includeProductImage") === "true";

  const whereClause: Prisma.TransactionWhereInput = {};

  if (id) whereClause.id = Number(id);
  
  if (status && status !== "Semua") whereClause.status = status;
  if (metode && metode !== "Semua") whereClause.metode_pembayaran = metode;
  if (pengiriman && pengiriman !== "Semua") whereClause.status_pengiriman = pengiriman;
  
  if (startDate && endDate) {
    whereClause.tanggal = {
      gte: toLocalStartOfDay(startDate),
      lte: toLocalEndOfDay(endDate)
    };
  }

  // Logika Filter Nama Pelanggan Spesifik
  if (pelanggan) {
    whereClause.nama_pembeli = {
      contains: pelanggan
    };
  }

  try {
    const transaksi = await prisma.transaction.findMany({
      where: whereClause,
      include: transactionInclude(includeProductImage),
      // FITUR BARU: Mengurutkan berdasarkan tanggal
      orderBy: { tanggal: sort === "asc" ? "asc" : "desc" },
    });
    const canSeePhone = auth.user.role === "Owner";
    const withNotifications = await attachNotifications(transaksi);
    return NextResponse.json(
      withNotifications.map((transaction) => ({
        ...transaction,
        orderRequest: transaction.orderRequest
          ? {
              ...transaction.orderRequest,
              phone: canSeePhone ? transaction.orderRequest.phone : maskPhone(transaction.orderRequest.phone),
            }
          : null,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const body = (await request.json()) as TransactionPayload;
    const { cart, metode_pembayaran, nama_pembeli, nama_kasir, status, status_pengiriman, tanggal, adjustStock } = body;

    const total_harga = calculateTotal(cart || []);

    // Catat pembeli ke master Customer (bila ada namanya) & tautkan transaksinya.
    const customerId = await resolveCustomerId(nama_pembeli);

    const nextTrxNumber = await getNextTrxNumber();
    const newTransaction = await prisma.transaction.create({
      data: {
        ...(tanggal ? { tanggal: new Date(tanggal) } : {}),
        trxNumber: nextTrxNumber,
        total_harga,
        metode_pembayaran: metode_pembayaran || "Tunai",
        nama_pembeli,
        ...(customerId ? { customerId } : {}),
        nama_kasir,
        status: status || "Paid",
        status_pengiriman: status_pengiriman || "Sedang Disiapkan",
        items: {
          create: mapCartToItems(cart || []),
        },
      },
      include: transactionInclude(),
    });

    if (adjustStock !== false) for (const item of cart || []) {
      await prisma.product.update({
        where: { id: resolveProductId(item) },
        data: { stok: { decrement: Number(item.quantity) } },
      });
    }

    // Jadikan harga transaksi ini sebagai patokan harga pelanggan berikutnya.
    await rememberCustomerPrices(nama_pembeli, cart || [], customerId);
    // Kode pelanggan baru dari transaksi ini → tambahkan ke master (untuk autocomplete).
    await rememberCustomerCodes(cart || []);

    await createNewOrderNotifications({
      ...newTransaction,
      senderRole: actor.role,
      senderName: actor.name,
    });
    await recordActivityLog({
      action: "TAMBAH",
      entity: "Transaksi",
      entityId: newTransaction.id,
      title: `Transaksi ditambahkan: TRX-${String(newTransaction.trxNumber ?? newTransaction.id).padStart(4, "0")}`,
      description: `${actor.name} menambahkan transaksi untuk ${newTransaction.nama_pembeli || "Tanpa nama"} sebesar Rp ${newTransaction.total_harga.toLocaleString("id-ID")}.`,
      actor,
      metadata: {
        total_harga: newTransaction.total_harga,
        metode_pembayaran: newTransaction.metode_pembayaran,
        status: newTransaction.status,
        status_pengiriman: newTransaction.status_pengiriman,
        nama_pembeli: newTransaction.nama_pembeli,
        nama_kasir: newTransaction.nama_kasir,
        jumlahItem: cart?.length || 0,
        adjustStock: adjustStock !== false,
      },
    });

    const [transactionWithNotifications] = await attachNotifications([newTransaction]);
    return NextResponse.json(transactionWithNotifications, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat transaksi" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // Pembatasan peran (server-side): mengubah ISI riwayat transaksi (item, harga,
    // tanggal, pembeli, metode, status bayar) hanya Owner — vektor kecurangan klasik.
    // Non-Owner (Admin) hanya boleh memperbarui status pengiriman.
    const auth = await requireRole(request, ["Owner", "Admin"]);
    if (!auth.ok) return auth.response;
    const viewer = auth.user;
    const actor = actorFromUser(viewer);

    const payload = (await request.json()) as TransactionPayload;
    const { id, status, status_pengiriman, metode_pembayaran, tanggal, nama_pembeli, nama_kasir, cart } = payload;

    if (viewer.role !== "Owner") {
      const mengubahIsi =
        Array.isArray(cart) || tanggal !== undefined || nama_pembeli !== undefined ||
        nama_kasir !== undefined || metode_pembayaran !== undefined || status !== undefined;
      if (mengubahIsi) {
        return NextResponse.json(
          { error: "Hanya Owner yang dapat mengubah isi riwayat transaksi." },
          { status: 403 }
        );
      }
    }
    const before = await prisma.transaction.findUnique({
      where: { id: Number(id) },
      include: transactionInclude(),
    });
    
    const dataToUpdate: Prisma.TransactionUpdateInput = {};
    if (status) dataToUpdate.status = status;
    if (status_pengiriman) {
      if (viewer.role === "Admin") {
        const sentNotifications = await prisma.$queryRaw<Array<{ statusPengiriman: string }>>`
          SELECT "statusPengiriman"
          FROM "Notification"
          WHERE "transactionId" = ${Number(id)} AND "senderRole" = 'Admin'
        `;
        const lockedLevel = sentNotifications.reduce(
          (highest, notification) => Math.max(highest, getPengirimanLevel(notification.statusPengiriman)),
          0
        );

        if (getPengirimanLevel(status_pengiriman) < lockedLevel) {
          return NextResponse.json(
            { error: "Status sudah dikunci karena notifikasi untuk tahap lebih lanjut sudah dikirim." },
            { status: 403 }
          );
        }
      }

      dataToUpdate.status_pengiriman = status_pengiriman;
    }
    if (metode_pembayaran) dataToUpdate.metode_pembayaran = metode_pembayaran; 
    if (tanggal) dataToUpdate.tanggal = new Date(tanggal);
    if (nama_pembeli !== undefined) dataToUpdate.nama_pembeli = nama_pembeli;
    if (nama_kasir !== undefined) dataToUpdate.nama_kasir = nama_kasir;
    if (Array.isArray(cart)) {
      dataToUpdate.total_harga = calculateTotal(cart);
      // Sinkronkan item TANPA membuang centang packing. Dulu semua item dihapus lalu
      // dibuat ulang, jadi setiap edit orderan (tambah/kurang produk) mereset checklist.
      // Sekarang baris lama yang masih ada dipakai ulang: id, packed, dan packedAt lestari.
      const { update, create, removedIds } = diffTransactionItems(
        before?.items ?? [],
        mapCartToItems(cart)
      );
      dataToUpdate.items = {
        ...(removedIds.length ? { deleteMany: { id: { in: removedIds } } } : {}),
        ...(update.length ? { update } : {}),
        ...(create.length ? { create } : {}),
      };
    }

    const updated = await prisma.transaction.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      include: transactionInclude(),
    });
    await recordActivityLog({
      action: "UPDATE",
      entity: "Transaksi",
      entityId: updated.id,
      title: `Transaksi diperbarui: TRX-${String(updated.trxNumber ?? updated.id).padStart(4, "0")}`,
      description: `${actor.name} memperbarui transaksi TRX-${String(updated.trxNumber ?? updated.id).padStart(4, "0")}.`,
      actor,
      metadata: {
        sebelum: before
          ? {
              total_harga: before.total_harga,
              metode_pembayaran: before.metode_pembayaran,
              status: before.status,
              status_pengiriman: before.status_pengiriman,
              nama_pembeli: before.nama_pembeli,
              nama_kasir: before.nama_kasir,
              jumlahItem: before.items.length,
            }
          : null,
        sesudah: {
          total_harga: updated.total_harga,
          metode_pembayaran: updated.metode_pembayaran,
          status: updated.status,
          status_pengiriman: updated.status_pengiriman,
          nama_pembeli: updated.nama_pembeli,
          nama_kasir: updated.nama_kasir,
          jumlahItem: updated.items.length,
        },
      },
    });
    const [transactionWithNotifications] = await attachNotifications([updated]);
    return NextResponse.json(transactionWithNotifications);
  } catch {
    return NextResponse.json({ error: "Gagal update status" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Menghapus riwayat transaksi hanya Owner (dicek di server, bukan cuma UI).
    const auth = await requireRole(request, ["Owner"]);
    if (!auth.ok) return auth.response;
    const actor = actorFromUser(auth.user);

    const payload = (await request.json()) as TransactionPayload;
    const { id } = payload;
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(id) },
      include: transactionInclude(),
    });
    await prisma.transaction.delete({ where: { id: Number(id) } });
    await recordActivityLog({
      action: "HAPUS",
      entity: "Transaksi",
      entityId: id,
      title: `Transaksi dihapus: TRX-${String(transaction?.trxNumber ?? id).padStart(4, "0")}`,
      description: `${actor.name} menghapus transaksi TRX-${String(transaction?.trxNumber ?? id).padStart(4, "0")}.`,
      actor,
      metadata: transaction
        ? {
            total_harga: transaction.total_harga,
            metode_pembayaran: transaction.metode_pembayaran,
            status: transaction.status,
            status_pengiriman: transaction.status_pengiriman,
            nama_pembeli: transaction.nama_pembeli,
            nama_kasir: transaction.nama_kasir,
            jumlahItem: transaction.items.length,
          }
        : null,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 });
  }
}
