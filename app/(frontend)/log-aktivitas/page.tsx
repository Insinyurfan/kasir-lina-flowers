"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Filter, RefreshCw, Search, Trash2 } from "lucide-react";
import { getSavedUserSession } from "@/lib/userSession";

type UserSession = {
  id: number;
  username: string;
  fullName?: string | null;
  role: string;
};

type ActivityLog = {
  id: number;
  action: string;
  entity: string;
  entityId?: string | null;
  title: string;
  description: string;
  actorId?: number | null;
  actorName?: string | null;
  actorRole?: string | null;
  createdAt: string;
};

const actionOptions = ["Semua", "TAMBAH", "UPDATE", "HAPUS", "KIRIM", "LOGIN"];
const entityOptions = ["Semua", "Produk", "Transaksi", "Akun", "Pengaturan", "Notifikasi"];

const actionTone: Record<string, string> = {
  TAMBAH: "bg-pink-100 text-pink-700 border-pink-200",
  UPDATE: "bg-rose-100 text-rose-700 border-rose-200",
  HAPUS: "bg-red-50 text-red-600 border-red-100",
  KIRIM: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  LOGIN: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function LogAktivitasPage() {
  const router = useRouter();
  const [user] = useState<UserSession | null>(() => getSavedUserSession<UserSession>());
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("Semua");
  const [entityFilter, setEntityFilter] = useState("Semua");
  const isOwner = user?.role === "Owner";

  const actorPayload = {
    actorId: user?.id,
    actorName: user?.fullName || user?.username,
    actorRole: user?.role,
  };

  useEffect(() => {
    const savedUser = getSavedUserSession<UserSession>();
    if (!savedUser) {
      router.push("/login");
      return;
    }

    if (savedUser.role === "Tamu") {
      router.push("/produk");
      return;
    }

  }, [router]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (actionFilter !== "Semua") params.set("action", actionFilter);
      if (entityFilter !== "Semua") params.set("entity", entityFilter);

      const res = await fetch(`/api/log-aktivitas?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, entityFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchLogs, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return logs;

    return logs.filter((log) =>
      [
        log.title,
        log.description,
        log.action,
        log.entity,
        log.entityId,
        log.actorName,
        log.actorRole,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [logs, search]);

  const allVisibleSelected =
    filteredLogs.length > 0 && filteredLogs.every((log) => selectedIds.includes(log.id));

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredLogs.map((log) => log.id) : []);
  };

  const toggleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((current) => (checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)));
  };

  const deleteLogs = async (deleteAll = false) => {
    if (!isOwner) return alert("Hanya Owner yang dapat menghapus Log Aktivitas.");
    if (!deleteAll && selectedIds.length === 0) return;

    const message = deleteAll
      ? "Hapus semua Log Aktivitas? Data log tidak bisa dikembalikan."
      : `Hapus ${selectedIds.length} Log Aktivitas yang dipilih?`;
    if (!confirm(message)) return;

    const res = await fetch("/api/log-aktivitas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deleteAll ? { deleteAll: true, ...actorPayload } : { ids: selectedIds, ...actorPayload }),
    });

    if (res.ok) fetchLogs();
    else {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Gagal menghapus Log Aktivitas.");
    }
  };

  return (
    <div className="lina-panel rounded-2xl p-6 min-h-[80vh] border text-slate-800">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="text-pink-500" /> Log Aktivitas
          </h2>
          <p className="text-slate-500 text-sm mt-1">Catatan otomatis untuk tambah data, update data, hapus data, login, dan notifikasi.</p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-100 bg-pink-50 px-4 py-2.5 text-sm font-bold text-pink-700 transition-colors hover:bg-pink-100"
        >
          <RefreshCw size={17} /> Muat Ulang
        </button>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari judul, pelaku, role, atau data..."
            className="w-full rounded-xl border border-pink-100 bg-pink-50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-pink-400"
          />
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-pink-100 bg-pink-50 px-3">
          <Filter size={16} className="text-pink-500" />
          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="h-[42px] min-w-0 flex-1 bg-transparent text-sm font-bold text-pink-700 outline-none"
          >
            {actionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <select
          value={entityFilter}
          onChange={(event) => setEntityFilter(event.target.value)}
          className="h-[42px] rounded-xl border border-pink-100 bg-pink-50 px-3 text-sm font-bold text-pink-700 outline-none focus:border-pink-400"
        >
          {entityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        {isOwner && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => deleteLogs(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={17} /> Hapus
            </button>
            <button
              type="button"
              onClick={() => deleteLogs(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              Semua
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="rounded-2xl border border-pink-100 bg-pink-50/40 py-10 text-center text-slate-400">Memuat log...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="rounded-2xl border border-pink-100 bg-pink-50/40 py-10 text-center text-slate-400">Belum ada log aktivitas.</div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-pink-100 bg-pink-50/60 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${actionTone[log.action] || actionTone.UPDATE}`}>
                    {log.action}
                  </span>
                  <h3 className="mt-3 font-black text-slate-800 leading-snug">{log.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{log.description}</p>
                </div>
                {isOwner && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(log.id)}
                    onChange={(event) => toggleSelectOne(log.id, event.target.checked)}
                    className="mt-1 h-4 w-4 accent-pink-600"
                  />
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white p-3">
                  <p className="font-bold uppercase text-slate-400">Pelaku</p>
                  <p className="mt-1 font-bold text-slate-700">{log.actorName || "Sistem"} - {log.actorRole || "Sistem"}</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="font-bold uppercase text-slate-400">Waktu</p>
                  <p className="mt-1 font-bold text-slate-700">{new Date(log.createdAt).toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-pink-100 md:block">
        <table className="w-full text-left">
          <thead className="bg-pink-50 text-pink-900 text-sm border-b border-pink-100">
            <tr>
              {isOwner && (
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) => toggleSelectAll(event.target.checked)}
                    className="h-4 w-4 accent-pink-600"
                  />
                </th>
              )}
              <th className="p-4 font-semibold">Aktivitas</th>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Pelaku</th>
              <th className="p-4 font-semibold">Waktu</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr><td colSpan={isOwner ? 5 : 4} className="py-10 text-center text-slate-400">Memuat log...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={isOwner ? 5 : 4} className="py-10 text-center text-slate-400">Belum ada log aktivitas.</td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-pink-50 hover:bg-pink-50/40 transition-colors">
                  {isOwner && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(log.id)}
                        onChange={(event) => toggleSelectOne(log.id, event.target.checked)}
                        className="h-4 w-4 accent-pink-600"
                      />
                    </td>
                  )}
                  <td className="p-4 align-top">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${actionTone[log.action] || actionTone.UPDATE}`}>
                      {log.action}
                    </span>
                    <p className="mt-2 font-black text-slate-800">{log.title}</p>
                    <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{log.description}</p>
                  </td>
                  <td className="p-4 align-top">
                    <p className="font-bold text-slate-700">{log.entity}</p>
                    <p className="mt-1 font-mono text-xs text-slate-400">{log.entityId ? `ID ${log.entityId}` : "-"}</p>
                  </td>
                  <td className="p-4 align-top">
                    <p className="font-bold text-slate-700">{log.actorName || "Sistem"}</p>
                    <p className="mt-1 text-xs font-semibold text-pink-600">{log.actorRole || "Sistem"}</p>
                  </td>
                  <td className="p-4 align-top whitespace-nowrap font-semibold text-slate-500">
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
