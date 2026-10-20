"use client";

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { ShieldAlert } from 'lucide-react';

export default function AuthGuard({ children, allowedRoles }) {
  const { user, isLoaded } = useContext(AppContext);
  const router = useRouter();

  const userRole = (user?.role || '').toLowerCase();
  const normalizedAllowed = allowedRoles?.map(r => String(r).toLowerCase()) || [];
  const isAuthorized = normalizedAllowed.length === 0 || normalizedAllowed.includes(userRole);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace('/login');
    } else if (!isAuthorized) {
      const destination = userRole === 'admin' ? '/admin' : '/';
      router.replace(destination);
    }
  }, [user, isLoaded, isAuthorized, userRole, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-3 text-content-muted">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Memeriksa sesi login...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-3 text-content-muted">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Mengalihkan ke halaman masuk...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    const destination = userRole === 'admin' ? '/admin' : '/';
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-content-primary mb-1">
          Akses Terbatas
        </h2>
        <p className="text-xs text-content-muted max-w-sm mb-4">
          Halaman ini hanya dapat diakses oleh {normalizedAllowed.map(r => r === 'admin' ? 'Administrator' : 'Mahasiswa').join(' atau ')}. Anda saat ini terautentikasi sebagai {userRole === 'admin' ? 'Administrator' : 'Mahasiswa'}.
        </p>
        <button
          onClick={() => router.replace(destination)}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg transition-colors"
        >
          {userRole === 'admin' ? 'Buka Panel Admin' : 'Kembali ke Beranda Mahasiswa'}
        </button>
      </div>
    );
  }

  return children;
}
