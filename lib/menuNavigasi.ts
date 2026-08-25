// Sumber tunggal susunan menu navigasi.
//
// Sebelumnya menu ditulis sebagai tujuh belas baris JSX berurutan di dalam
// `app/layout.tsx`, masing-masing membawa syarat perannya sendiri. Menambah
// menu berarti menempelkan satu baris lagi di bawah — dan begitulah daftar itu
// tumbuh sampai tidak terbaca lagi di layar desktop.
//
// Sekarang tiap menu didefinisikan SEKALI di sini, lalu disusun ulang untuk dua
// tempat pemakaian yang berbeda:
//   - `KELOMPOK_MENU`     → header desktop, dikelompokkan per pekerjaan
//   - `URUTAN_LACI_HP`    → laci hamburger HP, urutan lama dipertahankan persis
//
// Kenapa dua urutan, bukan satu: pemilik menyatakan tampilan HP sudah bagus dan
// tidak boleh berubah. Meratakan `KELOMPOK_MENU` akan mengacak urutan laci HP,
// jadi urutan lamanya ditulis eksplisit. Yang dibagi adalah DEFINISI menunya
// (href, label, ikon, syarat peran) — itu yang penting agar keduanya tidak
// menyimpang diam-diam saat ada menu baru.

import type { ComponentType } from "react";
import {
  ClipboardCheck,
  ClipboardList,
  Contact,
  FileDown,
  HandCoins,
  House,
  Inbox,
  LineChart,
  Package,
  PackageCheck,
  Scale,
  ShoppingCart,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import ReceiptHistoryIcon from "@/components/ReceiptHistoryIcon";

// Syarat peran ditulis sebagai nama aturan, bukan fungsi, supaya definisi menu
// tetap berupa data murni yang gampang dibaca sekali pandang.
export type SyaratPeran =
  | "semua" // termasuk Tamu
  | "kecualiTamu"
  | "ownerAdmin"
  | "ownerSaja";

export type MenuNavigasi = {
  href: string;
  label: string;
  Ikon: ComponentType<{ size?: number }>;
  syarat: SyaratPeran;
};

export type KelompokMenu = {
  id: string;
  label: string;
  menu: MenuNavigasi[];
};

// ── Definisi menu ──────────────────────────────────────────────────────────
// Sebagian label diganti atas keputusan pemilik, 22 Agustus 2026, supaya
// memakai istilah yang dipakai sehari-hari: "Data Produk" -> "Produk",
// "Request Pesanan" -> "Orderan Manual", "Papan Tugas" -> "Tugas Pengrajin".
// Yang berubah HANYA tulisannya. Tidak ada `href` yang ikut berpindah, jadi
// tautan lama, riwayat peramban, dan pintasan yang sudah tersimpan tetap sah.

const DASHBOARD: MenuNavigasi = { href: "/dashboard", label: "Dashboard", Ikon: House, syarat: "kecualiTamu" };
const KASIR: MenuNavigasi = { href: "/pos", label: "Kasir (POS)", Ikon: ShoppingCart, syarat: "kecualiTamu" };

const PRODUK: MenuNavigasi = { href: "/produk", label: "Produk", Ikon: Package, syarat: "semua" };
const PELANGGAN: MenuNavigasi = { href: "/pelanggan", label: "Pelanggan", Ikon: Contact, syarat: "kecualiTamu" };
const PENGRAJIN: MenuNavigasi = { href: "/pengrajin", label: "Pengrajin", Ikon: Users, syarat: "ownerAdmin" };

const REQUEST_PESANAN: MenuNavigasi = { href: "/request-pesanan", label: "Orderan Manual", Ikon: Inbox, syarat: "ownerAdmin" };
const STATUS_PESANAN: MenuNavigasi = { href: "/status-pesanan", label: "Status Pesanan", Ikon: ClipboardCheck, syarat: "kecualiTamu" };
const RIWAYAT_PENJUALAN: MenuNavigasi = { href: "/penjualan", label: "Riwayat Penjualan", Ikon: ReceiptHistoryIcon, syarat: "kecualiTamu" };
const UNDUH_NOTA: MenuNavigasi = { href: "/unduh-nota", label: "Unduh Nota", Ikon: FileDown, syarat: "kecualiTamu" };

const PAPAN_TUGAS: MenuNavigasi = { href: "/papan-tugas", label: "Tugas Pengrajin", Ikon: ClipboardList, syarat: "kecualiTamu" };
const CHECKLIST_PACKING: MenuNavigasi = { href: "/packing", label: "Checklist Packing", Ikon: PackageCheck, syarat: "kecualiTamu" };

const PIUTANG: MenuNavigasi = { href: "/piutang", label: "Piutang", Ikon: HandCoins, syarat: "kecualiTamu" };
const PENGELUARAN: MenuNavigasi = { href: "/pengeluaran", label: "Pengeluaran", Ikon: Wallet, syarat: "ownerAdmin" };
const LABA_RUGI: MenuNavigasi = { href: "/laba-rugi", label: "Laba Rugi", Ikon: Scale, syarat: "ownerSaja" };
const LAPORAN: MenuNavigasi = { href: "/laporan", label: "Laporan", Ikon: LineChart, syarat: "ownerSaja" };

const LOG_AKTIVITAS: MenuNavigasi = { href: "/log-aktivitas", label: "Log Aktivitas", Ikon: ClipboardList, syarat: "kecualiTamu" };
const MANAJEMEN_AKUN: MenuNavigasi = { href: "/akun", label: "Manajemen Akun", Ikon: Users, syarat: "ownerSaja" };

// Katalog publik — halaman yang dilihat pembeli. Selama ini satu-satunya cara
// ke sana dari dalam aplikasi adalah menutup lalu membuka ulang webnya, dan di
// HP yang sudah dipasang sebagai aplikasi itu berarti menutup aplikasinya dulu.
// `syarat: "semua"` karena katalog memang halaman publik: tidak ada peran yang
// perlu dilarang melihatnya.
const KATALOG: MenuNavigasi = { href: "/", label: "Katalog", Ikon: Store, syarat: "semua" };

// Tiga menu yang berdiri di luar kelompok mana pun, dengan alasan berbeda:
// Dashboard bukan salah satu pekerjaan melainkan titik berangkat, Kasir adalah
// tindakan yang paling sering dipakai, dan Katalog adalah pintu keluar ke sisi
// publik — ketiganya rugi kalau disembunyikan di dalam tarikan-bawah.
export const MENU_DASHBOARD = DASHBOARD;
export const MENU_KASIR = KASIR;
export const MENU_KATALOG = KATALOG;

// ── Susunan untuk header desktop ───────────────────────────────────────────
// Dikelompokkan menurut PEKERJAAN yang sedang dilakukan, bukan kemiripan
// teknis. Urutan di dalam kelompok mengikuti alur kerja, bukan abjad: di
// Orderan, Orderan Manual → Status Pesanan → Riwayat Penjualan → Unduh Nota
// memang urutan hidup sebuah pesanan.
export const KELOMPOK_MENU: KelompokMenu[] = [
  {
    id: "orderan",
    label: "Orderan",
    menu: [REQUEST_PESANAN, STATUS_PESANAN, RIWAYAT_PENJUALAN, UNDUH_NOTA],
  },
  {
    id: "tugas",
    label: "Tugas",
    menu: [PAPAN_TUGAS, CHECKLIST_PACKING],
  },
  {
    id: "keuangan",
    label: "Keuangan",
    menu: [PIUTANG, PENGELUARAN, LABA_RUGI, LAPORAN],
  },
  {
    id: "data",
    label: "Data",
    menu: [PRODUK, PELANGGAN, PENGRAJIN],
  },
  {
    id: "sistem",
    label: "Sistem",
    menu: [LOG_AKTIVITAS, MANAJEMEN_AKUN],
  },
];

// ── Susunan untuk laci hamburger HP ────────────────────────────────────────
// URUTAN LAMA, dipertahankan persis seperti sebelum ada header desktop.
// Manajemen Akun sengaja tidak ikut di sini: di laci HP ia dirender terpisah
// dengan garis pemisah di atasnya, sama seperti sebelumnya.
export const URUTAN_LACI_HP: MenuNavigasi[] = [
  DASHBOARD,
  KASIR,
  KATALOG,
  PRODUK,
  REQUEST_PESANAN,
  STATUS_PESANAN,
  CHECKLIST_PACKING,
  PELANGGAN,
  RIWAYAT_PENJUALAN,
  UNDUH_NOTA,
  LAPORAN,
  LOG_AKTIVITAS,
  PAPAN_TUGAS,
  PENGRAJIN,
  PIUTANG,
  PENGELUARAN,
  LABA_RUGI,
];

export const MENU_AKUN_LACI_HP = MANAJEMEN_AKUN;

// PERCOBAAN — belum diputuskan. Pemilik ingin melihat dulu secara lokal apakah
// judul kelompok enak dipandang di laci HP.
//   true  → laci HP memakai judul kelompok (urutannya mengikuti KELOMPOK_MENU)
//   false → laci HP kembali ke urutan lama URUTAN_LACI_HP, persis seperti semula
// Sengaja dibuat satu saklar, bukan dua cabang kode yang harus disunting
// bolak-balik: membatalkannya cukup mengganti nilai ini.
// Tipenya ditulis `boolean` dan bukan dibiarkan menyempit jadi literal `true`,
// supaya cabang "urutan lama" tetap dianggap hidup oleh TypeScript dan tidak
// ikut terbuang saat saklarnya nanti dibalik.
export const LACI_HP_DIKELOMPOKKAN: boolean = true;

// Dua menu yang berdiri di luar kelompok tetap muncul paling atas di laci HP
// saat mode berkelompok menyala — Dashboard sebagai titik berangkat, Kasir
// sebagai tindakan yang paling sering dipakai.
export const MENU_LUAR_KELOMPOK: MenuNavigasi[] = [DASHBOARD, KASIR, KATALOG];

// ── Penapisan peran ────────────────────────────────────────────────────────
// Aturannya disalin apa adanya dari kondisi JSX yang lama; tidak ada satu pun
// yang diperlonggar atau diperketat oleh perubahan ini.
export const bolehLihat = (syarat: SyaratPeran, role: string | undefined): boolean => {
  switch (syarat) {
    case "semua":
      return true;
    case "kecualiTamu":
      return role !== "Tamu";
    case "ownerAdmin":
      return role === "Owner" || role === "Admin";
    case "ownerSaja":
      return role === "Owner";
  }
};

export const saringMenu = (menu: MenuNavigasi[], role: string | undefined): MenuNavigasi[] =>
  menu.filter((item) => bolehLihat(item.syarat, role));

// Kelompok yang tidak menyisakan satu menu pun TIDAK dikembalikan sama sekali.
// Kepala kelompok yang membuka ke ruang kosong lebih membingungkan daripada
// tidak ada. Dihitung dari hasil penapisan, bukan ditulis manual per peran,
// supaya tidak perlu diingat lagi saat ada menu baru.
export const saringKelompok = (role: string | undefined): KelompokMenu[] =>
  KELOMPOK_MENU.map((kelompok) => ({
    ...kelompok,
    menu: saringMenu(kelompok.menu, role),
  })).filter((kelompok) => kelompok.menu.length > 0);

// Satu-satunya definisi "sedang aktif" di seluruh navigasi. `NavItem` dan
// `BottomNavItem` memakai perbandingan yang sama, jadi tidak ada dua aturan
// yang bisa berselisih.
export const menuAktif = (href: string, pathname: string): boolean => pathname === href;

export const kelompokAktif = (kelompok: KelompokMenu, pathname: string): boolean =>
  kelompok.menu.some((item) => menuAktif(item.href, pathname));
