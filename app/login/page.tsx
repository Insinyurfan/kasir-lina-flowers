"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Flower2, Lock, Sparkles, User } from "lucide-react";
import { getSavedUserSession, saveUserSession } from "@/lib/userSession";

type StoredUser = {
  role?: string;
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const savedUser = getSavedUserSession<StoredUser>();
    if (savedUser?.role) {
      router.replace(savedUser.role === "Tamu" ? "/produk" : "/dashboard");
      return () => {
        isMounted = false;
      };
    }

    fetch("/api/pengaturan", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.logo) setLogo(data.logo);
      })
      .catch(() => {
        if (isMounted) setLogo(null);
      });

    return () => {
      isMounted = false;
    };
    // Login bootstrap only needs to run once when the page is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    const data = await res.json();

    if (res.ok) {
      saveUserSession(data, rememberMe);
      router.push("/dashboard");
    } else {
      alert(data.error || "Login Gagal!");
    }
  };

  const handleGuestLogin = () => {
    saveUserSession(
      {
        id: 0,
        username: "tamu-produk",
        fullName: "Tamu Produk",
        profilePhoto: null,
        role: "Tamu",
        isGuest: true,
      },
      false
    );
    router.push("/produk");
  };

  const logoMarkup = (className: string, fallbackSize: number) => (
    <span className={className}>
      {logo ? (
        <Image src={logo} alt="Logo Lina Flowers" width={64} height={64} unoptimized className="login-logo-image" />
      ) : (
        <Flower2 className="login-logo-fallback" size={fallbackSize} />
      )}
    </span>
  );

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-brand">
          {logoMarkup("login-brand-logo", 23)}
          <div>
            <p className="login-kicker">Lina Store</p>
            <h1>Beauty Accessories</h1>
          </div>
        </div>

        <div className="login-hero-copy">
          <span className="login-pill">
            <Sparkles size={15} />
            Koleksi Wanita
          </span>
          <h2>Aksesori cantik yang pernah ada.</h2>
          <p>Kelola produk, pelanggan, laporan, dan penjualan dalam dashboard kasir rapi, dan mudah dipakai.</p>
        </div>

        <div className="accessory-stage">
          <Image
            src="/login-accessories-hero.png"
            alt="Aksesori rambut dan perhiasan wanita Lina Store"
            width={1536}
            height={1024}
            priority
            className="accessory-hero-image"
          />
        </div>

      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          {logoMarkup("login-form-logo", 31)}
          <p className="login-kicker login-form-kicker">Area Terbatas</p>
          <h2>Login Admin</h2>
          <p className="login-form-subtitle">Masuk untuk mengelola kasir, katalog produk, dan laporan operasional.</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrap">
                <User size={19} />
                <input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <Lock size={19} />
                <input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <label className="remember-row">
              <span>Ingat saya</span>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            </label>

            <button type="submit" className="login-submit">Masuk Sekarang</button>
            <button type="button" onClick={handleGuestLogin} className="product-order-button">
              Lihat Produk / Pemesanan Produk
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
