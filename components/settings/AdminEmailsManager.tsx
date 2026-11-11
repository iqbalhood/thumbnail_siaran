'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SUPER_ADMIN_EMAILS } from '@/lib/auth/admin';
import { 
  ShieldCheck, 
  Mail, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  UserCheck, 
  Sparkles,
  Loader2,
  Lock
} from 'lucide-react';

interface AdminEmailsManagerProps {
  branding: any;
  currentUser: any;
  onUpdated?: (updatedEmails: string[]) => void;
}

export function AdminEmailsManager({ branding, currentUser, onUpdated }: AdminEmailsManagerProps) {
  // Extract initial admin emails from branding.admin_emails or thumbnail_settings.admin_emails
  const getInitialEmails = (): string[] => {
    if (branding?.admin_emails && Array.isArray(branding.admin_emails)) {
      return branding.admin_emails;
    }
    const thumbAdminEmails = branding?.thumbnail_settings?.admin_emails;
    if (Array.isArray(thumbAdminEmails)) {
      return thumbAdminEmails;
    }
    return [];
  };

  const [adminEmails, setAdminEmails] = useState<string[]>(getInitialEmails());
  const [newEmail, setNewEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentEmail = (currentUser?.email || '').toLowerCase().trim();

  const handleAddEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newEmail.toLowerCase().trim();

    if (!clean) return;

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean)) {
      setStatusMsg({ type: 'error', text: 'Format email tidak valid.' });
      return;
    }

    if (SUPER_ADMIN_EMAILS.includes(clean)) {
      setStatusMsg({ type: 'error', text: `Email ${clean} sudah menjadi Super Admin permanen.` });
      return;
    }

    if (adminEmails.includes(clean)) {
      setStatusMsg({ type: 'error', text: `Email ${clean} sudah ada di daftar admin.` });
      return;
    }

    const updated = [...adminEmails, clean];
    setAdminEmails(updated);
    setNewEmail('');
    setStatusMsg(null);
    saveAdminEmails(updated);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const updated = adminEmails.filter((e) => e !== emailToRemove);
    setAdminEmails(updated);
    saveAdminEmails(updated);
  };

  const saveAdminEmails = async (emailsToSave: string[]) => {
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
        admin_emails: emailsToSave,
      };

      // Save to both admin_emails column (if migration applied) and thumbnail_settings.admin_emails (fallback)
      const { error } = await (supabase.from('branding_settings') as any)
        .update({
          admin_emails: emailsToSave,
          thumbnail_settings: mergedThumb,
        })
        .eq('id', branding.id);

      if (error) {
        // Fallback update to thumbnail_settings only
        const { error: fallbackErr } = await (supabase.from('branding_settings') as any)
          .update({
            thumbnail_settings: mergedThumb,
          })
          .eq('id', branding.id);

        if (fallbackErr) throw fallbackErr;
      }

      setStatusMsg({ type: 'success', text: 'Daftar admin berhasil diperbarui!' });
      if (onUpdated) onUpdated(emailsToSave);
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err: any) {
      console.error('Error saving admin emails:', err);
      setStatusMsg({ type: 'error', text: `Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Panel Pengelola Akses Administrator
            </h2>
            <p className="text-xs text-slate-500">
              Pilih dan tentukan email siapa saja yang berhak mendapatkan hak akses Admin (simpan preset, ubah konfigurasi branding).
            </p>
          </div>
        </div>

        {isSaving && (
          <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold bg-orange-50 px-3 py-1.5 rounded-lg">
            <Loader2 size={13} className="animate-spin" />
            <span>Menyimpan perubahan...</span>
          </div>
        )}
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? <Check size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Form Tambah Admin */}
      <form onSubmit={handleAddEmail} className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Mail size={13} className="text-orange-500" />
          Tambahkan Email Admin Baru
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Contoh: user@rri.co.id atau nama@gmail.com"
              className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl text-sm"
              disabled={isSaving}
            />
          </div>
          <Button
            type="submit"
            disabled={isSaving || !newEmail.trim()}
            className="h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-5 text-xs flex items-center justify-center gap-2 shrink-0 shadow-xs"
          >
            <Plus size={16} />
            <span>Jadikan Admin</span>
          </Button>
        </div>
        <p className="text-[11px] text-slate-400">
          *Pastikan user dengan email tersebut sudah pernah didaftarkan/dibuat di sistem login.
        </p>
      </form>

      {/* List Admin Emails */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Daftar Email yang Memiliki Hak Akses Admin ({SUPER_ADMIN_EMAILS.length + adminEmails.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* 1. Super Admin Permanen */}
          {SUPER_ADMIN_EMAILS.map((email) => (
            <div
              key={email}
              className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">{email}</span>
                    {email === currentEmail && (
                      <span className="bg-orange-200/70 text-orange-800 text-[9px] font-bold px-1.5 py-0.2 rounded">Anda</span>
                    )}
                  </div>
                  <span className="text-[10px] text-orange-600 font-medium flex items-center gap-1">
                    <Lock size={10} /> Super Admin Utama (Permanen)
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* 2. Custom Admin Emails */}
          {adminEmails.map((email) => {
            const isMe = email === currentEmail;
            return (
              <div
                key={email}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <UserCheck size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate">{email}</span>
                      {isMe && (
                        <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.2 rounded">Anda</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Sparkles size={10} className="text-orange-500" /> Administrator Ditugaskan
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  disabled={isSaving}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  title={`Hapus status admin untuk ${email}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {adminEmails.length === 0 && (
          <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            Belum ada email admin tambahan. Masukkan email di atas untuk memberikan akses admin ke pengguna lain.
          </p>
        )}
      </div>
    </section>
  );
}

