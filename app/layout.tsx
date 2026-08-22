"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Inter } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";
import Link from "next/link";
import { clearSavedUserSession, getSavedUserSession } from "@/lib/userSession";
import { JEDA_POLLING, useIntervalSaatTerlihat } from "@/lib/pollingHemat";
import SessionExpiryHandler from "@/components/SessionExpiryHandler";
import ToastHost from "@/components/ToastHost";
import PendaftarServiceWorker from "@/components/PendaftarServiceWorker";
import {
  LACI_HP_DIKELOMPOKKAN,
  MENU_AKUN_LACI_HP,
  MENU_DASHBOARD,
  MENU_KASIR,
  MENU_LUAR_KELOMPOK,
  URUTAN_LACI_HP,
  bolehLihat,
  kelompokAktif,
  menuAktif,
  saringKelompok,
  saringMenu,
  type KelompokMenu,
} from "@/lib/menuNavigasi";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  House,
  Package,
  ShoppingCart,
  ReceiptText,
  Flower2,
  Camera,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ClipboardCheck,
  PackageCheck,
  FileDown,
  Eye,
  Minus,
  RotateCcw,
  Settings,
  UserRound,
  Trash2,
  ZoomIn
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });
// Dipakai HANYA sebagai satuan backoff saat permintaan notifikasi gagal
// berturut-turut. Jeda polling normalnya ada di JEDA_POLLING.notifikasi.
const NOTIFICATION_POLL_INTERVAL = 5000;
const NOTIFICATION_FETCH_TIMEOUT = 8000;
const NOTIFICATION_MAX_BACKOFF = 60000;
const DISMISSED_NOTIFICATION_POPUPS_KEY = "lina_dismissed_notification_popups";
// "Order Baru" sengaja TIDAK di-popup: notifikasi tetap masuk lonceng, tapi tidak
// memunculkan modal yang mengganggu (mis. spam saat akun baru/lama login karena
// banyak notifikasi order lama belum terbaca).
const POPUP_NOTIFICATION_STATUSES = new Set(["Request Pesanan", "Siap Kirim", "Siap Dikirim"]);
// `/lacak` dan `/orderan` wajib ada di sini: pembeli yang melacak atau membuka
// kembali orderannya tidak punya akun, dan tanpa pengecualian ini mereka
// langsung dilempar ke /login.
const PUBLIC_ROUTES = ["/", "/login", "/lacak", "/orderan"];

type UserSession = {
  id: number;
  username: string;
  fullName?: string;
  profilePhoto?: string | null;
  role: string;
  isGuest?: boolean;
};

type NotificationItem = {
  id: number;
  transactionId?: number | null;
  targetRole: string;
  senderRole: string;
  senderName?: string | null;
  statusPengiriman: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const shouldShowNotificationPopup = (notification: NotificationItem) =>
  POPUP_NOTIFICATION_STATUSES.has(notification.statusPengiriman);

const getStoredUser = () => {
  return getSavedUserSession<UserSession>();
};

const fetchNotificationsByRole = async (
  role: string,
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>
) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), NOTIFICATION_FETCH_TIMEOUT);

  try {
    const res = await fetch(`/api/notifikasi?role=${encodeURIComponent(role)}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return false;

    const data = await res.json();
    setNotifications(Array.isArray(data) ? data : []);
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const broadcastNotificationsRefresh = () => {
  window.dispatchEvent(new Event("lina_notifications_updated"));
  localStorage.setItem("lina_notifications_refresh_at", String(Date.now()));
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isStandaloneReceipt = pathname.startsWith("/struk");
  const isPublicPage = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const [logo, setLogo] = useState<string | null>(null);
  const [brand, setBrand] = useState("Lina Flowers");
  const [user, setUser] = useState<UserSession | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(pathname !== "/login");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
  const [isStoreLogoPreviewOpen, setIsStoreLogoPreviewOpen] = useState(false);
  const [storeLogoEditorSource, setStoreLogoEditorSource] = useState<string | null>(null);
  const [isSavingStoreLogo, setIsSavingStoreLogo] = useState(false);
  const [newOrderPopup, setNewOrderPopup] = useState<NotificationItem | null>(null);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<number[]>([]);

  // STATE UNTUK MENU MOBILE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuRendered, setIsMobileMenuRendered] = useState(false);

  // TARIKAN-BAWAH HEADER DESKTOP. Disimpan sebagai satu id, bukan boolean per
  // kelompok, supaya "hanya satu terbuka pada satu waktu" berlaku dengan
  // sendirinya alih-alih harus dijaga manual.
  const [kelompokTerbuka, setKelompokTerbuka] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuDesktopRef = useRef<HTMLDivElement>(null);
  const readQueuedIdsRef = useRef<Set<number>>(new Set());
  const visibleNotificationReadIdsRef = useRef<Set<number>>(new Set());
  const mobileMenuTimerRef = useRef<number | null>(null);
  const tutupKelompokTimerRef = useRef<number | null>(null);
  const hasLoadedSettingsRef = useRef(false);
  const notificationFetchInFlightRef = useRef(false);
  const notificationFailureCountRef = useRef(0);
  const notificationBackoffUntilRef = useRef(0);
  const dismissedNewOrderPopupIdsRef = useRef<Set<number>>(new Set());
  const isGuest = user?.role === "Tamu";
  const actorPayload = useMemo(() => ({
    actorId: user?.id,
    actorName: user?.fullName || user?.username,
    actorRole: user?.role,
  }), [user?.fullName, user?.id, user?.role, user?.username]);

  // Kedua daftar ini berasal dari definisi menu yang sama; yang berbeda hanya
  // urutan dan cara menampilkannya. Kelompok yang habis tersaring oleh peran
  // tidak ikut dikembalikan `saringKelompok`, jadi tidak ada kepala kelompok
  // yang membuka ke ruang kosong.
  const kelompokTampil = useMemo(() => saringKelompok(user?.role), [user?.role]);
  const menuLaciHp = useMemo(() => saringMenu(URUTAN_LACI_HP, user?.role), [user?.role]);
  const menuLuarKelompokHp = useMemo(() => saringMenu(MENU_LUAR_KELOMPOK, user?.role), [user?.role]);

  useEffect(() => {
    let loadingTimer: number | null = null;
    let userTimer: number | null = null;

    if (isPublicPage || isStandaloneReceipt) {
      userTimer = window.setTimeout(() => setUser(null), 0);
      loadingTimer = window.setTimeout(() => setIsLoading(false), 0);
      return () => {
        if (userTimer) window.clearTimeout(userTimer);
        if (loadingTimer) window.clearTimeout(loadingTimer);
      };
    }

    const savedUser = getStoredUser();
    if (!savedUser) {
      userTimer = window.setTimeout(() => setUser(null), 0);
      router.replace("/login");
    } else if (savedUser.role === "Tamu") {
      userTimer = window.setTimeout(() => setUser(savedUser), 0);
      if (pathname !== "/produk") router.replace("/produk");
      loadingTimer = window.setTimeout(() => setIsLoading(false), 0);
    } else {
      userTimer = window.setTimeout(() => setUser(savedUser), 0);
      loadingTimer = window.setTimeout(() => setIsLoading(false), 0);
    }

    return () => {
      if (userTimer) window.clearTimeout(userTimer);
      if (loadingTimer) window.clearTimeout(loadingTimer);
    };
  }, [isPublicPage, isStandaloneReceipt, pathname, router]);

  useEffect(() => {
    if (!user?.role || user.role === "Tamu" || hasLoadedSettingsRef.current) return;

    hasLoadedSettingsRef.current = true;
    // `tampilan=1` melewatkan receiptLogo (2,8 MB) yang tidak dipakai di sini.
    // Endpoint ini jalan di SETIAP halaman lewat root layout.
    fetch("/api/pengaturan?tampilan=1")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.logo) setLogo(data.logo);
        if (data && data.brand) setBrand(data.brand);
      })
      .catch(() => {
        hasLoadedSettingsRef.current = false;
        console.log("Gagal memuat logo");
      });
  }, [user?.role]);

  useEffect(() => {
    const refreshUser = () => {
      const savedUser = getStoredUser();
      if (savedUser) setUser(savedUser);
    };

    window.addEventListener("user_lina_updated", refreshUser);
    return () => window.removeEventListener("user_lina_updated", refreshUser);
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setStoreLogoEditorSource(reader.result as string);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const saveStoreLogo = async (editedLogo: string) => {
    setIsSavingStoreLogo(true);

    try {
      setLogo(editedLogo);
      const res = await fetch("/api/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo: editedLogo, ...actorPayload }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan logo");
      const data = await res.json();
      setLogo(data?.logo || editedLogo);
      setStoreLogoEditorSource(null);
      setIsStoreLogoPreviewOpen(true);
    } catch {
      alert("Gagal menyimpan logo toko.");
      fetch("/api/pengaturan?tampilan=1", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => setLogo(data?.logo || null))
        .catch(() => setLogo(null));
    } finally {
      setIsSavingStoreLogo(false);
    }
  };

  const handleLogout = () => {
    void fetch("/api/login", { method: "DELETE" });
    clearSavedUserSession();
    setUser(null);
    setIsAccountMenuOpen(false);
    setIsProfilePreviewOpen(false);
    router.push("/login");
  };

  const openMobileMenu = () => {
    if (mobileMenuTimerRef.current) {
      window.clearTimeout(mobileMenuTimerRef.current);
      mobileMenuTimerRef.current = null;
    }

    setIsMobileMenuRendered(true);
    window.requestAnimationFrame(() => setIsMobileMenuOpen(true));
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    if (mobileMenuTimerRef.current) window.clearTimeout(mobileMenuTimerRef.current);
    mobileMenuTimerRef.current = window.setTimeout(() => {
      setIsMobileMenuRendered(false);
      mobileMenuTimerRef.current = null;
    }, 320);
  };

  useEffect(() => {
    return () => {
      if (mobileMenuTimerRef.current) window.clearTimeout(mobileMenuTimerRef.current);
      if (tutupKelompokTimerRef.current) window.clearTimeout(tutupKelompokTimerRef.current);
    };
  }, []);

  const batalTutupKelompok = useCallback(() => {
    if (tutupKelompokTimerRef.current) {
      window.clearTimeout(tutupKelompokTimerRef.current);
      tutupKelompokTimerRef.current = null;
    }
  }, []);

  const bukaKelompok = useCallback((id: string) => {
    batalTutupKelompok();
    setKelompokTerbuka(id);
  }, [batalTutupKelompok]);

  const tutupKelompok = useCallback(() => {
    batalTutupKelompok();
    setKelompokTerbuka(null);
  }, [batalTutupKelompok]);

  // Tenggang sebelum benar-benar menutup. Tanpa ini, tarikan-bawah tertutup di
  // tengah jalan saat kursor bergerak menyerong dari kepala kelompok menuju
  // isinya — celah antara keduanya cukup untuk memicu `mouseleave`.
  const tutupKelompokTertunda = useCallback(() => {
    batalTutupKelompok();
    tutupKelompokTimerRef.current = window.setTimeout(() => {
      setKelompokTerbuka(null);
      tutupKelompokTimerRef.current = null;
    }, 220);
  }, [batalTutupKelompok]);

  // `Esc` menutup — mengikuti pola yang sudah dipakai modal katalog.
  useEffect(() => {
    if (!kelompokTerbuka) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") tutupKelompok();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [kelompokTerbuka, tutupKelompok]);

  useEffect(() => {
    try {
      const savedIds = JSON.parse(localStorage.getItem(DISMISSED_NOTIFICATION_POPUPS_KEY) || "[]");
      dismissedNewOrderPopupIdsRef.current = new Set(Array.isArray(savedIds) ? savedIds.map(Number) : []);
    } catch {
      dismissedNewOrderPopupIdsRef.current = new Set();
    }
  }, []);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    // Dua rujukan karena blok profil ada di dua tempat — header desktop dan laci
    // HP. Keduanya tidak pernah tampil bersamaan, tetapi keduanya harus dianggap
    // "di dalam" supaya menu tidak tertutup saat isinya sendiri diklik.
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const diDalam =
        accountMenuRef.current?.contains(target) || accountMenuDesktopRef.current?.contains(target);
      if (!diDalam) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAccountMenuOpen]);

  const fetchNotificationsForRole = useCallback(async (role: string, force = false) => {
    if (notificationFetchInFlightRef.current) return false;
    if (!force && Date.now() < notificationBackoffUntilRef.current) return false;

    notificationFetchInFlightRef.current = true;
    const isLoaded = await fetchNotificationsByRole(role, setNotifications);
    notificationFetchInFlightRef.current = false;

    if (isLoaded) {
      notificationFailureCountRef.current = 0;
      notificationBackoffUntilRef.current = 0;
      return true;
    }

    notificationFailureCountRef.current += 1;
    const backoffMs = Math.min(
      NOTIFICATION_MAX_BACKOFF,
      NOTIFICATION_POLL_INTERVAL * Math.max(1, notificationFailureCountRef.current)
    );
    notificationBackoffUntilRef.current = Date.now() + backoffMs;
    return false;
  }, []);

  const fetchNotifications = useCallback(async (force = true) => {
    if (!user?.role || user.role === "Tamu") return;
    await fetchNotificationsForRole(user.role, force);
  }, [fetchNotificationsForRole, user]);

  // Tarikan pertama saja; pengulangannya diurus useIntervalSaatTerlihat di bawah.
  useEffect(() => {
    if (!user?.role || user.role === "Tamu") return;

    const role = user.role;
    const timeoutId = window.setTimeout(() => void fetchNotificationsForRole(role), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchNotificationsForRole, user?.role]);

  // Dulu setiap 5 detik tanpa henti, di SEMUA halaman, walau tabnya ditinggal
  // seharian. Sekarang 30 detik dan berhenti saat tab tidak dilihat.
  const bolehPolling = Boolean(user?.role) && user?.role !== "Tamu";
  useIntervalSaatTerlihat(
    () => {
      if (user?.role) void fetchNotificationsForRole(user.role);
    },
    JEDA_POLLING.notifikasi,
    bolehPolling
  );

  useEffect(() => {
    if (!user?.role || user.role === "Tamu") return;

    const role = user.role;
    const refreshNotifications = () => fetchNotificationsForRole(role, true);
    const handleStorageRefresh = (event: StorageEvent) => {
      if (event.key === "lina_notifications_refresh_at") refreshNotifications();
    };
    const handleVisibilityRefresh = () => {
      if (document.visibilityState === "visible") refreshNotifications();
    };

    window.addEventListener("lina_notifications_updated", refreshNotifications);
    window.addEventListener("storage", handleStorageRefresh);
    window.addEventListener("focus", refreshNotifications);
    window.addEventListener("online", refreshNotifications);
    document.addEventListener("visibilitychange", handleVisibilityRefresh);
    return () => {
      window.removeEventListener("lina_notifications_updated", refreshNotifications);
      window.removeEventListener("storage", handleStorageRefresh);
      window.removeEventListener("focus", refreshNotifications);
      window.removeEventListener("online", refreshNotifications);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
    };
  }, [fetchNotificationsForRole, user?.role]);

  const markNotificationsUnread = async (ids: number[]) => {
    const readIds = ids.filter((id) => {
      const notification = notifications.find((item) => item.id === id);
      return notification?.isRead;
    });

    if (readIds.length === 0) return;

    readIds.forEach((id) => readQueuedIdsRef.current.delete(id));
    setNotifications((current) =>
      current.map((notification) => (readIds.includes(notification.id) ? { ...notification, isRead: false } : notification))
    );
    setSelectedNotificationIds((current) => current.filter((id) => !readIds.includes(id)));
    setIsNotifOpen(false);

    try {
      const res = await fetch("/api/notifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: readIds, isRead: false, ...actorPayload }),
      });

      if (res.ok) broadcastNotificationsRefresh();
      else fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  const markNotificationsRead = useCallback(async (ids: number[]) => {
    const unreadIds = ids.filter((id) => {
      const notification = notifications.find((item) => item.id === id);
      return notification && !notification.isRead && !readQueuedIdsRef.current.has(id);
    });

    if (unreadIds.length === 0) return;

    unreadIds.forEach((id) => readQueuedIdsRef.current.add(id));
    setNotifications((current) =>
      current.map((notification) => (unreadIds.includes(notification.id) ? { ...notification, isRead: true } : notification))
    );

    try {
      const res = await fetch("/api/notifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds, ...actorPayload }),
      });

      if (!res.ok) {
        unreadIds.forEach((id) => readQueuedIdsRef.current.delete(id));
        fetchNotifications();
      } else {
        broadcastNotificationsRefresh();
      }
    } catch {
      unreadIds.forEach((id) => readQueuedIdsRef.current.delete(id));
      fetchNotifications();
    }
  }, [actorPayload, fetchNotifications, notifications]);

  const rememberDismissedNewOrderPopup = (id: number) => {
    dismissedNewOrderPopupIdsRef.current.add(id);
    localStorage.setItem(
      DISMISSED_NOTIFICATION_POPUPS_KEY,
      JSON.stringify(Array.from(dismissedNewOrderPopupIdsRef.current).slice(-100))
    );
  };

  const closeNewOrderPopup = () => {
    if (newOrderPopup) rememberDismissedNewOrderPopup(newOrderPopup.id);
    setNewOrderPopup(null);
  };

  const openNewOrderSource = () => {
    if (!newOrderPopup) return;

    rememberDismissedNewOrderPopup(newOrderPopup.id);
    markNotificationsRead([newOrderPopup.id]);
    // Request pesanan belum punya transaksi (baru lahir saat pemilik menerima
    // dan mengisi harganya), jadi mengarahkannya ke Status Pesanan hanya
    // menampilkan halaman kosong. Hulunya ada di Request Pesanan.
    const targetUrl =
      newOrderPopup.statusPengiriman === "Request Pesanan"
        ? "/request-pesanan"
        : newOrderPopup.transactionId
          ? `/status-pesanan?highlight=${newOrderPopup.transactionId}`
          : "/status-pesanan";
    setNewOrderPopup(null);
    router.push(targetUrl);
  };

  const openNotificationPopup = (notification: NotificationItem) => {
    setNewOrderPopup(notification);
    setIsNotifOpen(false);
    markNotificationsRead([notification.id]);
  };

  const toggleNotificationSelection = (id: number, checked: boolean) => {
    setSelectedNotificationIds((current) =>
      checked ? Array.from(new Set([...current, id])) : current.filter((itemId) => itemId !== id)
    );
  };

  const toggleAllNotificationsSelection = (checked: boolean) => {
    setSelectedNotificationIds(checked ? notifications.map((notification) => notification.id) : []);
  };

  const deleteNotifications = async (ids: number[]) => {
    if (!user?.role || user.role === "Tamu" || ids.length === 0) return;
    if (!confirm(`Hapus ${ids.length} notifikasi yang dipilih?`)) return;

    setNotifications((current) => current.filter((notification) => !ids.includes(notification.id)));
    setSelectedNotificationIds((current) => current.filter((id) => !ids.includes(id)));

    try {
      const res = await fetch("/api/notifikasi", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, role: user.role, ...actorPayload }),
      });

      if (res.ok) broadcastNotificationsRefresh();
      else fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  useEffect(() => {
    if (!isNotifOpen || notifications.every((notification) => notification.isRead)) return;

    const panel = document.querySelector<HTMLElement>("[data-global-notification-panel]");
    if (!panel) return;

    const unreadIds = new Set(notifications.filter((notification) => !notification.isRead).map((notification) => notification.id));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = Number((entry.target as HTMLElement).dataset.notificationId);
          if (!id || !unreadIds.has(id)) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) visibleNotificationReadIdsRef.current.add(id);
        });
      },
      {
        root: panel,
        threshold: [0.55, 0.75, 1],
      }
    );

    panel.querySelectorAll<HTMLElement>("[data-notification-id]").forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [isNotifOpen, notifications]);

  useEffect(() => {
    if (isNotifOpen) return;

    const ids = Array.from(visibleNotificationReadIdsRef.current);
    visibleNotificationReadIdsRef.current.clear();
    if (ids.length > 0) markNotificationsRead(ids);
  }, [isNotifOpen, markNotificationsRead]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!user?.role || user.role === "Tamu") {
        setNewOrderPopup(null);
        return;
      }

      const nextPopup = notifications.find(
        (notification) =>
          shouldShowNotificationPopup(notification) &&
          !notification.isRead &&
          !dismissedNewOrderPopupIdsRef.current.has(notification.id)
      );

      setNewOrderPopup((current) => {
        if (current?.id === nextPopup?.id) return current;
        return nextPopup || null;
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [notifications, user?.role]);

  useEffect(() => {
    if (!newOrderPopup) return;
    const timeoutId = window.setTimeout(closeNewOrderPopup, 5000);
    return () => window.clearTimeout(timeoutId);
    // The popup timer restarts only when a different notification is shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrderPopup?.id]);

  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;
  const selectedVisibleNotificationIds = selectedNotificationIds.filter((id) =>
    notifications.some((notification) => notification.id === id)
  );
  const allNotificationsSelected =
    notifications.length > 0 && notifications.every((notification) => selectedNotificationIds.includes(notification.id));
  const shouldHoldAuthCheck = !isPublicPage && !isStandaloneReceipt && !user;
  const shouldHoldGuestRedirect = isGuest && pathname !== "/produk" && pathname !== "/login" && !isStandaloneReceipt;

  // Isi menu akun sama persis di header desktop dan laci HP; hanya penempatannya
  // yang berbeda. Ditarik ke satu tempat supaya keduanya tidak menyimpang.
  const renderMenuAkun = (className: string) => (
    <div className={className}>
      {user?.profilePhoto && (
        <button
          type="button"
          onClick={() => {
            setIsProfilePreviewOpen(true);
            setIsAccountMenuOpen(false);
          }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold hover:bg-pink-50 hover:text-pink-600 transition-colors"
        >
          <Eye size={18} /> Lihat Foto
        </button>
      )}
      {!isGuest && (
        <Link
          href="/akun?edit=me"
          onClick={() => {
            setIsAccountMenuOpen(false);
            closeMobileMenu();
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold hover:bg-pink-50 hover:text-pink-600 transition-colors"
        >
          <Settings size={18} /> Pengaturan Akun
        </Link>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );

  const renderNotificationPanel = (className: string) => (
    <div className={className}>
      <div className="p-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800">Notifikasi</h3>
          <p className="text-xs text-slate-500">Pengingat orderan untuk role {user?.role}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm" /> Belum dibaca
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm" /> Sudah dibaca
            </span>
          </div>
        </div>
        {notifications.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                allNotificationsSelected
                  ? "border-pink-200 bg-pink-50 text-pink-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                checked={allNotificationsSelected}
                onChange={(e) => toggleAllNotificationsSelection(e.target.checked)}
                className="h-3.5 w-3.5 accent-pink-600"
              />
              Pilih semua
            </label>
            <button
              type="button"
              disabled={selectedVisibleNotificationIds.length === 0}
              onClick={() => markNotificationsUnread(selectedVisibleNotificationIds)}
              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Tandai belum baca ({selectedVisibleNotificationIds.length})
            </button>
            <button
              type="button"
              disabled={selectedVisibleNotificationIds.length === 0}
              onClick={() => deleteNotifications(selectedVisibleNotificationIds)}
              className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Trash2 size={13} /> Hapus dipilih ({selectedVisibleNotificationIds.length})
            </button>
          </div>
        )}
      </div>
      <div data-global-notification-panel className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">Belum ada notifikasi.</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start border-b border-slate-50 hover:bg-pink-50/50 ${notification.isRead ? "bg-white" : "bg-pink-50"}`}
            >
              <Link
                href={notification.transactionId
                  ? `/status-pesanan?highlight=${notification.transactionId}`
                  : "/status-pesanan"}
                data-notification-id={notification.id}
                className="block min-w-0 flex-1 py-4 pl-4"
                onClick={(event) => {
                  if (shouldShowNotificationPopup(notification)) {
                    event.preventDefault();
                    openNotificationPopup(notification);
                    return;
                  }

                  markNotificationsRead([notification.id]);
                  setIsNotifOpen(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    title={notification.isRead ? "Sudah dibaca" : "Belum dibaca"}
                    className={`mt-1 h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm ${
                      notification.isRead ? "bg-blue-500" : "bg-red-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{notification.statusPengiriman}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notification.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString("id-ID")} dari {notification.senderRole}
                      {notification.senderName ? ` - ${notification.senderName}` : ""}
                    </p>
                  </div>
                </div>
              </Link>
              <label className="flex cursor-pointer items-start px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedNotificationIds.includes(notification.id)}
                  onChange={(e) => toggleNotificationSelection(notification.id, e.target.checked)}
                  className="mt-1 h-4 w-4 accent-pink-600"
                />
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <html lang="id" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <title>Lina Flowers</title>
        {/* Kunci skala viewport agar tidak auto-zoom saat ganti orientasi (portrait <-> landscape) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="application-name" content="Lina Kasir" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Lina Kasir" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#db2777" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/lina-apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} bg-pink-50 text-slate-800`} suppressHydrationWarning>
        <SessionExpiryHandler />
        {/* Penampil notifikasi global — dipanggil dari halaman mana pun
            lewat toast.success/error di "@/lib/toast". */}
        <ToastHost />
        <PendaftarServiceWorker />
        <style>{`
          @keyframes lina-bell-ring {
            0%, 100% { transform: rotate(0deg); }
            8% { transform: rotate(16deg); }
            16% { transform: rotate(-14deg); }
            24% { transform: rotate(11deg); }
            32% { transform: rotate(-8deg); }
            40% { transform: rotate(5deg); }
            48% { transform: rotate(0deg); }
          }
        `}</style>
        {isLoading || shouldHoldAuthCheck || shouldHoldGuestRedirect ? (
          <div className="flex items-center justify-center h-screen" suppressHydrationWarning>
            <div className="animate-pulse text-pink-500 flex flex-col items-center" suppressHydrationWarning>
              <Flower2 size={48} className="animate-spin-slow mb-4" />
              <p className="font-bold">Memuat Sistem...</p>
            </div>
          </div>
        ) : isPublicPage || isStandaloneReceipt ? (
          children
        ) : (
          // `flex-col` untuk kedua ukuran: sejak sidebar desktop diganti header,
          // tidak ada lagi kolom kiri yang perlu disandingkan dengan konten.
          <div className="lina-app-shell flex h-screen flex-col overflow-hidden relative w-full">
            {/* HEADER DESKTOP — menggantikan sidebar ikon-tanpa-label.
                Berada di dalam arus tata letak (bukan `fixed`), jadi konten
                mengalir di bawahnya tanpa perlu `scroll-padding-top` maupun
                padding atas penyeimbang. */}
            <header className="hidden desktop:flex shrink-0 h-16 items-center gap-2 border-b border-pink-100 bg-white/90 px-4 backdrop-blur-md shadow-sm z-50">
              <button
                type="button"
                onClick={() => setIsStoreLogoPreviewOpen(true)}
                aria-label="Lihat logo toko"
                title="Lihat Logo Toko"
                className="w-11 h-11 rounded-xl bg-white border-2 border-pink-200 flex items-center justify-center overflow-hidden text-pink-500 flex-shrink-0 shadow-sm transition-colors hover:border-pink-400"
              >
                {logo ? (
                  <img src={logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
                ) : (
                  <Flower2 size={22} />
                )}
              </button>
              {/* Nama toko adalah yang PERTAMA dikorbankan saat ruang menyempit —
                  logonya sudah cukup sebagai penanda. Teks kepala kelompok tidak
                  boleh ikut menyusut; itu justru masalah yang sedang diperbaiki. */}
              <span className="hidden lg:block min-w-0 max-w-40 truncate text-sm font-black text-rose-950 leading-tight">
                {brand}
              </span>

              <nav aria-label="Navigasi utama" className="flex min-w-0 items-center gap-0.5 ml-1">
                {bolehLihat(MENU_DASHBOARD.syarat, user?.role) && (
                  <Link
                    href={MENU_DASHBOARD.href}
                    onClick={tutupKelompok}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                      menuAktif(MENU_DASHBOARD.href, pathname)
                        ? "bg-pink-600 text-white shadow-md shadow-pink-200"
                        : "text-rose-900 hover:bg-pink-50 hover:text-pink-700"
                    }`}
                  >
                    <MENU_DASHBOARD.Ikon size={18} />
                    {MENU_DASHBOARD.label}
                  </Link>
                )}

                {kelompokTampil.map((kelompok) => (
                  <KelompokHeaderDesktop
                    key={kelompok.id}
                    kelompok={kelompok}
                    pathname={pathname}
                    terbuka={kelompokTerbuka === kelompok.id}
                    onBuka={() => bukaKelompok(kelompok.id)}
                    onTutup={tutupKelompok}
                    onTutupTertunda={tutupKelompokTertunda}
                    onBatalTutup={batalTutupKelompok}
                  />
                ))}
              </nav>

              <div className="ml-auto flex flex-shrink-0 items-center gap-2 pl-2">
                {bolehLihat(MENU_KASIR.syarat, user?.role) && (
                  <Link
                    href={MENU_KASIR.href}
                    aria-label={MENU_KASIR.label}
                    title={MENU_KASIR.label}
                    className={`flex h-11 items-center gap-2 rounded-xl border px-3 font-bold transition-colors ${
                      menuAktif(MENU_KASIR.href, pathname)
                        ? "bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-200"
                        : "bg-pink-50 border-pink-100 text-pink-600 hover:bg-pink-100"
                    }`}
                  >
                    <ShoppingCart size={22} />
                    {/* Label menyusut jadi ikon saja sebelum apa pun yang lain di
                        navigasi dikorbankan — ikonnya sudah dikenal dari HP. */}
                    <span className="hidden xl:inline text-sm whitespace-nowrap">Kasir</span>
                  </Link>
                )}

                {!isGuest && (
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      aria-label="Notifikasi"
                      title="Notifikasi"
                      className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 flex items-center justify-center transition-colors hover:bg-pink-100"
                    >
                      <Bell
                        size={22}
                        className={unreadNotifications > 0 ? "animate-[lina-bell-ring_1.6s_ease-in-out_infinite]" : ""}
                      />
                    </button>
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white z-10">
                        {unreadNotifications}
                      </span>
                    )}
                  </div>
                )}

                <div ref={accountMenuDesktopRef} className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((current) => !current)}
                    title="Menu akun"
                    aria-label="Menu akun"
                    aria-haspopup="menu"
                    aria-expanded={isAccountMenuOpen}
                    className="flex items-center gap-2 rounded-xl p-0.5 pr-2 transition-colors hover:bg-pink-50"
                  >
                    <span className="w-10 h-10 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center overflow-hidden text-pink-500 flex-shrink-0 shadow-sm">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user?.fullName || user?.username || "Akun"} className="w-full h-full object-cover" />
                      ) : (
                        <UserRound size={22} />
                      )}
                    </span>
                    <span className="hidden xl:block min-w-0 max-w-36 text-left">
                      <span className="block text-xs font-bold leading-tight text-rose-950 truncate">{user?.fullName || user?.username || "Pengguna"}</span>
                      <span className="block text-[10px] text-pink-600 truncate">{user?.role}</span>
                    </span>
                    <ChevronDown size={16} className={`text-pink-500 transition-transform ${isAccountMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isAccountMenuOpen &&
                    renderMenuAkun(
                      "absolute top-full right-0 mt-2 w-60 rounded-xl border border-pink-100 bg-white p-2 text-slate-700 shadow-2xl z-[90]"
                    )}
                </div>
              </div>
            </header>


            {!isGuest && isNotifOpen &&
              <>
                <button
                  type="button"
                  aria-label="Tutup notifikasi"
                  onClick={() => setIsNotifOpen(false)}
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                />
                {renderNotificationPanel(
                  "fixed left-4 right-4 top-20 desktop:left-auto desktop:right-4 desktop:w-[340px] bg-white border border-pink-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                )}
              </>}

            {!isGuest && newOrderPopup && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                  <div className="bg-pink-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                        <ReceiptText size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-pink-100">
                          {newOrderPopup.statusPengiriman}
                        </p>
                        <h3 className="text-lg font-black">
                          {newOrderPopup.statusPengiriman === "Order Baru" ? "Pesanan masuk" : "Update orderan"}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-semibold leading-relaxed text-slate-600">{newOrderPopup.message}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      Dari {newOrderPopup.senderRole}
                      {newOrderPopup.senderName ? ` - ${newOrderPopup.senderName}` : ""}
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={closeNewOrderPopup}
                        className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm font-black text-pink-600 transition-colors hover:bg-pink-100"
                      >
                        Oke
                      </button>
                      <button
                        type="button"
                        onClick={openNewOrderSource}
                        className="rounded-2xl bg-pink-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-pink-200 transition-colors hover:bg-pink-700"
                      >
                        Lihat Orderan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MOBILE HEADER BAR: hamburger | logo + nama toko | keranjang | notifikasi.
                Foto profil & sapaan diganti identitas toko (samakan dengan halaman
                katalog), dan tombol Kasir/keranjang naik ke sini supaya bottom nav
                tidak terlalu padat. */}
            <div className="desktop:hidden fixed top-0 left-0 right-0 h-16 short:h-12 z-50 bg-white/95 border-b border-pink-100 backdrop-blur-md shadow-sm flex items-center px-3.5 short:px-2 gap-2.5 short:gap-1.5">
              <button
                onClick={openMobileMenu}
                className="p-2.5 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 flex-shrink-0"
              >
                <Menu size={26} />
              </button>

              {/* HANYA kotak logo yang bisa ditekan (membuka pratinjau/ganti logo
                  toko). Nama toko di sebelahnya sengaja teks biasa — kalau ikut
                  jadi tombol, area kosong header ikut tertekan. */}
              <button
                type="button"
                onClick={() => setIsStoreLogoPreviewOpen(true)}
                aria-label="Lihat logo toko"
                title="Lihat Logo Toko"
                className="w-11 h-11 rounded-xl bg-white border-2 border-pink-200 flex items-center justify-center overflow-hidden text-pink-500 flex-shrink-0 shadow-sm transition-colors hover:border-pink-400"
              >
                {logo ? (
                  <img src={logo} alt="Logo" className="w-full h-full object-contain p-0.5" />
                ) : (
                  <Flower2 size={22} />
                )}
              </button>
              <span className="flex-1 min-w-0 text-sm font-black text-rose-950 truncate leading-tight">{brand}</span>

              {!isGuest && (
                <Link
                  href="/pos"
                  aria-label="Kasir"
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors ${
                    pathname === "/pos"
                      ? "bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-200"
                      : "bg-pink-50 border-pink-100 text-pink-600"
                  }`}
                >
                  <ShoppingCart size={22} />
                </Link>
              )}

              {!isGuest && (
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 flex items-center justify-center"
                  >
                    <Bell size={22} className={unreadNotifications > 0 ? "animate-[lina-bell-ring_1.6s_ease-in-out_infinite]" : ""} />
                  </button>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white z-10">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* OVERLAY HITAM UNTUK MOBILE */}
            {isMobileMenuRendered && (
              <div
                className={`fixed inset-0 bg-black/60 z-[60] desktop:hidden backdrop-blur-sm transition-opacity duration-300 ease-out ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
                onClick={closeMobileMenu}
              />
            )}

            {/* LACI MENU — KHUSUS HP.
                Dulu berkelakuan ganda: laci geser di HP, sekaligus sidebar
                selebar 80px yang melebar saat disentuh kursor di desktop.
                Peran keduanya itulah yang membuat labelnya harus disembunyikan.
                Sejak ada header desktop, ia murni laci HP — `desktop:hidden`. */}
            <aside className={`
              desktop:hidden fixed inset-y-0 left-0 z-[70] w-72 flex flex-col bg-white/90 text-rose-950 p-4 shadow-xl border-r border-pink-100 backdrop-blur-md transition-transform duration-300 ease-in-out overflow-visible
              ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>

              {/* IDENTITAS PENGGUNA (dulu di bawah). Logo & nama toko sudah pindah
                  ke header depan, jadi posisi teratas ini diisi profil: foto, nama,
                  @username, dan label Role yang tetap dipertahankan. */}
              {/* `shrink-0` menjaga blok profil tetap utuh di puncak laci:
                  yang menggulung hanya daftar menunya, bukan identitas pengguna. */}
              <div className="shrink-0 flex items-start justify-between mb-6 short:mb-3 mt-2 short:mt-0">
                <div ref={accountMenuRef} className="relative flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((current) => !current)}
                    className="w-full flex items-center gap-3 min-w-0 text-left"
                    title="Menu akun"
                  >
                    <span className="w-12 h-12 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center overflow-hidden text-pink-500 flex-shrink-0 shadow-md shadow-pink-100">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user?.fullName || user?.username || "Akun"} className="w-full h-full object-cover" />
                      ) : (
                        <UserRound size={24} />
                      )}
                    </span>
                    <span className="min-w-0 block overflow-hidden">
                      <span className="block text-base font-bold leading-tight text-rose-950 truncate">{user?.fullName || user?.username || "Pengguna"}</span>
                      <span className="block text-[11px] text-pink-600 truncate">@{user?.username || "user"}</span>
                      <span className="text-[10px] text-pink-700 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded inline-block mt-1 font-medium tracking-wide">Role: {user?.role}</span>
                    </span>
                  </button>

                  {isAccountMenuOpen &&
                    renderMenuAkun(
                      "absolute top-full left-0 mt-2 w-60 rounded-xl border border-pink-100 bg-white p-2 text-slate-700 shadow-2xl z-[90]"
                    )}
                </div>

                {/* TOMBOL TUTUP LACI DI MOBILE */}
              <button
                  onClick={closeMobileMenu}
                  className="text-pink-500 hover:text-pink-700 p-1 flex-shrink-0"
                >
                  <X size={24} />
                </button>
              </div>

              {/* `min-h-0` WAJIB: flex item bawaannya `min-height: auto`, jadi ia
                  menolak menyusut di bawah tinggi kontennya dan `overflow-y-auto`
                  tidak pernah aktif — menunya terpotong, bukan bisa digulung.
                  Desktop dulu dipaksa `overflow-y-visible`, itu sebabnya menu
                  terpotong begitu daftarnya bertambah panjang. */}
              <nav className="lina-sidebar-nav flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden pr-1 short:gap-1">
                {/* Dua wujud, satu sumber. Saklarnya `LACI_HP_DIKELOMPOKKAN` di
                    `lib/menuNavigasi.ts` — percobaan yang masih ditimbang
                    pemilik, dan dibalikkan cukup dengan mengubah nilainya.

                    MATI  → urutan lama `URUTAN_LACI_HP`, persis seperti semula.
                    NYALA → judul kelompok, urutan mengikuti `KELOMPOK_MENU`. */}
                {LACI_HP_DIKELOMPOKKAN ? (
                  <>
                    {menuLuarKelompokHp.map((item) => (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        icon={<item.Ikon />}
                        label={item.label}
                        pathname={pathname}
                        onClick={closeMobileMenu}
                      />
                    ))}
                    {kelompokTampil.map((kelompok) => (
                      <div key={kelompok.id} className="flex flex-col gap-2 short:gap-1">
                        <span className="px-4 pt-3 short:pt-1.5 text-[11px] font-black uppercase tracking-widest text-pink-400">
                          {kelompok.label}
                        </span>
                        {kelompok.menu.map((item) => (
                          <NavItem
                            key={item.href}
                            href={item.href}
                            icon={<item.Ikon />}
                            label={item.label}
                            pathname={pathname}
                            onClick={closeMobileMenu}
                          />
                        ))}
                      </div>
                    ))}
                  </>
                ) : (
                  menuLaciHp.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      icon={<item.Ikon />}
                      label={item.label}
                      pathname={pathname}
                      onClick={closeMobileMenu}
                    />
                  ))
                )}

                {/* Hanya pada mode urutan lama. Saat berkelompok, Manajemen Akun
                    sudah berada di dalam kelompok Sistem — merendernya lagi di
                    sini akan menampilkannya dua kali. */}
                {!LACI_HP_DIKELOMPOKKAN && bolehLihat(MENU_AKUN_LACI_HP.syarat, user?.role) && (
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <NavItem
                      href={MENU_AKUN_LACI_HP.href}
                      icon={<MENU_AKUN_LACI_HP.Ikon />}
                      label={MENU_AKUN_LACI_HP.label}
                      pathname={pathname}
                      onClick={closeMobileMenu}
                    />
                  </div>
                )}
              </nav>

              {/* Identitas akun sudah pindah ke bagian atas sidebar. */}
            </aside>

            {/* KONTEN UTAMA */}
            <main className="lina-app-content flex-1 overflow-y-auto p-4 desktop:p-8 short:p-2 pt-16 desktop:pt-8 short:pt-14 pb-20 desktop:pb-8 short:pb-14">
              {children}
            </main>

            {/* BOTTOM NAV - Mobile Only */}
            {!isGuest && user && (
              <nav className="desktop:hidden fixed bottom-0 left-0 right-0 h-16 short:h-12 z-40 bg-white/95 border-t border-pink-100 backdrop-blur-md shadow-[0_-4px_20px_rgba(219,39,119,0.1)]">
                <div className="flex h-full">
                  {/* Kasir/keranjang sudah pindah ke header atas. Riwayat Penjualan
                      tetap ada di sidebar. */}
                  <BottomNavItem href="/dashboard" icon={<House size={20} />} label="Dashboard" pathname={pathname} />
                  <BottomNavItem href="/produk" icon={<Package size={20} />} label="Produk" pathname={pathname} />
                  <BottomNavItem href="/status-pesanan" icon={<ClipboardCheck size={20} />} label="Pesanan" pathname={pathname} />
                  <BottomNavItem href="/packing" icon={<PackageCheck size={20} />} label="Checklist" pathname={pathname} />
                  <BottomNavItem href="/unduh-nota" icon={<FileDown size={20} />} label="Nota" pathname={pathname} />
                </div>
              </nav>
            )}

          </div>
        )}
        {isProfilePreviewOpen && user?.profilePhoto && (
          <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsProfilePreviewOpen(false)}>
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 truncate pr-4">{user.fullName || user.username || "Foto profile"}</h3>
                <button
                  type="button"
                  onClick={() => setIsProfilePreviewOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 bg-slate-50">
                <img src={user.profilePhoto} alt={user.fullName || user.username || "Foto profile"} className="w-full max-h-[70vh] object-contain rounded-xl bg-white border border-slate-100" />
              </div>
            </div>
          </div>
        )}
        {isStoreLogoPreviewOpen && (
          <StoreLogoPreview
            logo={logo}
            canEdit={user?.role === "Owner"}
            isSaving={isSavingStoreLogo}
            fileInputRef={fileInputRef}
            onFileChange={handleLogoChange}
            onClose={() => setIsStoreLogoPreviewOpen(false)}
          />
        )}
        {storeLogoEditorSource && (
          <StoreLogoEditor
            source={storeLogoEditorSource}
            isSaving={isSavingStoreLogo}
            onCancel={() => setStoreLogoEditorSource(null)}
            onApply={saveStoreLogo}
          />
        )}
      </body>
    </html>
  );
}

// Komponen NavItem dimodifikasi untuk menerima fungsi onClick (Tutup menu mobile)
// Satu kepala kelompok di header desktop beserta tarikan-bawahnya.
//
// Keadaan buka/tutup TIDAK disimpan di sini melainkan diangkat ke induk: hanya
// satu tarikan-bawah boleh terbuka pada satu waktu, dan itu mustahil dijamin
// bila tiap kelompok memegang keadaannya sendiri.
function KelompokHeaderDesktop({
  kelompok,
  pathname,
  terbuka,
  onBuka,
  onTutup,
  onTutupTertunda,
  onBatalTutup,
}: {
  kelompok: KelompokMenu;
  pathname: string;
  terbuka: boolean;
  onBuka: () => void;
  onTutup: () => void;
  onTutupTertunda: () => void;
  onBatalTutup: () => void;
}) {
  // Penanda naik ke kepala kelompok: tanpa ini, pengguna kehilangan jejak
  // posisinya begitu tarikan-bawah tertutup.
  const aktif = kelompokAktif(kelompok, pathname);

  return (
    <div
      className="relative"
      onMouseEnter={onBuka}
      onMouseLeave={onTutupTertunda}
      // `onFocus` menggelembung dari tombol MAUPUN tautan di dalamnya, jadi
      // tarikan-bawah tetap terbuka selama pengguna menyusurinya dengan Tab.
      onFocus={onBuka}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={terbuka}
        // Klik/sentuh ikut membuka: pada perangkat tanpa kursor, `mouseenter`
        // tidak pernah terjadi dan menunya mustahil dibuka tanpa ini.
        onClick={() => (terbuka ? onTutup() : onBuka())}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
          aktif
            ? "bg-pink-600 text-white shadow-md shadow-pink-200"
            : "text-rose-900 hover:bg-pink-50 hover:text-pink-700"
        }`}
      >
        {kelompok.label}
        <ChevronDown size={15} className={`transition-transform duration-200 ${terbuka ? "rotate-180" : ""}`} />
      </button>

      {terbuka && (
        <div
          role="menu"
          onMouseEnter={onBatalTutup}
          onMouseLeave={onTutupTertunda}
          className="absolute left-0 top-full mt-1.5 w-64 rounded-xl border border-pink-100 bg-white p-2 shadow-2xl z-[90]"
        >
          {kelompok.menu.map((item) => {
            const itemAktif = menuAktif(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={onTutup}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
                  itemAktif
                    ? "bg-pink-600 text-white shadow-sm"
                    : "text-rose-900 hover:bg-pink-50 hover:text-pink-700"
                }`}
              >
                <span className="flex-shrink-0">
                  <item.Ikon size={18} />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Baris menu di laci HP. Kelas `desktop:*` yang dulu menyembunyikan labelnya
// sudah dibuang: laci ini tidak pernah tampil di desktop lagi, jadi label boleh
// terbaca apa adanya.
function NavItem({ href, icon, label, pathname, onClick }: { href: string, icon: React.ReactNode, label: string, pathname: string, onClick?: () => void }) {
  const isActive = menuAktif(href, pathname);
  return (
    <Link
      href={href}
      onClick={onClick}
      title={label}
      className={`flex items-center gap-3 short:gap-2 px-4 py-3.5 short:py-2.5 rounded-xl transition-all duration-200 font-bold tracking-wide overflow-hidden ${isActive ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 transform scale-[1.02]' : 'text-rose-900 hover:bg-pink-50 hover:text-pink-700'}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      {/* `text-ellipsis` supaya label yang kelewat panjang berakhir dengan "…"
          — terbaca sebagai disengaja, bukan seperti tampilan yang rusak. */}
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
        {label}
      </span>
    </Link>
  );
}

function BottomNavItem({ href, icon, label, pathname }: { href: string, icon: React.ReactNode, label: string, pathname: string }) {
  const isActive = menuAktif(href, pathname);
  return (
    <Link
      href={href}
      className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive ? 'text-pink-600' : 'text-slate-400 hover:text-pink-400'}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={`text-[9px] font-bold leading-none ${isActive ? 'text-pink-600' : ''}`}>{label}</span>
    </Link>
  );
}

function StoreLogoPreview({
  logo,
  canEdit,
  isSaving,
  fileInputRef,
  onFileChange,
  onClose,
}: {
  logo: string | null;
  canEdit: boolean;
  isSaving: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="store-logo-preview-card w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="p-4 border-b border-pink-100 bg-pink-50 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 truncate">Logo Toko</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {canEdit ? "Lihat logo lebih jelas atau ganti logo toko." : "Lihat logo toko lebih jelas."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 bg-pink-50/60">
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-pink-100 bg-white p-6">
            {logo ? (
              <img src={logo} alt="Logo toko" className="store-logo-preview-image max-h-[58vh] w-full object-contain" />
            ) : (
              <div className="store-logo-preview-image flex flex-col items-center gap-3 text-pink-400">
                <Flower2 size={88} />
                <p className="text-sm font-bold text-pink-500">Belum ada logo toko</p>
              </div>
            )}
          </div>
          {canEdit && (
            <div className="mt-4 flex justify-end">
              <input
                ref={fileInputRef}
                type="file"
                onChange={onFileChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-pink-200 transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera size={17} /> {isSaving ? "Menyimpan..." : "Ganti Logo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StoreLogoEditor({
  source,
  isSaving,
  onCancel,
  onApply,
}: {
  source: string;
  isSaving: boolean;
  onCancel: () => void;
  onApply: (editedLogo: string) => void;
}) {
  const cropSize = 280;
  const outputSize = 512;
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: cropSize, height: cropSize });
  const [dragStart, setDragStart] = useState<{ pointerX: number; pointerY: number; offsetX: number; offsetY: number } | null>(null);

  const clampZoom = (value: number) => Math.min(3, Math.max(1, value));

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    const nextSize =
      aspectRatio >= 1
        ? { width: cropSize * aspectRatio, height: cropSize }
        : { width: cropSize, height: cropSize / aspectRatio };

    setImageSize(nextSize);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({ pointerX: event.clientX, pointerY: event.clientY, offsetX: offset.x, offsetY: offset.y });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setOffset({
      x: dragStart.offsetX + event.clientX - dragStart.pointerX,
      y: dragStart.offsetY + event.clientY - dragStart.pointerY,
    });
  };

  const handlePointerEnd = () => setDragStart(null);

  const shiftOffset = (x: number, y: number) => {
    setOffset((current) => ({ x: current.x + x, y: current.y + y }));
  };

  const handleApply = () => {
    const image = imageRef.current;
    if (!image || isSaving) return;

    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, outputSize, outputSize);

    const scale = outputSize / cropSize;
    const drawnWidth = imageSize.width * zoom * scale;
    const drawnHeight = imageSize.height * zoom * scale;
    const drawnX = (cropSize / 2 - (imageSize.width * zoom) / 2 + offset.x) * scale;
    const drawnY = (cropSize / 2 - (imageSize.height * zoom) / 2 + offset.y) * scale;

    context.drawImage(image, drawnX, drawnY, drawnWidth, drawnHeight);
    onApply(canvas.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-pink-100 bg-pink-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Atur Logo Toko</h3>
            <p className="text-xs text-slate-500 mt-0.5">Geser logo dan atur zoom sebelum disimpan.</p>
          </div>
          <button type="button" onClick={onCancel} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex justify-center">
            <div
              className="relative rounded-2xl overflow-hidden bg-pink-50 border-4 border-white shadow-inner ring-1 ring-pink-100 touch-none cursor-move"
              style={{ width: cropSize, height: cropSize }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            >
              <img
                ref={imageRef}
                src={source}
                alt="Logo toko yang sedang diatur"
                draggable={false}
                onLoad={handleImageLoad}
                className="absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  width: imageSize.width,
                  height: imageSize.height,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-4 ring-white/70" />
            </div>
          </div>

          <div className="rounded-xl border border-pink-100 bg-pink-50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-700">Posisi Logo</p>
              <div className="grid grid-cols-3 gap-1">
                <span />
                <button type="button" title="Geser ke atas" onClick={() => shiftOffset(0, -12)} className="p-2 rounded-lg bg-white text-slate-500 hover:text-pink-600 border border-pink-100">
                  <ArrowUp size={16} />
                </button>
                <span />
                <button type="button" title="Geser ke kiri" onClick={() => shiftOffset(-12, 0)} className="p-2 rounded-lg bg-white text-slate-500 hover:text-pink-600 border border-pink-100">
                  <ArrowLeft size={16} />
                </button>
                <button type="button" title="Geser ke bawah" onClick={() => shiftOffset(0, 12)} className="p-2 rounded-lg bg-white text-slate-500 hover:text-pink-600 border border-pink-100">
                  <ArrowDown size={16} />
                </button>
                <button type="button" title="Geser ke kanan" onClick={() => shiftOffset(12, 0)} className="p-2 rounded-lg bg-white text-slate-500 hover:text-pink-600 border border-pink-100">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Minus size={16} className="text-slate-400" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(clampZoom(Number(event.target.value)))}
                className="w-full accent-pink-600"
              />
              <ZoomIn size={18} className="text-pink-500" />
            </div>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-pink-600"
            >
              <RotateCcw size={14} /> Reset posisi
            </button>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold transition-colors shadow-md shadow-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Pakai Logo Ini"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
