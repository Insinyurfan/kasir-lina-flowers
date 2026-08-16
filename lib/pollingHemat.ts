"use client";

// Polling yang berhenti saat tab tidak dilihat.
//
// LATAR: tiga halaman dulu menarik ulang data setiap 5 detik tanpa henti —
// notifikasi (di semua halaman), Status Pesanan, dan Riwayat Penjualan. Itu
// 720 permintaan per jam PER TAB, dan tetap berjalan walau tabnya ditinggal
// seharian di belakang tab lain. Tiap permintaan menarik data dari Supabase,
// dan itulah yang menghabiskan kuota egress sampai Storage diblokir.
//
// Dua penghematan sekaligus:
//   1. jedanya diperlebar (5 detik → puluhan detik)
//   2. intervalnya BERHENTI saat `document.hidden`, lalu menyusul sekali
//      begitu tabnya dilihat lagi — jadi datanya tetap segar saat dipandang,
//      tapi tidak membakar kuota saat tidak ada yang melihat.

import { useEffect, useRef } from "react";

/** Jeda baku, dalam milidetik. Dulu semuanya 5 detik. */
export const JEDA_POLLING = {
  /** Notifikasi: jalan di semua halaman, jadi paling sering menumpuk. */
  notifikasi: 30_000,
  /** Status Pesanan: beberapa orang mengubah status bergantian, perlu agak segar. */
  statusPesanan: 30_000,
  /** Riwayat Penjualan: payload terberat, dan jarang berubah sendiri. */
  riwayatPenjualan: 60_000,
  /** Request Pesanan: datang dari pembeli luar, jadi tak terduga waktunya —
   *  tapi notifikasi lonceng sudah lebih dulu memberi tahu, jadi tak perlu rapat. */
  requestPesanan: 30_000,
} as const;

/**
 * Jalankan `aksi` tiap `jedaMs`, TAPI hanya selama tab terlihat.
 *
 * Saat tab disembunyikan intervalnya dihentikan; saat kembali terlihat,
 * `aksi` dijalankan sekali lalu intervalnya dinyalakan lagi.
 *
 * `aktif` dipakai untuk mematikan polling sementara — mis. saat modal cetak
 * terbuka, supaya datanya tidak berubah di tengah pekerjaan.
 */
export const useIntervalSaatTerlihat = (
  aksi: () => void,
  jedaMs: number,
  aktif: boolean = true
) => {
  // Simpan aksi terbaru di ref supaya interval tidak perlu dipasang ulang
  // setiap komponen render — memasang ulang akan mengacak ritmenya.
  const aksiRef = useRef(aksi);
  useEffect(() => {
    aksiRef.current = aksi;
  }, [aksi]);

  useEffect(() => {
    if (!aktif) return;

    let idInterval: number | undefined;

    const hentikan = () => {
      if (idInterval !== undefined) {
        window.clearInterval(idInterval);
        idInterval = undefined;
      }
    };

    const mulai = () => {
      hentikan();
      idInterval = window.setInterval(() => aksiRef.current(), jedaMs);
    };

    const saatVisibilitasBerubah = () => {
      if (document.hidden) {
        hentikan();
        return;
      }
      // Menyusul sekali begitu dilihat lagi, supaya yang tampil bukan data basi
      // dari sebelum tabnya ditinggal.
      aksiRef.current();
      mulai();
    };

    if (!document.hidden) mulai();
    document.addEventListener("visibilitychange", saatVisibilitasBerubah);

    return () => {
      hentikan();
      document.removeEventListener("visibilitychange", saatVisibilitasBerubah);
    };
  }, [jedaMs, aktif]);
};
