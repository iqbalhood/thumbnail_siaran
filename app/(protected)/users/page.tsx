'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { UserManagement } from '@/components/settings/UserManagement';
import { AdminEmailsManager } from '@/components/settings/AdminEmailsManager';
import { checkIsUserAdmin } from '@/lib/auth/admin';
import { extractUserPermissions, getUserDialogPermission } from '@/lib/auth/permissions';
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Loader2, 
  AlertCircle, 
  Mic2, 
  Info, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function UsersPage() {
  const [branding, setBranding] = useState<any>(null);
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [bRes, dRes, authRes] = await Promise.all([
        supabase.from('branding_settings').select('*').single(),
        supabase.from('dialogs').select('*').order('name'),
        supabase.auth.getUser(),
      ]);

      setBranding(bRes.data);
      setDialogs(dRes.data || []);

      const user = authRes.data?.user || null;
      setCurrentUser(user);

      const bObj = bRes.data as any;
      const customAdmins =
        bObj?.admin_emails || bObj?.thumbnail_settings?.admin_emails || [];
      setIsAdmin(checkIsUserAdmin(user, customAdmins));
    } catch (err) {
      console.error('Error fetching users management data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const userPermissions = extractUserPermissions(branding);
  const userPerm = getUserDialogPermission(currentUser, userPermissions);
  const isAllowedAll = !userPerm || userPerm.allowAll || isAdmin;
  const allowedDialogIds = userPerm?.allowedDialogIds || [];
  const allowedDialogs = isAllowedAll
    ? dialogs
    : dialogs.filter((d) => allowedDialogIds.includes(d.id));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                User Management & Hak Akses
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Kelola hak akses pengguna ke jenis dialog siaran tertentu dan administrator aplikasi.
              </p>
            </div>
          </div>
        </div>

        {currentUser && (
          <div className="p-2 sm:px-3 sm:py-2 bg-white rounded-xl border border-slate-200/80 flex items-center gap-2 shadow-2xs self-start sm:self-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div className="text-[11px] leading-tight">
              <p className="font-bold text-slate-700 truncate max-w-[190px]">
                {currentUser.email}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {isAdmin ? '👑 Administrator' : '👤 Pengguna Terdaftar'}
              </p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 size={32} className="animate-spin text-orange-500" />
          <p className="text-xs font-semibold text-slate-500">
            Memuat data pengguna & hak akses...
          </p>
        </div>
      ) : isAdmin ? (
        <div className="space-y-6">
          {/* 1. Panel User Management (Akses Dialog Tertentu) */}
          <UserManagement
            branding={branding}
            dialogs={dialogs}
            currentUser={currentUser}
            adminEmails={branding?.admin_emails || branding?.thumbnail_settings?.admin_emails || []}
            onUpdated={(updatedPermissions) => {
              setBranding((prev: any) => ({
                ...prev,
                user_permissions: updatedPermissions,
                thumbnail_settings: {
                  ...(prev?.thumbnail_settings || {}),
                  user_permissions: updatedPermissions,
                },
              }));
            }}
          />

          {/* 2. Panel Admin Emails Manager */}
          <AdminEmailsManager
            branding={branding}
            currentUser={currentUser}
            onUpdated={(updatedEmails) => {
              setBranding((prev: any) => ({
                ...prev,
                admin_emails: updatedEmails,
                thumbnail_settings: {
                  ...(prev?.thumbnail_settings || {}),
                  admin_emails: updatedEmails,
                },
              }));
              if (currentUser) {
                setIsAdmin(checkIsUserAdmin(currentUser, updatedEmails));
              }
            }}
          />

          {/* 3. Info Supabase Authentication */}
          <section className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="max-w-2xl space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-orange-400">
                <Info size={18} />
                <h2 className="font-bold uppercase tracking-wider text-xs">
                  Autentikasi & Akun Pengguna Supabase
                </h2>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">
                Tambah atau Undang Akun Baru
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Untuk mendaftarkan akun baru, mengundang staf siaran, atau mereset password, 
                silakan gunakan menu <strong>Authentication → Users</strong> pada dashboard Supabase RRI.
                Setelah akun terdaftar di Supabase, Anda dapat mengatur hak akses dialognya pada form di atas.
              </p>
              <div className="pt-1">
                <a
                  href="https://supabase.com/dashboard/project/qttheourjrhwbmycvohb/auth/users"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-white/10"
                >
                  <span>Buka Supabase Authentication</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Non-Admin View: Informasi Hak Akses Akun Saya */
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Hak Akses Akun Anda
                </h2>
                <p className="text-xs text-slate-500">
                  Berikut adalah daftar jenis acara/dialog siaran yang diizinkan untuk akun <strong>{currentUser?.email}</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Status Akses Dialog:</span>
                {isAllowedAll ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <Unlock size={12} /> Akses Penuh ke Semua Dialog
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                    <Lock size={12} /> Akses Dibatasi ({allowedDialogs.length} Dialog)
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Dialog yang Dapat Anda Akses di Generator:
                </span>
                {allowedDialogs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {allowedDialogs.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <Mic2 size={14} className="text-orange-500 shrink-0" />
                        <span className="truncate">{d.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-red-500 italic">
                    Akun Anda belum diberi izin untuk mengakses jenis dialog manapun.
                  </p>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                Halaman pengelolaan hak akses pengguna hanya dapat diubah oleh Administrator sistem RRI. 
                Jika Anda memerlukan akses ke dialog siaran lain, silakan hubungi tim Admin.
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
