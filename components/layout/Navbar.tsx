'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { LayoutGrid, Users, Settings, LogOut, Radio } from 'lucide-react';

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
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Radio className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Thumbnail Generator
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              RRI PRO 1 Banda Aceh
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Action */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors group"
          >
            <LogOut size={18} className="md:mr-2 group-hover:translate-x-1 transition-transform" />
            <span className="hidden md:inline">Keluar</span>
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-slate-50 flex items-center justify-around py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-[10px] font-medium transition-all ${
                isActive ? 'text-orange-600' : 'text-slate-400'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
