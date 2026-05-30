"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  LineChart,
  Package,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  Trophy,
  TrendingUp,
  X,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ManualTransactionModal, { type ManualTransaction } from "@/components/ManualTransactionModal";
import { getSavedUserSession } from "@/lib/userSession";

type Product = {
  id: number;
  nama_produk: string;
  harga: number;
  stok: number;
  gambar?: string | null;
};

type Account = {
  username: string;
  fullName?: string | null;
};

type TransactionItem = {
  id: number;
  jumlah: number;
  subtotal: number;
  product: Product;
};

type Transaction = {
  id: number;
  tanggal: string;
  total_harga: number;
  metode_pembayaran: string;
  status: string;
  status_pengiriman: string;
  nama_pembeli?: string | null;
  nama_kasir?: string | null;
  items?: TransactionItem[];
};

type TopProduct = {
  id: number;
  nama_produk: string;
  gambar?: string | null;
  jumlah_terjual: number;
  total_pendapatan: number;
};

type StatementRow = {
  tanggal: Date;
  trxId: number;
  pelanggan: string;
  kasir: string;
  produk: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  metode: string;
  transaction: Transaction;
};

type OrderRow = {
  tanggal: Date;
  trxId: number;
  pelanggan: string;
  kasir: string;
  jumlah: number;
  subtotal: number;
  metode: string;
  transaction: Transaction;
};

type OrderSortKey = "tanggal" | "trxId" | "pelanggan" | "kasir" | "jumlah" | "subtotal" | "metode";
type SortDirection = "asc" | "desc";

const orderSortOptions: Array<{
  key: OrderSortKey;
  label: string;
  ascLabel: string;
  descLabel: string;
  defaultDirection: SortDirection;
}> = [
  { key: "tanggal", label: "Tanggal", ascLabel: "Terlama", descLabel: "Terbaru", defaultDirection: "desc" },
  { key: "trxId", label: "No TRX", ascLabel: "TRX Lama", descLabel: "TRX Baru", defaultDirection: "desc" },
  { key: "pelanggan", label: "Pelanggan", ascLabel: "A-Z", descLabel: "Z-A", defaultDirection: "asc" },
  { key: "kasir", label: "Kasir", ascLabel: "A-Z", descLabel: "Z-A", defaultDirection: "asc" },
  { key: "jumlah", label: "Qty", ascLabel: "Kecil ke besar", descLabel: "Besar ke kecil", defaultDirection: "desc" },
  { key: "subtotal", label: "Total Order", ascLabel: "Kecil ke besar", descLabel: "Besar ke kecil", defaultDirection: "desc" },
  { key: "metode", label: "Metode", ascLabel: "A-Z", descLabel: "Z-A", defaultDirection: "asc" },
];

const orderSortOptionByKey = orderSortOptions.reduce<Record<OrderSortKey, (typeof orderSortOptions)[number]>>(
  (result, option) => {
    result[option.key] = option;
    return result;
  },
  {} as Record<OrderSortKey, (typeof orderSortOptions)[number]>
);

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatMonthYear = (date: Date) => `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

const escapeHtml = (value: string | number) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const downloadBlob = (content: BlobPart, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const pdfText = (value: string) =>
  value
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const padText = (value: string | number, width: number, align: "left" | "right" = "left") => {
  const text = String(value).replace(/[^\x20-\x7E]/g, "?");
  const sliced = text.length > width ? `${text.slice(0, Math.max(width - 3, 0))}...` : text;
  return align === "right" ? sliced.padStart(width, " ") : sliced.padEnd(width, " ");
};

const createSimplePdf = (lines: string[]) => {
  const linesPerPage = 40;
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  if (pages.length === 0) pages.push(["Tidak ada data."]);

  const objects: Record<number, string> = {};
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";

  const pageObjectIds: number[] = [];
  pages.forEach((pageLines, pageIndex) => {
    const pageObjectId = 4 + pageIndex * 2;
    const contentObjectId = pageObjectId + 1;
    pageObjectIds.push(pageObjectId);

    const stream = [
      "BT",
      "/F1 9 Tf",
      "13 TL",
      "32 560 Td",
      ...pageLines.map((line, index) => `${index === 0 ? "" : "T*"}(${pdfText(line)}) Tj`),
      "ET",
    ].join("\n");

    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

  const maxObjectId = Math.max(...Object.keys(objects).map(Number));
  let pdf = "%PDF-1.4\n";
  const offsets = ["0000000000 65535 f "];

  for (let id = 1; id <= maxObjectId; id += 1) {
    offsets[id] = `${String(pdf.length).padStart(10, "0")} 00000 n `;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${maxObjectId + 1}\n${offsets.join("\n")}\n`;
  pdf += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
};

export default function LaporanPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [transaksi, setTransaksi] = useState<Transaction[]>([]);
  const [productImagesById, setProductImagesById] = useState<Record<number, string | null>>({});
  const [filterMode, setFilterMode] = useState<"month" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [isLoading, setIsLoading] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
  const [cashierNameByUsername, setCashierNameByUsername] = useState<Record<string, string>>({});
  const [isDesktopChart, setIsDesktopChart] = useState(false);
  const [orderSort, setOrderSort] = useState<{ key: OrderSortKey; direction: SortDirection }>({
    key: "tanggal",
    direction: "desc",
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedUser = getSavedUserSession<{ role?: string }>();
      if (savedUser) setUser(savedUser);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateChartMode = () => setIsDesktopChart(mediaQuery.matches);

    updateChartMode();
    mediaQuery.addEventListener("change", updateChartMode);
    return () => mediaQuery.removeEventListener("change", updateChartMode);
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/akun", { cache: "no-store" });
        const data = (await res.json()) as Account[];
        if (!Array.isArray(data)) return;

        setCashierNameByUsername(
          data.reduce<Record<string, string>>((map, account) => {
            if (account.username) map[account.username] = account.fullName || account.username;
            return map;
          }, {})
        );
      } catch {
        setCashierNameByUsername({});
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchProductImages = async () => {
      try {
        const res = await fetch("/api/produk", { cache: "no-store" });
        const data = (await res.json()) as Product[];
        if (!Array.isArray(data)) return;

        setProductImagesById(
          data.reduce<Record<number, string | null>>((map, product) => {
            map[product.id] = product.gambar || null;
            return map;
          }, {})
        );
      } catch {
        setProductImagesById({});
      }
    };

    fetchProductImages();
  }, []);

  const getCashierDisplayName = useCallback(
    (name?: string | null) => {
      if (!name) return "-";
      return cashierNameByUsername[name] || name;
    },
    [cashierNameByUsername]
  );

  const periodRange = useMemo(() => {
    const year = Number(selectedYear);
    const month = Number(selectedMonth) - 1;

    if (filterMode === "month") {
      return {
        startDate: formatDateInput(new Date(year, month, 1)),
        endDate: formatDateInput(new Date(year, month + 1, 0)),
      };
    }

    return {
      startDate: formatDateInput(new Date(year, 0, 1)),
      endDate: formatDateInput(new Date(year, 11, 31)),
    };
  }, [filterMode, selectedMonth, selectedYear]);

  const periodLabel =
    filterMode === "month"
      ? `${monthNames[Number(selectedMonth) - 1]} ${selectedYear}`
      : `Tahun ${selectedYear}`;

  const fetchLaporan = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/transaksi?startDate=${periodRange.startDate}&endDate=${periodRange.endDate}&sort=asc`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setTransaksi(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
    }
  }, [periodRange.endDate, periodRange.startDate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchLaporan();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchLaporan]);

  const paidTransactions = useMemo(() => transaksi.filter((t) => t.status === "Paid"), [transaksi]);

  const chartData = useMemo(() => {
    const groupedData: Record<string, { display: string; total: number }> = {};

    paidTransactions.forEach((t) => {
      const dateObj = new Date(t.tanggal);
      const key =
        filterMode === "month"
          ? formatDateInput(dateObj)
          : `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
      const display =
        filterMode === "month"
          ? dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
          : monthNames[dateObj.getMonth()].slice(0, 3);

      if (!groupedData[key]) groupedData[key] = { display, total: 0 };
      groupedData[key].total += t.total_harga;
    });

    return Object.keys(groupedData)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({
        tanggal: groupedData[key].display,
        pendapatan: groupedData[key].total,
      }));
  }, [paidTransactions, filterMode]);

  const topProducts = useMemo(() => {
    const grouped: Record<number, TopProduct> = {};

    paidTransactions.forEach((transaction) => {
      transaction.items?.forEach((item) => {
        const productId = item.product.id;
        if (!grouped[productId]) {
          grouped[productId] = {
            id: productId,
            nama_produk: item.product.nama_produk,
            gambar: productImagesById[productId],
            jumlah_terjual: 0,
            total_pendapatan: 0,
          };
        }

        grouped[productId].jumlah_terjual += item.jumlah;
        grouped[productId].total_pendapatan += item.subtotal;
      });
    });

    return Object.values(grouped)
      .sort((a, b) => b.jumlah_terjual - a.jumlah_terjual || b.total_pendapatan - a.total_pendapatan)
      .slice(0, 10);
  }, [paidTransactions, productImagesById]);

  const statementRows = useMemo<StatementRow[]>(() => {
    return paidTransactions
      .flatMap((transaction) =>
        (transaction.items || []).map((item) => ({
          tanggal: new Date(transaction.tanggal),
          trxId: transaction.id,
          pelanggan: transaction.nama_pembeli || "-",
          kasir: getCashierDisplayName(transaction.nama_kasir),
          produk: item.product.nama_produk,
          jumlah: item.jumlah,
          harga_satuan: item.jumlah > 0 ? item.subtotal / item.jumlah : 0,
          subtotal: item.subtotal,
          metode: transaction.metode_pembayaran,
          transaction,
        }))
      )
      .sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime() || a.trxId - b.trxId);
  }, [getCashierDisplayName, paidTransactions]);

  const orderRows = useMemo<OrderRow[]>(() => {
    return paidTransactions
      .map((transaction) => ({
        tanggal: new Date(transaction.tanggal),
        trxId: transaction.id,
        pelanggan: transaction.nama_pembeli || "-",
        kasir: getCashierDisplayName(transaction.nama_kasir),
        jumlah: (transaction.items || []).reduce((sum, item) => sum + item.jumlah, 0),
        subtotal: transaction.total_harga,
        metode: transaction.metode_pembayaran,
        transaction,
      }))
      .sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime() || a.trxId - b.trxId);
  }, [getCashierDisplayName, paidTransactions]);

  const sortedOrderRows = useMemo(() => {
    const directionMultiplier = orderSort.direction === "asc" ? 1 : -1;

    return [...orderRows].sort((a, b) => {
      let result = 0;

      if (orderSort.key === "tanggal") {
        result = a.tanggal.getTime() - b.tanggal.getTime();
      } else if (orderSort.key === "trxId" || orderSort.key === "jumlah" || orderSort.key === "subtotal") {
        result = Number(a[orderSort.key]) - Number(b[orderSort.key]);
      } else {
        result = String(a[orderSort.key]).localeCompare(String(b[orderSort.key]), "id-ID", { sensitivity: "base" });
      }

      if (result === 0) return b.trxId - a.trxId;
      return result * directionMultiplier;
    });
  }, [orderRows, orderSort.direction, orderSort.key]);

  const updateOrderSort = (key: OrderSortKey) => {
    setOrderSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }

      return { key, direction: orderSortOptionByKey[key].defaultDirection };
    });
  };

  const renderOrderSortIcon = (key: OrderSortKey) => {
    if (orderSort.key !== key) return <ArrowUpDown size={13} className="text-pink-300" />;
    return orderSort.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const monthlyBestProducts = useMemo(() => {
    return monthNames.map((monthName, monthIndex) => {
      const grouped: Record<number, TopProduct> = {};

      paidTransactions
        .filter((transaction) => new Date(transaction.tanggal).getMonth() === monthIndex)
        .forEach((transaction) => {
          transaction.items?.forEach((item) => {
            const productId = item.product.id;
            if (!grouped[productId]) {
              grouped[productId] = {
                id: productId,
                nama_produk: item.product.nama_produk,
                gambar: productImagesById[productId],
                jumlah_terjual: 0,
                total_pendapatan: 0,
              };
            }
            grouped[productId].jumlah_terjual += item.jumlah;
            grouped[productId].total_pendapatan += item.subtotal;
          });
        });

      const bestProduct = Object.values(grouped).sort(
        (a, b) => b.jumlah_terjual - a.jumlah_terjual || b.total_pendapatan - a.total_pendapatan
      )[0];

      return {
        bulan: monthName,
        produk: bestProduct?.nama_produk || "-",
        jumlah: bestProduct?.jumlah_terjual || 0,
        pendapatan: bestProduct?.total_pendapatan || 0,
      };
    });
  }, [paidTransactions, productImagesById]);

  const totalPendapatan = chartData.reduce((sum, item) => sum + item.pendapatan, 0);
  const totalTransaksiLunas = paidTransactions.length;
  const totalTransaksiUnpaid = transaksi.filter((t) => t.status === "Unpaid").length;
  const totalProdukTerjual = statementRows.reduce((sum, item) => sum + item.jumlah, 0);
  const chartMinWidth = filterMode === "month" ? Math.max(chartData.length * 58, 720) : 720;

  const openAddManual = () => {
    setEditingTransaction(null);
    setManualModalOpen(true);
  };

  const openEditManual = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setManualModalOpen(true);
  };

  const deleteTransaction = async (transaction: Transaction) => {
    if (!confirm(`Hapus TRX-${String(transaction.id).padStart(4, "0")}? Data tidak bisa dikembalikan.`)) return;

    const res = await fetch("/api/transaksi", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: transaction.id }),
    });

    if (res.ok) fetchLaporan();
    else alert("Gagal menghapus transaksi.");
  };

  const exportExcel = () => {
    const topRows = topProducts
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.nama_produk)}</td>
            <td>${item.jumlah_terjual}</td>
            <td class="money">${item.total_pendapatan}</td>
          </tr>`
      )
      .join("");

    const statementTableRows = statementRows
      .map(
        (row) => `
          <tr>
            <td>${row.tanggal.toLocaleDateString("id-ID")}</td>
            <td>TRX-${String(row.trxId).padStart(4, "0")}</td>
            <td class="text">${escapeHtml(row.pelanggan)}</td>
            <td class="text">${escapeHtml(row.kasir)}</td>
            <td class="wide">${escapeHtml(row.produk)}</td>
            <td>${row.jumlah}</td>
            <td class="money">${row.harga_satuan}</td>
            <td class="money">${row.subtotal}</td>
            <td class="text">${escapeHtml(row.metode)}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; }
            th, td { border: 1px solid #999; padding: 8px 12px; white-space: nowrap; }
            th { background: #fce7f3; }
            .money { text-align: right; min-width: 130px; }
            .text { min-width: 140px; }
            .wide { min-width: 220px; }
          </style>
        </head>
        <body>
          <h2>Laporan Penjualan ${escapeHtml(periodLabel)}</h2>
          <p>Periode: ${periodRange.startDate} sampai ${periodRange.endDate}</p>
          <p>Total pendapatan lunas: ${totalPendapatan}</p>
          <p>Total produk terjual: ${totalProdukTerjual}</p>

          <h3>Top 10 Produk Terlaris</h3>
          <table>
            <thead>
              <tr><th>No</th><th>Produk</th><th>Qty Terjual</th><th>Total Pendapatan</th></tr>
            </thead>
            <tbody>${topRows || '<tr><td colspan="4">Tidak ada data</td></tr>'}</tbody>
          </table>

          <h3>Rekening Koran Produk Terjual</h3>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th><th>No TRX</th><th>Pelanggan</th><th>Kasir</th><th>Produk</th>
                <th>Qty</th><th>Harga Satuan</th><th>Subtotal</th><th>Metode</th>
              </tr>
            </thead>
            <tbody>${statementTableRows || '<tr><td colspan="9">Tidak ada data</td></tr>'}</tbody>
          </table>
        </body>
      </html>`;

    downloadBlob(
      `\ufeff${html}`,
      `laporan-penjualan-${periodLabel.toLowerCase().replace(/\s+/g, "-")}.xls`,
      "application/vnd.ms-excel;charset=utf-8"
    );
  };

  const exportPdf = () => {
    const lines = [
      `LAPORAN PENJUALAN - ${periodLabel.toUpperCase()}`,
      `Periode: ${periodRange.startDate} sampai ${periodRange.endDate}`,
      `Dibuat: ${new Date().toLocaleString("id-ID")}`,
      "",
      `Total pendapatan lunas : ${formatRupiah(totalPendapatan)}`,
      `Transaksi lunas        : ${totalTransaksiLunas}`,
      `Transaksi belum lunas  : ${totalTransaksiUnpaid}`,
      `Produk terjual         : ${totalProdukTerjual}`,
      "",
      "TOP 10 PRODUK TERLARIS",
      `${padText("No", 4)}  ${padText("Produk", 34)}  ${padText("Qty", 8, "right")}  ${padText("Pendapatan", 18, "right")}`,
      "-".repeat(64),
      ...topProducts.map(
        (item, index) =>
          `${padText(index + 1, 4)}  ${padText(item.nama_produk, 34)}  ${padText(item.jumlah_terjual, 8, "right")}  ${padText(
            formatRupiah(item.total_pendapatan),
            18,
            "right"
          )}`
      ),
      ...(topProducts.length === 0 ? ["Tidak ada data produk terjual."] : []),
      "",
      "REKENING KORAN PRODUK TERJUAL",
      `${padText("Tanggal", 12)}  ${padText("TRX", 10)}  ${padText("Pelanggan", 18)}  ${padText("Produk", 28)}  ${padText(
        "Qty",
        5,
        "right"
      )}  ${padText("Harga", 16, "right")}  ${padText("Subtotal", 16, "right")}  ${padText("Metode", 14)}`,
      "-".repeat(115),
      ...statementRows.map(
        (row) =>
          `${padText(row.tanggal.toLocaleDateString("id-ID"), 12)}  ${padText(
            `TRX-${String(row.trxId).padStart(4, "0")}`,
            10
          )}  ${padText(row.pelanggan, 18)}  ${padText(row.produk, 28)}  ${padText(row.jumlah, 5, "right")}  ${padText(
            formatRupiah(row.harga_satuan),
            16,
            "right"
          )}  ${padText(formatRupiah(row.subtotal), 16, "right")}  ${padText(row.metode, 14)}`
      ),
      ...(statementRows.length === 0 ? ["Tidak ada data produk terjual."] : []),
    ];

    downloadBlob(
      createSimplePdf(lines),
      `laporan-penjualan-${periodLabel.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      "application/pdf"
    );
  };

  return (
    <div className="lina-panel rounded-2xl p-6 min-h-[80vh] border text-slate-800">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LineChart className="text-pink-500" /> Laporan Penjualan
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Pantau pendapatan, produk terlaris, dan rincian produk terjual per periode.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-3 bg-pink-50 p-3 rounded-xl border border-pink-100">
            <Calendar className="text-pink-400 shrink-0" size={20} />
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as "month" | "year")}
                className="bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500"
              >
                <option value="month">Filter Bulan</option>
                <option value="year">Filter Tahun</option>
              </select>

              {filterMode === "month" && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500"
                >
                  {monthNames.map((month, index) => (
                    <option key={month} value={String(index + 1)}>
                      {month}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500"
              >
                {Array.from({ length: 8 }, (_, index) => currentYear - index).map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            {user?.role === "Owner" && (
              <button
                onClick={openAddManual}
                className="flex-1 lg:flex-none bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors"
              >
                <Plus size={18} /> Manual
              </button>
            )}
            <button
              onClick={exportExcel}
              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors"
            >
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button
              onClick={exportPdf}
              className="flex-1 lg:flex-none bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors"
            >
              <FileText size={18} /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 text-white shadow-lg shadow-pink-200 md:col-span-2">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <TrendingUp size={20} />
            <h3 className="font-medium">Total Pendapatan Lunas</h3>
          </div>
          <p className="text-3xl font-bold">{formatRupiah(totalPendapatan)}</p>
          <p className="text-xs mt-2 opacity-80">{periodLabel}</p>
        </div>

        <div className="bg-white border border-pink-100 rounded-xl p-5 shadow-sm shadow-pink-100/50">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <ReceiptText size={20} className="text-green-500" />
            <h3 className="font-medium">Transaksi Lunas</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalTransaksiLunas}</p>
          <p className="text-xs mt-2 text-slate-400">Order berhasil dibayar</p>
        </div>

        <div className="bg-white border border-pink-100 rounded-xl p-5 shadow-sm shadow-pink-100/50">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <Package size={20} className="text-pink-500" />
            <h3 className="font-medium">Produk Terjual</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalProdukTerjual}</p>
          <p className="text-xs mt-2 text-slate-400">Item dari transaksi lunas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
        <div className="bg-white border border-pink-100 rounded-xl p-6 shadow-sm shadow-pink-100/50 xl:col-span-3">
          <h3 className="font-bold text-lg mb-6">Grafik Penjualan {filterMode === "month" ? "Harian" : "Bulanan"}</h3>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center text-slate-400">Memuat grafik...</div>
          ) : chartData.length > 0 ? (
            <>
              {isDesktopChart ? (
                <div className="h-80 min-h-80 w-full overflow-x-auto pb-2">
                  <div className="h-full min-h-80" style={{ width: chartMinWidth, minWidth: chartMinWidth }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 16, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} interval={0} />
                        <YAxis
                          width={100}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          tickFormatter={(value) => formatRupiah(Number(value))}
                        />
                        <Tooltip
                          cursor={{ fill: "#fdf2f8" }}
                          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                          formatter={(value) => [formatRupiah(Number(value || 0)), "Pendapatan"]}
                        />
                        <Bar dataKey="pendapatan" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-56 min-h-56 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="tanggal"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        dy={8}
                        interval="preserveStartEnd"
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: "#fdf2f8" }}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        formatter={(value) => [formatRupiah(Number(value || 0)), "Pendapatan"]}
                      />
                      <Bar dataKey="pendapatan" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
              <LineChart size={48} className="text-slate-200 mb-2" />
              <p>Belum ada data penjualan lunas pada periode ini.</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-pink-100 rounded-xl p-6 shadow-sm shadow-pink-100/50 xl:col-span-2">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            <Trophy className="text-pink-500" size={20} /> Top 10 Produk Terlaris
          </h3>
          <p className="text-sm text-slate-500 mb-5">{periodLabel}</p>

          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.gambar ? (
                        <img src={product.gambar} alt={product.nama_produk} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={18} className="text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{product.nama_produk}</p>
                      <p className="text-xs text-slate-400">{formatRupiah(product.total_pendapatan)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-800">{product.jumlah_terjual}</p>
                    <p className="text-xs text-slate-400">terjual</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl text-center px-4">
                Belum ada produk terjual pada periode ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {filterMode === "year" && (
        <div className="bg-white border border-pink-100 rounded-xl p-6 shadow-sm shadow-pink-100/50 mb-8">
          <h3 className="font-bold text-lg mb-5">Produk Paling Laris Tiap Bulan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {monthlyBestProducts.map((item) => (
              <div key={item.bulan} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                <p className="text-sm font-bold text-slate-500">{item.bulan}</p>
                <p className="font-bold text-slate-800 mt-1 truncate">{item.produk}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {item.jumlah > 0 ? `${item.jumlah} terjual - ${formatRupiah(item.pendapatan)}` : "Belum ada penjualan lunas"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-pink-100 rounded-xl p-6 shadow-sm shadow-pink-100/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ReceiptText className="text-pink-500" size={20} /> Laporan Produk Terjual
            </h3>
            <p className="text-sm text-slate-500 mt-1">Klik untuk melihat semua produk dalam order.</p>
          </div>
          <button
            onClick={exportExcel}
            className="bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors"
          >
            <Download size={18} /> Download Laporan
          </button>
        </div>

        <div className="mb-4 grid grid-cols-[1fr_auto] gap-2 md:hidden">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Urutkan</label>
            <select
              value={orderSort.key}
              onChange={(event) => {
                const key = event.target.value as OrderSortKey;
                setOrderSort({ key, direction: orderSortOptionByKey[key].defaultDirection });
              }}
              className="w-full rounded-xl border border-pink-100 bg-pink-50 px-3 py-2.5 text-sm font-bold text-pink-700 outline-none focus:border-pink-400"
            >
              {orderSortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Arah</label>
            <button
              type="button"
              onClick={() => setOrderSort((current) => ({ ...current, direction: current.direction === "asc" ? "desc" : "asc" }))}
              className="flex h-[42px] items-center justify-center gap-2 rounded-xl border border-pink-100 bg-white px-3 text-sm font-bold text-pink-700 shadow-sm"
            >
              {orderSort.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              {orderSort.direction === "asc" ? orderSortOptionByKey[orderSort.key].ascLabel : orderSortOptionByKey[orderSort.key].descLabel}
            </button>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {isLoading ? (
            <div className="rounded-2xl border border-pink-100 bg-pink-50/40 py-10 text-center text-slate-400">
              Memuat laporan...
            </div>
          ) : sortedOrderRows.length > 0 ? (
            sortedOrderRows.map((row, index) => {
              const currentMonth = formatMonthYear(row.tanggal);
              const previousMonth = index > 0 ? formatMonthYear(sortedOrderRows[index - 1].tanggal) : "";
              const showMonthSeparator = filterMode === "year" && currentMonth !== previousMonth;

              return (
                <Fragment key={`${row.trxId}-mobile`}>
                  {showMonthSeparator && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px flex-1 bg-pink-100" />
                      <span className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-pink-700">
                        {currentMonth}
                      </span>
                      <div className="h-px flex-1 bg-pink-100" />
                    </div>
                  )}
                  <div
                    onClick={() => setDetailTransaction(row.transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setDetailTransaction(row.transaction);
                    }}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer rounded-2xl border border-pink-100 bg-white p-4 shadow-sm transition-colors active:bg-pink-50/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-left font-bold text-slate-800 leading-snug">
                          {row.pelanggan}
                        </span>
                        <p className="mt-1 font-mono text-xs text-slate-400">TRX-{String(row.trxId).padStart(4, "0")}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold text-pink-600">{formatRupiah(row.subtotal)}</p>
                        <p className="text-xs text-slate-400">{row.jumlah} pcs</p>
                      </div>
                    </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Tanggal</p>
                    <p className="mt-1 font-bold text-slate-700">{row.tanggal.toLocaleDateString("id-ID")}</p>
                    <p className="text-xs text-slate-400">{row.tanggal.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Kasir</p>
                    <p className="mt-1 truncate font-bold text-slate-700">{row.kasir}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total Item</p>
                    <p className="mt-1 font-bold text-slate-700">{row.jumlah} pcs</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Metode</p>
                    <p className="mt-1 truncate font-bold text-slate-700">{row.metode}</p>
                  </div>
                </div>

                {user?.role === "Owner" && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditManual(row.transaction);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors active:scale-[0.98]"
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTransaction(row.transaction);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-500 transition-colors active:scale-[0.98]"
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  </div>
                )}
                  </div>
                </Fragment>
              );
            })
          ) : (
            <div className="rounded-2xl border border-pink-100 bg-pink-50/40 py-10 px-4 text-center text-slate-400">
              Belum ada produk terjual dari transaksi lunas pada periode ini.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border border-pink-100 md:block">
          <table className="w-full min-w-[900px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[145px]" />
              <col className="w-[110px]" />
              <col className="w-[180px]" />
              <col className="w-[165px]" />
              <col className="w-[72px]" />
              <col className="w-[150px]" />
              <col className="w-[120px]" />
              {user?.role === "Owner" && <col className="w-[100px]" />}
            </colgroup>
            <thead className="bg-pink-50 text-pink-900 border-b border-pink-100">
              <tr>
                <th className="p-4 font-semibold">
                  <button type="button" onClick={() => updateOrderSort("tanggal")} className="flex items-center gap-1.5 rounded-lg text-left hover:text-pink-600">
                    Tanggal {renderOrderSortIcon("tanggal")}
                  </button>
                </th>
                <th className="p-4 font-semibold">
                  <button type="button" onClick={() => updateOrderSort("trxId")} className="flex items-center gap-1.5 rounded-lg text-left hover:text-pink-600">
                    No TRX {renderOrderSortIcon("trxId")}
                  </button>
                </th>
                <th className="p-4 font-semibold">
                  <button type="button" onClick={() => updateOrderSort("pelanggan")} className="flex items-center gap-1.5 rounded-lg text-left hover:text-pink-600">
                    Pelanggan {renderOrderSortIcon("pelanggan")}
                  </button>
                </th>
                <th className="p-4 font-semibold">
                  <button type="button" onClick={() => updateOrderSort("kasir")} className="flex items-center gap-1.5 rounded-lg text-left hover:text-pink-600">
                    Kasir {renderOrderSortIcon("kasir")}
                  </button>
                </th>
                <th className="p-4 font-semibold text-right">
                  <button type="button" onClick={() => updateOrderSort("jumlah")} className="ml-auto flex items-center gap-1.5 rounded-lg text-right hover:text-pink-600">
                    Qty {renderOrderSortIcon("jumlah")}
                  </button>
                </th>
                <th className="p-4 font-semibold text-right">
                  <button type="button" onClick={() => updateOrderSort("subtotal")} className="ml-auto flex items-center gap-1.5 rounded-lg text-right hover:text-pink-600">
                    Total Order {renderOrderSortIcon("subtotal")}
                  </button>
                </th>
                <th className="p-4 font-semibold">
                  <button type="button" onClick={() => updateOrderSort("metode")} className="flex items-center gap-1.5 rounded-lg text-left hover:text-pink-600">
                    Metode {renderOrderSortIcon("metode")}
                  </button>
                </th>
                {user?.role === "Owner" && <th className="p-4 font-semibold text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={user?.role === "Owner" ? 8 : 7} className="text-center py-10 text-slate-400">
                    Memuat laporan...
                  </td>
                </tr>
              ) : sortedOrderRows.length > 0 ? (
                sortedOrderRows.map((row, index) => {
                  const currentMonth = formatMonthYear(row.tanggal);
                  const previousMonth = index > 0 ? formatMonthYear(sortedOrderRows[index - 1].tanggal) : "";
                  const showMonthSeparator = filterMode === "year" && currentMonth !== previousMonth;

                  return (
                    <Fragment key={`${row.trxId}`}>
                      {showMonthSeparator && (
                        <tr className="bg-white">
                          <td colSpan={user?.role === "Owner" ? 8 : 7} className="px-4 py-3">
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
                        onClick={() => setDetailTransaction(row.transaction)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setDetailTransaction(row.transaction);
                        }}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer border-b border-pink-50 hover:bg-pink-50/30 focus:bg-pink-50/50 focus:outline-none"
                      >
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-bold text-slate-700">{row.tanggal.toLocaleDateString("id-ID")}</div>
                          <div className="text-xs text-slate-400">
                            {row.tanggal.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-slate-500">TRX-{String(row.trxId).padStart(4, "0")}</td>
                        <td className="p-4 truncate">{row.pelanggan}</td>
                        <td className="p-4 font-bold text-slate-800">
                          <span className="block truncate text-left font-bold text-slate-800">
                            {row.kasir}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold">{row.jumlah}</td>
                        <td className="p-4 text-right font-bold text-pink-600 whitespace-nowrap">{formatRupiah(row.subtotal)}</td>
                        <td className="p-4 whitespace-nowrap">{row.metode}</td>
                        {user?.role === "Owner" && (
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditManual(row.transaction);
                                }}
                                className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 flex items-center justify-center"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTransaction(row.transaction);
                                }}
                                className="w-9 h-9 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 flex items-center justify-center"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={user?.role === "Owner" ? 8 : 7} className="text-center py-10 text-slate-400">
                    Belum ada produk terjual dari transaksi lunas pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[88vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-5">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-pink-500">TRX-{String(detailTransaction.id).padStart(4, "0")}</p>
                <h3 className="mt-1 truncate text-lg font-bold text-slate-800">
                  {getCashierDisplayName(detailTransaction.nama_kasir)}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(detailTransaction.tanggal).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailTransaction(null)}
                className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-colors hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[64vh] overflow-y-auto p-5">
              <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Pelanggan</p>
                  <p className="mt-1 truncate font-bold text-slate-700">{detailTransaction.nama_pembeli || "-"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Metode</p>
                  <p className="mt-1 truncate font-bold text-slate-700">{detailTransaction.metode_pembayaran}</p>
                </div>
              </div>

              <div className="space-y-3">
                {(detailTransaction.items || []).map((item) => {
                  const hargaSatuan = item.jumlah > 0 ? item.subtotal / item.jumlah : 0;

                  return (
                    <div key={item.id} className="rounded-2xl border border-pink-100 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 leading-snug">{item.product.nama_produk}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {item.jumlah} pcs x {formatRupiah(hargaSatuan)}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold text-pink-600">{formatRupiah(item.subtotal)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-pink-50 p-4">
                <span className="font-bold text-slate-700">Total Order</span>
                <span className="text-lg font-bold text-pink-600">{formatRupiah(detailTransaction.total_harga)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ManualTransactionModal
        open={manualModalOpen}
        transaction={editingTransaction as ManualTransaction | null}
        title={editingTransaction ? "Edit Laporan Transaksi" : "Tambah Laporan Manual"}
        onClose={() => setManualModalOpen(false)}
        onSaved={fetchLaporan}
      />
    </div>
  );
}
