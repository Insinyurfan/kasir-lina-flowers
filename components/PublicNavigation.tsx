"use client";

import { useEffect, useState } from "react";
import type { Ref } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, Flower2, Info, LogIn, ShoppingBag } from "lucide-react";

type PublicNavigationProps = {
  title: string;
  cartCount?: number;
  cartPulse?: boolean;
  cartButtonRef?: Ref<HTMLButtonElement>;
  onCartOpen?: () => void;
};

const navigation = [
  { href: "/pesan", label: "Pesan Produk", icon: ShoppingBag },
  { href: "/lacak", label: "Lacak Pesanan", icon: ClipboardCheck },
  { href: "/tentang", label: "Tentang Kami", icon: Info },
];

export default function PublicNavigation({
  title,
  cartCount = 0,
  cartPulse = false,
  cartButtonRef,
  onCartOpen,
}: PublicNavigationProps) {
  const pathname = usePathname();
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pengaturan", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setLogo(data?.logo || null))
      .catch(() => setLogo(null));
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <Link href="/pesan" className="flex min-w-0 items-center gap-2.5" aria-label="Lina Flowers">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-pink-100 bg-white text-pink-600 shadow-sm">
                {logo ? <img src={logo} alt="Logo Lina Flowers" className="h-full w-full object-contain p-1" /> : <Flower2 size={22} />}
              </span>
              <span className="truncate text-base font-bold tracking-wider text-rose-950">Lina Flowers</span>
            </Link>

            <h1 className="hidden flex-1 text-center text-lg font-black text-slate-800 sm:block">{title}</h1>

            <nav className="ml-auto hidden items-center gap-1 lg:flex">
              {navigation.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                    pathname === href ? "bg-pink-50 text-pink-700" : "text-slate-500 hover:bg-pink-50 hover:text-pink-700"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <Link href="/login" className="ml-auto flex shrink-0 items-center gap-2 rounded-xl bg-pink-600 px-3 py-2 text-sm font-black text-white lg:ml-2">
              <LogIn size={17} />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </div>
          <h1 className="mt-2 text-center text-sm font-black text-slate-800 sm:hidden">{title}</h1>
        </div>
      </header>

      {onCartOpen && (
        <button
          ref={cartButtonRef}
          type="button"
          onClick={onCartOpen}
          className={`fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-pink-600 text-white shadow-2xl shadow-pink-300 transition-transform md:bottom-7 md:right-7 ${
            cartPulse ? "scale-125" : "scale-100"
          }`}
          aria-label="Buka keranjang"
        >
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-[11px] font-black text-pink-600 shadow">
              {cartCount}
            </span>
          )}
        </button>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-pink-100 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_25px_rgba(219,39,119,0.09)] backdrop-blur lg:hidden">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-black ${active ? "text-pink-600" : "text-slate-400"}`}>
              <Icon size={21} strokeWidth={active ? 2.8 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
