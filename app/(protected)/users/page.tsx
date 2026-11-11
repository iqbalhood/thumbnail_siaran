'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { UserManagement } from '@/components/settings/UserManagement';
import { AdminEmailsManager } from '@/components/settings/AdminEmailsManager';
import { checkIsUserAdmin } from '@/lib/auth/admin';
import { Button } from '@/components/ui/Button';
import { 
  ShieldCheck, 
  ShieldAlert,
  Lock, 
  Loader2, 
  Info, 
  ExternalLink,
  ArrowLeft,
  LayoutGrid
} from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
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
        /* Non-Admin Access Denied View */
        <div className="max-w-xl mx-auto py-16 text-center space-y-5 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200/80 shadow-md">
            <ShieldAlert size={34} />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 uppercase tracking-wider inline-block">
              Akses Dibatasi · 403
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Halaman Khusus Administrator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Menu <strong>User Management</strong> hanya dapat diakses oleh akun Administrator RRI. Akun Anda (<strong>{currentUser?.email}</strong>) tidak memiliki hak akses administrator.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
            >
              <LayoutGrid size={15} />
              <span>Kembali ke Generator</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

