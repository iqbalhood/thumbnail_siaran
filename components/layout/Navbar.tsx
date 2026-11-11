'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { LayoutGrid, Users, Settings, LogOut, Radio, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Generator', href: '/generator', icon: LayoutGrid },
    { name: 'Pembicara', href: '/speakers', icon: Users },
    { name: 'User Management', shortName: 'Users', href: '/users', icon: ShieldCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
            <Radio className="text-white" size={18} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Thumbnail Generator
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              RRI PRO 1 Banda Aceh
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Unified for Mobile & Desktop) */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs md:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} className="shrink-0" />
                {item.shortName ? (
                  <>
                    <span className="hidden md:inline">{item.name}</span>
                    <span className="md:hidden">{item.shortName}</span>
                  </>
                ) : (
                  <span>{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Action */}
        <div className="flex items-center shrink-0">
          <Button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors group"
            title="Keluar"
          >
            <LogOut size={17} className="md:mr-2 group-hover:translate-x-0.5 transition-transform" />
            <span className="hidden md:inline">Keluar</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
