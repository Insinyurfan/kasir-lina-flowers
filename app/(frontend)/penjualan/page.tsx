"use client";

import { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ReceiptText, Filter, X, Printer, Settings, Save, User, Trash2, Camera, Calendar, AlertCircle, Search, Plus, Pencil, Download, BellRing, Check, ArrowDown, ArrowUp, ArrowUpDown, FileText } from "lucide-react";
import ManualTransactionModal, { type ManualTransaction } from "@/components/ManualTransactionModal";
import { getSavedUserSession } from "@/lib/userSession";

const pengirimanOptions = ["Diproses", "Siap Kirim", "Dikirim", "Selesai"];
const pengirimanLevels: Record<string, number> = {
  Diproses: 0,
  "Siap Kirim": 1,
  Dikirim: 2,
  Selesai: 3,
};
const MOBILE_TRANSACTION_BATCH_SIZE = 25;

type RiwayatSortKey = "tanggal" | "pelanggan" | "kasir";
type SortDirection = "asc" | "desc";
type PrinterProfile = "bluetooth" | "usb";
type StoreInfo = {
  brand: string;
  address: string;
  footer: string;
  logo: string;
  receiptLogo: string;
};
type StoreSettingResponse = Partial<StoreInfo> & {
  error?: string;
  detail?: string;
};

const riwayatSortOptions: Array<{
  key: RiwayatSortKey;
  label: string;
  defaultDirection: SortDirection;
  ascLabel: string;
  descLabel: string;
}> = [
  {
    key: "tanggal",
    label: "Tanggal Order",
    defaultDirection: "desc",
    ascLabel: "Terlama",
    descLabel: "Terbaru",
  },
  {
    key: "pelanggan",
    label: "Pelanggan",
    defaultDirection: "asc",
    ascLabel: "A-Z",
    descLabel: "Z-A",
  },
  {
    key: "kasir",
    label: "Kasir",
    defaultDirection: "asc",
    ascLabel: "A-Z",
    descLabel: "Z-A",
  },
];

const riwayatSortOptionByKey = riwayatSortOptions.reduce<Record<RiwayatSortKey, (typeof riwayatSortOptions)[number]>>(
  (acc, option) => {
    acc[option.key] = option;
    return acc;
  },
  {} as Record<RiwayatSortKey, (typeof riwayatSortOptions)[number]>
);

const formatTransactionMonth = (dateValue: string) =>
  new Date(dateValue).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

const createTransactionSignature = (items: any[]) =>
  items
    .map((transaction) => {
      const productSignature = (transaction.items || [])
        .map((item: any) => `${item.id}:${item.jumlah}:${item.subtotal}:${item.product?.nama_produk || ""}`)
        .join(",");
      const notificationSignature = (transaction.notifications || [])
        .map((notification: any) => `${notification.id}:${notification.senderRole}:${notification.statusPengiriman}:${notification.createdAt}`)
        .join(",");

      return [
        transaction.id,
        transaction.tanggal,
        transaction.total_harga,
        transaction.metode_pembayaran,
        transaction.status,
        transaction.status_pengiriman,
        transaction.nama_pembeli,
        transaction.nama_kasir,
        productSignature,
        notificationSignature,
      ].join(":");
    })
    .join("|");

export default function RiwayatPenjualanPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortDirection>("desc");
  const [quickSort, setQuickSort] = useState<{ key: RiwayatSortKey; direction: SortDirection }>({
    key: "tanggal",
    direction: "desc",
  });
  const [filterPelanggan, setFilterPelanggan] = useState("");

  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterMetode, setFilterMetode] = useState("Semua");
  const [filterPengiriman, setFilterPengiriman] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [printType, setPrintType] = useState<"struk" | "surat-jalan">("struk");
  const [printerProfile, setPrinterProfile] = useState<PrinterProfile>("bluetooth");
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [activeMobileMonth, setActiveMobileMonth] = useState("");
  const [isDesktopView, setIsDesktopView] = useState(false);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(MOBILE_TRANSACTION_BATCH_SIZE);
  const highlightHandledRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const transaksiSignatureRef = useRef("");

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    brand: "Lina Flowers",
    address: "",
    footer: "",
    logo: "",
    receiptLogo: "",
  });
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const receiptLogoInputRef = useRef<HTMLInputElement>(null);
  const actorPayload = {
    actorId: user?.id,
    actorName: user?.fullName || user?.username,
    actorRole: user?.role,
  };

  useEffect(() => {
    const savedUser = getSavedUserSession<any>();
    if (savedUser) setUser(savedUser);
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem("lina_printer_profile");
    if (savedProfile === "usb" || savedProfile === "bluetooth") setPrinterProfile(savedProfile);
  }, []);

  const updatePrinterProfile = (profile: PrinterProfile) => {
    setPrinterProfile(profile);
    localStorage.setItem("lina_printer_profile", profile);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => setIsDesktopView(mediaQuery.matches);

    syncViewport();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  const buildTransaksiUrl = () => {
    let url = `/api/transaksi?sort=${sortOrder}&`;
    if (filterStatus !== "Semua") url += `status=${filterStatus}&`;
    if (filterMetode !== "Semua") url += `metode=${filterMetode}&`;
    if (filterPengiriman !== "Semua") url += `pengiriman=${filterPengiriman}&`;
    if (filterPelanggan) url += `pelanggan=${filterPelanggan}&`;
    if (startDate && endDate) url += `startDate=${startDate}&endDate=${endDate}&`;
    return url;
  };

  const fetchTransaksi = async (options?: { keepFilterOpen?: boolean }) => {
    const res = await fetch(buildTransaksiUrl(), { cache: "no-store" });
    const data = await res.json();
    const nextTransaksi = Array.isArray(data) ? data : [];
    const nextSignature = createTransactionSignature(nextTransaksi);

    if (transaksiSignatureRef.current !== nextSignature) {
      transaksiSignatureRef.current = nextSignature;
      setTransaksi(nextTransaksi);
    }

    if (!options?.keepFilterOpen) setIsFilterOpen(false);
  };

  const fetchPengaturan = async () => {
    const res = await fetch("/api/pengaturan", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        setStoreInfo({
          brand: data.brand || "Lina Flowers",
          address: data.address || "",
          footer: data.footer || "",
          logo: data.logo || "",
          receiptLogo: data.receiptLogo || "",
        });
      }
    }
  };

  const getAdminLockedLevel = (transaction: any) => {
    return (transaction.notifications || [])
      .filter((notification: any) => notification.senderRole === "Admin")
      .reduce((highest: number, notification: any) => Math.max(highest, pengirimanLevels[notification.statusPengiriman] ?? 0), 0);
  };

  const hasSentCurrentNotification = (transaction: any) => {
    return (transaction.notifications || []).some(
      (notification: any) => notification.senderRole === user?.role && notification.statusPengiriman === transaction.status_pengiriman
    );
  };

  const canSendNotification = (transaction: any) => {
    if (!user?.role) return false;
    if (transaction.status_pengiriman === "Diproses") return user.role === "Owner";
    if (user.role === "Admin" && hasSentCurrentNotification(transaction)) return false;
    return user.role === "Owner" || user.role === "Admin";
  };

  const getNotificationButtonTitle = (sent: boolean) => {
    if (!sent) return "Kirim notifikasi pengingat";
    return user?.role === "Owner" ? "Kirim ulang notifikasi ini" : "Notifikasi status ini sudah pernah dikirim";
  };

  const markTransactionNotificationSent = (transaction: any) => {
    const senderRole = user?.role;
    if (!senderRole) return;

    const nextNotification = {
      id: Date.now(),
      transactionId: transaction.id,
      targetRole: user?.role || "",
      senderRole,
      senderName: user?.fullName || user?.username || null,
      statusPengiriman: transaction.status_pengiriman,
      message: "",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setTransaksi((current) =>
      current.map((item) => {
        if (item.id !== transaction.id) return item;
        const notifications = (item.notifications || []).filter(
          (notification: any) =>
            notification.senderRole !== senderRole || notification.statusPengiriman !== transaction.status_pengiriman
        );

        return { ...item, notifications: [nextNotification, ...notifications] };
      })
    );
  };

  const updateStatusTransaksi = async (id: number, field: string, value: string) => {
    if ((field === "status" || field === "metode_pembayaran") && user?.role !== "Owner") {
      alert("Hanya Owner yang dapat mengubah data ini!");
      return;
    }

    const currentTrx = transaksi.find((t) => t.id === id);

    if (field === "status_pengiriman" && user?.role === "Admin" && currentTrx) {
      const lockedLevel = getAdminLockedLevel(currentTrx);
      if ((pengirimanLevels[value] ?? 0) < lockedLevel) {
        alert("Status ini sudah dikunci karena notifikasi tahap lebih lanjut sudah pernah dikirim.");
        return;
      }
    }

    const payload: any = { id, [field]: value, ...actorPayload };

    if (field === "metode_pembayaran") {
      payload.status = value === "Belum Bayar" ? "Unpaid" : "Paid";
    } else if (field === "status") {
      if (value === "Unpaid") {
        payload.metode_pembayaran = "Belum Bayar";
      } else if (value === "Paid") {
        if (currentTrx && currentTrx.metode_pembayaran === "Belum Bayar") {
          payload.metode_pembayaran = "Tunai";
        }
      }
    }

    try {
      const res = await fetch("/api/transaksi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setTransaksi(transaksi.map((t) => (t.id === id ? { ...t, ...updated } : t)));
      } else {
        const data = await res.json();
        alert(data.error || "Gagal memperbarui status.");
      }
    } catch (error) {
      alert("Gagal memperbarui status.");
    }
  };

  const handleSendNotification = async (transaction: any) => {
    if (!canSendNotification(transaction)) return;

    const res = await fetch("/api/notifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId: transaction.id,
        senderRole: user?.role,
        senderName: user?.username,
        actorId: user?.id,
        actorName: user?.fullName || user?.username,
        actorRole: user?.role,
        statusPengiriman: transaction.status_pengiriman,
      }),
    });

    if (res.ok) {
      markTransactionNotificationSent(transaction);
      localStorage.setItem("lina_notifications_refresh_at", String(Date.now()));
      window.dispatchEvent(new Event("lina_notifications_updated"));
      alert("Notifikasi berhasil dikirim.");
      fetchTransaksi({ keepFilterOpen: true });
    } else {
      const data = await res.json();
      alert(data.error || "Gagal mengirim notifikasi.");
    }
  };

  useEffect(() => {
    fetchTransaksi();
    fetchPengaturan();
  }, []);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    fetchTransaksi({ keepFilterOpen: true });
  }, [sortOrder, filterStatus, filterMetode, filterPengiriman, filterPelanggan, startDate, endDate]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (printModalOpen || manualModalOpen) return;
      fetchTransaksi({ keepFilterOpen: true });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [sortOrder, filterStatus, filterMetode, filterPengiriman, filterPelanggan, startDate, endDate, printModalOpen, manualModalOpen]);

  const applySavedStoreInfo = (data: StoreSettingResponse | null) => {
    if (!data) return;
    setStoreInfo({
      brand: data.brand || "Lina Flowers",
      address: data.address || "",
      footer: data.footer || "",
      logo: data.logo || "",
      receiptLogo: data.receiptLogo || "",
    });
  };

  const saveStoreSettings = async (
    nextStoreInfo: Partial<StoreInfo> = storeInfo,
    successMessage = "Pengaturan berhasil disimpan permanen ke database!"
  ) => {
    setIsSavingSetting(true);
    try {
      const res = await fetch("/api/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nextStoreInfo, ...actorPayload }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.detail ? `${data.error || "Gagal menyimpan pengaturan ke database."}\n${data.detail}` : data?.error || "Gagal menyimpan pengaturan ke database.");
        fetchPengaturan();
        return false;
      }

      applySavedStoreInfo(data);
      if (successMessage) alert(successMessage);
      return true;
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleSimpanPengaturan = async () => {
    await saveStoreSettings(storeInfo, "Pengaturan berhasil disimpan permanen ke database!");
  };

  const handleReceiptLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Ukuran logo struk maksimal 3MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const receiptLogo = reader.result as string;
      setStoreInfo((prev) => ({ ...prev, receiptLogo }));
      await saveStoreSettings({ receiptLogo }, "Logo struk berhasil disimpan ke database.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDeleteReceiptLogo = async () => {
    setStoreInfo((prev) => ({ ...prev, receiptLogo: "" }));
    await saveStoreSettings({ receiptLogo: "" }, "Logo struk berhasil dihapus dari database.");
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi ini? Data tidak bisa dikembalikan.`)) return;
    try {
      const res = await fetch("/api/transaksi/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, ...actorPayload }),
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchTransaksi();
      } else {
        alert("Gagal menghapus data.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const openAddManual = () => {
    setEditingTransaction(null);
    setManualModalOpen(true);
  };

  const openEditManual = (transaction: any) => {
    setEditingTransaction(transaction);
    setManualModalOpen(true);
  };

  const handleDeleteOne = async (transaction: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus TRX-${transaction.id.toString().padStart(4, "0")}?`)) return;

    try {
      const res = await fetch("/api/transaksi", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: transaction.id, ...actorPayload }),
      });

      if (res.ok) fetchTransaksi();
      else alert("Gagal menghapus transaksi.");
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filteredTransaksi.map((t) => t.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) setSelectedIds([...selectedIds, id]);
    else setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
  };

  const resetFilter = () => {
    setFilterStatus("Semua");
    setFilterMetode("Semua");
    setFilterPengiriman("Semua");
    setFilterPelanggan("");
    setSortOrder("desc");
    setQuickSort({ key: "tanggal", direction: "desc" });
    setStartDate("");
    setEndDate("");
    setSearch("");
    fetch("/api/transaksi?sort=desc", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setTransaksi(data);
        setIsFilterOpen(false);
      });
  };

  // ✅ FIX UTAMA: Gunakan Blob URL + window.open() untuk print yang kompatibel
  // dengan Chrome Android, iOS Safari, dan Windows Chrome
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const wrapCanvasText = (
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

  const drawDashedLine = (ctx: CanvasRenderingContext2D, y: number, width: number, margin: number) => {
    ctx.save();
    ctx.setLineDash([10, 7]);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(width - margin, y);
    ctx.stroke();
    ctx.restore();
  };

  const getPrintFileName = (extension = "jpg") =>
    `${printType === "struk" ? "struk" : "surat-jalan"}-TRX-${selectedTrx?.id.toString().padStart(4, "0") || "0000"}.${extension}`;

  const downloadBlobFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const getBlobImageSize = (blob: Blob) =>
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

  const createImagePdfBlob = (imageBytes: Uint8Array, imageWidth: number, imageHeight: number) => {
    const encoder = new TextEncoder();
    const pageWidthPt = 58 * 72 / 25.4;
    const pageHeightPt = Math.max(30 * 72 / 25.4, pageWidthPt * imageHeight / imageWidth);
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

  const createReceiptImageBlob = async (mode: "digital" | "thermal" = "digital", mimeType?: "image/jpeg" | "image/png") => {
    if (!selectedTrx) return null;

    const isThermal = mode === "thermal";
    const width = isThermal ? 384 : 720;
    const margin = isThermal ? 12 : 44;
    const contentWidth = width - margin * 2;
    const logoSize = isThermal ? 48 : 84;
    const topPadding = isThermal ? 16 : 36;
    const brandFont = isThermal ? 21 : 30;
    const brandLineHeight = isThermal ? 25 : 34;
    const bodyFont = isThermal ? 16 : 22;
    const bodyLineHeight = isThermal ? 20 : 27;
    const titleFont = isThermal ? 18 : 24;
    const totalFont = isThermal ? 20 : 28;
    const itemGap = isThermal ? 32 : 42;
    const estimatedHeight =
      (isThermal ? 340 : 560) + (selectedTrx.items?.length || 0) * (isThermal ? 70 : 95) + (storeInfo.footer?.length || 0) * 2;
    const draftCanvas = document.createElement("canvas");
    draftCanvas.width = width;
    draftCanvas.height = Math.max(isThermal ? 640 : 1100, estimatedHeight);

    const ctx = draftCanvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, draftCanvas.width, draftCanvas.height);
    ctx.fillStyle = "#111";
    ctx.textBaseline = "top";

    let y = topPadding;

    if (storeInfo.receiptLogo) {
      try {
        const logo = await loadImage(storeInfo.receiptLogo);
        ctx.drawImage(logo, width / 2 - logoSize / 2, y, logoSize, logoSize);
        y += logoSize + (isThermal ? 10 : 14);
      } catch {
        y += 4;
      }
    }

    ctx.font = `bold ${brandFont}px 'Courier New', monospace`;
    y = wrapCanvasText(ctx, storeInfo.brand || "Lina Flowers", margin, y, contentWidth, brandLineHeight, "center");

    ctx.font = `${bodyFont}px 'Courier New', monospace`;
    y = wrapCanvasText(ctx, storeInfo.address || "", margin, y + (isThermal ? 5 : 8), contentWidth, bodyLineHeight, "center");

    y += isThermal ? 9 : 16;
    drawDashedLine(ctx, y, width, margin);
    y += isThermal ? 14 : 22;

    ctx.font = `bold ${titleFont}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillText(printType === "struk" ? "STRUK PENJUALAN" : "SURAT JALAN", width / 2, y);
    ctx.textAlign = "left";
    y += isThermal ? 30 : 44;

    ctx.textAlign = "left";
    ctx.font = `${bodyFont}px 'Courier New', monospace`;
    const trxDate = new Date(selectedTrx.tanggal);
    ctx.fillText(
      `DATE      : ${trxDate.toLocaleDateString("id-ID")} ${trxDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
      margin,
      y
    );
    y += bodyLineHeight + 2;
    ctx.fillText(`CASHIER   : ${selectedTrx.nama_kasir || "-"}`, margin, y);
    y += bodyLineHeight + 2;
    ctx.fillText(`PELANGGAN : ${selectedTrx.nama_pembeli || "-"}`, margin, y);
    y += bodyLineHeight + 2;
    ctx.fillText(`NO TRX    : TRX-${selectedTrx.id.toString().padStart(4, "0")}`, margin, y);
    y += isThermal ? 28 : 36;

    drawDashedLine(ctx, y, width, margin);
    y += isThermal ? 16 : 24;

    selectedTrx.items.forEach((item: { jumlah: number; subtotal: number; product: { nama_produk: string } }) => {
      ctx.font = `bold ${bodyFont}px 'Courier New', monospace`;
      y = wrapCanvasText(ctx, String(item.product.nama_produk || "").toUpperCase(), margin, y, contentWidth, bodyLineHeight);

      ctx.font = `${bodyFont}px 'Courier New', monospace`;
      const unitPrice = item.jumlah > 0 ? item.subtotal / item.jumlah : 0;
      ctx.fillText(`${item.jumlah} x ${printType === "struk" ? unitPrice.toLocaleString("id-ID") : "Pcs"}`, margin, y + 2);

      if (printType === "struk") {
        ctx.textAlign = "right";
        ctx.fillText(`Rp ${item.subtotal.toLocaleString("id-ID")}`, width - margin, y + 2);
        ctx.textAlign = "left";
      }

      y += itemGap;
    });

    y += isThermal ? 4 : 8;
    drawDashedLine(ctx, y, width, margin);
    y += isThermal ? 17 : 26;

    if (printType === "struk") {
      ctx.font = `bold ${totalFont}px 'Courier New', monospace`;
      ctx.fillText("TOTAL", margin, y);
      ctx.textAlign = "right";
      ctx.fillText(`Rp ${selectedTrx.total_harga.toLocaleString("id-ID")}`, width - margin, y);
      ctx.textAlign = "left";
      y += isThermal ? 31 : 44;
      drawDashedLine(ctx, y, width, margin);
      y += isThermal ? 19 : 28;
    }

    ctx.font = `italic ${bodyFont}px 'Courier New', monospace`;
    y = wrapCanvasText(ctx, storeInfo.footer || "", margin, y, contentWidth, bodyLineHeight + 1, "center");

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = width;
    finalCanvas.height = Math.ceil(y + (isThermal ? 18 : 36));
    const finalCtx = finalCanvas.getContext("2d");
    if (!finalCtx) return null;
    finalCtx.fillStyle = "#fff";
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    finalCtx.drawImage(draftCanvas, 0, 0);

    return new Promise<Blob | null>((resolve) => {
      finalCanvas.toBlob((blob) => resolve(blob), mimeType || (isThermal ? "image/png" : "image/jpeg"), 0.95);
    });
  };

  const handleDownloadJpg = async () => {
    const blob = await createReceiptImageBlob("thermal", "image/jpeg");
    if (!blob) return;

    downloadBlobFile(blob, getPrintFileName("jpg"));
  };

  const handleDownloadPdf = async () => {
    try {
      const imageBlob = await createReceiptImageBlob("thermal", "image/jpeg");
      if (!imageBlob) return;

      const [imageBytes, imageSize] = await Promise.all([
        imageBlob.arrayBuffer().then((buffer) => new Uint8Array(buffer)),
        getBlobImageSize(imageBlob),
      ]);

      const pdfBlob = createImagePdfBlob(imageBytes, imageSize.width, imageSize.height);
      downloadBlobFile(pdfBlob, getPrintFileName("pdf"));
    } catch {
      alert("Gagal membuat PDF struk.");
    }
  };

  const shouldUseMobilePrintBridge = () => {
    const userAgent = navigator.userAgent || "";
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return isAndroid || isIOS;
  };

  const handlePrint = () => {
    if (shouldUseMobilePrintBridge() && selectedTrx) {
      const receiptUrl = `/struk/${selectedTrx.id}?type=${printType}`;
      const receiptWindow = window.open(receiptUrl, "_blank");

      if (!receiptWindow) {
        window.location.href = receiptUrl;
      }
      return;
    }

    const receiptArea = document.getElementById("receipt-print-area");
    if (!receiptArea) return;

    const isMobileReceiptPage = shouldUseMobilePrintBridge();
    const printContent = receiptArea.innerHTML;
    const thermalPaperWidthMm = 58;
    const thermalContentWidthMm = 51.5;
    const thermalPrintPaddingMm = 0.8;
    const thermalPrintOffsetMm = printerProfile === "usb" ? (thermalPaperWidthMm - thermalContentWidthMm) / 2 - 1 : -1.2;
    const paperHeightMm = Math.min(Math.max(Math.ceil(receiptArea.scrollHeight * 0.264583 * 1.55) + 28, 120), 760);

    const fullHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=219, initial-scale=1.0" />
    <title>Cetak Struk</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }

      html {
        width: ${thermalPaperWidthMm}mm;
        margin: 0;
        padding: 0;
        background: #fff;
      }

      body {
        width: ${thermalPaperWidthMm}mm;
        max-width: ${thermalPaperWidthMm}mm;
        min-width: ${thermalPaperWidthMm}mm;
        margin: 0;
        padding: 0;
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        color: #000;
        background: #fff;
        overflow: visible;
      }

      .receipt-sheet {
        width: ${thermalContentWidthMm}mm;
        max-width: ${thermalContentWidthMm}mm;
        padding: ${thermalPrintPaddingMm}mm;
        margin: 0 auto;
        background: #fff;
        color: #000;
        box-shadow: none;
        border: 0;
        position: absolute;
        left: ${thermalPrintOffsetMm}mm;
        top: ${isMobileReceiptPage ? "54px" : "0"};
      }

      @page {
        size: ${thermalPaperWidthMm}mm ${paperHeightMm}mm;
        margin: 0;
      }

      @media print {
        html, body {
          width: ${thermalPaperWidthMm}mm !important;
          max-width: ${thermalPaperWidthMm}mm !important;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .receipt-sheet {
          width: ${thermalContentWidthMm}mm !important;
          max-width: ${thermalContentWidthMm}mm !important;
          padding: ${thermalPrintPaddingMm}mm !important;
          border: 0 !important;
          box-shadow: none !important;
          left: ${thermalPrintOffsetMm}mm !important;
          right: auto !important;
          top: 0 !important;
        }

        @page {
          size: ${thermalPaperWidthMm}mm ${paperHeightMm}mm !important;
          margin: 0mm !important;
        }

        img {
          max-width: 100% !important;
          height: auto !important;
        }
      }

      .text-center { text-align: center; }
      .font-bold { font-weight: bold; }
      .flex { display: flex; }
      .justify-between { justify-content: space-between; }
      .receipt-sheet * {
        line-height: 1.24 !important;
      }
      .receipt-meta {
        overflow-wrap: anywhere;
      }
      .receipt-row {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) max-content;
        column-gap: 4px;
        align-items: start;
        width: 100%;
      }
      .receipt-row > span:first-child {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .receipt-amount {
        white-space: nowrap;
        text-align: right;
      }
      .receipt-total-row .receipt-amount {
        font-size: 13.5px !important;
      }
      .receipt-sheet .text-\\[11px\\] {
        font-size: 12px !important;
      }
      .receipt-sheet .text-\\[14px\\] {
        font-size: 14px !important;
      }
      .receipt-sheet > div[style*="border-top"] {
        margin-left: -${thermalPrintPaddingMm}mm !important;
        margin-right: -${thermalPrintPaddingMm}mm !important;
      }
      .whitespace-pre-wrap { white-space: pre-wrap; }
      .space-y-1 > * + * { margin-top: 4px; }
      .space-y-3 > * + * { margin-top: 6px; }
      .mt-1 { margin-top: 4px; }
      .mt-2 { margin-top: 6px; }
      .mt-4 { margin-top: 9px; }
      .mb-2 { margin-bottom: 6px; }
      .uppercase { text-transform: uppercase; }
      .italic { font-style: italic; }
      .tracking-widest { letter-spacing: 0.15em; }
      .mobile-print-note {
        display: ${isMobileReceiptPage ? "block" : "none"};
        width: ${thermalPaperWidthMm}mm;
        padding: 10px 8px;
        border-bottom: 1px dashed #999;
        font-family: Arial, sans-serif;
        font-size: 11px;
        line-height: 1.35;
        color: #333;
        background: #fff;
      }
      @media print {
        .mobile-print-note { display: none !important; }
      }
    </style>
  </head>
  <body>
    <div class="mobile-print-note">
      Buka menu titik tiga browser, lalu pilih Bagikan atau Cetak. Pilih aplikasi printer/RawBT jika tersedia.
    </div>
    <main class="receipt-sheet">${printContent}</main>
    ${isMobileReceiptPage ? "" : `<script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
          setTimeout(function() { window.close(); }, 1200);
        }, 500);
      };
    </script>`}
  </body>
</html>`;

    // Buat Blob URL — lebih reliable dari iframe di semua browser & platform
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Buka tab/window baru untuk print
    const printWindow = window.open(url, "_blank");

    if (!printWindow) {
      // Fallback jika popup diblokir (umum terjadi di iOS Safari)
      alert("Pop-up diblokir. Silakan izinkan pop-up, atau gunakan tombol Download JPG untuk kirim struk digital.");
      URL.revokeObjectURL(url);
      return;
    }

    // Bersihkan Blob URL setelah beberapa detik
    setTimeout(() => URL.revokeObjectURL(url), isMobileReceiptPage ? 60000 : 10000);
  };

  const filteredTransaksi = useMemo(
    () => {
      const keyword = search.trim().toLowerCase();
      const compactKeyword = keyword.replace(/[\s#-]/g, "");
      const numericKeyword = compactKeyword.replace(/^trx/, "");

      const baseTransaksi = !keyword ? transaksi : transaksi.filter((t) => {
        const buyerName = (t.nama_pembeli?.toLowerCase() || "");
        const transactionId = t.id.toString();
        const paddedTransactionId = transactionId.padStart(4, "0");
        const trxCode = `trx-${paddedTransactionId}`;
        const compactTrxCode = `trx${paddedTransactionId}`;

        return (
          buyerName.includes(keyword) ||
          trxCode.includes(keyword) ||
          compactTrxCode.includes(compactKeyword) ||
          transactionId.includes(numericKeyword)
        );
      });

      return [...baseTransaksi].sort((a, b) => {
        const direction = quickSort.direction === "asc" ? 1 : -1;
        let result = 0;

        if (quickSort.key === "tanggal") {
          result = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
        } else if (quickSort.key === "pelanggan") {
          result = String(a.nama_pembeli || "").localeCompare(String(b.nama_pembeli || ""), "id-ID", { sensitivity: "base" });
        } else {
          result = String(a.nama_kasir || "").localeCompare(String(b.nama_kasir || ""), "id-ID", { sensitivity: "base" });
        }

        if (result === 0) return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();

        return result * direction;
      });
    },
    [quickSort.direction, quickSort.key, search, transaksi]
  );

  const updateRiwayatSort = (key: RiwayatSortKey) => {
    setQuickSort((current) => {
      const nextSort =
        current.key === key
          ? { key, direction: current.direction === "asc" ? "desc" : "asc" } as const
          : { key, direction: riwayatSortOptionByKey[key].defaultDirection } as const;

      if (key === "tanggal") setSortOrder(nextSort.direction);
      return nextSort;
    });
  };

  const renderRiwayatSortIcon = (key: RiwayatSortKey) => {
    if (quickSort.key !== key) return <ArrowUpDown size={13} className="text-pink-300" />;
    return quickSort.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const mobileMonths = useMemo(() => {
    return Array.from(new Set(filteredTransaksi.slice(0, mobileVisibleCount).map((t) => formatTransactionMonth(t.tanggal))));
  }, [filteredTransaksi, mobileVisibleCount]);

  const mobileVisibleTransaksi = useMemo(
    () => filteredTransaksi.slice(0, mobileVisibleCount),
    [filteredTransaksi, mobileVisibleCount]
  );

  useEffect(() => {
    setMobileVisibleCount(MOBILE_TRANSACTION_BATCH_SIZE);
  }, [filterMetode, filterPelanggan, filterPengiriman, filterStatus, quickSort.direction, quickSort.key, search, sortOrder, startDate, endDate]);

  const allVisibleTransactionsSelected =
    filteredTransaksi.length > 0 && filteredTransaksi.every((t) => selectedIds.includes(t.id));

  useEffect(() => {
    setActiveMobileMonth((current) => {
      if (mobileMonths.length === 0) return "";
      return mobileMonths.includes(current) ? current : mobileMonths[0];
    });
  }, [mobileMonths]);

  useEffect(() => {
    const updateActiveMonth = () => {
      const monthMarkers = Array.from(document.querySelectorAll<HTMLElement>("[data-mobile-month-marker]"));
      if (monthMarkers.length === 0) return;

      const anchorTop = 132;
      let currentMonth = monthMarkers[0].dataset.mobileMonthMarker || "";
      for (const marker of monthMarkers) {
        if (marker.getBoundingClientRect().top <= anchorTop) {
          currentMonth = marker.dataset.mobileMonthMarker || currentMonth;
        } else {
          break;
        }
      }

      setActiveMobileMonth((current) => (current === currentMonth ? current : currentMonth));
    };

    const scrollRoot = document.querySelector("main");
    let animationFrame = 0;
    const requestUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateActiveMonth);
    };

    scrollRoot?.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      scrollRoot?.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [filteredTransaksi]);

  useEffect(() => {
    const highlightParam = searchParams.get("highlight");
    if (!highlightParam || highlightHandledRef.current === highlightParam || transaksi.length === 0) return;

    const targetId = Number(highlightParam);
    const targetExists = transaksi.some((item) => item.id === targetId);
    if (!targetExists) return;

    highlightHandledRef.current = highlightParam;
    setSearch("");
    setHighlightedId(targetId);

    window.setTimeout(() => {
      const visibleTarget = Array.from(document.querySelectorAll<HTMLElement>(`[data-trx-target="${targetId}"]`)).find(
        (element) => element.getClientRects().length > 0
      );
      visibleTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);

    window.setTimeout(() => {
      setHighlightedId((current) => (current === targetId ? null : current));
    }, 2600);
  }, [searchParams, transaksi]);

  return (
    <div className="lina-panel rounded-2xl p-6 min-h-[80vh] border text-slate-800">
      <style jsx global>{`
        @keyframes trx-highlight {
          0%, 100% {
            background-color: transparent;
            box-shadow: inset 0 0 0 0 rgba(236, 72, 153, 0);
          }
          35%, 65% {
            background-color: #fce7f3;
            box-shadow: inset 0 0 0 2px rgba(236, 72, 153, 0.65);
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ReceiptText className="text-pink-500" /> Riwayat Penjualan
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola status pembayaran dan pengiriman pesanan.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* SEARCH BAR */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau No TRX..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-pink-50 border border-pink-100 rounded-xl outline-none focus:border-pink-500 text-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
            {user?.role === "Owner" && (
              <button
                onClick={openAddManual}
                className="bg-pink-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-sm hover:bg-pink-700"
              >
                <Plus size={18} /> Manual
              </button>
            )}
            {selectedIds.length > 0 && user?.role === "Owner" && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-sm"
              >
                <Trash2 size={18} /> Hapus ({selectedIds.length})
              </button>
            )}
            {user?.role === "Owner" && filteredTransaksi.length > 0 && (
              <label
                className={`md:hidden px-3 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-sm border ${
                  allVisibleTransactionsSelected
                    ? "bg-pink-600 text-white border-pink-600 shadow-pink-200"
                    : "bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={allVisibleTransactionsSelected}
                  onChange={handleSelectAll}
                  className="sr-only"
                />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    allVisibleTransactionsSelected
                      ? "border-white bg-white text-pink-600"
                      : "border-pink-300 bg-white text-transparent"
                  }`}
                >
                  <Check size={12} strokeWidth={4} />
                </span>
                <span className="text-xs">Pilih Semua</span>
              </label>
            )}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="bg-pink-100 text-pink-700 px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
            >
              <Filter size={20} /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-[1fr_auto] gap-2 md:hidden">
        <select
          value={quickSort.key}
          onChange={(e) => {
            const key = e.target.value as RiwayatSortKey;
            const direction = riwayatSortOptionByKey[key].defaultDirection;
            setQuickSort({ key, direction });
            if (key === "tanggal") setSortOrder(direction);
          }}
          className="h-[42px] rounded-xl border border-pink-100 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-pink-400"
        >
          {riwayatSortOptions.map((option) => (
            <option key={option.key} value={option.key}>
              Urutkan: {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setQuickSort((current) => {
              const direction = current.direction === "asc" ? "desc" : "asc";
              if (current.key === "tanggal") setSortOrder(direction);
              return { ...current, direction };
            });
          }}
          className="flex h-[42px] items-center justify-center gap-2 rounded-xl border border-pink-100 bg-white px-3 text-sm font-bold text-pink-700 shadow-sm"
        >
          {quickSort.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          {quickSort.direction === "asc" ? riwayatSortOptionByKey[quickSort.key].ascLabel : riwayatSortOptionByKey[quickSort.key].descLabel}
        </button>
      </div>

      {!isDesktopView && activeMobileMonth && (
        <div className="fixed left-0 right-0 top-4 z-40 flex justify-center pointer-events-none md:hidden">
          <div className="w-fit max-w-[64vw] rounded-full border border-pink-100 bg-white/95 px-5 py-2 text-center text-sm font-black uppercase tracking-wide text-pink-700 shadow-lg shadow-pink-100/70 backdrop-blur-sm">
            {activeMobileMonth}
          </div>
        </div>
      )}

      {!isDesktopView && (
      <div className="space-y-3">
        {filteredTransaksi.length === 0 ? (
          <div className="rounded-2xl border border-pink-100 bg-pink-50/40 py-10 text-center text-sm text-slate-400">
            Pencarian tidak ditemukan...
          </div>
        ) : (
          mobileVisibleTransaksi.map((t, index) => {
            const currentMonth = new Date(t.tanggal).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
            const previousMonth = index > 0
              ? new Date(mobileVisibleTransaksi[index - 1].tanggal).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
              : "";
            const showMonthSeparator = index === 0 || currentMonth !== previousMonth;
            const adminLockedLevel = getAdminLockedLevel(t);
            const notificationSent = hasSentCurrentNotification(t);
            const notificationAllowed = canSendNotification(t);
            const cardTone = t.status === "Unpaid"
              ? "border-red-100 bg-red-50/60"
              : t.status_pengiriman === "Diproses"
                ? "border-orange-100 bg-orange-50/60"
                : t.status_pengiriman === "Siap Kirim"
                  ? "border-blue-100 bg-blue-50/60"
                  : "border-pink-100 bg-white";

            return (
              <Fragment key={t.id}>
                {showMonthSeparator && (
                  <div data-mobile-month-marker={currentMonth} className="flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-pink-100" />
                    <div className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-center text-[11px] font-black uppercase tracking-wide text-pink-700">
                      {currentMonth}
                    </div>
                    <div className="h-px flex-1 bg-pink-100" />
                  </div>
                )}

                <article
                  data-trx-target={t.id}
                  className={`rounded-2xl border p-4 shadow-sm space-y-4 ${cardTone} ${highlightedId === t.id ? "animate-[trx-highlight_1.2s_ease-in-out_2]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {user?.role === "Owner" && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(t.id)}
                            onChange={(e) => handleSelectOne(t.id, e.target.checked)}
                            className="w-4 h-4 cursor-pointer accent-pink-600"
                          />
                        )}
                        <p className="text-xs font-mono font-bold text-pink-600">TRX-{t.id.toString().padStart(4, "0")}</p>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-slate-800 leading-snug">{t.nama_pembeli || "Tanpa nama"}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Kasir: <span className="font-semibold text-slate-700">{t.nama_kasir || "-"}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-500">
                        {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(t.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/80 border border-white p-3 space-y-2">
                    {(t.items || []).slice(0, 3).map((item: { id: number; jumlah: number; subtotal: number; product?: { nama_produk?: string } }) => (
                      <div key={item.id} className="flex justify-between gap-3 text-xs">
                        <span className="text-slate-600 min-w-0 truncate">
                          {item.jumlah}x {item.product?.nama_produk || "Produk Dihapus"}
                        </span>
                        <span className="font-bold text-slate-700 shrink-0">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                    {(t.items || []).length > 3 && (
                      <p className="text-[11px] font-bold text-slate-400">+{(t.items || []).length - 3} item lainnya</p>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total</p>
                      <p className="text-lg font-black text-pink-600">Rp {t.total_harga.toLocaleString("id-ID")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrx(t);
                        setPrintModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm active:scale-95"
                    >
                      <Printer size={16} /> Cetak
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Metode</p>
                      {user?.role === "Owner" ? (
                        <select
                          value={t.metode_pembayaran}
                          onChange={(e) => updateStatusTransaksi(t.id, "metode_pembayaran", e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2 outline-none text-xs font-bold cursor-pointer transition-colors ${t.status === "Unpaid"
                              ? "bg-red-100 border-red-200 text-red-700"
                              : "bg-white border-slate-200 text-slate-600"
                            }`}
                        >
                          <option value="Tunai">Tunai</option>
                          <option value="QRIS">QRIS</option>
                          <option value="Transfer Bank">Transfer Bank</option>
                          <option value="Belum Bayar">Belum Bayar</option>
                        </select>
                      ) : (
                        <p className={`rounded-xl bg-white px-3 py-2 text-xs font-bold border border-slate-100 ${t.status === "Unpaid" ? "text-red-600" : "text-slate-600"}`}>
                          {t.metode_pembayaran}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Bayar</p>
                        {user?.role === "Owner" ? (
                          <select
                            value={t.status}
                            onChange={(e) => updateStatusTransaksi(t.id, "status", e.target.value)}
                            className={`w-full font-bold rounded-xl px-3 py-2 outline-none text-xs cursor-pointer transition-colors ${t.status === "Paid"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-500 text-white border border-red-500 shadow-sm shadow-red-200"
                              }`}
                          >
                            <option value="Paid">Lunas</option>
                            <option value="Unpaid">Belum Lunas</option>
                          </select>
                        ) : (
                          <span
                            className={`flex h-9 items-center justify-center rounded-xl px-3 text-xs font-bold ${t.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-500 text-white shadow-sm shadow-red-200"
                              }`}
                          >
                            {t.status === "Paid" ? "Lunas" : "Belum Lunas"}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Pengiriman</p>
                        <select
                          value={t.status_pengiriman}
                          onChange={(e) => updateStatusTransaksi(t.id, "status_pengiriman", e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2 outline-none text-xs font-bold cursor-pointer transition-colors ${t.status_pengiriman === "Diproses"
                              ? "bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-200"
                              : t.status_pengiriman === "Siap Kirim"
                                ? "bg-blue-500 text-white border-blue-600 shadow-sm shadow-blue-200"
                              : "bg-white border-slate-200 text-slate-600"
                            }`}
                        >
                          {pengirimanOptions.map((option) => (
                            <option
                              key={option}
                              value={option}
                              disabled={user?.role === "Admin" && (pengirimanLevels[option] ?? 0) < adminLockedLevel}
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 border-t border-white pt-3">
                    {(user?.role === "Owner" || user?.role === "Admin") && (
                      <button
                        type="button"
                        onClick={() => handleSendNotification(t)}
                        disabled={!notificationAllowed}
                        title={getNotificationButtonTitle(notificationSent)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold shadow-sm transition-all ${
                          notificationAllowed
                            ? "bg-pink-50 border-pink-100 text-pink-600 active:scale-95"
                            : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                        }`}
                      >
                        <BellRing size={15} /> Notif
                      </button>
                    )}
                    {user?.role === "Owner" && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditManual(t)}
                          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm active:scale-95"
                        >
                          <Pencil size={15} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOne(t)}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs font-bold text-red-600 shadow-sm active:scale-95"
                        >
                          <Trash2 size={15} /> Hapus
                        </button>
                      </>
                    )}
                  </div>
                </article>
              </Fragment>
            );
          })
        )}

        {mobileVisibleCount < filteredTransaksi.length && (
          <button
            type="button"
            onClick={() => setMobileVisibleCount((current) => current + MOBILE_TRANSACTION_BATCH_SIZE)}
            className="w-full rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm font-bold text-pink-700 shadow-sm active:scale-[0.99]"
          >
            Muat lagi ({filteredTransaksi.length - mobileVisibleCount} tersisa)
          </button>
        )}
      </div>
      )}

      {isDesktopView && (
      <div className="relative z-0 overflow-x-auto rounded-xl border border-pink-100">
        <table className="w-full min-w-[1050px] text-left">
          <thead className="bg-pink-50 text-pink-900 text-sm border-b border-pink-100">
            <tr>
              <th className="p-4 w-10 text-center">
                {user?.role === "Owner" && (
                  <input
                    type="checkbox"
                    checked={filteredTransaksi.length > 0 && selectedIds.length === filteredTransaksi.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer accent-pink-600"
                  />
                )}
              </th>
              <th className="p-4 font-semibold">
                <button type="button" onClick={() => updateRiwayatSort("tanggal")} className="flex items-center gap-1.5 rounded-lg text-left hover:text-pink-600">
                  Tanggal Order {renderRiwayatSortIcon("tanggal")}
                </button>
              </th>
              <th className="p-4 font-semibold">
                <button type="button" onClick={() => updateRiwayatSort("pelanggan")} className="flex items-center gap-1.5 rounded-lg text-left hover:text-pink-600">
                  Pelanggan {renderRiwayatSortIcon("pelanggan")}
                </button>
              </th>
              <th className="p-4 font-semibold">
                <button type="button" onClick={() => updateRiwayatSort("kasir")} className="flex items-center gap-1.5 rounded-lg text-left hover:text-pink-600">
                  Kasir {renderRiwayatSortIcon("kasir")}
                </button>
              </th>
              <th className="p-4 font-semibold">Total & Metode</th>
              <th className="p-4 font-semibold">Status Bayar</th>
              <th className="p-4 font-semibold">Pengiriman</th>
              <th className="p-4 font-semibold text-center min-w-[80px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredTransaksi.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400">
                  Pencarian tidak ditemukan...
                </td>
              </tr>
            ) : (
              filteredTransaksi.map((t, index) => {
                let rowStyle = "border-b border-pink-50 hover:bg-pink-50/30 transition-colors";
                if (t.status === "Unpaid")
                  rowStyle = "border-b border-red-100 bg-red-50/50 hover:bg-red-100/50 transition-colors";
                else if (t.status_pengiriman === "Diproses")
                  rowStyle = "border-b border-orange-100 bg-orange-50/50 hover:bg-orange-100/50 transition-colors";
                else if (t.status_pengiriman === "Siap Kirim")
                  rowStyle = "border-b border-blue-100 bg-blue-50/50 hover:bg-blue-100/50 transition-colors";

                const currentMonth = new Date(t.tanggal).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                const previousMonth = index > 0
                  ? new Date(filteredTransaksi[index - 1].tanggal).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
                  : "";
                const showMonthSeparator = index === 0 || currentMonth !== previousMonth;
                const adminLockedLevel = getAdminLockedLevel(t);
                const notificationSent = hasSentCurrentNotification(t);
                const notificationAllowed = canSendNotification(t);

                return (
                  <Fragment key={t.id}>
                  {showMonthSeparator && (
                    <tr className="bg-white">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-pink-100" />
                          <span className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-pink-700">
                            {currentMonth}
                          </span>
                          <div className="h-px flex-1 bg-pink-100" />
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr
                    data-trx-target={t.id}
                    className={`${rowStyle} ${highlightedId === t.id ? "animate-[trx-highlight_1.2s_ease-in-out_2]" : ""}`}
                  >
                    <td className="p-4 text-center">
                      {user?.role === "Owner" && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(t.id)}
                          onChange={(e) => handleSelectOne(t.id, e.target.checked)}
                          className="w-4 h-4 cursor-pointer accent-pink-600"
                        />
                      )}
                    </td>
                    <td className="p-4">
                      <div className={`font-bold flex items-center gap-1 ${t.status === "Unpaid" ? "text-red-600" : "text-slate-700"}`}>
                        {t.status === "Unpaid" ? (
                          <AlertCircle size={14} className="text-red-500" />
                        ) : (
                          <Calendar size={14} className="text-pink-400" />
                        )}
                        {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 ml-5">
                        {new Date(t.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1 text-[13px]">
                        <User size={14} className="text-slate-400" /> {t.nama_pembeli}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        #TRX-{t.id.toString().padStart(4, "0")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 text-[13px]">{t.nama_kasir || "-"}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Cashier</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-pink-600 mb-1">Rp {t.total_harga.toLocaleString("id-ID")}</div>
                      {user?.role === "Owner" ? (
                        <select
                          value={t.metode_pembayaran}
                          onChange={(e) => updateStatusTransaksi(t.id, "metode_pembayaran", e.target.value)}
                          className={`border rounded-md px-1 py-0.5 outline-none text-[11px] font-medium w-full max-w-[110px] cursor-pointer transition-colors ${t.status === "Unpaid"
                              ? "bg-red-100 border-red-200 text-red-700 hover:bg-red-200"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                          <option value="Tunai">Tunai</option>
                          <option value="QRIS">QRIS</option>
                          <option value="Transfer Bank">Transfer Bank</option>
                          <option value="Belum Bayar">Belum Bayar</option>
                        </select>
                      ) : (
                        <div className={`text-[10px] font-medium ${t.status === "Unpaid" ? "text-red-500" : "text-slate-500"}`}>
                          {t.metode_pembayaran}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {user?.role === "Owner" ? (
                        <select
                          value={t.status}
                          onChange={(e) => updateStatusTransaksi(t.id, "status", e.target.value)}
                          className={`font-bold rounded-lg px-2 py-1 outline-none text-xs cursor-pointer transition-colors ${t.status === "Paid"
                              ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                              : "bg-red-500 text-white shadow-sm shadow-red-200 hover:bg-red-600"
                            }`}
                        >
                          <option value="Paid">Lunas</option>
                          <option value="Unpaid">Belum Lunas</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-500 text-white shadow-sm shadow-red-200"
                            }`}
                        >
                          {t.status === "Paid" ? "Lunas" : "Belum Lunas"}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={t.status_pengiriman}
                        onChange={(e) => updateStatusTransaksi(t.id, "status_pengiriman", e.target.value)}
                        className={`border rounded-lg px-2 py-1 outline-none text-xs font-medium cursor-pointer transition-colors ${t.status_pengiriman === "Diproses"
                            ? "bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-200 hover:bg-orange-600"
                            : t.status_pengiriman === "Siap Kirim"
                              ? "bg-blue-500 text-white border-blue-600 shadow-sm shadow-blue-200 hover:bg-blue-600"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {pengirimanOptions.map((option) => (
                          <option
                            key={option}
                            value={option}
                            disabled={user?.role === "Admin" && (pengirimanLevels[option] ?? 0) < adminLockedLevel}
                          >
                            {option === "Diproses" ? "⏳ " : option === "Siap Kirim" ? "📦 " : option === "Dikirim" ? "🚚 " : "✅ "}
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrx(t);
                            setPrintModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center bg-white border border-slate-200 p-2 rounded-lg hover:bg-slate-100 shadow-sm transition-all cursor-pointer"
                        >
                          <Printer size={18} className="text-slate-600" />
                        </button>
                        {user?.role === "Owner" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSendNotification(t)}
                              disabled={!notificationAllowed}
                              title={getNotificationButtonTitle(notificationSent)}
                              className={`inline-flex items-center justify-center border p-2 rounded-lg shadow-sm transition-all ${
                                notificationAllowed
                                  ? "bg-pink-50 border-pink-100 hover:bg-pink-100 cursor-pointer"
                                  : "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <BellRing size={18} className={notificationAllowed ? "text-pink-600" : "text-slate-400"} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditManual(t)}
                              className="inline-flex items-center justify-center bg-white border border-slate-200 p-2 rounded-lg hover:bg-slate-100 shadow-sm transition-all cursor-pointer"
                            >
                              <Pencil size={18} className="text-slate-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOne(t)}
                              className="inline-flex items-center justify-center bg-red-50 border border-red-100 p-2 rounded-lg hover:bg-red-100 shadow-sm transition-all cursor-pointer"
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </button>
                          </>
                        )}
                        {user?.role === "Admin" && (
                          <button
                            type="button"
                            onClick={() => handleSendNotification(t)}
                            disabled={!notificationAllowed}
                            title={getNotificationButtonTitle(notificationSent)}
                            className={`inline-flex items-center justify-center border p-2 rounded-lg shadow-sm transition-all ${
                              notificationAllowed
                                ? "bg-pink-50 border-pink-100 hover:bg-pink-100 cursor-pointer"
                                : "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <BellRing size={18} className={notificationAllowed ? "text-pink-600" : "text-slate-400"} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* MODAL CETAK STRUK */}
      {printModalOpen && selectedTrx && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 p-4 overflow-y-auto flex justify-center items-start">

          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row relative mt-4 mb-8 md:my-auto md:max-h-[90vh] md:overflow-hidden">

            {/* TOMBOL CLOSE */}
            <button
              onClick={() => setPrintModalOpen(false)}
              className="absolute top-4 right-4 z-20 bg-red-50 p-2.5 rounded-full text-red-500 hover:bg-red-100 transition-colors shadow-sm"
            >
              <X size={20} />
            </button>

            {/* SISI KIRI: PENGATURAN (HANYA MUNCUL JIKA ROLE ADALAH OWNER) */}
            {user?.role === "Owner" && (
              <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100 bg-white md:overflow-y-auto">
                <h3 className="font-bold text-lg mb-4 text-slate-800 md:hidden">Cetak Dokumen</h3>

                <div className="flex gap-2 p-1 bg-pink-50 rounded-xl mb-6">
                  <button onClick={() => setPrintType("struk")} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${printType === 'struk' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>Struk Harga</button>
                  <button onClick={() => setPrintType("surat-jalan")} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${printType === 'surat-jalan' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>Surat Jalan</button>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold flex items-center gap-2 text-pink-600"><Settings size={18} /> Pengaturan Tampilan</span>
                    <button onClick={handleSimpanPengaturan} disabled={isSavingSetting} className="bg-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md hover:bg-pink-700 active:scale-95 disabled:opacity-50"><Save size={14} /> {isSavingSetting ? "Menyimpan..." : "Simpan"}</button>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo Struk & Surat Jalan</label>
                    <div className="flex items-center gap-3 mt-2">
                      {storeInfo.receiptLogo ? (
                        <img
                          src={storeInfo.receiptLogo}
                          alt="Logo Struk"
                          className="w-14 h-14 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1"
                        />
                      ) : (
                        <div
                          aria-label="Logo struk kosong"
                          className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-300"
                        >
                          Kosong
                        </div>
                      )}
                      <input type="file" ref={receiptLogoInputRef} onChange={handleReceiptLogoUpload} className="hidden" accept="image/*" />
                      <button
                        type="button"
                        onClick={() => receiptLogoInputRef.current?.click()}
                        className="text-xs font-bold border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Ubah Logo Struk
                      </button>
                      {storeInfo.receiptLogo && (
                        <button
                          type="button"
                          onClick={handleDeleteReceiptLogo}
                          disabled={isSavingSetting}
                          aria-label="Hapus logo struk"
                          title="Hapus logo struk"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Brand</label><input type="text" value={storeInfo.brand} onChange={(e) => setStoreInfo({ ...storeInfo, brand: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-bold text-slate-700 focus:border-pink-500 mt-1" /></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat Cabang</label><textarea value={storeInfo.address} onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none text-slate-700 focus:border-pink-500 mt-1" rows={2} /></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pesan Penutup</label><textarea value={storeInfo.footer} onChange={(e) => setStoreInfo({ ...storeInfo, footer: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none text-slate-700 focus:border-pink-500 mt-1" rows={2} /></div>
                </div>
              </div>
            )}

            {/* SISI KANAN: PREVIEW & TOMBOL CETAK */}
            <div className={`w-full ${user?.role === "Owner" ? "md:w-1/2" : "max-w-2xl mx-auto"} bg-pink-50/50 flex flex-col md:overflow-y-auto relative`}>

              {/* HEADER ADMIN */}
              {user?.role !== "Owner" && (
                <div className="flex justify-between items-center p-4 md:p-6 bg-white border-b sticky top-0 z-10 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg hidden md:block">Pratinjau Pesanan</h3>
                  <div className="flex gap-2 p-1 bg-pink-50 rounded-xl w-full md:w-auto mt-6 md:mt-0 mr-8 md:mr-0">
                    <button onClick={() => setPrintType("struk")} className={`flex-1 md:w-32 py-2 text-xs font-bold rounded-lg transition-all ${printType === 'struk' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>Struk Harga</button>
                    <button onClick={() => setPrintType("surat-jalan")} className={`flex-1 md:w-32 py-2 text-xs font-bold rounded-lg transition-all ${printType === 'surat-jalan' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>Surat Jalan</button>
                  </div>
                </div>
              )}

              {user?.role === "Owner" && (
                <div className="hidden md:flex justify-between items-center p-4 bg-white border-b sticky top-0 z-10">
                  <h3 className="font-bold text-slate-800">Preview Dokumen</h3>
                </div>
              )}

              {/* AREA KERTAS STRUK — hanya preview di layar */}
              <div className="flex-1 p-6 md:p-8 flex justify-center items-start min-h-[50vh]">
                <div
                  id="receipt-print-area"
                  className="bg-white shadow-xl w-full max-w-[80mm] p-6 text-[11px] font-mono border border-slate-200 text-black leading-tight mx-auto"
                >
                  <div className="text-center">
                    {storeInfo.receiptLogo && (
                      <img
                        src={storeInfo.receiptLogo}
                        style={{ width: "50px", height: "50px", objectFit: "contain", margin: "0 auto 8px" }}
                        alt="Logo Struk Lina Flowers"
                      />
                    )}
                    <div className="font-bold text-[14px]">{storeInfo.brand}</div>
                    <div className="whitespace-pre-wrap mt-1">{storeInfo.address}</div>
                  </div>
                  <div style={{ borderTop: "1.5px dashed #000", margin: "12px 0" }}></div>
                  <div className="text-center font-bold uppercase tracking-widest">
                    {printType === "struk" ? "STRUK PENJUALAN" : "SURAT JALAN"}
                  </div>

                  <div className="receipt-meta mt-4 space-y-1">
                    <div>DATE      : {new Date(selectedTrx.tanggal).toLocaleDateString("id-ID")}</div>
                    <div>TIME      : {new Date(selectedTrx.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                    <div>CASHIER   : {selectedTrx.nama_kasir}</div>
                    <div>PELANGGAN : <span className="font-bold">{selectedTrx.nama_pembeli}</span></div>
                    <div>NO TRX    : TRX-{selectedTrx.id.toString().padStart(4, "0")}</div>
                  </div>

                  <div style={{ borderTop: "1.5px dashed #000", margin: "12px 0" }}></div>
                  <div className="space-y-3">
                    {selectedTrx.items.map((item: { id: number; jumlah: number; subtotal: number; product: { nama_produk: string } }) => (
                      <div key={item.id}>
                        <div className="font-bold uppercase">{item.product.nama_produk}</div>
                        <div className="receipt-row flex justify-between mt-0.5">
                          <span>
                            {item.jumlah} x{" "}
                            {printType === "struk"
                              ? (item.subtotal / item.jumlah).toLocaleString("id-ID")
                              : "Pcs"}
                          </span>
                          {printType === "struk" && <span className="receipt-amount">Rp {item.subtotal.toLocaleString("id-ID")}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: "1.5px dashed #000", margin: "12px 0" }}></div>
                  {printType === "struk" && (
                    <div className="receipt-row receipt-total-row flex justify-between font-bold text-[14px] mt-2 mb-2">
                      <span>TOTAL</span>
                      <span className="receipt-amount">Rp {selectedTrx.total_harga.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div style={{ borderTop: "1.5px dashed #000", margin: "12px 0" }}></div>
                  <div className="text-center mt-4 italic whitespace-pre-wrap">{storeInfo.footer}</div>
                </div>
              </div>

              {/* TOMBOL CETAK */}
              <div className="p-4 bg-white border-t mt-auto md:sticky md:bottom-0 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="mb-3 hidden md:block">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Mode Printer Windows</p>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-pink-50 p-1">
                    <button
                      type="button"
                      onClick={() => updatePrinterProfile("bluetooth")}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                        printerProfile === "bluetooth" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Bluetooth
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePrinterProfile("usb")}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                        printerProfile === "usb" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      USB Center
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 active:scale-[0.98] transition-all"
                  >
                    <FileText size={18} /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJpg}
                    className="bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 active:scale-[0.98] transition-all"
                  >
                    <Download size={18} /> JPG
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-200 hover:bg-pink-700 active:scale-[0.98] transition-all"
                >
                  <Printer size={20} /> Cetak {printType === "struk" ? "Struk" : "Surat Jalan"} Sekarang
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL FILTER */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Filter Transaksi Lengkap</h3>
              <button type="button" onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={filterPelanggan}
                  onChange={(e) => setFilterPelanggan(e.target.value)}
                  placeholder="Contoh: Ibu Rina"
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urutkan Berdasarkan</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    const direction = e.target.value as SortDirection;
                    setSortOrder(direction);
                    setQuickSort({ key: "tanggal", direction });
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-pink-500"
                >
                  <option value="desc">Tanggal Terbaru ke Terlama</option>
                  <option value="asc">Tanggal Terlama ke Terbaru</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status Bayar</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-pink-500"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Paid">Lunas</option>
                  <option value="Unpaid">Belum Lunas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
                <select
                  value={filterMetode}
                  onChange={(e) => setFilterMetode(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-pink-500"
                >
                  <option value="Semua">Semua Metode</option>
                  <option value="Tunai">Tunai (Cash)</option>
                  <option value="QRIS">QRIS / E-Wallet</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Belum Bayar">Belum Bayar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status Pengiriman</label>
                <select
                  value={filterPengiriman}
                  onChange={(e) => setFilterPengiriman(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-pink-500"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Diproses">⏳ Diproses</option>
                  <option value="Siap Kirim">📦 Siap Kirim</option>
                  <option value="Dikirim">🚚 Dikirim</option>
                  <option value="Selesai">✅ Selesai</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 outline-none text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetFilter}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                  Reset Filter
                </button>
                <button
                  type="button"
                  onClick={() => fetchTransaksi()}
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-colors"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ManualTransactionModal
        open={manualModalOpen}
        transaction={editingTransaction as ManualTransaction | null}
        title={editingTransaction ? "Edit Riwayat Penjualan" : "Tambah Riwayat Manual"}
        onClose={() => setManualModalOpen(false)}
        onSaved={fetchTransaksi}
      />
    </div>
  );
}
