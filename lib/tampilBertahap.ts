"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Render daftar panjang sepotong demi sepotong, bukan sekaligus.
//
// KENAPA ADA: katalog dan halaman produk merender SELURUH produk begitu data
// datang. Dengan 56 produk itu berarti 56 kartu beserta 56 permintaan gambar
// menumpuk sekaligus, padahal layar cuma memuat belasan. Angkanya akan terus
// naik seiring produk bertambah.
//
// `next/image` memang sudah menunda gambar di luar layar, tapi itu hanya
// mengurus gambarnya — simpul DOM-nya tetap dibuat semua. Hook ini memangkas
// keduanya: yang belum terlihat belum dibuat sama sekali, lalu potongan
// berikutnya menyusul begitu pengguna mendekati ujung daftar.
//
// Pilihan sadar: ini BUKAN windowing penuh seperti react-window. Potongan yang
// sudah tampil dibiarkan tetap di DOM, tidak dibuang saat tergulung ke atas.
// Dengan begitu posisi gulungan tidak pernah melompat, tinggi kartu tidak perlu
// diketahui di muka, dan Ctrl+F peramban tetap menemukan yang sudah dilihat —
// tiga hal yang biasanya jadi harga mahal dari windowing sungguhan, dan tidak
// sepadan untuk daftar berukuran ratusan.

export const useTampilBertahap = <T,>(items: T[], ukuranBatch = 24) => {
  const [batas, setBatas] = useState(ukuranBatch);
  const [panjangTerakhir, setPanjangTerakhir] = useState(items.length);

  // Batas kembali ke potongan pertama saat JUMLAH item berubah — itu tandanya
  // pencarian atau filternya berganti, dan hasil baru tidak boleh muncul dengan
  // sisa batas gulungan sebelumnya.
  //
  // Sengaja memakai panjang, BUKAN identitas array. Sebagian pemanggil (POS)
  // menghitung daftarnya dengan `.filter()` langsung di badan komponen, jadi
  // arraynya baru pada setiap render; membandingkan identitas akan mereset
  // terus-menerus dan berujung render tak berhenti. Panjang adalah nilai
  // primitif, jadi hook ini aman dipakai baik dengan daftar ber-`useMemo`
  // maupun tidak.
  //
  // Konsekuensi yang diterima: pencarian yang kebetulan menghasilkan jumlah
  // sama persis tidak memicu reset. Dampaknya cuma "lebih banyak yang tampil
  // dari seharusnya", bukan daftar yang salah.
  //
  // Disetel saat render (pola resmi React untuk menyesuaikan state ketika
  // masukan berubah), bukan lewat useEffect, supaya tidak ada render antara
  // yang sempat menampilkan potongan dari daftar lama.
  if (panjangTerakhir !== items.length) {
    setPanjangTerakhir(items.length);
    setBatas(ukuranBatch);
  }

  const tampil = useMemo(() => items.slice(0, batas), [items, batas]);
  const adaLagi = batas < items.length;

  const penandaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!adaLagi) return;
    const penanda = penandaRef.current;
    if (!penanda) return;

    // Peramban lama tanpa IntersectionObserver: tampilkan semuanya sekaligus.
    // Lebih baik berat sesaat daripada daftar yang tak bisa dilanjutkan sama
    // sekali. Ditunda keluar dari badan efek mengikuti pola yang dipakai di
    // berkas lain, supaya tidak memicu render beruntun.
    if (typeof IntersectionObserver === "undefined") {
      const timeoutId = window.setTimeout(() => setBatas(items.length), 0);
      return () => window.clearTimeout(timeoutId);
    }

    const pengamat = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setBatas((current) => current + ukuranBatch);
      },
      // Ditembak 600px sebelum penanda benar-benar terlihat, supaya potongan
      // berikutnya sudah siap saat gulungan sampai — pengguna tidak melihat
      // ruang kosong lebih dulu.
      { rootMargin: "600px" }
    );
    pengamat.observe(penanda);
    return () => pengamat.disconnect();
    // `batas` ikut jadi kebergantungan supaya pengamat dipasang ulang setiap
    // potongan bertambah. Tanpa itu, penanda yang MASIH terlihat setelah
    // potongan baru dimuat tidak akan memicu apa pun — IntersectionObserver
    // hanya melapor saat perpotongan BERUBAH, bukan selama masih berpotongan —
    // dan daftarnya berhenti di tengah jalan pada layar tinggi.
  }, [adaLagi, batas, items.length, ukuranBatch]);

  return { tampil, adaLagi, penandaRef, totalItem: items.length };
};
