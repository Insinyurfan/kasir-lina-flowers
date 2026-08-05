// Pembuat dokumen Nota / Surat Jalan ukuran A4 (canvas -> JPG -> PDF).
//
// Kode ini SEBELUMNYA hanya ada di dalam halaman Riwayat Penjualan. Dipindah ke
// sini supaya halaman pintasan "Download Nota" memakai fungsi yang SAMA PERSIS,
// bukan salinan — kalau tata letak nota diubah, kedua halaman ikut berubah dan
// tidak mungkin melenceng satu sama lain.

import { formatQtySatuan, formatUnitPriceSatuan } from "@/lib/satuan";

export type NotaStoreInfo = {
  brand: string;
  address: string;
  footer: string;
  logo: string;
  receiptLogo: string;
};

export type NotaTransactionItem = {
  id?: number;
  jumlah: number;
  subtotal: number;
  satuanHarga?: string | null;
  variantName?: string | null;
  label?: string | null;
  product?: { nama_produk?: string | null } | null;
};

export type NotaTransaction = {
  id: number;
  trxNumber?: number | null;
  tanggal: string;
  total_harga: number;
  nama_kasir?: string | null;
  nama_pembeli?: string | null;
  items?: NotaTransactionItem[];
};

export type PrintDocumentType = "nota" | "surat-jalan";

export const formatTransactionCode = (id: number) => `TRX-${String(id).padStart(4, "0")}`;

// ===== MODE ANEKA (nota grup bernomor + kode produk) =====
// Aktif lewat toggle saat cetak. Saat NONAKTIF, dokumen dirender persis seperti semula.
export type DocItemLike = {
  variantName?: string | null;
  label?: string | null;
  product?: { nama_produk?: string | null } | null;
};

const CIRCLED_NUMS = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳"];
const circledNo = (n: number): string => CIRCLED_NUMS[n] ?? `(${n})`;

// Ambil kode produk dari nama, mis. "LN 13 - Bando Bunga..." -> "LN 13".
const extractKode = (nama?: string | null): string => {
  if (!nama) return "-";
  const i = nama.indexOf(" - ");
  return i > 0 ? nama.slice(0, i).trim() : nama.trim();
};

// Kode pelanggan: pakai `label` (baru) bila ada; jika tidak, pakai `variantName` (data lama
// yang menyimpan kode sebagai variasi). Ini yang menentukan pengelompokan nomor nota.
export const anekaCode = (item: DocItemLike): string => {
  const l = (item.label || "").trim();
  return l || (item.variantName || "").trim();
};

// Ukuran/variasi asli untuk ditampilkan — hanya bila kode ada di `label`
// (kalau kode berada di variantName/data lama, tidak ada ukuran terpisah).
const anekaSize = (item: DocItemLike): string => ((item.label || "").trim() ? (item.variantName || "").trim() : "");

// Peta kode pelanggan -> nomor nota, urut kemunculan pertama.
// startNo = nomor awal (default 1). Untuk nota lanjutan pelanggan yang sama,
// setel startNo agar penomoran meneruskan nota sebelumnya (mis. mulai dari 5).
export const buildNotaMap = (items: DocItemLike[], startNo = 1): Map<string, number> => {
  const map = new Map<string, number>();
  let n = Math.max(1, Math.floor(startNo)) - 1;
  for (const it of items) {
    const code = anekaCode(it);
    if (code && !map.has(code)) map.set(code, ++n);
  }
  return map;
};

// Urutkan item agar terkelompok per pelanggan (nomor nota).
export const orderItemsAneka = <T extends DocItemLike>(items: T[], notaMap: Map<string, number>): T[] =>
  [...items].sort((a, b) => (notaMap.get(anekaCode(a)) ?? 999) - (notaMap.get(anekaCode(b)) ?? 999));

// Nama tampil Mode Aneka: "① LN 13 (M) AMN" (nomor nota + kode produk + ukuran + kode pelanggan).
export const anekaItemName = (item: DocItemLike, notaMap: Map<string, number>): string => {
  const kode = extractKode(item.product?.nama_produk);
  const code = anekaCode(item);
  const size = anekaSize(item);
  const no = code ? notaMap.get(code) : undefined;
  const prefix = no ? `${circledNo(no)} ` : "";
  return `${prefix}${kode}${size ? ` (${size})` : ""}${code ? ` ${code}` : ""}`;
};

// Nama tampil normal (kode pelanggan tetap ikut bila ada, mis. "... — AMN").
export const normalItemName = (item: DocItemLike): string =>
  (item.product?.nama_produk || "-") +
  (item.variantName ? ` (${item.variantName})` : "") +
  (item.label ? ` — ${item.label}` : "");

// ===== UTILITAS CANVAS & BERKAS =====

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const wrapCanvasText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = "left"
) => {
  const words = String(text || "").split(/\s+/);
  let line = "";
  let currentY = y;
  const drawX = align === "center" ? x + maxWidth / 2 : align === "right" ? x + maxWidth : x;
  const previousAlign = ctx.textAlign;
  ctx.textAlign = align;

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, drawX, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line) {
    ctx.fillText(line, drawX, currentY);
    currentY += lineHeight;
  }

  ctx.textAlign = previousAlign;
  return currentY;
};

export const downloadBlobFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const getBlobImageSize = (blob: Blob) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal membaca ukuran gambar struk."));
    };
    image.src = url;
  });

// Bungkus satu gambar JPEG jadi PDF 1 halaman (tanpa library eksternal).
export const createImagePdfBlob = (
  imageBytes: Uint8Array,
  imageWidth: number,
  imageHeight: number,
  pageWidthMm = 58
) => {
  const encoder = new TextEncoder();
  const pageWidthPt = pageWidthMm * 72 / 25.4;
  const minHeightPt = pageWidthMm > 100 ? 297 * 72 / 25.4 : 30 * 72 / 25.4;
  const pageHeightPt = Math.max(minHeightPt, pageWidthPt * imageHeight / imageWidth);
  const content = `q\n${pageWidthPt.toFixed(2)} 0 0 ${pageHeightPt.toFixed(2)} 0 0 cm\n/Im0 Do\nQ`;
  const contentBytes = encoder.encode(content);
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let byteOffset = 0;

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    byteOffset += bytes.length;
  };

  const pushText = (text: string) => pushBytes(encoder.encode(text));

  const addObject = (id: number, parts: Array<string | Uint8Array>) => {
    offsets[id] = byteOffset;
    pushText(`${id} 0 obj\n`);
    parts.forEach((part) => (typeof part === "string" ? pushText(part) : pushBytes(part)));
    pushText("\nendobj\n");
  };

  pushText("%PDF-1.4\n");
  addObject(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);
  addObject(2, ["<< /Type /Pages /Kids [3 0 R] /Count 1 >>"]);
  addObject(3, [
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt.toFixed(2)} ${pageHeightPt.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  ]);
  addObject(4, [
    `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
    imageBytes,
    "\nendstream",
  ]);
  addObject(5, [`<< /Length ${contentBytes.length} >>\nstream\n`, contentBytes, "\nendstream"]);

  const xrefOffset = byteOffset;
  pushText("xref\n0 6\n0000000000 65535 f \n");
  for (let id = 1; id <= 5; id += 1) {
    pushText(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const pdfBytes = new Uint8Array(totalLength);
  let cursor = 0;
  chunks.forEach((chunk) => {
    pdfBytes.set(chunk, cursor);
    cursor += chunk.length;
  });

  return new Blob([pdfBytes], { type: "application/pdf" });
};

// ===== DOKUMEN A4 (NOTA / SURAT JALAN) =====

export const createA4DocumentBlob = async (
  storeInfo: NotaStoreInfo,
  t: NotaTransaction,
  documentType: PrintDocumentType,
  mimeType: "image/jpeg" | "image/png" = "image/jpeg",
  aneka = false,
  startNo = 1
): Promise<Blob | null> => {
  const isNota = documentType === "nota";
  const notaMap = buildNotaMap(t.items || [], startNo);
  const docItems = aneka ? orderItemsAneka(t.items || [], notaMap) : (t.items || []);
  // A4 at ~150 dpi: 210mm × 5.906px/mm ≈ 1240px wide
  const W = 1240;
  const MARGIN = 95;
  const CW = W - MARGIN * 2;
  const estimatedH = 1754 + (t.items || []).length * 55;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = estimatedH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, estimatedH);
  ctx.textBaseline = "top";

  let y = MARGIN;

  // --- HEADER: logo + brand + doc title ---
  const LOGO_SIZE = 90;
  const logoSrc = storeInfo.receiptLogo || storeInfo.logo;
  let logoImg: HTMLImageElement | null = null;
  if (logoSrc) {
    try { logoImg = await loadImage(logoSrc); } catch { /* no logo */ }
  }

  const headerTopY = y;
  if (logoImg) ctx.drawImage(logoImg, MARGIN, y, LOGO_SIZE, LOGO_SIZE);

  const brandX = MARGIN + (logoImg ? LOGO_SIZE + 18 : 0);
  const brandMaxW = Math.floor(CW * 0.55);
  ctx.fillStyle = "#db2777";
  ctx.font = "bold 30px Arial, sans-serif";
  let brandBottomY = wrapCanvasText(ctx, storeInfo.brand || "Lina Flowers", brandX, y, brandMaxW, 36);
  if (storeInfo.address) {
    ctx.fillStyle = "#64748b";
    ctx.font = "18px Arial, sans-serif";
    brandBottomY = wrapCanvasText(ctx, storeInfo.address, brandX, brandBottomY + 6, brandMaxW, 23);
  }

  const docTitle = isNota ? "NOTA PESANAN" : "SURAT JALAN";
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(docTitle, MARGIN + CW, headerTopY);
  ctx.font = "bold 20px Arial, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText(formatTransactionCode(t.trxNumber ?? t.id), MARGIN + CW, headerTopY + 38);
  ctx.textAlign = "left";

  y = Math.max(headerTopY + LOGO_SIZE, brandBottomY) + 16;

  // pink divider
  ctx.fillStyle = "#f9a8d4";
  ctx.fillRect(MARGIN, y, CW, 3);
  y += 20;

  // --- META GRID (2×2) ---
  const META_CELL_H = 70;
  const COL_W = Math.floor(CW / 2);
  const metaFields: [string, string][] = [
    ["No. Transaksi", formatTransactionCode(t.trxNumber ?? t.id)],
    ["Tanggal", new Date(t.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })],
    ["Pelanggan", t.nama_pembeli || "-"],
    ["Kasir", t.nama_kasir || "-"],
  ];

  ctx.fillStyle = "#fdf8fb";
  ctx.fillRect(MARGIN, y, CW, META_CELL_H * 2);
  ctx.strokeStyle = "#fbcfe8";
  ctx.lineWidth = 1;
  ctx.strokeRect(MARGIN, y, CW, META_CELL_H * 2);

  metaFields.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = MARGIN + col * COL_W;
    const cy = y + row * META_CELL_H;
    ctx.strokeStyle = "#fbcfe8";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx, cy, COL_W, META_CELL_H);
    ctx.fillStyle = "#be185d";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText(label.toUpperCase(), cx + 14, cy + 12);
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText(value, cx + 14, cy + 34);
  });
  y += META_CELL_H * 2 + 20;

  // --- TABLE ---
  const THEAD_H = 40;
  const ROW_H = 48;
  const UNIT_W = isNota ? 140 : 0;
  const QTY_W = 120;
  const SUB_W = isNota ? 140 : 0;
  const PROD_W = CW - UNIT_W - QTY_W - SUB_W;

  ctx.fillStyle = "#fce7f3";
  ctx.fillRect(MARGIN, y, CW, THEAD_H);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.strokeRect(MARGIN, y, CW, THEAD_H);
  ctx.fillStyle = "#be185d";
  ctx.font = "bold 14px Arial, sans-serif";
  ctx.fillText("PRODUK", MARGIN + 14, y + 13);
  ctx.textAlign = "center";
  if (isNota) {
    ctx.fillText("HARGA/UNIT", MARGIN + PROD_W + UNIT_W / 2, y + 13);
    ctx.fillText("JUMLAH", MARGIN + PROD_W + UNIT_W + QTY_W / 2, y + 13);
    ctx.textAlign = "right";
    ctx.fillText("SUBTOTAL", MARGIN + CW - 14, y + 13);
  } else {
    ctx.fillText("JUMLAH", MARGIN + PROD_W + UNIT_W + QTY_W / 2, y + 13);
  }
  ctx.textAlign = "left";
  y += THEAD_H;

  docItems.forEach((item, idx) => {
    if (idx % 2 === 1) {
      ctx.fillStyle = "#fdf8fb";
      ctx.fillRect(MARGIN, y, CW, ROW_H);
    }
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(MARGIN, y, CW, ROW_H);

    const prodName = aneka ? anekaItemName(item, notaMap) : normalItemName(item);
    ctx.fillStyle = "#334155";
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText(prodName.length > 50 ? prodName.slice(0, 49) + "…" : prodName, MARGIN + 14, y + 16);

    if (isNota) {
      const unitPrice = item.jumlah > 0 ? item.subtotal / item.jumlah : 0;
      const unitDisplay = formatUnitPriceSatuan(unitPrice, item.satuanHarga);
      ctx.fillStyle = "#64748b";
      ctx.font = "16px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Rp ${unitDisplay.value.toLocaleString("id-ID")}/${unitDisplay.label}`, MARGIN + PROD_W + UNIT_W / 2, y + 16);

      ctx.fillStyle = "#64748b";
      ctx.font = "16px Arial, sans-serif";
      ctx.fillText(formatQtySatuan(item.jumlah, item.satuanHarga), MARGIN + PROD_W + UNIT_W + QTY_W / 2, y + 16);

      ctx.fillStyle = "#334155";
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`Rp ${Number(item.subtotal || 0).toLocaleString("id-ID")}`, MARGIN + CW - 14, y + 16);
    } else {
      ctx.fillStyle = "#64748b";
      ctx.font = "16px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(formatQtySatuan(item.jumlah, item.satuanHarga), MARGIN + PROD_W + UNIT_W + QTY_W / 2, y + 16);
    }
    ctx.textAlign = "left";
    y += ROW_H;
  });

  // total row
  if (isNota) {
    const TOTAL_H = 56;
    ctx.fillStyle = "#fdf2f8";
    ctx.fillRect(MARGIN, y, CW, TOTAL_H);
    ctx.strokeStyle = "#fbcfe8";
    ctx.lineWidth = 1;
    ctx.strokeRect(MARGIN, y, CW, TOTAL_H);
    ctx.fillStyle = "#be185d";
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.fillText("TOTAL PESANAN", MARGIN + 14, y + 16);
    ctx.textAlign = "right";
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillText(`Rp ${Number(t.total_harga || 0).toLocaleString("id-ID")}`, MARGIN + CW - 14, y + 14);
    ctx.textAlign = "left";
    y += TOTAL_H + 20;
  } else {
    y += 20;
  }

  // notes box
  const NOTES_H = 88;
  ctx.strokeStyle = "#cbd5e1";
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 1;
  ctx.strokeRect(MARGIN, y, CW, NOTES_H);
  ctx.setLineDash([]);
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 14px Arial, sans-serif";
  ctx.fillText(isNota ? "CATATAN:" : "CATATAN PENGIRIMAN:", MARGIN + 14, y + 14);
  y += NOTES_H + 20;

  // footer
  if (storeInfo.footer) {
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGIN, y);
    ctx.lineTo(MARGIN + CW, y);
    ctx.stroke();
    y += 16;
    ctx.fillStyle = "#64748b";
    ctx.font = "15px Arial, sans-serif";
    y = wrapCanvasText(ctx, storeInfo.footer, MARGIN, y, CW, 22, "center");
    y += 16;
  }

  // trim to actual content height
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = W;
  finalCanvas.height = Math.ceil(y + MARGIN);
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) return null;
  finalCtx.fillStyle = "#ffffff";
  finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
  finalCtx.drawImage(canvas, 0, 0);

  return new Promise<Blob | null>((resolve) => {
    finalCanvas.toBlob((blob) => resolve(blob), mimeType, 0.95);
  });
};

// Nama berkas: "nota-TRX-0012.pdf" / "surat-jalan-TRX-0012.jpg".
export const notaFileName = (
  t: Pick<NotaTransaction, "id" | "trxNumber">,
  documentType: PrintDocumentType,
  extension: string
) => `${documentType}-${formatTransactionCode(t.trxNumber ?? t.id)}.${extension}`;

// Dipakai halaman pintasan: sekali panggil langsung terunduh.
export const downloadNotaAsJpg = async (
  storeInfo: NotaStoreInfo,
  t: NotaTransaction,
  documentType: PrintDocumentType = "nota",
  aneka = false,
  startNo = 1
) => {
  const blob = await createA4DocumentBlob(storeInfo, t, documentType, "image/jpeg", aneka, startNo);
  if (!blob) throw new Error("Gagal membuat gambar dokumen.");
  downloadBlobFile(blob, notaFileName(t, documentType, "jpg"));
};

export const downloadNotaAsPdf = async (
  storeInfo: NotaStoreInfo,
  t: NotaTransaction,
  documentType: PrintDocumentType = "nota",
  aneka = false,
  startNo = 1
) => {
  const imageBlob = await createA4DocumentBlob(storeInfo, t, documentType, "image/jpeg", aneka, startNo);
  if (!imageBlob) throw new Error("Gagal membuat gambar dokumen.");
  const [imageBytes, imageSize] = await Promise.all([
    imageBlob.arrayBuffer().then((b) => new Uint8Array(b)),
    getBlobImageSize(imageBlob),
  ]);
  // A4 width = 210mm
  const pdfBlob = createImagePdfBlob(imageBytes, imageSize.width, imageSize.height, 210);
  downloadBlobFile(pdfBlob, notaFileName(t, documentType, "pdf"));
};
