"use client";

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { DetailViewSkeleton } from '@/components/Skeleton';
import {
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer
} from 'lucide-react';

export default function Recommendations() {
  const { sawResults, riasecResult, academicComponents, sawWeights } = useContext(AppContext);
  const router = useRouter();

  const [selectedCareerName, setSelectedCareerName] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadLatest() {
      try {
        await apiRequest('/recommendations/latest');
      } catch {
        // Fallback to contextual calculated results
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadLatest();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (sawResults && sawResults.length > 0) {
      setSelectedCareerName(sawResults[0].name);
    }
  }, [sawResults]);

  if (isLoading) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <DetailViewSkeleton />
      </main>
    );
  }

  // Validation: Check criteria readiness
  const hasAcademic = academicComponents && academicComponents.length >= 5;
  const hasRiasec = riasecResult && riasecResult.completedAt;

  if (!hasRiasec || !hasAcademic) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <Card className="max-w-md mx-auto p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-content-primary mb-2">
            Kriteria Rekomendasi Belum Lengkap
          </h2>
          <p className="text-content-muted text-xs leading-relaxed mb-6">
            Metode Simple Additive Weighting (SAW) membutuhkan kelengkapan data nilai akademik dan hasil tes minat karir RIASEC untuk menghasilkan pemeringkatan yang valid.
          </p>
          <div className="grid gap-2.5">
            {!hasAcademic && (
              <button
                onClick={() => router.push('/akademik')}
                className="w-full py-2.5 px-4 bg-primary text-white font-semibold text-xs rounded-lg hover:bg-primary-dark transition-colors"
              >
                Lengkapi Data Nilai Akademik (C2)
              </button>
            )}
            {!hasRiasec && (
              <button
                onClick={() => router.push('/riasec')}
                className="w-full py-2.5 px-4 bg-primary text-white font-semibold text-xs rounded-lg hover:bg-primary-dark transition-colors"
              >
                Ikuti Tes Minat RIASEC (C1)
              </button>
            )}
            <Link 
              href="/" 
              className="text-xs text-content-muted hover:text-content-primary font-medium mt-2 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  const selectedCareer = sawResults.find(r => r.name === selectedCareerName) || sawResults[0];
  const topResult = sawResults[0];

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(riasecResult.completedAt));

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span>/</span>
        <span className="text-content-primary font-medium">Hasil Rekomendasi Karir</span>
      </nav>

      {/* Header and Context */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-divider">
        <div>
          <h1 className="text-2xl sm:text-2.5xl font-bold text-content-primary tracking-tight">
            Hasil Rekomendasi Karir TI
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Pemeringkatan preferensi alternatif karir berbasis metode Simple Additive Weighting (SAW).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-content-muted">
            Tanggal perhitungan: {formattedDate}
          </span>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-divider hover:bg-subsurface text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors flex items-center gap-1.5"
            title="Cetak lembar rekomendasi"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak Hasil</span>
          </button>
        </div>
      </div>

      {/* Top Alternative Highlight Card: Elevated Blue Showcase (Non-Flat) */}
      {topResult && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white p-6 sm:p-8 mb-8 border border-blue-400/30 shadow-[0_20px_40px_-15px_rgba(29,78,216,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]">
          {/* Subtle Ambient Geometric Compass Motif */}
          <div className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5 pointer-events-none select-none" aria-hidden="true">
            <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
              <circle cx="100" cy="100" r="80" strokeDasharray="6 6" />
              <polygon points="100,20 125,75 180,100 125,125 100,180 75,125 20,100 75,75" fill="currentColor" fillOpacity="0.04" />
              <circle cx="100" cy="100" r="10" fill="currentColor" fillOpacity="0.1" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Rekomendasi Utama (Peringkat 1)</span>
                </span>
                <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-blue-100 border border-white/15">
                  V_1 = {topResult.score}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3.5">
                <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-md">
                  {topResult.icon || '⌘'}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-2.5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-xs">
                    {topResult.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100/90 font-medium mt-0.5">{topResult.subtitle}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-2xl mb-5">
                Alternatif ini menempati urutan pertama dengan nilai preferensi tertinggi, mengindikasikan kesesuaian kuat antara profil minat {riasecResult.top?.join(', ')}, kompetensi akademik mata kuliah TI, dan serapan tenaga kerja industri.
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/20 text-blue-100 font-medium text-[11px]">
                  RIASEC Target: {topResult.tags?.[0] || 'I R C'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/20 text-blue-100 font-medium text-[11px]">
                  Volume Lowongan: {topResult.market?.vacancy || '500'} posisi
                </span>
                <Link
                  href={`/eksplorasi/${topResult.name}`}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs transition-all duration-150 shadow-md hover:shadow-lg flex items-center gap-1.5 ml-auto sm:ml-0"
                >
                  <span>Detail Kompetensi Karir</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Score Breakdown Box: Frosted Dimensional Panel */}
            <div className="w-full lg:w-72 bg-blue-950/50 backdrop-blur-md border border-white/20 rounded-xl p-5 shrink-0 flex flex-col justify-between shadow-lg shadow-black/10">
              <div>
                <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block mb-1">
                  Nilai Preferensi SAW
                </span>
                <div className="text-3.5xl sm:text-4xl font-mono font-extrabold text-white leading-none mb-1 tracking-tight drop-shadow-xs">
                  {topResult.score}
                </div>
                <span className="text-[10px] text-blue-200/80 leading-tight block">
                  Skala preferensi 0.00 hingga 1.00
                </span>
              </div>

              <div className="mt-4 pt-3.5 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white/10 backdrop-blur-xs border border-white/15 rounded-lg">
                  <span className="text-[9px] font-bold text-blue-200 block mb-0.5">C1 ({sawWeights?.c1 || 40}%)</span>
                  <span className="text-xs font-mono font-extrabold text-white">{topResult.c1?.val || '0.90'}</span>
                </div>
                <div className="p-2 bg-white/10 backdrop-blur-xs border border-white/15 rounded-lg">
                  <span className="text-[9px] font-bold text-blue-200 block mb-0.5">C2 ({sawWeights?.c2 || 35}%)</span>
                  <span className="text-xs font-mono font-extrabold text-white">{topResult.c2?.val || '0.88'}</span>
                </div>
                <div className="p-2 bg-white/10 backdrop-blur-xs border border-white/15 rounded-lg">
                  <span className="text-[9px] font-bold text-blue-200 block mb-0.5">C3 ({sawWeights?.c3 || 25}%)</span>
                  <span className="text-xs font-mono font-extrabold text-white">{topResult.c3?.val || '0.85'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advisory Note */}
      <div className="mb-6 p-3.5 rounded-lg border border-divider bg-subsurface/60 text-xs text-content-secondary leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          Catatan Akademik: Hasil rekomendasi ini berfungsi sebagai sistem pendukung keputusan (decision support tool) untuk konsultasi karir dan rencana studi. Mahasiswa disarankan mengonfirmasikan hasil dengan dosen pembimbing akademik.
        </span>
      </div>

      {/* Main Grid: Ranking Table and Selected Career Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left Column: Full Ranking Table (lg:col-span-7) */}
        <div className="lg:col-span-7">
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-divider flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-content-primary">
                  Tabel Peringkat Alternatif Karir
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Klik pada baris karir untuk menelaah kontribusi tiap kriteria.
                </p>
              </div>
              <span className="text-xs font-mono text-content-muted">
                {sawResults.length} Alternatif
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-subsurface border-b border-divider text-content-muted font-semibold text-[11px]">
                    <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-4">Alternatif Karir</th>
                    <th className="py-2.5 px-4 text-right font-mono">C1 (Minat)</th>
                    <th className="py-2.5 px-4 text-right font-mono">C2 (Akademik)</th>
                    <th className="py-2.5 px-4 text-right font-mono">C3 (Pasar)</th>
                    <th className="py-2.5 px-4 text-right font-mono font-bold">Skor (V)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {sawResults.map((item, index) => {
                    const isSelected = selectedCareerName === item.name;
                    return (
                      <tr 
                        key={item.name}
                        onClick={() => setSelectedCareerName(item.name)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-primary/5 dark:bg-primary/10 font-semibold' 
                            : 'hover:bg-subsurface/60'
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={`inline-block w-6 h-6 rounded text-xs leading-6 ${
                            index === 0 
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold' 
                              : 'text-content-muted'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-content-primary leading-tight">{item.name}</div>
                          <div className="text-[10px] text-content-muted truncate">{item.subtitle}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-content-secondary">
                          {item.c1?.val || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-content-secondary">
                          {item.c2?.val || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-content-secondary">
                          {item.c3?.val || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-primary dark:text-sky-300">
                          {item.score}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Selected Career Criteria Deep Dive (lg:col-span-5) */}
        {selectedCareer && (
          <div className="lg:col-span-5">
            <Card className="p-5 flex flex-col gap-5">
              <div className="pb-3 border-b border-divider">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted">
                    Inspeksi Kriteria
                  </span>
                  <span className="text-xs font-mono font-bold text-primary">
                    V = {selectedCareer.score}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-content-primary">
                  {selectedCareer.name}
                </h3>
                <p className="text-xs text-content-muted">{selectedCareer.subtitle}</p>
              </div>

              {/* Formula & Weight Contribution Bars */}
              <div className="space-y-4">
                {/* C1 RIASEC */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-content-primary">
                      C1: Minat RIASEC (Bobot {sawWeights?.c1 || 40}%)
                    </span>
                    <span className="font-mono font-bold text-content-primary">
                      {selectedCareer.c1?.val}
                    </span>
                  </div>
                  <p className="text-[11px] text-content-muted mb-1.5 leading-tight">
                    {selectedCareer.c1?.desc || 'Kesesuaian dengan profil minat dominan mahasiswa.'}
                  </p>
                  <div className="h-1.5 w-full bg-subsurface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${selectedCareer.c1?.pct || 75}%` }} 
                    />
                  </div>
                </div>

                {/* C2 Academic */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-content-primary">
                      C2: Nilai Akademik (Bobot {sawWeights?.c2 || 35}%)
                    </span>
                    <span className="font-mono font-bold text-content-primary">
                      {selectedCareer.c2?.val}
                    </span>
                  </div>
                  <p className="text-[11px] text-content-muted mb-1.5 leading-tight">
                    {selectedCareer.c2?.desc || 'Kesesuaian capaian mata kuliah prasyarat.'}
                  </p>
                  <div className="h-1.5 w-full bg-subsurface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${selectedCareer.c2?.pct || 75}%` }} 
                    />
                  </div>
                </div>

                {/* C3 Market Demand */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-content-primary">
                      C3: Kebutuhan Pasar (Bobot {sawWeights?.c3 || 25}%)
                    </span>
                    <span className="font-mono font-bold text-content-primary">
                      {selectedCareer.c3?.val}
                    </span>
                  </div>
                  <p className="text-[11px] text-content-muted mb-1.5 leading-tight">
                    {selectedCareer.c3?.desc || 'Volume kebutuhan dan lowongan di industri TI.'}
                  </p>
                  <div className="h-1.5 w-full bg-subsurface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${selectedCareer.c3?.pct || 75}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Mathematical summary */}
              <div className="p-3 bg-subsurface rounded-lg border border-divider text-[11px] text-content-secondary leading-relaxed">
                <span className="font-semibold block mb-0.5 text-content-primary">
                  Perhitungan Preferensi:
                </span>
                V = ({sawWeights?.c1 || 40}% × {selectedCareer.c1?.val}) + ({sawWeights?.c2 || 35}% × {selectedCareer.c2?.val}) + ({sawWeights?.c3 || 25}% × {selectedCareer.c3?.val}) = <strong className="font-mono text-primary">{selectedCareer.score}</strong>
              </div>

              <div className="pt-2 flex gap-2">
                <Link
                  href={`/eksplorasi/${selectedCareer.name}`}
                  className="w-full py-2 px-3 text-center bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Buka Profil Karir Lengkap
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Methodology Section */}
      <section className="mb-10">
        <Card className="p-6">
          <h3 className="text-sm font-bold text-content-primary mb-1">
            Transparansi Metode Simple Additive Weighting (SAW)
          </h3>
          <p className="text-xs text-content-muted mb-4 leading-relaxed">
            Metode SAW (dikenal juga sebagai metode penjumlahan terbobot) mencari penjumlahan terbobot dari rating kinerja pada setiap alternatif di semua kriteria.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-subsurface rounded-lg border border-divider">
              <span className="font-bold text-content-primary block mb-1">1. Normalisasi Matriks (R_ij)</span>
              <p className="text-[11px] text-content-muted leading-relaxed">
                Seluruh nilai kriteria dikonversi ke kriteria keuntungan (benefit criteria) dengan skala 0 sampai 1.
              </p>
            </div>
            <div className="p-3 bg-subsurface rounded-lg border border-divider">
              <span className="font-bold text-content-primary block mb-1">2. Perkalian Bobot (w_j)</span>
              <p className="text-[11px] text-content-muted leading-relaxed">
                Nilai ternormalisasi dikalikan dengan bobot preferensi kriteria yang ditetapkan oleh pengambil keputusan.
              </p>
            </div>
            <div className="p-3 bg-subsurface rounded-lg border border-divider">
              <span className="font-bold text-content-primary block mb-1">3. Nilai Preferensi (V_i)</span>
              <p className="text-[11px] text-content-muted leading-relaxed">
                Nilai V_i yang lebih besar mengindikasikan bahwa alternatif karir tersebut lebih direkomendasikan.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <footer className="pt-6 pb-2 border-t border-divider text-center text-xs text-content-muted">
        CareerPath TI: Sistem Pendukung Keputusan Rekomendasi Karir Mahasiswa TI
      </footer>
    </main>
  );
}
