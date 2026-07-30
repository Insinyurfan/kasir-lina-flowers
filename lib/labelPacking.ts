// Label bungkus siap gunting.
//
// Menggantikan kertas kecil yang selama ini ditulis tangan ("Toko A, Bando
// Satin 1 gross") lalu ditempel di tiap plastik packingan.
//
// SENGAJA memakai jendela cetak peramban, bukan pembuat PDF di
// lib/notaDocument.ts: nota butuh tata letak presisi karena diserahkan ke toko,
// sedangkan label hanya digunting dan ditempel. Dan di rumah hanya ada printer
// biasa — memaksa format printer thermal berarti fiturnya tidak bisa dipakai
// sama sekali sampai perangkatnya dibeli.

import { formatQtySatuan } from "@/lib/satuan";

export type BarisLabel = {
  namaProduk: string;
  variantName?: string | null;
  /** Kode pelanggan per baris (mis. Aneka: AMN/SMT) — pembeda bungkus antar cabang. */
  label?: string | null;
  jumlah: number;
  satuan?: string | null;
};

export type DataLabel = {
  namaToko: string;
  nomorNota: string;
  tanggal?: string | null;
  baris: BarisLabel[];
};

const escapeHtml = (nilai: string) =>
  nilai
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const satuLabel = (data: DataLabel, baris: BarisLabel) => {
  const variasi = baris.variantName ? ` (${baris.variantName})` : "";
  const kode = baris.label?.trim();

  return `
    <div class="label">
      <div class="toko">${escapeHtml(data.namaToko.toUpperCase())}</div>
      <div class="produk">${escapeHtml(baris.namaProduk)}${escapeHtml(variasi)}</div>
      <div class="baris-bawah">
        <span class="jumlah">${escapeHtml(formatQtySatuan(baris.jumlah, baris.satuan))}</span>
        ${kode ? `<span class="kode">${escapeHtml(kode.toUpperCase())}</span>` : ""}
      </div>
      <div class="nota">${escapeHtml(data.nomorNota)}${data.tanggal ? ` · ${escapeHtml(data.tanggal)}` : ""}</div>
    </div>`;
};

export const buatHtmlLabel = (data: DataLabel): string => {
  const isi = data.baris.map((baris) => satuLabel(data, baris)).join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>Label ${escapeHtml(data.nomorNota)} — ${escapeHtml(data.namaToko)}</title>
<style>
  @page { size: A4; margin: 8mm; }

  * { box-sizing: border-box; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    color: #111;
  }

  .lembar {
    display: grid;
    /* 2 kolom di A4 (~194mm ruang cetak) memberi label ~95mm — cukup lebar
       untuk nama produk panjang tanpa terpotong. */
    grid-template-columns: repeat(2, 1fr);
    gap: 4mm;
  }

  .label {
    border: 1px dashed #999;   /* garis potong */
    border-radius: 2mm;
    padding: 4mm;
    height: 34mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* Jangan biarkan satu label terbelah dua halaman. */
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .toko {
    font-size: 13pt;
    font-weight: 800;
    letter-spacing: 0.3px;
    line-height: 1.1;
  }

  .produk {
    font-size: 10.5pt;
    font-weight: 600;
    line-height: 1.25;
    /* Nama produk bisa panjang; potong di baris kedua agar tinggi label tetap. */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .baris-bawah {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 3mm;
  }

  .jumlah {
    font-size: 14pt;
    font-weight: 800;
  }

  .kode {
    font-size: 10pt;
    font-weight: 800;
    border: 1.5px solid #111;
    border-radius: 1.5mm;
    padding: 0.5mm 2mm;
  }

  .nota {
    font-size: 8pt;
    color: #555;
    font-family: "Courier New", monospace;
  }

  @media print {
    .petunjuk { display: none; }
  }

  .petunjuk {
    font-size: 10pt;
    color: #555;
    margin-bottom: 4mm;
  }
</style>
</head>
<body>
  <p class="petunjuk">
    ${data.baris.length} label — tekan Ctrl+P lalu gunting mengikuti garis putus-putus.
  </p>
  <div class="lembar">${isi}</div>
  <script>
    window.addEventListener("load", function () {
      window.focus();
      window.print();
    });
  </script>
</body>
</html>`;
};

/**
 * Buka jendela cetak berisi label. Mengembalikan false bila peramban memblokir
 * pop-up, supaya pemanggil bisa memberi tahu pengguna alih-alih diam saja.
 */
export const cetakLabel = (data: DataLabel): boolean => {
  const jendela = window.open("", "_blank", "width=900,height=700");
  if (!jendela) return false;

  jendela.document.write(buatHtmlLabel(data));
  jendela.document.close();
  return true;
};
