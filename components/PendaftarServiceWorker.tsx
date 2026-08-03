"use client";

// Mendaftarkan service worker dan memegang kendali pembaruannya.
//
// Kenapa tidak membiarkan versi baru mengambil alih sendiri: perilaku bawaan
// peramban adalah menunggu SEMUA tab situs ditutup. PWA yang dipasang di layar
// HP nyaris tidak pernah benar-benar ditutup — orang cuma pindah aplikasi —
// sehingga perangkat bisa berminggu-minggu tertinggal versi lama.
//
// Dan `skipWaiting()` otomatis juga bukan jawabannya: menukar aset di tengah
// sesi bisa membuat halaman yang sudah terbuka meminta potongan JavaScript
// yang sudah tidak ada, tepat saat orang sedang membuat nota.
//
// Jalan tengahnya: beri tahu, lalu biarkan penggunanya yang memutuskan.

import { useEffect } from "react";
import { toast } from "@/lib/toast";

export default function PendaftarServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    let sedangMemuatUlang = false;

    // `controllerchange` bisa terpicu lebih dari sekali; tanpa penjaga ini
    // halaman bisa memuat ulang berkali-kali.
    const saatPengendaliBerganti = () => {
      if (sedangMemuatUlang) return;
      sedangMemuatUlang = true;
      window.location.reload();
    };

    const tawarkanPembaruan = (menunggu: ServiceWorker) => {
      toast.info(
        "Versi baru tersedia. Tutup lalu buka lagi halaman ini, atau tekan muat ulang di peramban."
      );
      // Perintahkan versi baru mengambil alih; pemuatan ulang terjadi lewat
      // `controllerchange` di atas.
      menunggu.postMessage("LEWATI_MENUNGGU");
    };

    const daftarkan = async () => {
      try {
        const registrasi = await navigator.serviceWorker.register("/sw.js");

        // Sudah ada versi baru yang menunggu sejak halaman dibuka.
        if (registrasi.waiting) tawarkanPembaruan(registrasi.waiting);

        registrasi.addEventListener("updatefound", () => {
          const baru = registrasi.installing;
          if (!baru) return;

          baru.addEventListener("statechange", () => {
            // `controller` yang sudah ada berarti ini pembaruan, bukan
            // pemasangan pertama — pemasangan pertama tidak perlu diganggu.
            if (baru.state === "installed" && navigator.serviceWorker.controller) {
              tawarkanPembaruan(baru);
            }
          });
        });
      } catch {
        // Gagal mendaftar bukan alasan mengganggu pengguna — aplikasinya tetap
        // jalan normal, hanya tanpa cache.
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", saatPengendaliBerganti);
    const idTimeout = window.setTimeout(() => void daftarkan(), 0);

    return () => {
      window.clearTimeout(idTimeout);
      navigator.serviceWorker.removeEventListener("controllerchange", saatPengendaliBerganti);
    };
  }, []);

  return null;
}
