"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Camera, Edit, Eye, Minus, Plus, RotateCcw, Save, ShieldAlert, Trash2, UserRound, Users, X, ZoomIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSavedUserSession, updateSavedUserSession } from "@/lib/userSession";

type Account = {
  id: number;
  username: string;
  fullName: string;
  profilePhoto?: string | null;
  role: string;
};

type AccountForm = Account & {
  password: string;
  confirmPassword: string;
  oldPassword: string;
};

const emptyForm: AccountForm = {
  id: 0,
  username: "",
  fullName: "",
  profilePhoto: "",
  password: "",
  confirmPassword: "",
  oldPassword: "",
  role: "Admin",
};

const getSavedUser = () => {
  return getSavedUserSession<Account>();
};

export default function ManajemenAkunPage() {
  const [currentUser, setCurrentUser] = useState<Account | null>(() => getSavedUser());
  const [akunList, setAkunList] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AccountForm>(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<{ src: string; title: string } | null>(null);
  const [photoEditorSource, setPhotoEditorSource] = useState<string | null>(null);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openSelfEditRef = useRef(
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "me"
  );

  const mainOwnerId = useMemo(() => {
    const firstOwner = akunList.find((akun) => akun.role === "Owner");
    return firstOwner?.id ?? null;
  }, [akunList]);

  const visibleAccounts = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "Owner") return akunList;
    return akunList.filter((akun) => akun.id === currentUser.id);
  }, [akunList, currentUser]);

  const fetchAkun = useCallback(async () => {
    const res = await fetch("/api/akun", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as Account[];
      setAkunList(data);
      return data;
    }
    return [];
  }, []);

  const openAccountForm = useCallback((akun: Account) => {
    setIsEdit(true);
    setFormData({
      id: akun.id,
      username: akun.username,
      fullName: akun.fullName || akun.username,
      profilePhoto: akun.profilePhoto || "",
      password: "",
      confirmPassword: "",
      oldPassword: "",
      role: akun.role,
    });
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const timeoutId = window.setTimeout(() => fetchAkun().then((accounts) => {
      if (!openSelfEditRef.current) return;

      const ownAccount = accounts.find((akun) => akun.id === currentUser.id);
      if (ownAccount) {
        openAccountForm(ownAccount);
        openSelfEditRef.current = false;
      }
    }), 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentUser, fetchAkun, openAccountForm, router]);

  const canEditAccount = (akun: Account) => {
    if (!currentUser) return false;
    if (currentUser.id === akun.id) return true;
    if (currentUser.role !== "Owner") return false;
    return mainOwnerId !== akun.id;
  };

  const canDeleteAccount = (akun: Account) => {
    if (!currentUser || currentUser.role !== "Owner") return false;
    if (currentUser.id === akun.id) return false;
    return mainOwnerId !== akun.id;
  };

  const syncCurrentUser = (updatedAccount: Account) => {
    if (!currentUser || currentUser.id !== updatedAccount.id) return;

    const updatedUser = { ...currentUser, ...updatedAccount };
    setCurrentUser(updatedUser);
    updateSavedUserSession(updatedUser);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (akun: Account) => {
    if (!canEditAccount(akun)) {
      alert("Owner utama dengan ID terlama tidak bisa diubah oleh akun lain.");
      return;
    }

    openAccountForm(akun);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoEditorSource(reader.result as string);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const isChangingPassword = formData.password.trim() !== "";
    const isSelfEdit = isEdit && formData.id === currentUser.id;

    if (isChangingPassword) {
      if (formData.password !== formData.confirmPassword) {
        alert("Konfirmasi password baru tidak cocok. Periksa kembali.");
        return;
      }
      if (isSelfEdit && !formData.oldPassword.trim()) {
        alert("Password lama wajib diisi untuk mengubah password.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const method = isEdit ? "PATCH" : "POST";
      const payload = {
        id: formData.id,
        username: formData.username,
        fullName: formData.fullName,
        profilePhoto: formData.profilePhoto,
        password: formData.password,
        oldPassword: formData.oldPassword,
        role: currentUser.role === "Owner" ? formData.role : currentUser.role,
        actorId: currentUser.id,
      };

      const res = await fetch("/api/akun", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert(`Akun berhasil ${isEdit ? "diperbarui" : "ditambahkan"}!`);
        setIsModalOpen(false);
        syncCurrentUser(result);
        fetchAkun();
      } else {
        alert(result.error || "Gagal menyimpan akun.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHapus = async (akun: Account) => {
    if (!canDeleteAccount(akun)) {
      return alert("Akun ini tidak bisa dihapus demi keamanan.");
    }

    if (!confirm("Apakah Anda yakin ingin menghapus akun ini? Akun tidak bisa dikembalikan.")) return;

    try {
      const res = await fetch("/api/akun", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: akun.id, actorId: currentUser?.id }),
      });

      if (res.ok) {
        fetchAkun();
      } else {
        const result = await res.json();
        alert(result.error || "Gagal menghapus akun.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="lina-panel rounded-2xl p-6 min-h-[80vh] border text-slate-800">
      <style jsx global>{`
        @keyframes account-name-marquee {
          0%, 16% {
            transform: translateX(0);
          }
          84%, 100% {
            transform: translateX(calc(-1 * var(--marquee-distance, 0px)));
          }
        }

        .account-name-marquee {
          animation: account-name-marquee var(--marquee-duration, 10s) ease-in-out infinite alternate;
        }

        @media (min-width: 768px) {
          .account-name-marquee {
            animation: none;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-pink-500" /> Manajemen Akun
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {currentUser.role === "Owner"
              ? "Kelola data login Owner, Admin, dan Tamu."
              : "Kelola username, nama lengkap, foto profile, dan password akun Anda."}
          </p>
        </div>
        {currentUser.role === "Owner" && (
          <button onClick={handleOpenAdd} className="w-full justify-center bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-md shadow-pink-200 md:w-auto">
            <Plus size={18} /> Tambah Akun Baru
          </button>
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {visibleAccounts.length === 0 ? (
          <div className="rounded-2xl border border-pink-100 bg-pink-50/40 py-10 text-center text-slate-400">
            Belum ada data akun
          </div>
        ) : (
          visibleAccounts.map((akun) => (
            <div key={akun.id} className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <ProfilePhoto
                  account={akun}
                  sizeClass="w-16 h-16 shrink-0"
                  onPreview={() => akun.profilePhoto && setPhotoPreview({ src: akun.profilePhoto, title: akun.fullName || akun.username })}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 overflow-hidden">
                      <MarqueeText className="font-bold text-slate-800" text={akun.fullName || akun.username} />
                      <MarqueeText className="mt-0.5 text-sm font-semibold text-slate-500" text={`@${akun.username}`} />
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                      akun.role === "Owner" ? "bg-pink-100 text-pink-700" : akun.role === "Tamu" ? "bg-slate-100 text-slate-600" : "bg-rose-100 text-rose-700"
                    }`}>
                      {akun.role}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-500">ID #{akun.id}</span>
                    {currentUser.id === akun.id && <span className="rounded-full bg-pink-100 px-3 py-1 text-[11px] font-bold text-pink-600">Anda</span>}
                    {mainOwnerId === akun.id && <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">Owner Utama</span>}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Password</p>
                  <p className="mt-1 font-mono font-bold tracking-widest text-slate-600">********</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Akses</p>
                  <p className="mt-1 truncate font-bold text-slate-700">{akun.role}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenEdit(akun)}
                  disabled={!canEditAccount(akun)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-pink-50 px-3 py-2.5 text-sm font-bold text-pink-600 transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Edit Akun"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleHapus(akun)}
                  disabled={!canDeleteAccount(akun)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600 transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Hapus Akun"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-pink-100 md:block">
        <table className="w-full text-left">
          <thead className="bg-pink-50 text-pink-900 text-sm border-b border-pink-100">
            <tr>
              <th className="p-4 font-semibold w-16 text-center">ID</th>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Nama Lengkap</th>
              <th className="p-4 font-semibold">Foto Profile</th>
              <th className="p-4 font-semibold">Password</th>
              <th className="p-4 font-semibold">Hak Akses (Role)</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {visibleAccounts.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-slate-400">Belum ada data akun</td></tr>
            ) : (
              visibleAccounts.map((akun) => (
                <tr key={akun.id} className="border-b border-pink-50 hover:bg-pink-50/40 transition-colors">
                  <td className="p-4 text-center text-slate-400 font-mono">#{akun.id}</td>
                  <td className="p-4 font-bold text-slate-700">
                    <div className="flex items-center gap-2">
                      {akun.username}
                      {currentUser.id === akun.id && <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">Anda</span>}
                      {mainOwnerId === akun.id && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Owner Utama</span>}
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{akun.fullName || akun.username}</td>
                  <td className="p-4">
                    <ProfilePhoto
                      account={akun}
                      sizeClass="w-11 h-11"
                      onPreview={() => akun.profilePhoto && setPhotoPreview({ src: akun.profilePhoto, title: akun.fullName || akun.username })}
                    />
                  </td>
                  <td className="p-4 font-mono text-slate-500 tracking-widest">********</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      akun.role === "Owner" ? "bg-pink-100 text-pink-700" : akun.role === "Tamu" ? "bg-slate-100 text-slate-600" : "bg-rose-100 text-rose-700"
                    }`}>
                      {akun.role}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(akun)}
                        disabled={!canEditAccount(akun)}
                        className="p-2 text-pink-500 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Edit Akun"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleHapus(akun)}
                        disabled={!canDeleteAccount(akun)}
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Hapus Akun"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="lina-panel-header p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">{isEdit ? "Edit Akun" : "Tambah Akun Baru"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSimpan} className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-2xl border border-pink-100 bg-pink-50 overflow-hidden flex items-center justify-center text-pink-400 group"
                  title="Ganti foto profile"
                >
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} alt="Foto profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserRound size={34} />
                  )}
                  <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera size={20} className="text-white" />
                  </span>
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700">Foto Profile</p>
                  <p className="text-xs text-slate-500 mt-1">Klik foto untuk memilih gambar akun.</p>
                  {formData.profilePhoto && (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPhotoPreview({ src: formData.profilePhoto || "", title: formData.fullName || formData.username || "Foto profile" })}
                        className="text-xs font-bold text-pink-600"
                      >
                        Lihat Foto
                      </button>
                      <button type="button" onClick={() => setFormData({ ...formData, profilePhoto: "" })} className="text-xs font-bold text-red-500">
                        Hapus Foto
                      </button>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                  placeholder="Contoh: sarahkasir"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-pink-500 text-sm font-medium"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Contoh: Sarah Amelia"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-pink-500 text-sm font-medium"
                  autoComplete="name"
                />
              </div>

              {isEdit ? (
                <>
                  {formData.id === currentUser.id && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Password Lama</label>
                      <input
                        type="password"
                        value={formData.oldPassword}
                        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                        placeholder="Masukkan password lama..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-pink-500 text-sm font-medium"
                        autoComplete="current-password"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Password Baru <span className="text-pink-500 font-normal">(Kosongkan jika tidak ingin mengubah)</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value, confirmPassword: "" })}
                      placeholder="Ketik password baru..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-pink-500 text-sm font-medium"
                      autoComplete="new-password"
                    />
                  </div>
                  {formData.password && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Ulangi password baru..."
                        className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:border-pink-500 text-sm font-medium ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200"
                        }`}
                        autoComplete="new-password"
                      />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1 font-medium">Password tidak cocok.</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value, confirmPassword: "" })}
                      placeholder="Masukkan password..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-pink-500 text-sm font-medium"
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Konfirmasi Password</label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Ulangi password..."
                      className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:border-pink-500 text-sm font-medium ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200"
                      }`}
                      autoComplete="new-password"
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 font-medium">Password tidak cocok.</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hak Akses (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={currentUser.role !== "Owner" || (mainOwnerId === formData.id && isEdit)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-pink-500 text-sm font-bold bg-white disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="Admin">Admin</option>
                  <option value="Owner">Owner</option>
                  <option value="Tamu">Tamu</option>
                </select>
                {formData.role === "Owner" && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <ShieldAlert size={12} /> Role Owner dapat mengakses seluruh sistem.
                  </p>
                )}
                {mainOwnerId === formData.id && isEdit && (
                  <p className="text-[10px] text-amber-600 mt-1 font-medium">Owner utama dengan ID terlama dilindungi demi keamanan.</p>
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors text-slate-600 text-sm">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2 shadow-md shadow-pink-200 text-sm disabled:opacity-50">
                  <Save size={18} /> {isLoading ? "Menyimpan..." : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {photoEditorSource && (
        <ProfilePhotoEditor
          source={photoEditorSource}
          onCancel={() => setPhotoEditorSource(null)}
          onApply={(editedPhoto) => {
            setFormData((current) => ({ ...current, profilePhoto: editedPhoto }));
            setPhotoEditorSource(null);
          }}
        />
      )}

      {photoPreview && (
        <PhotoLightbox
          src={photoPreview.src}
          title={photoPreview.title}
          onClose={() => setPhotoPreview(null)}
        />
      )}
    </div>
  );
}

function ProfilePhoto({ account, sizeClass, onPreview }: { account: Account; sizeClass: string; onPreview?: () => void }) {
  return (
    <button
      type="button"
      onClick={account.profilePhoto ? onPreview : undefined}
      disabled={!account.profilePhoto}
      className={`${sizeClass} group relative rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center overflow-hidden text-pink-400 disabled:cursor-default`}
      title={account.profilePhoto ? "Lihat foto profile" : "Belum ada foto profile"}
    >
      {account.profilePhoto ? (
        <img src={account.profilePhoto} alt={account.fullName || account.username} className="w-full h-full object-cover" />
      ) : (
        <UserRound size={18} />
      )}
      {account.profilePhoto && (
        <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Eye size={16} className="text-white" />
        </span>
      )}
    </button>
  );
}

function MarqueeText({ text, className = "" }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const textElement = textRef.current;
      if (!container || !textElement) return;

      setOverflowDistance(Math.max(0, textElement.scrollWidth - container.clientWidth));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <span
        ref={textRef}
        className={`${overflowDistance > 0 ? "account-name-marquee" : ""} block w-max max-w-none whitespace-nowrap pr-2`}
        style={
          overflowDistance > 0
            ? ({
                "--marquee-distance": `${overflowDistance}px`,
                "--marquee-duration": `${Math.max(8, Math.min(16, overflowDistance / 8))}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {text}
      </span>
    </div>
  );
}

function ProfilePhotoEditor({
  source,
  onCancel,
  onApply,
}: {
  source: string;
  onCancel: () => void;
  onApply: (editedPhoto: string) => void;
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
    if (!image) return;

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
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Atur Foto Profile</h3>
            <p className="text-xs text-slate-500 mt-0.5">Geser foto dan atur zoom sebelum disimpan.</p>
          </div>
          <button type="button" onClick={onCancel} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex justify-center">
            <div
              className="relative rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-inner ring-1 ring-pink-100 touch-none cursor-move"
              style={{ width: cropSize, height: cropSize }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            >
              <img
                ref={imageRef}
                src={source}
                alt="Foto profile yang sedang diatur"
                draggable={false}
                onLoad={handleImageLoad}
                className="absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  width: imageSize.width,
                  height: imageSize.height,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-white/70" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-700">Posisi Foto</p>
              <div className="grid grid-cols-3 gap-1">
                <span />
                <button type="button" title="Geser ke atas" onClick={() => shiftOffset(0, -12)} className="p-2 rounded-lg bg-white text-slate-500 hover:text-pink-600 border border-slate-100">
                  <ArrowUp size={16} />
                </button>
                <span />
                <button type="button" title="Geser ke kiri" onClick={() => shiftOffset(-12, 0)} className="p-2 rounded-lg bg-white text-slate-500 hover:text-pink-600 border border-slate-100">
                  <ArrowLeft size={16} />
                </button>
                <button type="button" title="Geser ke bawah" onClick={() => shiftOffset(0, 12)} className="p-2 rounded-lg bg-white text-slate-500 hover:text-pink-600 border border-slate-100">
                  <ArrowDown size={16} />
                </button>
                <button type="button" title="Geser ke kanan" onClick={() => shiftOffset(12, 0)} className="p-2 rounded-lg bg-white text-slate-500 hover:text-pink-600 border border-slate-100">
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
            <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors">
              Batal
            </button>
            <button type="button" onClick={handleApply} className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold transition-colors shadow-md shadow-pink-200">
              Pakai Foto Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoLightbox({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 truncate pr-4">{title}</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 bg-slate-50">
          <img src={src} alt={title} className="w-full max-h-[70vh] object-contain rounded-xl bg-white border border-slate-100" />
        </div>
      </div>
    </div>
  );
}
