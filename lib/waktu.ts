// Perhitungan batas hari & bulan dalam WIB (Asia/Jakarta).
//
// Kenapa tidak memakai `toLocaleString` atau zona waktu proses: server di Vercel
// berjalan pada UTC. Tanpa perhitungan eksplisit, transaksi pukul 00:00–07:00 WIB
// jatuh ke tanggal sebelumnya — persis jam saat mobil kirim berangkat.
//
// Indonesia tidak menerapkan daylight saving, jadi offset tetap +7 jam aman.

export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const SEHARI_MS = 24 * 60 * 60 * 1000;

// Geser instan UTC agar getter UTC-nya membaca angka jam/tanggal WIB.
const keWIB = (tanggal: Date) => new Date(tanggal.getTime() + WIB_OFFSET_MS);

// Kembalikan instan UTC untuk pukul 00:00:00.000 WIB pada hari yang memuat `tanggal`.
export const awalHariWIB = (tanggal: Date): Date => {
  const digeser = tanggal.getTime() + WIB_OFFSET_MS;
  const awalHari = Math.floor(digeser / SEHARI_MS) * SEHARI_MS;
  return new Date(awalHari - WIB_OFFSET_MS);
};

// Kembalikan instan UTC untuk pukul 23:59:59.999 WIB pada hari yang memuat `tanggal`.
export const akhirHariWIB = (tanggal: Date): Date =>
  new Date(awalHariWIB(tanggal).getTime() + SEHARI_MS - 1);

// Rentang penuh bulan yang memuat `tanggal`, dari 00:00:00.000 WIB tanggal 1
// sampai 23:59:59.999 WIB hari terakhir bulan itu.
export const rentangBulanWIB = (tanggal: Date): { mulai: Date; selesai: Date } => {
  const wib = keWIB(tanggal);
  const tahun = wib.getUTCFullYear();
  const bulan = wib.getUTCMonth();

  const mulai = new Date(Date.UTC(tahun, bulan, 1) - WIB_OFFSET_MS);
  const mulaiBulanBerikut = new Date(Date.UTC(tahun, bulan + 1, 1) - WIB_OFFSET_MS);

  return { mulai, selesai: new Date(mulaiBulanBerikut.getTime() - 1) };
};

// Rentang penuh bulan sebelum bulan yang memuat `tanggal`. Dipakai sebagai
// pembanding di laporan laba rugi.
export const rentangBulanSebelumnyaWIB = (tanggal: Date): { mulai: Date; selesai: Date } => {
  const { mulai } = rentangBulanWIB(tanggal);
  return rentangBulanWIB(new Date(mulai.getTime() - 1));
};

// Selisih hari kalender WIB antara dua tanggal. Dipakai untuk umur piutang,
// sehingga transaksi kemarin sore selalu berumur 1 hari — bukan 0 karena
// belum genap 24 jam.
export const umurHariWIB = (dari: Date, sampai: Date = new Date()): number =>
  Math.round((awalHariWIB(sampai).getTime() - awalHariWIB(dari).getTime()) / SEHARI_MS);

// "YYYY-MM-DD" menurut kalender WIB. Dipakai untuk mengelompokkan daftar per
// hari dan mengisi nilai bawaan <input type="date">.
export const tanggalWIBString = (tanggal: Date): string => {
  const wib = keWIB(tanggal);
  const bulan = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const hari = String(wib.getUTCDate()).padStart(2, "0");
  return `${wib.getUTCFullYear()}-${bulan}-${hari}`;
};

// Ubah "YYYY-MM-DD" dari <input type="date"> menjadi instan UTC pukul 00:00 WIB.
// Kembalikan null bila format tidak sah, supaya pemanggil bisa menolak 400.
export const dariTanggalInputWIB = (nilai: string): Date | null => {
  const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nilai.trim());
  if (!cocok) return null;

  const tahun = Number(cocok[1]);
  const bulan = Number(cocok[2]);
  const hari = Number(cocok[3]);
  if (bulan < 1 || bulan > 12 || hari < 1 || hari > 31) return null;

  const hasil = new Date(Date.UTC(tahun, bulan - 1, hari) - WIB_OFFSET_MS);
  // Tolak tanggal yang "berguling" (mis. 2026-02-31 menjadi 3 Maret).
  if (tanggalWIBString(hasil) !== `${cocok[1]}-${cocok[2]}-${cocok[3]}`) return null;
  return hasil;
};

// Baca rentang tanggal dari query string. `mulai`/`selesai` berformat YYYY-MM-DD.
// Bila keduanya kosong, kembalikan bulan berjalan.
export const rentangDariQuery = (
  mulaiParam: string | null,
  selesaiParam: string | null
): { mulai: Date; selesai: Date } | null => {
  if (!mulaiParam && !selesaiParam) return rentangBulanWIB(new Date());

  const mulaiTanggal = mulaiParam ? dariTanggalInputWIB(mulaiParam) : null;
  const selesaiTanggal = selesaiParam ? dariTanggalInputWIB(selesaiParam) : null;
  if ((mulaiParam && !mulaiTanggal) || (selesaiParam && !selesaiTanggal)) return null;

  const mulai = mulaiTanggal ?? awalHariWIB(selesaiTanggal!);
  const selesai = akhirHariWIB(selesaiTanggal ?? mulaiTanggal!);
  if (selesai.getTime() < mulai.getTime()) return null;

  return { mulai, selesai };
};

// Label bulan berbahasa Indonesia, mis. "Juli 2026".
export const labelBulanWIB = (tanggal: Date): string =>
  tanggal.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
