"use client";

import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Sliders, 
  TrendingUp, 
  Users, 
  History, 
  Clock, 
  LogOut
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const { user, logout } = useContext(AppContext);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard Admin', path: '/admin', icon: LayoutDashboard },
    { name: 'Alternatif Karir TI', path: '/admin/alternatif', icon: Briefcase },
    { name: 'Konfigurasi Bobot SAW', path: '/admin/konfigurasi', icon: Sliders },
    { name: 'Data Pasar Kerja', path: '/admin/pasar-kerja', icon: TrendingUp },
    { name: 'Data Mahasiswa', path: '/admin/mahasiswa', icon: Users },
    { name: 'Riwayat Rekomendasi', path: '/admin/riwayat', icon: History },
    { name: 'Scheduler Pasar Kerja', path: '/admin/scheduler', icon: Clock },
  ];

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <aside className="w-64 h-screen bg-[#0a0f1d] border-r border-[#1f3052] text-slate-200 flex flex-col px-4 py-5 shrink-0 z-30 sticky top-0 overflow-y-auto transition-colors duration-150">
      {/* Brand Header */}
      <Link 
        href="/admin" 
        className="flex items-center gap-2.5 px-2 mb-6 hover:opacity-90 transition-opacity"
      >
        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-xs">
          <svg 
            className="w-4.5 h-4.5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-white leading-tight">CareerPath TI</span>
          <span className="text-[10px] font-semibold text-slate-400 leading-none">Panel Administrator</span>
        </div>
      </Link>

      {/* Nav Menu */}
      <nav className="flex-1 flex flex-col gap-1" aria-label="Menu Admin">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
          Navigasi Master
        </span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link 
              key={item.name}
              href={item.path} 
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                active 
                  ? 'bg-primary text-white font-bold border-l-3 border-amber-400' 
                  : 'text-slate-300 hover:text-white hover:bg-[#18243e]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer User & Theme Bar */}
      <div className="mt-auto pt-3 border-t border-[#1f3052] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <ThemeToggle size="sm" showLabel={true} className="border-[#1f3052] bg-[#18243e] text-slate-200" />
        </div>

        <div className="flex items-center justify-between gap-2 bg-[#18243e] p-2 rounded-lg border border-[#1f3052]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              {user?.initials || 'AD'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-white block truncate leading-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate leading-tight">
                {user?.email || 'admin@careerpath.id'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
            title="Keluar dari sesi"
            aria-label="Keluar dari sesi"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
