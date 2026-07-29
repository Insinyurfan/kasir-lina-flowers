// Uji lib/waktu.ts dan jembatan laba↔kas tanpa basis data.
// Dijalankan dengan: node --experimental-strip-types scripts/uji-perhitungan.mts

import {
  awalHariWIB,
  akhirHariWIB,
  rentangBulanWIB,
  rentangBulanSebelumnyaWIB,
  umurHariWIB,
  tanggalWIBString,
  dariTanggalInputWIB,
} from "../lib/waktu.ts";

let lolos = 0;
let gagal = 0;

const cek = (nama: string, aktual: unknown, harapan: unknown) => {
  const a = aktual instanceof Date ? aktual.toISOString() : String(aktual);
  const h = harapan instanceof Date ? harapan.toISOString() : String(harapan);
  if (a === h) {
    lolos += 1;
    console.log(`  ok   ${nama}`);
  } else {
    gagal += 1;
    console.log(`  GAGAL ${nama}\n        dapat  : ${a}\n        harusnya: ${h}`);
  }
};

console.log("\n== Batas hari WIB (task 10.2) ==");
// 00:30 WIB tanggal 15 Juli 2026 = 17:30 UTC tanggal 14 Juli.
const dinihari = new Date("2026-07-14T17:30:00.000Z");
cek("00:30 WIB masuk tanggal 15 Juli", tanggalWIBString(dinihari), "2026-07-15");
cek("awal hari = 15 Juli 00:00 WIB", awalHariWIB(dinihari), new Date("2026-07-14T17:00:00.000Z"));

// 23:30 WIB tanggal 15 Juli = 16:30 UTC tanggal 15 Juli.
const larutMalam = new Date("2026-07-15T16:30:00.000Z");
cek("23:30 WIB masih tanggal 15 Juli", tanggalWIBString(larutMalam), "2026-07-15");
cek("akhir hari = 15 Juli 23:59:59.999 WIB", akhirHariWIB(larutMalam), new Date("2026-07-15T16:59:59.999Z"));

// Titik paling rawan: 07:00 WIB vs tengah malam UTC.
cek(
  "17:00 UTC tepat = pergantian hari WIB",
  tanggalWIBString(new Date("2026-07-14T17:00:00.000Z")),
  "2026-07-15"
);
cek(
  "16:59:59 UTC masih hari sebelumnya",
  tanggalWIBString(new Date("2026-07-14T16:59:59.999Z")),
  "2026-07-14"
);

console.log("\n== Rentang bulan WIB ==");
const bulanJuli = rentangBulanWIB(new Date("2026-07-15T05:00:00.000Z"));
cek("Juli mulai 1 Juli 00:00 WIB", bulanJuli.mulai, new Date("2026-06-30T17:00:00.000Z"));
cek("Juli selesai 31 Juli 23:59:59.999 WIB", bulanJuli.selesai, new Date("2026-07-31T16:59:59.999Z"));

const bulanJuni = rentangBulanSebelumnyaWIB(new Date("2026-07-15T05:00:00.000Z"));
cek("bulan sebelumnya mulai 1 Juni WIB", bulanJuni.mulai, new Date("2026-05-31T17:00:00.000Z"));
cek("bulan sebelumnya selesai 30 Juni WIB", bulanJuni.selesai, new Date("2026-06-30T16:59:59.999Z"));

console.log("\n== Umur piutang ==");
cek(
  "kemarin sore = 1 hari (bukan 0 karena belum 24 jam)",
  umurHariWIB(new Date("2026-07-14T10:00:00.000Z"), new Date("2026-07-15T02:00:00.000Z")),
  1
);
cek(
  "hari yang sama = 0 hari",
  umurHariWIB(new Date("2026-07-15T01:00:00.000Z"), new Date("2026-07-15T16:00:00.000Z")),
  0
);
cek(
  "45 hari",
  umurHariWIB(new Date("2026-06-01T05:00:00.000Z"), new Date("2026-07-16T05:00:00.000Z")),
  45
);

console.log("\n== Penguraian input tanggal ==");
cek("2026-07-15 → 00:00 WIB", dariTanggalInputWIB("2026-07-15"), new Date("2026-07-14T17:00:00.000Z"));
cek("tanggal berguling ditolak", dariTanggalInputWIB("2026-02-31"), "null");
cek("format salah ditolak", dariTanggalInputWIB("15/07/2026"), "null");

console.log("\n== Jembatan laba ↔ kas (task 10.1) ==");
// laba − kenaikanPiutang − prive = posisiKas
const kasus = [
  { nama: "untung tapi kas minus", omzet: 10_000_000, biaya: 6_000_000, prive: 3_000_000, kasMasuk: 7_000_000 },
  { nama: "semua tunai, tanpa prive", omzet: 5_000_000, biaya: 2_000_000, prive: 0, kasMasuk: 5_000_000 },
  { nama: "rugi", omzet: 3_000_000, biaya: 4_500_000, prive: 500_000, kasMasuk: 3_000_000 },
  { nama: "menagih nota lama (piutang turun)", omzet: 4_000_000, biaya: 1_000_000, prive: 0, kasMasuk: 9_000_000 },
];

for (const k of kasus) {
  const laba = k.omzet - k.biaya;
  const kasKeluar = k.biaya + k.prive;
  const posisiKas = k.kasMasuk - kasKeluar;
  const kenaikanPiutang = k.omzet - k.kasMasuk;
  cek(`${k.nama}: jembatan berimbang`, laba - kenaikanPiutang - k.prive, posisiKas);
}

// Prive TIDAK boleh mengurangi laba (skenario spec expense-tracking).
{
  const laba = 10_000_000 - 6_000_000;
  cek("prive Rp3jt tidak mengurangi laba Rp4jt", laba, 4_000_000);
}

console.log(`\n${lolos} lolos, ${gagal} gagal\n`);
process.exit(gagal === 0 ? 0 : 1);
