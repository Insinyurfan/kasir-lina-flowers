import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActorFromPayload, recordActivityLog } from "@/lib/activityLog";
import { getServerSessionUser } from "@/lib/serverSession";

export const dynamic = "force-dynamic";

type RequestItemPayload = {
  productId?: number;
  quantity?: number;
};

type RequestPricePayload = {
  itemId?: number;
  unitPrice?: number;
};

type RequestPayload = {
  id?: number;
  customerName?: string;
  phone?: string;
  items?: RequestItemPayload[];
  action?: "accept" | "reject";
  rejectionReason?: string;
  prices?: RequestPricePayload[];
  actorId?: number;
  actorName?: string;
  actorRole?: string;
};

const cleanPhone = (value = "") => value.replace(/[^\d+]/g, "").slice(0, 20);
const getStatusDescription = (status: string, fallback?: string | null) => {
  if (status === "Siap Kirim" || status === "Siap Dikirim") {
    return "Pesanan anda sudah siap dikirimkan sedang menunggu di kirimkan.";
  }
  if (status === "Dikirim") {
    return "Pesanan anda sudah dalam perjalanan dan akan segera sampai.";
  }
  return fallback || null;
};
const maskPhone = (value: string) => {
  if (value.length <= 6) return `${value.slice(0, 2)}****`;
  return `${value.slice(0, 4)}${"*".repeat(Math.max(4, value.length - 7))}${value.slice(-3)}`;
};
const normalizeHistoryStatus = (status: string) => {
  if (status === "Diproses") return "Sedang Disiapkan";
  if (status === "Siap Kirim") return "Siap Dikirim";
  return status;
};

const makeRequestCode = () => {
  const datePart = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `REQ-${datePart}-${randomPart}`;
};

const getTargetRoles = async () => {
  const rows = await prisma.user.findMany({
    where: { role: { in: ["Owner", "Admin"] } },
    distinct: ["role"],
    select: { role: true },
  });
  return rows.length > 0 ? rows.map((row) => row.role) : ["Owner", "Admin"];
};

const createRequestNotifications = async (code: string, customerName: string) => {
  const message = `${code} - ${customerName}`;
  for (const targetRole of await getTargetRoles()) {
    await prisma.notification.create({
      data: {
        targetRole,
        senderRole: "Tamu",
        senderName: customerName,
        statusPengiriman: "Request Pesanan",
        message,
      },
    });
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (code) {
      const phone = cleanPhone(searchParams.get("phone") || "");
      if (phone.length < 8) {
        return NextResponse.json({ error: "Nomor HP wajib diisi untuk melacak pesanan." }, { status: 400 });
      }
      const transactionMatch = code.match(/^TRX-?(\d+)$/);
      const trxNum = transactionMatch ? Number(transactionMatch[1]) : null;
      let resolvedTransactionId: number | null = null;
      if (trxNum !== null) {
        const trx = await prisma.transaction.findFirst({
          where: { OR: [{ trxNumber: trxNum }, { trxNumber: null, id: trxNum }] },
          select: { id: true },
        });
        resolvedTransactionId = trx?.id ?? null;
      }
      const orderRequest = await prisma.orderRequest.findUnique({
        where: resolvedTransactionId !== null ? { transactionId: resolvedTransactionId } : { code },
        include: {
          items: { orderBy: { id: "asc" } },
          statusHistory: { orderBy: { createdAt: "asc" } },
          transaction: {
            select: {
              id: true,
              trxNumber: true,
              tanggal: true,
              status_pengiriman: true,
            },
          },
        },
      });

      if (!orderRequest) {
        return NextResponse.json({ error: "Kode pesanan atau nomor HP tidak sesuai." }, { status: 404 });
      }
      if (cleanPhone(orderRequest.phone) !== phone) {
        return NextResponse.json({ error: "Kode pesanan atau nomor HP tidak sesuai." }, { status: 404 });
      }

      const storedStatuses = new Set(orderRequest.statusHistory.map((item) => normalizeHistoryStatus(item.status)));
      const baselineHistory = [
        ...(!storedStatuses.has("Menunggu")
          ? [{
              id: -1,
              status: "Menunggu",
              description: "Request pesanan berhasil dikirim.",
              createdAt: orderRequest.createdAt,
            }]
          : []),
        ...(orderRequest.transaction && !storedStatuses.has("Diterima")
          ? [{
              id: -2,
              status: "Diterima",
              description: `Request diterima sebagai TRX-${String(orderRequest.transaction.trxNumber ?? orderRequest.transaction.id).padStart(4, "0")}.`,
              createdAt: orderRequest.transaction.tanggal,
            }]
          : []),
        ...(orderRequest.transaction && !storedStatuses.has("Sedang Disiapkan")
          ? [{
              id: -3,
              status: "Sedang Disiapkan",
              description: "Pesanan mulai disiapkan.",
              createdAt: orderRequest.transaction.tanggal,
            }]
          : []),
        ...(orderRequest.status === "Ditolak" && !storedStatuses.has("Ditolak")
          ? [{
              id: -4,
              status: "Ditolak",
              description: orderRequest.rejectionReason || "Request pesanan ditolak.",
              createdAt: orderRequest.updatedAt,
            }]
          : []),
        ...(orderRequest.transaction &&
        !["Sedang Disiapkan", "Diproses"].includes(orderRequest.transaction.status_pengiriman) &&
        !storedStatuses.has(normalizeHistoryStatus(orderRequest.transaction.status_pengiriman))
          ? [{
              id: -5,
              status: normalizeHistoryStatus(orderRequest.transaction.status_pengiriman),
              description: getStatusDescription(
                normalizeHistoryStatus(orderRequest.transaction.status_pengiriman),
                "Pesanan sedang diproses."
              ),
              createdAt: orderRequest.updatedAt,
            }]
          : []),
      ];
      const history = [...baselineHistory, ...orderRequest.statusHistory]
        .map((item) => ({
          ...item,
          status: normalizeHistoryStatus(item.status),
          description: getStatusDescription(normalizeHistoryStatus(item.status), item.description),
        }))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return NextResponse.json({
        code: orderRequest.code,
        customerName: orderRequest.customerName,
        status: orderRequest.status,
        rejectionReason: orderRequest.rejectionReason,
        createdAt: orderRequest.createdAt,
        transaction: orderRequest.transaction
          ? {
              id: orderRequest.transaction.id,
              trxNumber: orderRequest.transaction.trxNumber,
              status_pengiriman: orderRequest.transaction.status_pengiriman,
            }
          : null,
        statusHistory: history,
        items: orderRequest.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
        })),
      });
    }

    const status = searchParams.get("status");
    const viewer = await getServerSessionUser(request);
    if (!viewer || !["Owner", "Admin"].includes(viewer.role)) {
      return NextResponse.json({ error: "Sesi Owner atau Admin diperlukan." }, { status: 401 });
    }
    const canSeePhone = viewer?.role === "Owner";
    const requests = await prisma.orderRequest.findMany({
      where: status && status !== "Semua" ? { status } : undefined,
      include: {
        items: {
          include: {
            product: { select: { gambar: true } },
          },
          orderBy: { id: "asc" },
        },
        transaction: {
          select: { id: true, trxNumber: true, status_pengiriman: true, nama_pengrajin: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      requests.map((orderRequest) => ({
        ...orderRequest,
        phone: canSeePhone ? orderRequest.phone : maskPhone(orderRequest.phone),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Gagal memuat request pesanan." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload;
    const customerName = payload.customerName?.trim().slice(0, 100) || "";
    const phone = cleanPhone(payload.phone);
    const rawItems = (payload.items || [])
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Math.max(0, Math.floor(Number(item.quantity))),
      }))
      .filter((item) => Number.isInteger(item.productId) && item.productId > 0 && item.quantity > 0);
    const requestedItems = Array.from(
      rawItems.reduce<Map<number, number>>((result, item) => {
        result.set(item.productId, (result.get(item.productId) || 0) + item.quantity);
        return result;
      }, new Map())
    ).map(([productId, quantity]) => ({ productId, quantity }));

    if (customerName.length < 2) {
      return NextResponse.json({ error: "Nama wajib diisi minimal 2 karakter." }, { status: 400 });
    }
    if (phone.length < 8) {
      return NextResponse.json({ error: "Nomor HP belum valid." }, { status: 400 });
    }
    if (requestedItems.length === 0 || requestedItems.length > 50) {
      return NextResponse.json({ error: "Pesanan harus memiliki produk." }, { status: 400 });
    }

    const productIds = [...new Set(requestedItems.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, nama_produk: true, harga: true, stok: true },
    });
    const productById = new Map(products.map((product) => [product.id, product]));

    const normalizedItems = requestedItems.map((item) => {
      const product = productById.get(item.productId);
      if (!product) throw new Error("Produk tidak ditemukan.");
      if (item.quantity > product.stok) {
        throw new Error(`Stok ${product.nama_produk} hanya ${product.stok}.`);
      }
      return {
        productId: product.id,
        productName: product.nama_produk,
        quantity: item.quantity,
        unitPrice: product.harga,
        subtotal: product.harga * item.quantity,
      };
    });
    const totalPrice = normalizedItems.reduce((total, item) => total + item.subtotal, 0);

    let created;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        created = await prisma.orderRequest.create({
          data: {
            code: makeRequestCode(),
            customerName,
            phone,
            totalPrice,
            items: { create: normalizedItems },
            statusHistory: {
              create: {
                status: "Menunggu",
                description: "Request pesanan berhasil dikirim.",
              },
            },
          },
          include: { items: true },
        });
        break;
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }

    if (!created) throw new Error("Gagal membuat kode pesanan.");
    await createRequestNotifications(created.code, created.customerName);

    return NextResponse.json(
      {
        code: created.code,
        status: created.status,
        customerName: created.customerName,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengirim request pesanan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload;
    const authorizedUser = await getServerSessionUser(request);
    if (!authorizedUser || !["Owner", "Admin"].includes(authorizedUser.role)) {
      return NextResponse.json({ error: "Hanya Owner atau Admin yang dapat memproses request." }, { status: 403 });
    }
    const actor = getActorFromPayload({
      actorId: authorizedUser.id,
      actorName: authorizedUser.fullName || authorizedUser.username,
      actorRole: authorizedUser.role,
    });

    const requestId = Number(payload.id);
    const orderRequest = await prisma.orderRequest.findUnique({
      where: { id: requestId },
      include: { items: true },
    });
    if (!orderRequest) {
      return NextResponse.json({ error: "Request pesanan tidak ditemukan." }, { status: 404 });
    }
    if (orderRequest.status !== "Menunggu") {
      return NextResponse.json({ error: "Request ini sudah pernah diproses." }, { status: 409 });
    }

    if (payload.action === "reject") {
      const rejectionReason = payload.rejectionReason?.trim().slice(0, 300) || "";
      if (!rejectionReason) {
        return NextResponse.json({ error: "Alasan penolakan wajib diisi." }, { status: 400 });
      }

      const rejected = await prisma.orderRequest.update({
        where: { id: requestId },
        data: {
          status: "Ditolak",
          rejectionReason,
          statusHistory: {
            create: {
              status: "Ditolak",
              description: rejectionReason,
            },
          },
        },
      });
      await recordActivityLog({
        action: "UPDATE",
        entity: "Request Pesanan",
        entityId: rejected.id,
        title: `Request ditolak: ${rejected.code}`,
        description: `${actor.name} menolak request ${rejected.code}.`,
        actor,
        metadata: { rejectionReason },
      });
      return NextResponse.json(rejected);
    }

    if (payload.action !== "accept") {
      return NextResponse.json({ error: "Aksi request tidak valid." }, { status: 400 });
    }

    const suppliedPrices = Array.isArray(payload.prices) ? payload.prices : [];
    const priceByItemId = new Map<number, number>();
    for (const item of suppliedPrices) {
      const itemId = Number(item.itemId);
      const unitPrice = Math.round(Number(item.unitPrice));
      if (!Number.isInteger(itemId) || itemId <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
        return NextResponse.json({ error: "Harga pesanan tidak valid." }, { status: 400 });
      }
      priceByItemId.set(itemId, unitPrice);
    }
    if (suppliedPrices.length > 0) {
      const requestItemIds = new Set(orderRequest.items.map((item) => item.id));
      const hasInvalidItem = [...priceByItemId.keys()].some((itemId) => !requestItemIds.has(itemId));
      if (priceByItemId.size !== orderRequest.items.length || hasInvalidItem) {
        return NextResponse.json({ error: "Semua harga produk wajib dikonfirmasi." }, { status: 400 });
      }
    }

    const accepted = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: orderRequest.items.map((item) => item.productId) } },
        select: { id: true, nama_produk: true, stok: true },
      });
      const productById = new Map(products.map((product) => [product.id, product]));

      for (const item of orderRequest.items) {
        const product = productById.get(item.productId);
        if (!product || product.stok < item.quantity) {
          throw new Error(`Stok ${item.productName} tidak mencukupi.`);
        }
      }

      const confirmedItems = orderRequest.items.map((item) => {
        const unitPrice = suppliedPrices.length > 0 ? priceByItemId.get(item.id) : item.unitPrice;
        if (unitPrice === undefined) throw new Error(`Harga ${item.productName} belum dikonfirmasi.`);
        return {
          ...item,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      });
      const confirmedTotal = confirmedItems.reduce((total, item) => total + item.subtotal, 0);

      for (const item of confirmedItems) {
        await tx.orderRequestItem.update({
          where: { id: item.id },
          data: {
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          },
        });
      }

      const allTrx = await tx.transaction.findMany({ select: { id: true, trxNumber: true } });
      const usedTrxNums = new Set(allTrx.map((t) => (t.trxNumber !== null ? t.trxNumber : t.id)));
      let nextTrxNum = 1;
      while (usedTrxNums.has(nextTrxNum)) nextTrxNum++;

      const transaction = await tx.transaction.create({
        data: {
          trxNumber: nextTrxNum,
          total_harga: confirmedTotal,
          metode_pembayaran: "Belum Bayar",
          status: "Unpaid",
          nama_pembeli: orderRequest.customerName,
          nama_kasir: actor.name,
          status_pengiriman: "Sedang Disiapkan",
          items: {
            create: confirmedItems.map((item) => ({
              productId: item.productId,
              jumlah: item.quantity,
              subtotal: item.subtotal,
            })),
          },
        },
      });

      for (const item of orderRequest.items) {
        const stockUpdate = await tx.product.updateMany({
          where: { id: item.productId, stok: { gte: item.quantity } },
          data: { stok: { decrement: item.quantity } },
        });
        if (stockUpdate.count !== 1) {
          throw new Error(`Stok ${item.productName} baru saja berubah dan tidak mencukupi.`);
        }
      }

      const updatedRequest = await tx.orderRequest.update({
        where: { id: requestId },
        data: {
          status: "Diterima",
          totalPrice: confirmedTotal,
          transactionId: transaction.id,
          rejectionReason: null,
          statusHistory: {
            create: [
              {
                status: "Diterima",
                description: `Request diterima sebagai TRX-${String(transaction.trxNumber ?? transaction.id).padStart(4, "0")}.`,
              },
              {
                status: "Sedang Disiapkan",
                description: "Pesanan mulai disiapkan.",
              },
            ],
          },
        },
      });

      return { request: updatedRequest, transaction, pricesAdjusted: suppliedPrices.length > 0 };
    });

    await recordActivityLog({
      action: "UPDATE",
      entity: "Request Pesanan",
      entityId: accepted.request.id,
      title: `Request diterima: ${accepted.request.code}`,
      description: `${actor.name} menerima request ${accepted.request.code} menjadi TRX-${String(accepted.transaction.trxNumber ?? accepted.transaction.id).padStart(4, "0")}.`,
      actor,
      metadata: {
        transactionId: accepted.transaction.id,
        totalPrice: accepted.transaction.total_harga,
        pricesAdjusted: accepted.pricesAdjusted,
      },
    });

    return NextResponse.json(accepted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memproses request pesanan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
