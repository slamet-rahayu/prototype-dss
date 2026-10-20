"use client";

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { DetailViewSkeleton } from '@/components/Skeleton';
import { RotateCcw, Info, ChevronRight, CheckCircle2 } from 'lucide-react';

const TYPE_INFO = {
  R: {
    name: "Realistic",
    description: "Praktis, teknis, perangkat keras, infrastruktur TI, dan jaringan komputer.",
    examples: "Area karir relevan: Network Administrator, DevOps Engineer, dan IT Infrastructure."
  },
  I: {
    name: "Investigative",
    description: "Analisis logis, pemecahan masalah algoritma, riset teknologi, dan sains data.",
    examples: "Area karir relevan: Software Engineer, Data Analyst, dan Cybersecurity Analyst."
  },
  A: {
    name: "Artistic",
    description: "Kreativitas desain, pengalaman visual pengguna, dan konsep produk interaktif.",
    examples: "Area karir relevan: UI/UX Designer, Frontend Specialist, dan Digital Product Design."
  },
  S: {
    name: "Social",
    description: "Komunikasi kebutuhan, pendampingan pengguna, pelatihan, dan relasi tim.",
    examples: "Area karir relevan: IT Consultant, IT Support Specialist, dan Business Analyst."
  },
  E: {
    name: "Enterprising",
    description: "Kepemimpinan proyek, inisiatif strategi, komunikasi persuasif, dan bisnis TI.",
    examples: "Area karir relevan: IT Product Manager, Scrum Master, dan Technology Sales."
  },
  C: {
    name: "Conventional",
    description: "Ketelitian prosedur, administrasi data terstruktur, dan penjaminan kualitas.",
    examples: "Area karir relevan: Database Administrator, QA Engineer, dan IT Governance."
  }
};

export default function RiasecResult() {
  const { riasecResult, setRiasecResult, setRiasecProgress } = useContext(AppContext);
  const router = useRouter();
  const [toast, setToast] = useState({ show: false, message: '' });
  const [loading, setLoading] = useState(!riasecResult?.completedAt);

  useEffect(() => {
    let active = true;
    if (!riasecResult?.completedAt) {
      setLoading(true);
      apiRequest('/riasec/my-result')
        .then(res => {
          if (active && res.data) {
            const topLetters = res.data.topHolland 
              ? res.data.topHolland.split('') 
              : ['I', 'R', 'C'];

            setRiasecResult({
              scores: res.data.scores,
              top: topLetters,
              completedAt: res.data.completedAt
            });
          }
        })
        .catch(err => {
          console.warn('Could not fetch RIASEC result:', err.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => { active = false; };
  }, [riasecResult, setRiasecResult]);

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin mengulang tes? Seluruh jawaban sebelumnya akan dihapus.")) {
      setRiasecResult(null);
      setRiasecProgress({ currentIndex: 0, answers: Array(18).fill(null) });
      triggerToast("Hasil tes diatur ulang. Mengalihkan ke halaman tes...");
      setTimeout(() => {
        router.push('/riasec');
      }, 600);
    }
  };

  if (loading) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/riasec" className="hover:text-primary transition-colors">Tes Minat</Link>
          <span>/</span>
          <span className="text-content-primary font-medium">Hasil Analisis RIASEC</span>
        </nav>
        <DetailViewSkeleton />
      </main>
    );
  }

  if (!riasecResult || !riasecResult.completedAt) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <Card className="max-w-md mx-auto p-8 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Info className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-content-primary mb-2">
            Hasil Tes Belum Tersedia
          </h2>
          <p className="text-xs text-content-muted leading-relaxed mb-6">
            Anda belum menyelesaikan Tes Minat Karir RIASEC. Silakan ikuti tes terlebih dahulu untuk menghasilkan profil minat vokasional.
          </p>
          <button 
            onClick={() => router.push('/riasec')}
            className="w-full py-2.5 px-4 bg-primary text-white font-semibold text-xs rounded-lg hover:bg-primary-dark transition-colors"
          >
            Mulai Tes RIASEC
          </button>
          <div className="mt-3">
            <Link href="/" className="text-xs text-content-muted hover:text-content-primary font-medium">
              Kembali ke Beranda
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(riasecResult.completedAt));

  const hollandCode = riasecResult.top.join('');

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/riasec" className="hover:text-primary transition-colors">Tes RIASEC</Link>
        <span>/</span>
        <span className="text-content-primary font-medium">Hasil Analisis</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-divider">
        <div>
          <h1 className="text-2xl sm:text-2.5xl font-bold text-content-primary tracking-tight">
            Hasil Analisis Minat Karir RIASEC
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Distribusi skor kepribadian vokasional model John Holland sebagai input kriteria C1 dalam SAW.
          </p>
        </div>
        <div className="text-xs font-mono text-content-muted">
          Selesai pada: {formattedDate}
        </div>
      </div>

      <div className="space-y-6">
        {/* Dominant Holland Code Highlight Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary text-white font-mono font-bold text-2xl flex items-center justify-center tracking-wider shrink-0 shadow-xs">
                {hollandCode}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                  Kode Holland Dominan
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-content-primary leading-tight mb-1">
                  Tipe Dominan: {riasecResult.top.map(t => TYPE_INFO[t]?.name).join(', ')}
                </h2>
                <p className="text-xs text-content-muted leading-relaxed max-w-xl">
                  {TYPE_INFO[riasecResult.top[0]]?.description}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => router.push('/rekomendasi')}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Lihat Rekomendasi Karir</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 border border-divider hover:bg-subsurface text-content-secondary hover:text-content-primary rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi Tes</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Score Distribution & Top 3 Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Full 6 Dimensions Bar Chart (lg:col-span-7) */}
          <div className="lg:col-span-7">
            <Card className="p-6">
              <div className="pb-3 mb-5 border-b border-divider flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-content-primary">
                    Distribusi 6 Dimensi Holland
                  </h3>
                  <p className="text-xs text-content-muted mt-0.5">
                    Perolehan skor dari akumulasi jawaban pada setiap kategori
                  </p>
                </div>
                <span className="text-xs font-mono text-content-muted">Skala Maks 15</span>
              </div>

              <div className="space-y-4">
                {Object.entries(TYPE_INFO).map(([code, info]) => {
                  const score = riasecResult.scores[code] || 0;
                  const pct = Math.round((score / 15) * 100);
                  const isTop = riasecResult.top.includes(code);

                  return (
                    <div key={code} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded text-[11px] font-mono font-bold flex items-center justify-center ${
                            isTop 
                              ? 'bg-primary text-white' 
                              : 'bg-subsurface border border-divider text-content-muted'
                          }`}>
                            {code}
                          </span>
                          <span className={`font-semibold ${isTop ? 'text-content-primary' : 'text-content-secondary'}`}>
                            {info.name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-content-primary">
                          {score} <span className="text-content-muted font-normal text-[11px]">/ 15</span>
                        </span>
                      </div>

                      <div className="h-2 w-full bg-subsurface rounded-full overflow-hidden border border-divider">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isTop ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column: Top 3 Dimensions Breakdown (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <Card className="p-6">
              <div className="pb-3 mb-4 border-b border-divider">
                <h3 className="text-sm font-bold text-content-primary">
                  Tiga Dimensi Tertinggi
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Digunakan untuk menghitung koefisien kecocokan alternatif karir
                </p>
              </div>

              <div className="space-y-3">
                {riasecResult.top.map((code, index) => {
                  const score = riasecResult.scores[code] || 0;
                  return (
                    <div key={code} className="p-3.5 rounded-lg border border-divider bg-subsurface">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 text-[11px] font-mono font-bold flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-bold text-content-primary">
                            {code}: {TYPE_INFO[code]?.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-primary">
                          {score} Poin
                        </span>
                      </div>
                      <p className="text-[11px] text-content-secondary leading-relaxed">
                        {TYPE_INFO[code]?.examples}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-divider text-[11px] text-content-muted leading-relaxed">
                Skor pada ketiga dimensi ini dipetakan ke profil bobot RIASEC setiap alternatif karir untuk menghasilkan nilai kriteria C1 dalam matriks SAW.
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <footer className="pt-8 pb-4 text-center text-xs text-content-muted">
        CareerPath TI: Sistem Pendukung Keputusan Rekomendasi Karir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
