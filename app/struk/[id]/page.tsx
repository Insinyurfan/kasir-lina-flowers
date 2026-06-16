"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer, Share2 } from "lucide-react";

type ReceiptType = "struk" | "surat-jalan";

type StoreInfo = {
  brand?: string | null;
  address?: string | null;
  footer?: string | null;
  receiptLogo?: string | null;
};

type TransactionItem = {
  id: number;
  jumlah: number;
  subtotal: number;
  product: {
    nama_produk: string;
  };
};

type Transaction = {
  id: number;
  trxNumber?: number | null;
  tanggal: string;
  total_harga: number;
  nama_kasir?: string | null;
  nama_pembeli?: string | null;
  items: TransactionItem[];
};

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function ReceiptPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const receiptType = (searchParams.get("type") === "surat-jalan" ? "surat-jalan" : "struk") as ReceiptType;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    brand: "Lina Flowers",
    address: "",
    footer: "Terima Kasih Atas Kunjungan Anda",
    receiptLogo: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const title = receiptType === "struk" ? "STRUK PENJUALAN" : "SURAT JALAN";

  useEffect(() => {
    const loadReceipt = async () => {
      try {
        const [transactionRes, settingRes] = await Promise.all([
          fetch(`/api/transaksi?id=${encodeURIComponent(params.id)}&sort=desc`, { cache: "no-store" }),
          fetch("/api/pengaturan", { cache: "no-store" }),
        ]);

        const transactions = (await transactionRes.json()) as Transaction[];
        const setting = (await settingRes.json()) as StoreInfo;

        setTransaction(Array.isArray(transactions) ? transactions[0] || null : null);
        setStoreInfo((current) => ({ ...current, ...setting }));
      } finally {
        setIsLoading(false);
      }
    };

    loadReceipt();
  }, [params.id]);

  const shareData = useMemo(() => {
    if (!transaction || typeof window === "undefined") return null;

    return {
      title,
      text: `TRX-${String(transaction.trxNumber ?? transaction.id).padStart(4, "0")} ${transaction.nama_pembeli || ""}`.trim(),
      url: window.location.href,
    };
  }, [title, transaction]);

  const handleShare = async () => {
    if (!shareData || !navigator.share) {
      window.print();
      return;
    }

    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <main className="receipt-shell screen-only">Memuat struk...</main>;
  }

  if (!transaction) {
    return (
      <main className="receipt-shell screen-only">
        <p>Struk tidak ditemukan.</p>
        <button type="button" onClick={() => history.back()} className="receipt-action secondary">
          <ArrowLeft size={18} /> Kembali
        </button>
      </main>
    );
  }

  const transactionDate = new Date(transaction.tanggal);

  return (
    <main className="receipt-page">
      <section className="receipt-sheet">
        <div className="text-center">
          {storeInfo.receiptLogo && (
            <img src={storeInfo.receiptLogo} alt="Logo Struk Lina Flowers" className="receipt-logo" />
          )}
          <div className="brand">{storeInfo.brand || "Lina Flowers"}</div>
          <div className="muted pre-wrap">{storeInfo.address || ""}</div>
        </div>

        <div className="dash" />
        <div className="title">{title}</div>

        <div className="meta">
          <div>DATE      : {transactionDate.toLocaleDateString("id-ID")}</div>
          <div>TIME      : {transactionDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
          <div>CASHIER   : {transaction.nama_kasir || "-"}</div>
          <div>
            PELANGGAN : <strong>{transaction.nama_pembeli || "-"}</strong>
          </div>
          <div>NO TRX    : TRX-{String(transaction.trxNumber ?? transaction.id).padStart(4, "0")}</div>
        </div>

        <div className="dash" />

        <div className="items">
          {transaction.items.map((item) => {
            const unitPrice = item.jumlah > 0 ? item.subtotal / item.jumlah : 0;

            return (
              <div key={item.id} className="item">
                <div className="product-name">{item.product.nama_produk}</div>
                <div className="row receipt-row">
                  <span>
                    {item.jumlah} x {receiptType === "struk" ? unitPrice.toLocaleString("id-ID") : "Pcs"}
                  </span>
                  {receiptType === "struk" && <span className="receipt-amount">{formatCurrency(item.subtotal)}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="dash" />

        {receiptType === "struk" && (
          <>
            <div className="row receipt-row total">
              <span>TOTAL</span>
              <span className="receipt-amount">{formatCurrency(transaction.total_harga)}</span>
            </div>
            <div className="dash" />
          </>
        )}

        <div className="footer pre-wrap">{storeInfo.footer || ""}</div>
      </section>

      <nav className="receipt-actions screen-only">
        <button type="button" onClick={() => history.back()} className="receipt-action secondary">
          <ArrowLeft size={18} /> Kembali
        </button>
        <button type="button" onClick={handlePrint} className="receipt-action">
          <Printer size={19} /> Cetak
        </button>
        <button type="button" onClick={handleShare} className="receipt-action primary">
          <Share2 size={19} /> Bagikan
        </button>
      </nav>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #f8fafc;
        }

        .receipt-page {
          min-height: 100vh;
          padding: 14px 0 96px;
          background: #f8fafc;
          color: #000;
          font-family: "Courier New", Courier, monospace;
        }

        .receipt-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-family: Arial, sans-serif;
          color: #334155;
        }

        .receipt-sheet {
          width: 51.5mm;
          max-width: 51.5mm;
          margin: 0 auto;
          padding: 0.8mm;
          background: #fff;
          color: #000;
          font-size: 12px;
          line-height: 1.24;
          box-sizing: border-box;
        }

        .receipt-logo {
          width: 50px;
          height: 50px;
          object-fit: contain;
          display: block;
          margin: 0 auto 8px;
        }

        .text-center {
          text-align: center;
        }

        .brand {
          font-size: 14px;
          font-weight: 700;
        }

        .muted {
          margin-top: 4px;
        }

        .pre-wrap {
          white-space: pre-wrap;
        }

        .dash {
          border-top: 1.5px dashed #000;
          margin: 10px -0.8mm;
        }

        .title {
          text-align: center;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .meta {
          margin-top: 10px;
          overflow-wrap: anywhere;
        }

        .row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .receipt-row {
          display: grid;
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

        .items {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .product-name {
          font-weight: 700;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }

        .total {
          font-size: 13.5px;
          font-weight: 700;
        }

        .footer {
          text-align: center;
          font-style: italic;
          margin-top: 10px;
        }

        .receipt-actions {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          display: grid;
          grid-template-columns: 0.8fr 1fr 1fr;
          gap: 8px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.96);
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -10px 24px rgba(15, 23, 42, 0.08);
          font-family: Arial, sans-serif;
        }

        .receipt-action {
          min-height: 48px;
          border: 0;
          border-radius: 12px;
          background: #0f172a;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .receipt-action.primary {
          background: #16a34a;
        }

        .receipt-action.secondary {
          background: #e2e8f0;
          color: #334155;
        }

        @page {
          size: 58mm auto;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 58mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .screen-only {
            display: none !important;
          }

          .receipt-page {
            min-height: 0 !important;
            width: 58mm !important;
            padding: 0 !important;
            background: #fff !important;
          }

          .receipt-sheet {
            width: 51.5mm !important;
            max-width: 51.5mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}
