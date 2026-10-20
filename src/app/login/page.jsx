"use client";

import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Login() {
  const { user, isLoaded, login } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const router = useRouter();

  // If already authenticated, redirect to the user's role home
  useEffect(() => {
    if (isLoaded && user) {
      const role = String(user.role || '').toLowerCase();
      router.replace(role === 'admin' ? '/admin' : '/');
    }
  }, [user, isLoaded, router]);

  const handleLoginSubmit = async (targetEmail, targetPassword) => {
    setLoading(true);
    setIsError(false);
    setFeedback('Memverifikasi akun ke basis data...');

    try {
      const loggedUser = await login(targetEmail, targetPassword);
      const role = String(loggedUser.role || '').toLowerCase();
      setFeedback(`Autentikasi berhasil sebagai ${role === 'admin' ? 'Administrator' : 'Mahasiswa'}. Mengalihkan...`);
      
      setTimeout(() => {
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, 500);
    } catch (err) {
      setIsError(true);
      setFeedback(err.message || 'Kredensial login tidak valid. Periksa kembali email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    const emailTrimmed = email.trim();

    if (!emailTrimmed) {
      errs.email = 'Alamat email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errs.email = 'Format email tidak valid (contoh: user@kampus.ac.id).';
    }

    if (!password) {
      errs.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 6) {
      errs.password = 'Kata sandi minimal 6 karakter.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setIsError(true);
      setFeedback('Harap periksa dan perbaiki isian formulir login.');
      return;
    }

    setFieldErrors({});
    handleLoginSubmit(emailTrimmed, password);
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-canvas transition-colors duration-150 relative">
      {/* Dark Mode Switcher */}
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle size="sm" />
      </div>

      {/* Institutional Left Brand Showcase */}
      <section className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#0a0f1d] text-slate-100 p-12 lg:p-16 flex-col justify-between border-r border-[#1f3052]">
        <div className="flex items-center gap-3 font-bold text-base">
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
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">CareerPath TI</span>
            <span className="text-[10px] font-semibold text-slate-400 block leading-none">Sistem Pendukung Keputusan Karir</span>
          </div>
        </div>

        <div className="max-w-lg my-12">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Sistem Pendukung Keputusan Multi-Kriteria
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
            Orientasi dan rekomendasi karir berbasis metode ilmiah.
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            CareerPath TI mengintegrasikan model minat vokasional Holland RIASEC (C1), capaian mata kuliah akademik (C2), serta serapan kebutuhan industri TI (C3) menggunakan algoritma Simple Additive Weighting (SAW).
          </p>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary/20 text-blue-300 font-mono text-[10px] flex items-center justify-center">C1</span>
              <span>Kesesuaian 6 Dimensi Minat Karir RIASEC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary/20 text-blue-300 font-mono text-[10px] flex items-center justify-center">C2</span>
              <span>Evaluasi Capaian Mata Kuliah Terkait</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-primary/20 text-blue-300 font-mono text-[10px] flex items-center justify-center">C3</span>
              <span>Analisis Serapan Data Lowongan Pasar Kerja</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          CareerPath TI: Platform Konsultasi dan Penilaian Karir Mahasiswa Bidang Teknologi Informasi
        </div>
      </section>

      {/* Right Form Container */}
      <section className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-content-primary block">CareerPath TI</span>
              <span className="text-[10px] text-content-muted block leading-none">SPK Rekomendasi Karir</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-content-primary mb-1">
              Masuk ke Sistem
            </h2>
            <p className="text-xs text-content-muted">
              Masukkan kredensial akun mahasiswa atau administrator Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-content-primary mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="nama@email.ac.id"
                  className={`w-full pl-8 pr-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
                    fieldErrors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-divider focus:border-primary'
                  }`}
                  aria-invalid={!!fieldErrors.email}
                  required
                />
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="text-xs font-semibold text-content-primary">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Masukkan kata sandi"
                  className={`w-full pl-8 pr-8 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
                    fieldErrors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-divider focus:border-primary'
                  }`}
                  aria-invalid={!!fieldErrors.password}
                  required
                />
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-content-muted hover:text-content-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? 'Memverifikasi...' : 'Masuk'}</span>
            </button>

            {feedback && (
              <div className={`p-2.5 border rounded-lg text-xs leading-relaxed ${
                isError 
                  ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400' 
                  : 'border-divider bg-subsurface text-content-secondary'
              }`}>
                {feedback}
              </div>
            )}

            <div className="pt-2 text-center text-xs text-content-muted">
              Belum memiliki akun mahasiswa?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
