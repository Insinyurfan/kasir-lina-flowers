"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Inter } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";
import Link from "next/link";
import { clearSavedUserSession, getSavedUserSession } from "@/lib/userSession";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  History,
  House,
  Package,
  ShoppingCart,
  ReceiptText,
  LineChart,
  Flower2,
  Camera,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  ClipboardList,
  ClipboardCheck,
  Eye,
  Minus,
  RotateCcw,
  Settings,
  UserRound,
  Trash2,
  ZoomIn
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });
const NOTIFICATION_POLL_INTERVAL = 5000;
const NOTIFICATION_FETCH_TIMEOUT = 8000;
const NOTIFICATION_MAX_BACKOFF = 60000;
const DISMISSED_NOTIFICATION_POPUPS_KEY = "lina_dismissed_notification_popups";
const POPUP_NOTIFICATION_STATUSES = new Set(["Order Baru", "Request Pesanan", "Siap Kirim", "Siap Dikirim"]);
const PUBLIC_ROUTES = ["/", "/login"];

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const readQueuedIdsRef = useRef<Set<number>>(new Set());
  const visibleNotificationReadIdsRef = useRef<Set<number>>(new Set());
  const mobileMenuTimerRef = useRef<number | null>(null);
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
    fetch("/api/pengaturan")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.logo) setLogo(data.logo);
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
      fetch("/api/pengaturan", { cache: "no-store" })
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
    };
  }, []);

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

    const handleClickOutside = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
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

  useEffect(() => {
    if (!user?.role || user.role === "Tamu") return;

    const role = user.role;
    const fetchLatest = (force = false) => fetchNotificationsForRole(role, force);
    const timeoutId = window.setTimeout(fetchLatest, 0);
    const intervalId = window.setInterval(fetchLatest, NOTIFICATION_POLL_INTERVAL);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [fetchNotificationsForRole, user?.role]);

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
    const targetUrl = newOrderPopup.transactionId
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
          <div className="lina-app-shell flex h-screen flex-col md:flex-row overflow-hidden relative w-full">
            {!isGuest && <div className="hidden md:block fixed top-4 right-4 z-50">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`group relative h-11 rounded-xl bg-white text-pink-600 border border-pink-100 shadow-lg shadow-pink-100 flex items-center justify-center gap-2 font-bold overflow-hidden transition-all duration-300 ease-out md:bg-pink-50 md:shadow-sm md:hover:w-36 md:hover:px-4 ${
                    isNotifOpen ? "w-36 px-4" : "w-11 px-0"
                  }`}
                >
                  <Bell
                    size={20}
                    className={`shrink-0 origin-top transition-transform duration-300 ${
                      isNotifOpen || unreadNotifications > 0
                        ? "animate-[lina-bell-ring_1.6s_ease-in-out_infinite]"
                        : "md:group-hover:animate-[lina-bell-ring_1.6s_ease-in-out_infinite]"
                    }`}
                  />
                  <span
                    className={`text-sm whitespace-nowrap transition-all duration-300 ${
                      isNotifOpen
                        ? "opacity-100 max-w-24 translate-x-0"
                        : "opacity-0 max-w-0 translate-x-2 md:group-hover:opacity-100 md:group-hover:max-w-24 md:group-hover:translate-x-0"
                    }`}
                  >
                    Notifikasi
                  </span>
                </button>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md ring-2 ring-white z-10">
                    {unreadNotifications}
                  </span>
                )}
              </div>
            </div>}

            {!isGuest && isNotifOpen &&
              <>
                <button
                  type="button"
                  aria-label="Tutup notifikasi"
                  onClick={() => setIsNotifOpen(false)}
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                />
                {renderNotificationPanel(
                  "fixed left-4 right-4 top-20 md:left-auto md:right-4 md:w-[340px] bg-white border border-pink-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
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

            {/* MOBILE HEADER BAR: hamburger | profil + sapaan | notifikasi */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 bg-white/95 border-b border-pink-100 backdrop-blur-md shadow-sm flex items-center px-3 gap-2">
              <button
                onClick={openMobileMenu}
                className="p-2 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 flex-shrink-0"
              >
                <Menu size={22} />
              </button>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-pink-50 border-2 border-pink-200 flex items-center justify-center overflow-hidden text-pink-400 flex-shrink-0">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserRound size={16} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-400 font-medium leading-none">Selamat datang,</p>
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">{user?.fullName || user?.username || "Pengguna"}</p>
                </div>
              </div>

              {!isGuest && (
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 flex items-center justify-center"
                  >
                    <Bell size={18} className={unreadNotifications > 0 ? "animate-[lina-bell-ring_1.6s_ease-in-out_infinite]" : ""} />
                  </button>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white z-10">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* OVERLAY HITAM UNTUK MOBILE */}
            {isMobileMenuRendered && (
              <div
                className={`fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm transition-opacity duration-300 ease-out ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
                onClick={closeMobileMenu}
              />
            )}

            {/* SIDEBAR */}
            <aside className={`
              group/sidebar fixed md:static inset-y-0 left-0 z-[70] w-72 md:w-20 md:hover:w-64 flex flex-col bg-white/90 text-rose-950 p-4 shadow-xl md:shadow-[14px_0_40px_rgba(219,39,119,0.10)] border-r border-pink-100 backdrop-blur-md transition-[width,transform] duration-300 ease-in-out overflow-visible
              ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>

              <div className="flex items-start justify-between mb-8 mt-2 md:px-0">
                <div className="flex items-center gap-3 min-w-0 md:w-full md:justify-center md:group-hover/sidebar:justify-start">
                  {/* LOGO DENGAN BACKGROUND PUTIH AGAR PNG TRANSPARAN TERLIHAT JELAS */}
                  <button
                    type="button"
                    onClick={() => setIsStoreLogoPreviewOpen(true)}
                    className="group relative w-12 h-12 flex-shrink-0 bg-white border-2 border-pink-200 rounded-xl flex items-center justify-center overflow-hidden transition-all shadow-md shadow-pink-100 cursor-pointer hover:border-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
                    title="Lihat Logo Toko"
                  >
                    {logo ? (
                      <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Flower2 size={24} className="text-pink-500" />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-pink-950/45 opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Eye size={18} className="scale-50 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100" />
                    </span>
                  </button>
                  <div className="min-w-0 overflow-hidden transition-all duration-300 md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-40 md:group-hover/sidebar:opacity-100">
                    <h1 className="text-lg font-bold tracking-wider leading-tight text-rose-950">Lina Flowers</h1>
                    <p className="text-[10px] text-pink-700 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded inline-block mt-1 font-medium tracking-wide">Role: {user?.role}</p>
                  </div>
                </div>

                {/* TOMBOL TUTUP SIDEBAR DI MOBILE */}
              <button
                  onClick={closeMobileMenu}
                  className="md:hidden text-pink-500 hover:text-pink-700 p-1"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-1 overflow-y-auto md:overflow-y-visible overflow-x-hidden md:overflow-x-visible pr-1 md:pr-0">
                {!isGuest && <NavItem href="/dashboard" icon={<House />} label="Dashboard" pathname={pathname} onClick={closeMobileMenu} />}
                {!isGuest && <NavItem href="/pos" icon={<ShoppingCart />} label="Kasir (POS)" pathname={pathname} onClick={closeMobileMenu} />}
                <NavItem href="/produk" icon={<Package />} label="Data Produk" pathname={pathname} onClick={closeMobileMenu} />
                {!isGuest && <NavItem href="/status-pesanan" icon={<ClipboardCheck />} label="Status Pesanan" pathname={pathname} onClick={closeMobileMenu} />}
                {!isGuest && <NavItem href="/penjualan" icon={<ReceiptHistoryIcon />} label="Riwayat Penjualan" pathname={pathname} onClick={closeMobileMenu} />}
                {!isGuest && <NavItem href="/laporan" icon={<LineChart />} label="Laporan" pathname={pathname} onClick={closeMobileMenu} />}
                {!isGuest && <NavItem href="/log-aktivitas" icon={<ClipboardList />} label="Log Aktivitas" pathname={pathname} onClick={closeMobileMenu} />}

                {user?.role === "Owner" && (
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <NavItem href="/akun" icon={<Users />} label="Manajemen Akun" pathname={pathname} onClick={closeMobileMenu} />
                  </div>
                )}
              </nav>

              <div ref={accountMenuRef} className="relative mt-6">
                {isAccountMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-3 w-60 rounded-xl border border-pink-100 bg-white p-2 text-slate-700 shadow-2xl z-[90]">
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
                )}

                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((current) => !current)}
                    className="w-full flex items-center md:justify-center md:group-hover/sidebar:justify-start gap-3 p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors duration-200 text-rose-950 border border-pink-100 shadow-inner shadow-pink-50"
                  title="Menu akun"
                >
                  <div className="w-11 h-11 rounded-full bg-white/95 border border-pink-200 flex items-center justify-center overflow-hidden text-pink-500 flex-shrink-0">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user?.fullName || user?.username || "Akun"} className="w-full h-full object-cover" />
                    ) : (
                      <UserRound size={22} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-left overflow-hidden transition-all duration-300 md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-40 md:group-hover/sidebar:opacity-100">
                    <p className="text-sm font-bold truncate">{user?.fullName || user?.username || "Akun"}</p>
                    <p className="text-[11px] text-pink-600 truncate">@{user?.username || "user"} - {user?.role}</p>
                  </div>
                </button>
              </div>
            </aside>

            {/* KONTEN UTAMA */}
            <main className="lina-app-content flex-1 overflow-y-auto p-4 md:p-8 pt-14 md:pt-8 pb-20 md:pb-8">
              {children}
            </main>

            {/* BOTTOM NAV - Mobile Only */}
            {!isGuest && user && (
              <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 z-40 bg-white/95 border-t border-pink-100 backdrop-blur-md shadow-[0_-4px_20px_rgba(219,39,119,0.1)]">
                <div className="flex h-full">
                  <BottomNavItem href="/dashboard" icon={<House size={20} />} label="Dashboard" pathname={pathname} />
                  <BottomNavItem href="/pos" icon={<ShoppingCart size={20} />} label="Kasir" pathname={pathname} />
                  <BottomNavItem href="/produk" icon={<Package size={20} />} label="Produk" pathname={pathname} />
                  <BottomNavItem href="/status-pesanan" icon={<ClipboardCheck size={20} />} label="Pesanan" pathname={pathname} />
                  <BottomNavItem href="/penjualan" icon={<ReceiptHistoryIcon />} label="Riwayat" pathname={pathname} />
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
function NavItem({ href, icon, label, pathname, onClick }: { href: string, icon: React.ReactNode, label: string, pathname: string, onClick?: () => void }) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      title={label}
      className={`flex items-center md:justify-center md:group-hover/sidebar:justify-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold tracking-wide overflow-hidden ${isActive ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 transform scale-[1.02]' : 'text-rose-900 hover:bg-pink-50 hover:text-pink-700'}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="whitespace-nowrap overflow-hidden transition-all duration-300 md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-44 md:group-hover/sidebar:opacity-100">
        {label}
      </span>
    </Link>
  );
}

function BottomNavItem({ href, icon, label, pathname }: { href: string, icon: React.ReactNode, label: string, pathname: string }) {
  const isActive = pathname === href;
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

function ReceiptHistoryIcon() {
  return (
    <span className="relative block w-6 h-6">
      <ReceiptText size={24} />
      <span className="absolute -right-1 -bottom-1 rounded-full bg-current text-pink-600">
        <History size={13} className="text-white" />
      </span>
    </span>
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
