"use client";

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { Skeleton, CardSkeleton } from '@/components/Skeleton';
import { 
  Compass, 
  BookOpen, 
  FileCheck2, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function Home() {
  const { user, academicComponents, riasecResult, careers, sawResults, sawWeights, isLoaded } = useContext(AppContext);
  const [toast, setToast] = useState({ show: false, message: '' });
  const router = useRouter();

  if (!isLoaded) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <div className="bg-surface border border-divider rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-96 max-w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex gap-3 pt-3">
                <Skeleton className="h-10 w-44 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
            <div className="w-full lg:w-72 bg-subsurface border border-divider rounded-xl p-5 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
        <div className="bg-surface border border-divider rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </main>
    );
  }

  const topCareer = sawResults && sawResults.length > 0 ? sawResults[0] : null;
  const topCareerData = topCareer && careers ? careers[topCareer.name] : null;

  // Validation of the 3 SAW criteria
  const hasProfile = Boolean(user?.name && user?.university);
  const hasAcademic = Boolean(academicComponents && academicComponents.length >= 5);
  const hasRiasec = Boolean(riasecResult?.completedAt);
  const isRecommendationReady = hasRiasec && hasAcademic;

  let completedCriteriaCount = 0;
  if (hasRiasec) completedCriteriaCount += 1;
  if (hasAcademic) completedCriteriaCount += 1;
  // Criteria 3 (Market demand) is maintained in master data
  completedCriteriaCount += 1;

  // Average academic grade
  const averageGrade = hasAcademic
    ? Math.round(academicComponents.reduce((acc, c) => acc + Number(c.grade || 0), 0) / academicComponents.length)
    : null;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Institutional Hero Banner */}
      <section className="bg-surface border border-divider rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-content-muted mb-2">
              <span>{user?.university || 'Universitas'}</span>
              <span>•</span>
              <span>{user?.studyProgram || 'Teknologi Informasi'}</span>
            </div>
            
            <h1 className="text-2.5xl sm:text-3xl font-bold text-content-primary tracking-tight leading-snug mb-3">
              Sistem Pendukung Keputusan Rekomendasi Karir TI
            </h1>
            
            <p className="text-content-secondary text-sm leading-relaxed mb-6">
              Sistem mengolah rekomendasi karir berbasis multi-kriteria menggunakan metode Simple Additive Weighting (SAW), mengintegrasikan hasil tes minat RIASEC (C1), evaluasi kompetensi akademik (C2), dan serapan pasar kerja industri (C3).
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {isRecommendationReady ? (
                <button 
                  onClick={() => router.push('/rekomendasi')}
                  className="px-4.5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-xs transition-colors duration-150 flex items-center gap-2"
                >
                  <span>Buka Hasil Rekomendasi Karir</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => router.push(hasRiasec ? '/akademik' : '/riasec')}
                  className="px-4.5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-xs transition-colors duration-150 flex items-center gap-2"
                >
                  <span>{hasRiasec ? 'Lengkapi Data Nilai Akademik (C2)' : 'Mulai Tes Minat RIASEC (C1)'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button 
                onClick={() => router.push('/eksplorasi')}
                className="px-4 py-2.5 rounded-lg border border-divider bg-surface hover:bg-subsurface text-content-primary font-semibold text-xs transition-colors duration-150"
              >
                Katalog Karir TI
              </button>
            </div>
          </div>

          {/* Assessment Readiness Gauge */}
          <div className="w-full lg:w-72 bg-subsurface/70 border border-divider rounded-xl p-5 shrink-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-content-primary">Kesiapan Data Kriteria</span>
                <span className="text-xs font-mono font-bold text-primary">
                  {isRecommendationReady ? '100%' : `${Math.round((completedCriteriaCount / 3) * 100)}%`}
                </span>
              </div>
              <p className="text-[11px] text-content-muted leading-relaxed mb-4">
                {isRecommendationReady
                  ? 'Seluruh kriteria SAW terpenuhi. Rekomendasi telah dihitung.'
                  : 'Lengkapi seluruh kriteria untuk menghasilkan ranking preferensi karir.'}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-divider text-xs">
              <div className="flex items-center justify-between">
                <span className="text-content-secondary text-[11px]">C1: Tes Minat RIASEC</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  hasRiasec 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {hasRiasec ? 'Selesai' : 'Belum'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-secondary text-[11px]">C2: Capaian Akademik</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  hasAcademic 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {hasAcademic ? 'Selesai' : 'Belum'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-secondary text-[11px]">C3: Data Pasar Kerja</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Tersedia
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Criteria Matrix (Replaces Template 3-Step) */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-content-primary">
              Matriks Kriteria Rekomendasi (SAW)
            </h2>
            <p className="text-xs text-content-muted mt-0.5">
              Setiap kriteria memiliki bobot preferensi yang telah dikalibrasi dalam sistem pendukung keputusan.
            </p>
          </div>
          <span className="text-[11px] font-mono text-content-muted">
            Formula: V_i = ∑(w_j × R_ij)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Criterion 1: RIASEC */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                  C1
                </div>
                <span className="text-xs font-mono font-bold text-content-muted">
                  Bobot: {sawWeights?.c1 || 40}%
                </span>
              </div>
              <h3 className="text-sm font-bold text-content-primary mb-1">
                Minat Karir RIASEC
              </h3>
              <p className="text-xs text-content-muted leading-relaxed mb-4">
                Mengukur kecocokan kepribadian dan minat vokasional berdasarkan 6 dimensi model John Holland.
              </p>
            </div>

            <div className="pt-3 border-t border-divider flex items-center justify-between">
              {hasRiasec ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kode: {riasecResult.top?.join('-')}</span>
                </div>
              ) : (
                <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  Belum mengikuti tes
                </span>
              )}
              <button 
                onClick={() => router.push(hasRiasec ? '/riasec/hasil' : '/riasec')}
                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                {hasRiasec ? 'Lihat Hasil' : 'Mulai Tes'}
              </button>
            </div>
          </Card>

          {/* Criterion 2: Academic */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                  C2
                </div>
                <span className="text-xs font-mono font-bold text-content-muted">
                  Bobot: {sawWeights?.c2 || 35}%
                </span>
              </div>
              <h3 className="text-sm font-bold text-content-primary mb-1">
                Kompetensi Akademik
              </h3>
              <p className="text-xs text-content-muted leading-relaxed mb-4">
                Evaluasi nilai mata kuliah inti: Pemrograman, Basis Data, Jaringan, dan Rekayasa Sistem.
              </p>
            </div>

            <div className="pt-3 border-t border-divider flex items-center justify-between">
              {hasAcademic ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Rata-rata: {averageGrade}</span>
                </div>
              ) : (
                <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  Data belum lengkap
                </span>
              )}
              <button 
                onClick={() => router.push('/akademik')}
                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                {hasAcademic ? 'Periksa Nilai' : 'Input Nilai'}
              </button>
            </div>
          </Card>

          {/* Criterion 3: Job Market */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                  C3
                </div>
                <span className="text-xs font-mono font-bold text-content-muted">
                  Bobot: {sawWeights?.c3 || 25}%
                </span>
              </div>
              <h3 className="text-sm font-bold text-content-primary mb-1">
                Kebutuhan Pasar Kerja
              </h3>
              <p className="text-xs text-content-muted leading-relaxed mb-4">
                Indeks serapan industri dan volume lowongan kerja bidang TI aktif di Indonesia.
              </p>
            </div>

            <div className="pt-3 border-t border-divider flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terhubung API</span>
              </div>
              <button 
                onClick={() => router.push('/eksplorasi')}
                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Lihat Tren
              </button>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Content Area: Top Alternative Preview & Industry Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-start">
        {/* Top Recommendation Summary Card (lg:col-span-7) */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-divider">
              <div>
                <h3 className="text-sm font-bold text-content-primary">
                  Hasil Rekomendasi Teratas
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Berdasarkan nilai preferensi akhir SAW tertinggi
                </p>
              </div>
              {isRecommendationReady && (
                <Link
                  href="/rekomendasi"
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                >
                  <span>Analisis Lengkap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {isRecommendationReady && topCareer ? (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white p-5.5 border border-blue-400/30 shadow-[0_15px_30px_-10px_rgba(29,78,216,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]">
                {/* Background Compass Decoration */}
                <div className="absolute -right-6 -bottom-6 w-44 h-44 text-white/5 pointer-events-none select-none" aria-hidden="true">
                  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                    <circle cx="100" cy="100" r="75" strokeDasharray="5 5" />
                    <polygon points="100,25 125,75 175,100 125,125 100,175 75,125 25,100 75,75" fill="currentColor" fillOpacity="0.04" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
                      {topCareer.icon || '⌘'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 shadow-xs">
                          Peringkat 1
                        </span>
                        <span className="text-xs font-mono font-medium text-blue-200">
                          Skor SAW: {topCareer.score}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white leading-tight">
                        {topCareer.name}
                      </h4>
                      <p className="text-xs text-blue-100/90">{topCareer.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-white/15">
                    <span className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider block">Nilai Preferensi (V)</span>
                    <span className="text-2xl font-mono font-extrabold text-white">
                      {topCareer.score}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5 border-t border-white/15 text-xs mb-4">
                  <div>
                    <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider block mb-1.5">
                      Kesesuaian Tipe Minat
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {topCareerData?.riasecMapped?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/10 backdrop-blur-xs border border-white/20 rounded text-[11px] font-semibold text-white">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider block mb-1.5">
                      Kebutuhan Pasar
                    </span>
                    <span className="text-xs font-medium text-blue-100">
                      {topCareer.market?.vacancy || '200+'} lowongan terdata
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row gap-2.5">
                  <button 
                    onClick={() => router.push(`/eksplorasi/${topCareer.name}`)}
                    className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Pelajari Deskripsi Karir
                  </button>
                  <button 
                    onClick={() => router.push('/rekomendasi')}
                    className="py-2 px-4 bg-white hover:bg-blue-50 text-blue-900 rounded-lg text-xs font-bold transition-all shadow-md"
                  >
                    Buka Hasil Rekomendasi Karir
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-subsurface border border-dashed border-divider rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <AlertCircle className="w-10 h-10 text-content-muted mb-3" />
                <h4 className="text-sm font-bold text-content-primary mb-1">
                  Rekomendasi Belum Dapat Dihitung
                </h4>
                <p className="text-xs text-content-muted max-w-md mx-auto mb-5 leading-relaxed">
                  Metode SAW mensyaratkan kelengkapan data kriteria penilaian. Silakan selesaikan Tes RIASEC dan pastikan nilai akademik Anda telah dimasukkan.
                </p>
                <div className="flex flex-wrap gap-2.5 justify-center">
                  {!hasRiasec && (
                    <button 
                      onClick={() => router.push('/riasec')}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                    >
                      Mulai Tes RIASEC (C1)
                    </button>
                  )}
                  {!hasAcademic && (
                    <button 
                      onClick={() => router.push('/akademik')}
                      className="px-4 py-2 bg-surface border border-divider text-content-primary rounded-lg text-xs font-semibold hover:bg-subsurface transition-colors"
                    >
                      Input Nilai Akademik (C2)
                    </button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Industry Job Market Summary (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-divider">
              <div>
                <h3 className="text-sm font-bold text-content-primary">
                  Indeks Kebutuhan Industri TI
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Distribusi data kriteria C3 berdasarkan peran
                </p>
              </div>
              <span className="text-[10px] font-mono text-content-muted">
                Sumber: Adzuna API
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-subsurface rounded-lg">
                <div>
                  <span className="text-xs font-bold text-content-primary block">Software Engineering</span>
                  <span className="text-[10px] text-content-muted">Fullstack, Frontend, Backend</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-primary block">High</span>
                  <span className="text-[10px] text-content-muted">520+ lowongan</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-subsurface rounded-lg">
                <div>
                  <span className="text-xs font-bold text-content-primary block">Data & Intelligence</span>
                  <span className="text-[10px] text-content-muted">Analyst, Engineer, AI Specialist</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-primary block">High</span>
                  <span className="text-[10px] text-content-muted">380+ lowongan</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-subsurface rounded-lg">
                <div>
                  <span className="text-xs font-bold text-content-primary block">Infrastructure & Security</span>
                  <span className="text-[10px] text-content-muted">DevOps, Cloud, Cyber Sec</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-primary block">Moderate</span>
                  <span className="text-[10px] text-content-muted">260+ lowongan</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-content-muted leading-relaxed mt-4 pt-3 border-t border-divider">
              Data kebutuhan pasar kerja dinormalisasi ke dalam skala 0 hingga 1 untuk perhitungan kriteria C3 dalam metode Simple Additive Weighting.
            </p>
          </Card>
        </div>
      </section>

      {/* Career Catalog Explorer Preview */}
      <section className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-content-primary">
              Alternatif Karir Bidang TI
            </h2>
            <p className="text-xs text-content-muted mt-0.5">
              Pilihan karir yang dievaluasi dan dibandingkan dalam sistem rekomendasi.
            </p>
          </div>
          <Link 
            href="/eksplorasi"
            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <span>Lihat Semua ({Object.keys(careers).length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(careers).slice(0, 4).map(([name, data]) => (
            <Card key={name} className="p-4.5 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div>
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 font-bold text-base flex items-center justify-center mb-3">
                  {data.icon || '⌘'}
                </div>
                <h3 className="text-xs font-bold text-content-primary mb-1">
                  {name}
                </h3>
                <p className="text-[11px] text-content-muted leading-relaxed line-clamp-2 mb-3">
                  {data.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-divider flex items-center justify-between text-[11px]">
                <span className="font-mono text-content-muted">
                  RIASEC: {data.riasecMapped?.join('') || '-'}
                </span>
                <Link
                  href={`/eksplorasi/${name}`}
                  className="font-semibold text-primary hover:underline"
                >
                  Detail
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <footer className="pt-8 pb-4 border-t border-divider text-center text-xs text-content-muted">
        <p>CareerPath TI: Sistem Pendukung Keputusan Rekomendasi Karir Bidang Teknologi Informasi</p>
        <p className="text-[11px] mt-1 text-content-muted/80">Metodologi: Simple Additive Weighting (SAW) dan Model Minat Holland RIASEC</p>
      </footer>
    </main>
  );
}
