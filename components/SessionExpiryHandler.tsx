"use client";

import { useEffect } from "react";
import { clearSavedUserSession } from "@/lib/userSession";

// Penanganan 401 global. Setelah pengetatan otorisasi (identitas dari sesi ber-HMAC),
// endpoint terproteksi membalas 401 saat sesi tidak ada/kedaluwarsa. Komponen ini
// menyisipkan pembungkus di sekitar window.fetch: bila sebuah request same-origin ke
// /api/* membalas 401, sesi lokal dibersihkan dan pengguna diarahkan ke /login.
//
// Semua fetch di aplikasi ini sudah same-origin (URL relatif) sehingga cookie sesi
// otomatis ikut — tidak perlu lagi mengirim actorId untuk otorisasi.
export default function SessionExpiryHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch.bind(window);

    const isApiRequest = (input: RequestInfo | URL): boolean => {
      try {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url;
        const resolved = new URL(url, window.location.origin);
        // Hanya same-origin /api/* — abaikan host lain (mis. Supabase Storage).
        return resolved.origin === window.location.origin && resolved.pathname.startsWith("/api/");
      } catch {
        return false;
      }
    };

    const patched: typeof window.fetch = async (input, init) => {
      const response = await originalFetch(input as RequestInfo | URL, init);

      if (
        response.status === 401 &&
        isApiRequest(input as RequestInfo | URL) &&
        window.location.pathname !== "/login"
      ) {
        clearSavedUserSession();
        // Simpan tujuan agar bisa kembali setelah login ulang (opsional dipakai halaman login).
        try {
          sessionStorage.setItem("lina_post_login_redirect", window.location.pathname + window.location.search);
        } catch {
          /* abaikan bila storage tidak tersedia */
        }
        window.location.assign("/login");
      }

      return response;
    };

    window.fetch = patched;
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
