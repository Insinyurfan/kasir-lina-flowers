import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActorFromPayload, recordActivityLog } from "@/lib/activityLog";
import { getServerSessionUser } from "@/lib/serverSession";
import { checkRateLimit, getClientIp, recordHit, tooManyRequests, type RateLimitRule } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// POST di rute ini terbuka untuk tamu, dan tiap pesanan yang masuk membuat
// notifikasi ke seluruh Owner/Admin — tanpa batas, satu skrip bisa membanjiri
// tabel pesanan sekaligus notifikasi. Batasnya dipasang longgar: pelanggan
// sungguhan mengirim 1–3 kali, bukan belasan.
const ORDER_IP_RULE: RateLimitRule = { limit: 10, windowMs: 10 * 60 * 1000 };

type RequestItemPayload = {
  productId?: number;
  variantId?: number;
  quantity?: number;
};

type RequestPricePayload = {
  itemId?: number;
  unitPrice?: number;
};

type RequestPayload = {
  id?: number;
  code?: string;
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

// Kesalahan yang berasal dari isian pembeli (varian belum dipilih, stok tak
// cukup), bukan kegagalan server. Dipisahkan supaya balasannya 400: sebelumnya
// semuanya lolos ke catch terakhir dan jadi 500, sehingga "pilih dulu
// variasinya" ikut tercatat sebagai kerusakan server di log dan pemantauan.
class ValidationError extends Error {}

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

// Alfabet kode orderan. Karakter yang gampang tertukar SENGAJA dibuang:
// huruf O (mirip angka 0), serta I dan L (mirip angka 1). Kode ini ditempel di
// chat lalu diketik ulang di halaman "Buka Kode Orderan", dan salah baca satu
// karakter cuma menghasilkan "kode tidak ditemukan" — pembeli tidak punya cara
// menebak mana yang keliru. Sisa 31 karakter tetap memberi 31^8 ≈ 850 miliar
// kemungkinan, jauh lebih dari cukup.
const KODE_ALFABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const KODE_PANJANG = 8;

// Kode pendek tanpa awalan maupun tanggal, mis. "K7QMD4XP" — sependek mungkin
// karena memang untuk dibaca dan diketik manusia.
const makeRequestCode = () => {
  // Pengambilan-ulang (rejection sampling), bukan sekadar `byte % 31`: 256
  // tidak habis dibagi 31, jadi sisa pembagian polos membuat 8 karakter awal
  // alfabet muncul lebih sering. Kode ini satu-satunya kunci untuk membuka dan
  // mengubah orderan, jadi sebarannya harus benar-benar rata — bukan sekadar
  // "terlihat acak".
  const batasAman = Math.floor(256 / KODE_ALFABET.length) * KODE_ALFABET.length;
  let kode = "";
  while (kode.length < KODE_PANJANG) {
    for (const byte of randomBytes(KODE_PANJANG)) {
      if (byte >= batasAman) continue;
      kode += KODE_ALFABET[byte % KODE_ALFABET.length];
      if (kode.length === KODE_PANJANG) break;
    }
  }
  return kode;
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
    const kodeOrderan = searchParams.get("orderan")?.trim().toUpperCase();
    const trxParam = searchParams.get("trx")?.trim().toUpperCase();

    // ── BUKA KODE ORDERAN ────────────────────────────────────────────────
    // Cukup kodenya saja, TANPA nomor HP. Kodenya 8 karakter acak dari 31
    // kemungkinan per posisi, jadi tidak bisa disisir berurutan seperti nomor
    // TRX yang menaik satu per satu.
    //
    // Balasannya SENGAJA tidak memuat nama maupun nomor HP. Kode ini dibuat
    // untuk dibagikan (ditempel di chat, diteruskan ke teman), jadi harus aman
    // bila sampai ke tangan orang lain: yang terlihat hanya daftar belanjanya,
    // bukan siapa pemesannya.
    if (kodeOrderan) {
      const tersimpan = await prisma.orderRequest.findUnique({
        where: { code: kodeOrderan },
        include: {
          items: { orderBy: { id: "asc" } },
          transaction: { select: { id: true, trxNumber: true } },
        },
      });

      if (!tersimpan) {
        return NextResponse.json({ error: "Kode orderan tidak ditemukan." }, { status: 404 });
      }

      // Harga baru dibuka setelah pemilik menetapkannya. Selama masih
      // "Menunggu", angka yang tersimpan barulah harga acuan produk — bukan
      // harga yang berlaku untuk pembeli ini — sehingga menampilkannya justru
      // menyesatkan dan mengunci negosiasi sebelum dimulai.
      const sudahDihargai = tersimpan.status !== "Menunggu";

      return NextResponse.json({
        code: tersimpan.code,
        status: tersimpan.status,
        rejectionReason: tersimpan.rejectionReason,
        createdAt: tersimpan.createdAt,
        // Selama masih menunggu, pembeli boleh mengubah isinya sendiri.
        bisaDiubah: tersimpan.status === "Menunggu",
        // Nomor TRX diberitahukan di sini supaya pembeli tahu apa yang harus
        // dimasukkan di halaman lacak — tanpa perlu menanyakannya lewat chat.
        trxNumber: tersimpan.transaction
          ? tersimpan.transaction.trxNumber ?? tersimpan.transaction.id
          : null,
        totalPrice: sudahDihargai ? tersimpan.totalPrice : null,
        items: tersimpan.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: sudahDihargai ? item.unitPrice : null,
          subtotal: sudahDihargai ? item.subtotal : null,
        })),
      });
    }

    // ── LACAK PESANAN ────────────────────────────────────────────────────
    // WAJIB disertai nomor HP. Nomor TRX berurutan (TRX-0205, 0206, 0207…),
    // jadi tanpa kunci kedua siapa pun bisa menyisirnya dari 1 ke atas dan
    // membaca seluruh pesanan pelanggan beserta nama dan nomor HP-nya.
    if (trxParam) {
      const phone = cleanPhone(searchParams.get("phone") || "");
      if (phone.length < 8) {
        return NextResponse.json({ error: "Nomor HP wajib diisi untuk melacak pesanan." }, { status: 400 });
      }

      const trxNum = Number(trxParam.replace(/^TRX-?/, ""));
      if (!Number.isInteger(trxNum) || trxNum <= 0) {
        return NextResponse.json({ error: "Nomor transaksi tidak valid." }, { status: 400 });
      }

      const trx = await prisma.transaction.findFirst({
        where: { OR: [{ trxNumber: trxNum }, { trxNumber: null, id: trxNum }] },
        select: { id: true },
      });
      if (!trx) {
        return NextResponse.json({ error: "Nomor transaksi atau nomor HP tidak sesuai." }, { status: 404 });
      }

      const orderRequest = await prisma.orderRequest.findUnique({
        where: { transactionId: trx.id },
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

      // Pesan galat sengaja sama persis untuk "transaksi tidak ada" dan
      // "nomor HP tidak cocok". Membedakannya akan memberi tahu penebak nomor
      // TRX mana yang sungguh ada, dan itu separuh jalan menuju penyisiran.
      if (!orderRequest) {
        return NextResponse.json({ error: "Nomor transaksi atau nomor HP tidak sesuai." }, { status: 404 });
      }
      if (cleanPhone(orderRequest.phone) !== phone) {
        return NextResponse.json({ error: "Nomor transaksi atau nomor HP tidak sesuai." }, { status: 404 });
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
        // Harga sengaja tidak ikut: saat pesanan masih "Menunggu", harganya
        // memang belum dikonfirmasi pemilik, dan lacak publik ini hanya butuh
        // menjawab "pesanan saya apa saja dan sudah sampai mana".
        items: orderRequest.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          variantName: item.variantName,
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

// Ubah item mentah dari pembeli menjadi baris pesanan yang sudah tervalidasi
// dan berharga.
//
// Dipakai bersama oleh POST (menyimpan orderan baru) dan PUT (mengubah orderan
// tersimpan). Disatukan dengan sengaja: kalau aturan varian dan stok ditulis
// dua kali, cepat atau lambat salah satunya tertinggal saat aturannya berubah —
// dan yang bocor justru jalur edit yang lebih jarang diuji.
const siapkanItemPesanan = async (items: RequestItemPayload[] | undefined) => {
  const rawItems = (items || [])
    .map((item) => ({
      productId: Number(item.productId),
      // 0 = produk tanpa varian, mengikuti konvensi CustomerPrice di skema.
      variantId: Math.max(0, Math.floor(Number(item.variantId) || 0)),
      quantity: Math.max(0, Math.floor(Number(item.quantity))),
    }))
    .filter((item) => Number.isInteger(item.productId) && item.productId > 0 && item.quantity > 0);

  // Digabung per kombinasi produk+varian: dua baris "Mawar / Merah" menyatu
  // jadi satu, tapi "Mawar / Merah" dan "Mawar / Putih" tetap dua baris.
  const requestedItems = [
    ...rawItems
      .reduce<Map<string, { productId: number; variantId: number; quantity: number }>>((result, item) => {
        const key = `${item.productId}:${item.variantId}`;
        const existing = result.get(key);
        if (existing) existing.quantity += item.quantity;
        else result.set(key, { ...item });
        return result;
      }, new Map())
      .values(),
  ];

  if (requestedItems.length === 0 || requestedItems.length > 50) {
    throw new ValidationError("Pesanan harus memiliki produk.");
  }

  const productIds = [...new Set(requestedItems.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      nama_produk: true,
      harga: true,
      stok: true,
      variants: { select: { id: true, name: true, priceModifier: true } },
    },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  // Stok disimpan di level produk, bukan per varian. Karena satu produk bisa
  // muncul di beberapa baris (varian berbeda), stok harus diuji terhadap TOTAL
  // seluruh barisnya — menguji per baris akan meloloskan pesanan 3 Merah +
  // 3 Putih padahal stoknya tinggal 4.
  const quantityByProduct = new Map<number, number>();
  for (const item of requestedItems) {
    quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) || 0) + item.quantity);
  }
  for (const [productId, quantity] of quantityByProduct) {
    const product = productById.get(productId);
    if (!product) throw new ValidationError("Produk tidak ditemukan.");
    if (quantity > product.stok) {
      throw new ValidationError(`Stok ${product.nama_produk} hanya ${product.stok}.`);
    }
  }

  return requestedItems.map((item) => {
    const product = productById.get(item.productId);
    if (!product) throw new ValidationError("Produk tidak ditemukan.");

    const variant = item.variantId > 0 ? product.variants.find((v) => v.id === item.variantId) : undefined;
    // Varian dicari di dalam produknya sendiri, jadi id varian milik produk
    // lain otomatis ditolak — bukan cuma dicek keberadaannya di tabel.
    if (item.variantId > 0 && !variant) {
      throw new ValidationError(`Variasi untuk ${product.nama_produk} tidak ditemukan.`);
    }
    // Produk yang punya varian WAJIB disebutkan variasinya. Tanpa ini pesanan
    // jadi ambigu dan pemilik harus bertanya balik lewat WhatsApp — persis
    // masalah yang ingin dihilangkan oleh alur pemesanan ini.
    if (item.variantId === 0 && product.variants.length > 0) {
      throw new ValidationError(`Pilih dulu variasi untuk ${product.nama_produk}.`);
    }

    // `priceModifier` menyimpan harga ABSOLUT varian, bukan selisih —
    // mengikuti pola yang sudah dipakai POS dan keranjang kasir.
    const unitPrice = variant?.priceModifier ?? product.harga;

    return {
      productId: product.id,
      productName: product.nama_produk,
      variantId: variant ? variant.id : 0,
      variantName: variant ? variant.name : null,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });
};

export async function POST(request: Request) {
  try {
    const orderKey = `pesanan:ip:${getClientIp(request)}`;
    const orderLimit = checkRateLimit(orderKey, ORDER_IP_RULE);
    if (orderLimit.limited) {
      const minutes = Math.ceil(orderLimit.retryAfterSeconds / 60);
      return tooManyRequests(
        `Terlalu banyak pesanan dikirim dari perangkat ini. Coba lagi dalam ${minutes} menit.`,
        orderLimit.retryAfterSeconds
      );
    }
    // Dihitung di awal, bukan hanya saat pesanan berhasil dibuat: kiriman yang
    // ditolak validasi pun tetap menyentuh database, jadi tetap perlu dibatasi.
    recordHit(orderKey, ORDER_IP_RULE);

    const payload = (await request.json()) as RequestPayload;
    const customerName = payload.customerName?.trim().slice(0, 100) || "";
    const phone = cleanPhone(payload.phone);
    if (customerName.length < 2) {
      return NextResponse.json({ error: "Nama wajib diisi minimal 2 karakter." }, { status: 400 });
    }
    if (phone.length < 8) {
      return NextResponse.json({ error: "Nomor HP belum valid." }, { status: 400 });
    }

    const normalizedItems = await siapkanItemPesanan(payload.items);
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

    // Ini kegagalan server (tiga kali tabrakan kode acak), bukan salah isian
    // pembeli — biarkan jatuh ke 500, jangan 400.
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
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Gagal mengirim request pesanan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Perbarui isi orderan yang sudah tersimpan, dibuka kembali lewat kode orderan.
//
// Kunci akses satu-satunya adalah kodenya sendiri — memang begitu rancangannya,
// sama seperti kode simulasi: yang memegang kode boleh mengubah isinya. Yang
// menjaganya tetap aman adalah kodenya acak dan balasan GET-nya tidak pernah
// memuat nama atau nomor HP, jadi kode yang bocor tidak membocorkan identitas.
export async function PUT(request: Request) {
  try {
    const editKey = `pesanan:ubah:${getClientIp(request)}`;
    const editLimit = checkRateLimit(editKey, ORDER_IP_RULE);
    if (editLimit.limited) {
      const minutes = Math.ceil(editLimit.retryAfterSeconds / 60);
      return tooManyRequests(
        `Terlalu banyak perubahan dari perangkat ini. Coba lagi dalam ${minutes} menit.`,
        editLimit.retryAfterSeconds
      );
    }
    recordHit(editKey, ORDER_IP_RULE);

    const payload = (await request.json()) as RequestPayload;
    const code = payload.code?.trim().toUpperCase() || "";
    if (!code) {
      return NextResponse.json({ error: "Kode orderan wajib diisi." }, { status: 400 });
    }

    const tersimpan = await prisma.orderRequest.findUnique({
      where: { code },
      select: { id: true, code: true, status: true, customerName: true },
    });
    if (!tersimpan) {
      return NextResponse.json({ error: "Kode orderan tidak ditemukan." }, { status: 404 });
    }
    // Sesudah pemilik menerima atau menolak, isinya dikunci. Membiarkannya
    // berubah berarti pemilik sudah menetapkan harga (bahkan mungkin sudah
    // memotong stok dan membuat transaksi) untuk daftar yang kemudian diam-diam
    // berganti — dan tidak ada yang tahu sampai barangnya salah.
    if (tersimpan.status !== "Menunggu") {
      return NextResponse.json(
        { error: `Orderan ini sudah ${tersimpan.status.toLowerCase()} dan tidak bisa diubah lagi.` },
        { status: 409 }
      );
    }

    const normalizedItems = await siapkanItemPesanan(payload.items);
    const totalPrice = normalizedItems.reduce((total, item) => total + item.subtotal, 0);

    const diperbarui = await prisma.$transaction(async (tx) => {
      // Baris lama dihapus lalu ditulis ulang, bukan dicocokkan satu per satu.
      // Kombinasi produk+varian bisa berubah bebas (varian diganti, produk
      // dibuang, produk baru masuk), jadi mencocokkan per baris justru lebih
      // rumit dan lebih mudah salah daripada menulis ulang seluruhnya.
      await tx.orderRequestItem.deleteMany({ where: { orderRequestId: tersimpan.id } });
      return tx.orderRequest.update({
        where: { id: tersimpan.id },
        data: {
          totalPrice,
          items: { create: normalizedItems },
          statusHistory: {
            create: {
              // Diberi label sendiri, bukan "Menunggu" lagi. Memakai label yang
              // sama membuat linimasa menampilkan "Menunggu" dua kali berturut-
              // turut dan pembeli mengira ada yang salah. Status pesanannya
              // sendiri tetap "Menunggu" — yang berubah hanya catatan riwayat.
              status: "Diubah",
              description: "Pembeli mengubah isi orderan.",
            },
          },
        },
        select: { code: true, status: true },
      });
    });

    // Pemilik harus diberi tahu. Tanpa ini, daftar yang sedang dia hargai bisa
    // sudah berubah tanpa jejak apa pun di layarnya.
    await createRequestNotifications(diperbarui.code, `${tersimpan.customerName} (diubah)`);

    return NextResponse.json({ code: diperbarui.code, status: diperbarui.status });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Gagal memperbarui orderan.";
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
              // Varian ikut disalin ke transaksi. Tanpa ini, variasi yang sudah
              // susah payah dipilih pembeli lenyap begitu request diterima —
              // checklist packing, nota, dan Status Pesanan hanya menampilkan
              // nama produknya saja.
              variantId: item.variantId > 0 ? item.variantId : null,
              variantName: item.variantName,
              // Harga yang dikonfirmasi pemilik sudah harga akhir per satuan,
              // jadi disimpan sebagai basePrice tanpa modifier. Ini menjaga
              // invarian skema `subtotal = (basePrice + priceModifier) × jumlah`
              // tetap benar; sebelumnya basePrice tertinggal 0 padahal
              // subtotalnya terisi.
              basePrice: item.unitPrice,
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
