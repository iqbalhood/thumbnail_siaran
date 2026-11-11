'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { UserDialogPermission, extractUserPermissions } from '@/lib/auth/permissions';
import { SUPER_ADMIN_EMAILS } from '@/lib/auth/admin';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Edit3, 
  Trash2, 
  Check, 
  AlertCircle, 
  Search, 
  Sparkles, 
  Loader2, 
  Mic2, 
  Mail, 
  User, 
  CheckSquare, 
  Square,
  Info
} from 'lucide-react';

interface UserManagementProps {
  branding: any;
  dialogs: any[];
  currentUser: any;
  adminEmails?: string[];
  onUpdated?: (updatedPermissions: UserDialogPermission[]) => void;
}

export function UserManagement({
  branding,
  dialogs,
  currentUser,
  adminEmails = [],
  onUpdated,
}: UserManagementProps) {
  const [permissions, setPermissions] = useState<UserDialogPermission[]>(() =>
    extractUserPermissions(branding)
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    email: string;
    name: string;
    allowAll: boolean;
    allowedDialogIds: string[];
    note: string;
  }>({
    email: '',
    name: '',
    allowAll: false,
    allowedDialogIds: [],
    note: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Open modal for creating a new user permission
  const handleOpenCreateModal = () => {
    setEditingEmail(null);
    setFormData({
      email: '',
      name: '',
      allowAll: false,
      allowedDialogIds: dialogs.length > 0 ? [dialogs[0].id] : [],
      note: '',
    });
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing user permission
  const handleOpenEditModal = (perm: UserDialogPermission) => {
    setEditingEmail(perm.email);
    setFormData({
      email: perm.email,
      name: perm.name || '',
      allowAll: perm.allowAll,
      allowedDialogIds: perm.allowedDialogIds || [],
      note: perm.note || '',
    });
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  // Toggle selection of a specific dialog ID
  const handleToggleDialog = (dialogId: string) => {
    setFormData((prev) => {
      const exists = prev.allowedDialogIds.includes(dialogId);
      return {
        ...prev,
        allowedDialogIds: exists
          ? prev.allowedDialogIds.filter((id) => id !== dialogId)
          : [...prev.allowedDialogIds, dialogId],
      };
    });
  };

  // Select all dialogs
  const handleSelectAllDialogs = () => {
    setFormData((prev) => ({
      ...prev,
      allowedDialogIds: dialogs.map((d) => d.id),
    }));
  };

  // Clear all selected dialogs
  const handleClearAllDialogs = () => {
    setFormData((prev) => ({
      ...prev,
      allowedDialogIds: [],
    }));
  };

  // Save the full permissions list to Supabase
  const savePermissions = async (updatedList: UserDialogPermission[]) => {
    if (!branding?.id) return;
    setIsSaving(true);
    setStatusMsg(null);

    try {
      const existingThumb =
        branding?.thumbnail_settings && typeof branding.thumbnail_settings === 'object'
          ? branding.thumbnail_settings
          : {};

      const mergedThumb = {
        ...existingThumb,
        user_permissions: updatedList,
      };

      // Try updating user_permissions column first (migration 0011), with fallback to thumbnail_settings
      const { error } = await (supabase.from('branding_settings') as any)
        .update({
          user_permissions: updatedList,
          thumbnail_settings: mergedThumb,
        })
        .eq('id', branding.id);

      if (error) {
        // Fallback to storing inside JSONB thumbnail_settings
        const { error: fallbackErr } = await (supabase.from('branding_settings') as any)
          .update({ thumbnail_settings: mergedThumb })
          .eq('id', branding.id);
        if (fallbackErr) throw fallbackErr;
      }

      setPermissions(updatedList);
      if (onUpdated) onUpdated(updatedList);
      setStatusMsg({ type: 'success', text: 'Hak akses pengguna berhasil disimpan.' });
      setIsModalOpen(false);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Gagal menyimpan hak akses: ${err.message || err}` });
    } finally {
      setIsSaving(false);
    }
  };

  // Form submit handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formData.email.toLowerCase().trim();

    if (!cleanEmail) {
      setStatusMsg({ type: 'error', text: 'Email pengguna wajib diisi.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setStatusMsg({ type: 'error', text: 'Format email tidak valid.' });
      return;
    }

    if (!formData.allowAll && formData.allowedDialogIds.length === 0) {
      setStatusMsg({
        type: 'error',
        text: 'Pilih minimal 1 dialog atau aktifkan opsi "Beri Akses ke Semua Dialog".',
      });
      return;
    }

    const newEntry: UserDialogPermission = {
      email: cleanEmail,
      name: formData.name.trim() || undefined,
      allowAll: formData.allowAll,
      allowedDialogIds: formData.allowAll ? [] : formData.allowedDialogIds,
      note: formData.note.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    let updatedList: UserDialogPermission[];
    if (editingEmail) {
      // Editing existing user
      updatedList = permissions.map((p) =>
        p.email.toLowerCase() === editingEmail.toLowerCase() ? newEntry : p
      );
    } else {
      // Creating new user: check if duplicate
      if (permissions.some((p) => p.email.toLowerCase() === cleanEmail)) {
        setStatusMsg({
          type: 'error',
          text: `Email ${cleanEmail} sudah ada di daftar. Gunakan tombol Edit untuk mengubah.`,
        });
        return;
      }
      updatedList = [...permissions, newEntry];
    }

    await savePermissions(updatedList);
  };

  // Delete user permission handler
  const handleDeleteUser = async (emailToDelete: string) => {
    if (
      !confirm(
        `Hapus aturan hak akses untuk "${emailToDelete}"? Pengguna ini akan kembali ke pengaturan hak akses bawaan.`
      )
    ) {
      return;
    }
    const updatedList = permissions.filter(
      (p) => p.email.toLowerCase() !== emailToDelete.toLowerCase()
    );
    await savePermissions(updatedList);
  };

  // Check if an email is an admin
  const isEmailAdmin = (email: string) => {
    const clean = email.toLowerCase().trim();
    return (
      SUPER_ADMIN_EMAILS.includes(clean) ||
      adminEmails.map((e) => e.toLowerCase().trim()).includes(clean) ||
      clean.includes('admin')
    );
  };

  // Filtered users for display
  const filteredPermissions = permissions.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.email.toLowerCase().includes(q) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.note && p.note.toLowerCase().includes(q))
    );
  });

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              User Management & Hak Akses Dialog
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
              {permissions.length} User Diatur
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Tentukan user/email mana saja yang boleh mengakses jenis acara/dialog siaran tertentu di Generator Thumbnail & Poster.
            Admin dan Super Admin secara otomatis memiliki akses penuh ke seluruh dialog.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreateModal}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-500/20 shrink-0 h-10 px-4"
        >
          <UserPlus size={15} />
          <span>Tambah User & Akses</span>
        </Button>
      </div>

      {/* Global Status Message */}
      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <Check size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Search & Overview */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari user berdasarkan email atau nama..."
            className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-xs h-9"
          />
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Akses Penuh
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Akses Dibatasi
          </span>
        </div>
      </div>

      {/* Users List Table / Cards */}
      {filteredPermissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPermissions.map((userPerm) => {
            const isAdmin = isEmailAdmin(userPerm.email);
            const isCurrentUser =
              currentUser?.email?.toLowerCase().trim() ===
              userPerm.email.toLowerCase().trim();

            const allowedDialogNames = userPerm.allowAll
              ? []
              : dialogs
                  .filter((d) => (userPerm.allowedDialogIds || []).includes(d.id))
                  .map((d) => d.name);

            return (
              <div
                key={userPerm.email}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-orange-200 transition-all space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {userPerm.email}
                      </span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                          Anda
                        </span>
                      )}
                      {isAdmin && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5 border border-amber-200">
                          <ShieldCheck size={10} /> Admin
                        </span>
                      )}
                    </div>
                    {userPerm.name && (
                      <p className="text-[11px] text-slate-500 font-medium">
                        {userPerm.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(userPerm)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      title="Edit hak akses dialog"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(userPerm.email)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus user dari daftar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Dialog Access Badges */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    {userPerm.allowAll ? (
                      <>
                        <Unlock size={11} className="text-emerald-500" />
                        Akses Dialog:
                      </>
                    ) : (
                      <>
                        <Lock size={11} className="text-orange-500" />
                        Akses Dialog Dibatasi:
                      </>
                    )}
                  </span>

                  {userPerm.allowAll ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Sparkles size={11} /> Boleh Mengakses Semua Dialog ({dialogs.length} Dialog)
                    </span>
                  ) : allowedDialogNames.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {allowedDialogNames.map((dName) => (
                        <span
                          key={dName}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 flex items-center gap-1 shadow-2xs"
                        >
                          <Mic2 size={10} className="text-orange-500" />
                          <span className="truncate max-w-[170px]">{dName}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-red-500 font-semibold italic flex items-center gap-1">
                      <AlertCircle size={11} /> Tidak ada dialog yang diizinkan
                    </span>
                  )}
                </div>

                {userPerm.note && (
                  <p className="text-[10px] text-slate-400 italic">
                    Catatan: {userPerm.note}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
          <Users size={28} className="mx-auto text-slate-300" />
          <p className="text-xs font-bold text-slate-700">
            {searchQuery
              ? `Tidak ada pengguna yang cocok dengan "${searchQuery}".`
              : 'Belum ada pembatasan hak akses pengguna.'}
          </p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'Coba gunakan kata kunci pencarian yang lain.'
              : 'Semua user yang login saat ini dapat mengakses seluruh dialog siaran. Klik tombol "Tambah User & Akses" di atas untuk membatasi dialog bagi user tertentu.'}
          </p>
          {!searchQuery && (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenCreateModal}
                className="text-xs font-bold border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <UserPlus size={14} className="mr-1.5" />
                Tambah Pembatasan User Pertama
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Info Notice Box */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Cara Kerja Hak Akses Dialog:</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-amber-800">
            <li>User yang dibatasi hanya akan melihat dan dapat memilih jenis dialog yang Anda centang saat membuat thumbnail/poster di generator.</li>
            <li>Admin dan Super Admin selalu dapat mengakses dan mengelola seluruh dialog tanpa batasan.</li>
            <li>Jika email user belum didaftarkan di sini, user tersebut secara default dapat mengakses seluruh dialog.</li>
          </ul>
        </div>
      </div>

      {/* Modal Tambah / Edit Hak Akses Pengguna */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmail ? 'Edit Hak Akses Dialog User' : 'Tambah User & Atur Hak Akses'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail size={13} className="text-orange-500" />
              Email Pengguna (Akun RRI) *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contoh: jurnalis@rri.co.id"
              disabled={Boolean(editingEmail)}
              className="bg-slate-50 rounded-xl text-xs"
              required
            />
            {editingEmail && (
              <p className="text-[10px] text-slate-400">
                Email tidak dapat diubah saat mode edit. Hapus dan buat baru jika ingin mengganti email.
              </p>
            )}
          </div>

          {/* Name / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User size={13} className="text-orange-500" />
              Nama Staf / Keterangan (Opsional)
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="contoh: Andi Pratama (Penyiar PRO 1)"
              className="bg-slate-50 rounded-xl text-xs"
            />
          </div>

          {/* Opsi Akses: Semua Dialog vs Dialog Tertentu */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              Pilihan Hak Akses Dialog
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, allowAll: true })}
                className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                  formData.allowAll
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Unlock size={14} className={formData.allowAll ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-xs font-bold">Semua Dialog</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Boleh mengakses seluruh acara/dialog tanpa batasan
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, allowAll: false })}
                className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
                  !formData.allowAll
                    ? 'border-orange-500 bg-orange-50/70 text-orange-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Lock size={14} className={!formData.allowAll ? 'text-orange-600' : 'text-slate-400'} />
                  <span className="text-xs font-bold">Dialog Tertentu</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Hanya boleh mengakses dialog yang dipilih di bawah
                </span>
              </button>
            </div>
          </div>

          {/* Checklist Dialog (Jika tidak allowAll) */}
          {!formData.allowAll && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Mic2 size={13} className="text-orange-500" />
                  Centang Dialog yang Diizinkan ({formData.allowedDialogIds.length} Dipilih):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllDialogs}
                    className="text-[10px] font-bold text-orange-600 hover:text-orange-700"
                  >
                    Pilih Semua
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleClearAllDialogs}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              {dialogs.length > 0 ? (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {dialogs.map((dialog) => {
                    const isChecked = formData.allowedDialogIds.includes(dialog.id);
                    return (
                      <button
                        key={dialog.id}
                        type="button"
                        onClick={() => handleToggleDialog(dialog.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                          isChecked
                            ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isChecked ? (
                            <CheckSquare size={16} className="text-orange-600 shrink-0" />
                          ) : (
                            <Square size={16} className="text-slate-300 shrink-0" />
                          )}
                          <span className="text-xs truncate">{dialog.name}</span>
                        </div>
                        {isChecked && (
                          <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider shrink-0">
                            Diizinkan
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum ada dialog yang dibuat di database.
                </p>
              )}
            </div>
          )}

          {/* Catatan Tambahan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Catatan / Keterangan Internal (Opsional)
            </label>
            <Input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="contoh: Akses terbatas untuk tim siaran pagi"
              className="bg-slate-50 rounded-xl text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="text-xs font-bold border-slate-200"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 px-4"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
              <span>{editingEmail ? 'Simpan Perubahan' : 'Tambahkan User'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

