"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flower2 } from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";

type StoredUser = {
  role?: string;
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getSavedUserSession<StoredUser>();
    if (!user) {
      router.replace("/login");
      return;
    }

    router.replace(user.role === "Tamu" ? "/produk" : "/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-pink-50">
      <div className="animate-pulse text-pink-500 flex flex-col items-center">
        <Flower2 size={48} className="animate-spin-slow mb-4" />
        <p className="font-bold">Memuat Sistem...</p>
      </div>
    </div>
  );
}
