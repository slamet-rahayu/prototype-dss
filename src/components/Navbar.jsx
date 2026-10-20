"use client";

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AppContext } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';
import { Menu, X, Compass, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AppContext);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Beranda', path: '/' },
    { label: 'Data Akademik', path: '/akademik' },
    { label: 'Tes RIASEC', path: '/riasec' },
    { label: 'Hasil Rekomendasi', path: '/rekomendasi' },
    { label: 'Katalog Karir', path: '/eksplorasi' },
    { label: 'Profil', path: '/profile' }
  ];

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-surface border-b border-divider transition-colors duration-150">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand identity: Purposeful academic decision support emblem */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 text-content-primary hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-xs">
            {/* Geometric career pathway compass icon */}
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
            <span className="text-sm font-bold tracking-tight text-content-primary leading-tight">CareerPath TI</span>
            <span className="text-[10px] font-medium text-content-muted leading-none">SPK Rekomendasi Karir</span>
          </div>
        </Link>

        {/* Student Navigation */}
        {user && String(user.role || '').toLowerCase() === 'student' && (
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 ${
                    active 
                      ? 'bg-subsurface text-primary font-bold border-b-2 border-primary' 
                      : 'text-content-secondary hover:text-content-primary hover:bg-subsurface/60'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Actions bar */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle size="sm" />

          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-divider hover:bg-subsurface text-content-primary text-xs font-semibold transition-colors duration-150"
                title="Lihat Profil Mahasiswa"
              >
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 font-bold text-[11px] flex items-center justify-center">
                  {user.initials || 'MR'}
                </span>
                <span className="hidden md:inline max-w-[120px] truncate">{user.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold hidden sm:inline">
                  Mahasiswa
                </span>
              </Link>
              <button 
                onClick={() => { logout(); router.push('/login'); }} 
                className="p-1.5 text-content-muted hover:text-danger hover:bg-subsurface rounded-lg transition-colors duration-150"
                title="Keluar"
                aria-label="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors duration-150"
            >
              Masuk
            </Link>
          )}

          {/* Mobile hamburger menu toggle */}
          {user && String(user.role || '').toLowerCase() === 'student' && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg border border-divider text-content-secondary hover:text-content-primary hover:bg-subsurface focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && user && String(user.role || '').toLowerCase() === 'student' && (
        <div className="lg:hidden bg-surface border-b border-divider px-4 py-3 grid gap-1 animate-slide-down shadow-md">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-subsurface text-primary font-bold'
                  : 'text-content-secondary hover:text-content-primary hover:bg-subsurface'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
