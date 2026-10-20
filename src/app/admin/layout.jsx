"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';

export default function AdminLayout({ children }) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="h-screen w-full overflow-hidden bg-canvas text-content-primary flex font-sans transition-colors duration-150">
        <Sidebar />
        <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-surface border-b border-divider px-6 sm:px-8 flex items-center justify-between shrink-0 z-20 transition-colors duration-150">
            <div className="flex items-center gap-3">
              <h2 className="text-xs sm:text-sm font-bold text-content-primary tracking-tight">
                Sistem Pendukung Keputusan Rekomendasi Karir TI
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-subsurface border border-divider text-[11px] font-semibold text-content-muted">
                Panel Administrator
              </span>
            </div>
          </header>
          <div className="flex-1 w-full bg-canvas overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
