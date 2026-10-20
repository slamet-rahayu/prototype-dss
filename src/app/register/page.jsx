"use client";

import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, Hash, BookOpen, AlertCircle } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function Register() {
  const { user, isLoaded, register } = useContext(AppContext);
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studyProgram, setStudyProgram] = useState('Teknologi Informasi');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const router = useRouter();

  // If already authenticated, redirect to the user's role home
  useEffect(() => {
    if (isLoaded && user) {
      const role = String(user.role || '').toLowerCase();
      router.replace(role === 'admin' ? '/admin' : '/');
    }
  }, [user, isLoaded, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim();
    const nimTrimmed = nim.trim();

    if (!nameTrimmed) {
      errs.name = 'Nama lengkap wajib diisi.';
    } else if (nameTrimmed.length < 2) {
      errs.name = 'Nama lengkap minimal 2 karakter.';
    }

    if (nimTrimmed && !/^\d{5,15}$/.test(nimTrimmed)) {
      errs.nim = 'NIM harus berupa angka 5 hingga 15 digit.';
    }

    if (!emailTrimmed) {
      errs.email = 'Alamat email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errs.email = 'Format email tidak valid (contoh: nama@kampus.ac.id).';
    }

    if (!password) {
      errs.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 6) {
      errs.password = 'Kata sandi minimal 6 karakter.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setIsError(true);
      setFeedback('Harap periksa dan lengkapi formulir pendaftaran dengan benar.');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    setIsError(false);
    setFeedback('Mendaftarkan akun ke basis data...');

    try {
      await register({
        fullName: nameTrimmed,
        email: emailTrimmed,
        password,
        nim: nimTrimmed || undefined,
        studyProgram
      });

      setFeedback(`Pendaftaran berhasil! Mengalihkan ke beranda...`);
      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch (err) {
      setIsError(true);
      setFeedback(err.message || 'Pendaftaran gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-canvas transition-colors duration-150 relative">
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle size="sm" />
      </div>

      {/* Institutional Left Brand Showcase */}
      <section className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#0c1a24] text-slate-100 p-12 lg:p-16 flex-col justify-between border-r border-[#1e384d]">
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
            <span className="text-[10px] font-semibold text-slate-400 block leading-none">Registrasi Mahasiswa</span>
          </div>
        </div>

        <div className="max-w-lg my-12">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Akun Mahasiswa Tingkat Akhir
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
            Mulai evaluasi kesiapan karir bidang teknologi informasi.
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Daftarkan diri Anda untuk mengakses instrumen tes RIASEC, mengelola riwayat nilai akademik, dan memperoleh rekomendasi alternatif karir berbasis Simple Additive Weighting.
          </p>
        </div>

        <div className="text-[11px] text-slate-500">
          CareerPath TI: Platform Konsultasi dan Penilaian Karir Mahasiswa Bidang Teknologi Informasi
        </div>
      </section>

      {/* Right Form Container */}
      <section className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-content-primary block">CareerPath TI</span>
              <span className="text-[10px] text-content-muted block leading-none">Pendaftaran Akun</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-content-primary mb-1">
              Pendaftaran Mahasiswa
            </h2>
            <p className="text-xs text-content-muted">
              Lengkapi data di bawah ini untuk membuat akun baru.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-content-primary mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Masukkan nama lengkap Anda"
                  className={`w-full pl-8 pr-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
                    fieldErrors.name 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-divider focus:border-primary'
                  }`}
                  aria-invalid={!!fieldErrors.name}
                  required
                />
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="nim" className="block text-xs font-semibold text-content-primary mb-1">
                Nomor Induk Mahasiswa (NIM)
              </label>
              <div className="relative">
                <input 
                  id="nim"
                  type="text"
                  value={nim}
                  onChange={(e) => {
                    setNim(e.target.value);
                    if (fieldErrors.nim) setFieldErrors(prev => ({ ...prev, nim: undefined }));
                  }}
                  placeholder="Contoh: 20220801005 (opsional)"
                  className={`w-full pl-8 pr-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
                    fieldErrors.nim 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-divider focus:border-primary'
                  }`}
                  aria-invalid={!!fieldErrors.nim}
                />
                <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
              {fieldErrors.nim && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.nim}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="studyProgram" className="block text-xs font-semibold text-content-primary mb-1">
                Program Studi
              </label>
              <div className="relative">
                <select 
                  id="studyProgram"
                  value={studyProgram}
                  onChange={(e) => setStudyProgram(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-subsurface border border-divider rounded-lg outline-none focus:border-primary text-xs text-content-primary appearance-none cursor-pointer"
                >
                  <option value="Teknologi Informasi">Teknologi Informasi</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Ilmu Komputer">Ilmu Komputer</option>
                </select>
                <BookOpen className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-content-primary mb-1">
                Email Universitas / Pribadi <span className="text-red-500">*</span>
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
              <label htmlFor="password" className="block text-xs font-semibold text-content-primary mb-1">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Minimal 6 karakter"
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
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? 'Mendaftarkan...' : 'Daftar Akun Mahasiswa'}</span>
            </button>

            {feedback && (
              <div className={`p-2.5 border rounded-lg text-xs leading-relaxed ${
                isError 
                  ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400' 
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                {feedback}
              </div>
            )}

            <div className="pt-2 text-center text-xs text-content-muted">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Masuk ke sistem
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
