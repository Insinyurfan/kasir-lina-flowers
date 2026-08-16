import { redirect } from "next/navigation";

// Dulu mengarah ke /login karena pemesanan tamu memang belum ada. Sekarang
// pemesanan hidup di katalog publik, jadi tautan lama diarahkan ke sana —
// bukan ke halaman login yang justru menghalangi pembeli baru.
export default function PesanPage() {
  redirect("/");
}
