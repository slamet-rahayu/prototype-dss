"use client";

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import {
  User,
  Mail,
  School,
  BookOpen,
  Calendar,
  MapPin,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, academicComponents, riasecResult } = useContext(AppContext);

  const [name, setName] = useState(user?.name || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [studyProgram, setStudyProgram] = useState(user?.studyProgram || 'Teknologi Informasi');
  const [semester, setSemester] = useState(user?.semester || 'Semester 7');
  const [domicile, setDomicile] = useState(user?.domicile || '');
  const [showSavedLabel, setShowSavedLabel] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const res = await apiRequest('/auth/me');
        if (res?.data && isMounted) {
          const u = res.data;
          const s = u.student;
          if (s) {
            setName(s.fullName || u.email);
            setUniversity(s.university || '');
            setStudyProgram(s.studyProgram || 'Teknologi Informasi');
            setSemester(s.semester || 'Semester 7');
            setDomicile(s.domicile || '');
          }
        }
      } catch {
        // Fallback to contextual user
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUniversity(user.university || '');
      setStudyProgram(user.studyProgram || 'Teknologi Informasi');
      setSemester(user.semester || 'Semester 7');
      setDomicile(user.domicile || '');
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    const nameTrimmed = name.trim();
    const univTrimmed = university.trim();
    const progTrimmed = studyProgram.trim();
    const domTrimmed = domicile.trim();

    if (!nameTrimmed) {
      errs.name = "Nama lengkap wajib diisi.";
    } else if (nameTrimmed.length < 2) {
      errs.name = "Nama lengkap minimal 2 karakter.";
    }

    if (!univTrimmed) {
      errs.university = "Nama perguruan tinggi wajib diisi.";
    } else if (univTrimmed.length < 3) {
      errs.university = "Nama perguruan tinggi minimal 3 karakter.";
    }

    if (!progTrimmed) {
      errs.studyProgram = "Program studi wajib diisi.";
    } else if (progTrimmed.length < 3) {
      errs.studyProgram = "Program studi minimal 3 karakter.";
    }

    if (!domTrimmed) {
      errs.domicile = "Domisili wajib diisi.";
    } else if (domTrimmed.length < 3) {
      errs.domicile = "Domisili minimal 3 karakter (contoh: Jakarta, Indonesia).";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      triggerToast("Harap periksa dan lengkapi kolom profil yang belum valid.");
      return;
    }

    setFieldErrors({});
    updateProfile({
      name: nameTrimmed,
      university: univTrimmed,
      studyProgram: progTrimmed,
      semester,
      domicile: domTrimmed
    });

    setShowSavedLabel(true);
    triggerToast("Perubahan profil mahasiswa berhasil disimpan.");
    setTimeout(() => {
      setShowSavedLabel(false);
    }, 2500);
  };

  const handleReset = () => {
    setFieldErrors({});
    setName(user?.name || '');
    setUniversity(user?.university || '');
    setStudyProgram(user?.studyProgram || 'Teknologi Informasi');
    setSemester(user?.semester || 'Semester 7');
    setDomicile(user?.domicile || '');
    triggerToast("Perubahan formulir dibatalkan.");
  };

  // Readiness evaluation
  const hasProfile = Boolean(user?.name && user?.university && user?.studyProgram);
  const hasAcademic = Boolean(academicComponents && academicComponents.length >= 5);
  const hasRiasec = Boolean(riasecResult?.completedAt);

  let completionScore = 50;
  if (hasProfile) completionScore += 10;
  if (hasAcademic) completionScore += 20;
  if (hasRiasec) completionScore += 20;

  if (isLoading) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
          <Skeleton className="h-4 w-16" />
          <span>/</span>
          <Skeleton className="h-4 w-28" />
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-divider">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          <div className="lg:col-span-4">
            <Card className="p-6 text-center">
              <Skeleton className="w-16 h-16 rounded-xl mx-auto mb-3" />
              <Skeleton className="h-5 w-36 mx-auto mb-1.5" />
              <Skeleton className="h-3 w-48 mx-auto mb-3" />
              <Skeleton className="h-5 w-28 mx-auto mb-5 rounded-md" />
              <div className="w-full h-px bg-divider my-5" />
              <div className="space-y-4 text-left">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Skeleton className="w-4 h-4 rounded mt-0.5 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-divider">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="p-6">
              <div className="pb-3 mb-5 border-b border-divider flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
                <div className="pt-4 border-t border-divider flex items-center justify-end gap-3">
                  <Skeleton className="h-9 w-20 rounded-lg" />
                  <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span>/</span>
        <span className="text-content-primary font-medium">Profil Mahasiswa</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-divider">
        <div>
          <h1 className="text-2xl sm:text-2.5xl font-bold text-content-primary tracking-tight">
            Profil Mahasiswa
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Data identitas mahasiswa dan institusi pendidikan sebagai rujukan sistem pendukung keputusan.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Status Akun Aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
        {/* Left Column: Student Summary Card (lg:col-span-4) */}
        <div className="lg:col-span-4">
          <Card className="p-6 text-center">
            <div className="w-16 h-16 rounded-xl bg-primary text-white font-mono font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              {user?.initials || 'MR'}
            </div>

            <h2 className="text-base font-bold text-content-primary mb-0.5">
              {user?.name}
            </h2>
            <p className="text-xs text-content-muted font-mono mb-2">
              {user?.email}
            </p>
            <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-subsurface border border-divider text-content-secondary">
              Mahasiswa Tingkat Akhir
            </span>

            <div className="w-full h-px bg-divider my-5" />

            <div className="space-y-3 text-left text-xs">
              <div className="flex items-start gap-2.5">
                <School className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-content-primary leading-tight">
                    {user?.university || 'Belum diisi'}
                  </strong>
                  <span className="text-[10px] text-content-muted">Perguruan Tinggi</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-content-primary leading-tight">
                    {user?.studyProgram || 'Teknologi Informasi'}
                  </strong>
                  <span className="text-[10px] text-content-muted">Program Studi</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-content-primary leading-tight">
                    {user?.semester || 'Semester 7'}
                  </strong>
                  <span className="text-[10px] text-content-muted">Semester Berjalan</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-divider text-left">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-content-primary text-[11px]">Kelengkapan Data</span>
                <span className="font-mono font-bold text-primary">{completionScore}%</span>
              </div>
              <div className="h-2 w-full bg-subsurface rounded-full overflow-hidden border border-divider">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Profile Form (lg:col-span-8) */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="pb-3 mb-5 border-b border-divider flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-content-primary">
                  Perbarui Informasi Profil
                </h2>
                <p className="text-xs text-content-muted mt-0.5">
                  Informasi ini digunakan dalam laporan konsultasi karir.
                </p>
              </div>
              {showSavedLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold rounded">
                  <Check className="w-3.5 h-3.5" />
                  Tersimpan
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-4 text-xs" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block font-semibold text-content-primary mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="fullName"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                      }}
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
                  <label htmlFor="emailAddress" className="block font-semibold text-content-primary mb-1">
                    Alamat Email (Tetap)
                  </label>
                  <div className="relative">
                    <input
                      id="emailAddress"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-8 pr-3 py-2 bg-subsurface border border-divider rounded-lg outline-none text-xs text-content-muted cursor-not-allowed opacity-80"
                    />
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="universityName" className="block font-semibold text-content-primary mb-1">
                    Perguruan Tinggi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="universityName"
                      type="text"
                      value={university}
                      onChange={(e) => {
                        setUniversity(e.target.value);
                        if (fieldErrors.university) setFieldErrors(prev => ({ ...prev, university: undefined }));
                      }}
                      placeholder="Nama Universitas"
                      className={`w-full pl-8 pr-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
                        fieldErrors.university 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-divider focus:border-primary'
                      }`}
                      aria-invalid={!!fieldErrors.university}
                      required
                    />
                    <School className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                  </div>
                  {fieldErrors.university && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.university}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="studyProgramName" className="block font-semibold text-content-primary mb-1">
                    Program Studi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="studyProgramName"
                      type="text"
                      value={studyProgram}
                      onChange={(e) => {
                        setStudyProgram(e.target.value);
                        if (fieldErrors.studyProgram) setFieldErrors(prev => ({ ...prev, studyProgram: undefined }));
                      }}
                      placeholder="Teknologi Informasi"
                      className={`w-full pl-8 pr-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
                        fieldErrors.studyProgram 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-divider focus:border-primary'
                      }`}
                      aria-invalid={!!fieldErrors.studyProgram}
                      required
                    />
                    <BookOpen className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                  </div>
                  {fieldErrors.studyProgram && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.studyProgram}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="semesterSelection" className="block font-semibold text-content-primary mb-1">
                    Semester
                  </label>
                  <select
                    id="semesterSelection"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-subsurface border border-divider rounded-lg outline-none focus:border-primary text-xs text-content-primary"
                  >
                    {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="domicileLocation" className="block font-semibold text-content-primary mb-1">
                    Domisili <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="domicileLocation"
                      type="text"
                      value={domicile}
                      onChange={(e) => {
                        setDomicile(e.target.value);
                        if (fieldErrors.domicile) setFieldErrors(prev => ({ ...prev, domicile: undefined }));
                      }}
                      placeholder="Jakarta, Indonesia"
                      className={`w-full pl-8 pr-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
                        fieldErrors.domicile 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-divider focus:border-primary'
                      }`}
                      aria-invalid={!!fieldErrors.domicile}
                      required
                    />
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                  </div>
                  {fieldErrors.domicile && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.domicile}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-divider flex items-center justify-end gap-2">
                <button
                  type="reset"
                  className="px-3.5 py-1.5 border border-divider hover:bg-subsurface text-content-secondary rounded-lg font-medium text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-xs shadow-xs transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <footer className="pt-6 pb-2 text-center text-xs text-content-muted border-t border-divider">
        CareerPath TI: Sistem Pendukung Keputusan Rekomendasi Karir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
