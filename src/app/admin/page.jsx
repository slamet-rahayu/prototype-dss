"use client";

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { StatCardSkeleton, TableSkeleton, Skeleton } from '@/components/Skeleton';
import {
  Users,
  Briefcase,
  Sliders,
  Clock,
  History,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { students, careers, sawWeights, schedulerJobs, recommendationHistory } = useContext(AppContext);
  const router = useRouter();
  const [toast, setToast] = useState({ show: false, message: '' });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest('/admin/dashboard')
      .then(res => {
        if (active && res.data) {
          setDashboardStats(res.data);
        }
      })
      .catch(err => {
        console.warn('Gagal memuat statistik live dari API admin:', err.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const totalStudents = dashboardStats?.studentCount ?? students.length;
  const totalCareers = dashboardStats?.careerCount ?? Object.keys(careers).length;
  const weights = dashboardStats?.sawWeights ?? sawWeights;
  const activeSchedulerCount = dashboardStats?.activeSchedulers ?? schedulerJobs.filter(j => j.status === 'Aktif').length;
  const recentHistoryList = dashboardStats?.recentHistories ?? recommendationHistory;
  const recentStudentList = dashboardStats?.recentStudents ?? students;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
        <span>Panel Administrator</span>
        <span>/</span>
        <span className="text-content-primary font-medium">Dashboard</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-divider">
        <div>
          <h1 className="text-2xl sm:text-2.5xl font-bold text-content-primary tracking-tight">
            Dashboard Administrator
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Pantau status data master, bobot kriteria SAW, dan riwayat kalkulasi rekomendasi mahasiswa.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Sistem Berjalan Normal</span>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      {isLoading ? (
        <StatCardSkeleton count={4} className="mb-8" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
              Total Mahasiswa
            </span>
            <div className="text-2xl font-mono font-bold text-content-primary leading-tight mb-1">
              {totalStudents}
            </div>
            <span className="text-[11px] text-content-muted">
              Akun mahasiswa terdaftar
            </span>
          </Card>

          <Card className="p-5">
            <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
              Alternatif Karir TI
            </span>
            <div className="text-2xl font-mono font-bold text-content-primary leading-tight mb-1">
              {totalCareers}
            </div>
            <span className="text-[11px] text-content-muted">
              Pilihan karir dalam sistem
            </span>
          </Card>

          <Card className="p-5">
            <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
              Bobot Kriteria SAW
            </span>
            <div className="text-2xl font-mono font-bold text-primary dark:text-sky-300 leading-tight mb-1">
              {weights.c1}/{weights.c2}/{weights.c3}
            </div>
            <span className="text-[11px] text-content-muted">
              Proporsi C1/C2/C3 (%)
            </span>
          </Card>

          <Card className="p-5">
            <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
              Job Scheduler
            </span>
            <div className="text-2xl font-mono font-bold text-content-primary leading-tight mb-1">
              {activeSchedulerCount} <span className="text-sm font-normal text-content-muted">/ 3</span>
            </div>
            <span className="text-[11px] text-content-muted">
              Tugas sinkronisasi aktif
            </span>
          </Card>
        </div>
      )}

      {/* Main Grid: Distribution Chart & Overview Tables */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-divider">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-4 w-28" />
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </Card>
            <TableSkeleton rows={5} cols={3} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-5 space-y-3">
              <Skeleton className="h-4 w-36 mb-1" />
              <Skeleton className="h-3 w-52 mb-4" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </Card>
            <Card className="p-5 space-y-3">
              <Skeleton className="h-4 w-36 mb-1" />
              <Skeleton className="h-3 w-40 mb-3" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left Column: RIASEC Distribution & Student Table (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* RIASEC Distribution Bar Chart Card */}
          <Card className="p-6">
            <div className="pb-3 mb-6 border-b border-divider flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-content-primary">
                  Distribusi Minat Mahasiswa (RIASEC)
                </h2>
                <p className="text-xs text-content-muted mt-0.5">
                  Frekuensi agregat tipe kepribadian mahasiswa berdasarkan hasil tes minat
                </p>
              </div>
              <span className="text-xs font-mono text-content-muted">
                Sampel {totalStudents} Mahasiswa
              </span>
            </div>

            {/* Clean, Accessible Bar Chart */}
            <div className="space-y-3.5">
              {[
                { type: 'R', name: 'Realistic', pct: 68, count: '68%' },
                { type: 'I', name: 'Investigative', pct: 85, count: '85%' },
                { type: 'A', name: 'Artistic', pct: 58, count: '58%' },
                { type: 'S', name: 'Social', pct: 45, count: '45%' },
                { type: 'E', name: 'Enterprising', pct: 52, count: '52%' },
                { type: 'C', name: 'Conventional', pct: 64, count: '64%' }
              ].map((item) => (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-content-primary">
                      {item.type} - {item.name}
                    </span>
                    <span className="font-mono font-bold text-content-secondary">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-subsurface rounded-full overflow-hidden border border-divider">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Student Status Table Card */}
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-divider flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-content-primary">
                  Status Data Mahasiswa Terbaru
                </h2>
                <p className="text-xs text-content-muted mt-0.5">
                  Progres pengisian kriteria rekomendasi
                </p>
              </div>
              <Link 
                href="/admin/mahasiswa" 
                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted font-semibold">
                    <th className="py-2.5 px-4">Nama Mahasiswa</th>
                    <th className="py-2.5 px-4">Program Studi</th>
                    <th className="py-2.5 px-4 text-center">Status Kelengkapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {recentStudentList.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-subsurface/60 transition-colors">
                      <td className="py-3 px-4">
                        <strong className="font-semibold text-content-primary block leading-tight">
                          {item.name}
                        </strong>
                        <span className="text-[10px] text-content-muted font-mono">NIM: {item.nim}</span>
                      </td>
                      <td className="py-3 px-4 text-content-secondary">
                        {item.studyProgram}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Lengkap'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Quick Config Links & Alternatives (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Management Shortcuts */}
          <Card className="p-5">
            <h2 className="text-sm font-bold text-content-primary mb-1">
              Pintasan Konfigurasi
            </h2>
            <p className="text-xs text-content-muted mb-4">
              Akses cepat ke modul pengaturan kriteria dan pasar kerja
            </p>

            <div className="space-y-2.5">
              <Link
                href="/admin/konfigurasi"
                className="flex items-center gap-3 p-3 rounded-lg border border-divider bg-subsurface hover:bg-subsurface/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="text-xs font-semibold text-content-primary block leading-tight group-hover:text-primary">
                    Konfigurasi Bobot SAW
                  </strong>
                  <span className="text-[10px] text-content-muted block truncate">
                    Atur pembobotan C1, C2, dan C3
                  </span>
                </div>
              </Link>

              <Link
                href="/admin/riwayat"
                className="flex items-center gap-3 p-3 rounded-lg border border-divider bg-subsurface hover:bg-subsurface/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 flex items-center justify-center shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="text-xs font-semibold text-content-primary block leading-tight group-hover:text-primary">
                    Riwayat Rekomendasi
                  </strong>
                  <span className="text-[10px] text-content-muted block truncate">
                    Pantau log kalkulasi SAW mahasiswa
                  </span>
                </div>
              </Link>

              <Link
                href="/admin/scheduler"
                className="flex items-center gap-3 p-3 rounded-lg border border-divider bg-subsurface hover:bg-subsurface/80 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="text-xs font-semibold text-content-primary block leading-tight group-hover:text-primary">
                    Manajemen Scheduler
                  </strong>
                  <span className="text-[10px] text-content-muted block truncate">
                    Jadwal sinkronisasi background Adzuna
                  </span>
                </div>
              </Link>
            </div>
          </Card>

          {/* Alternatives Summary Card */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-divider">
              <h2 className="text-sm font-bold text-content-primary">
                Alternatif Karir ({Object.keys(careers).length})
              </h2>
              <Link 
                href="/admin/alternatif" 
                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Kelola
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {Object.entries(careers).slice(0, 4).map(([name, data]) => (
                <div key={name} className="flex items-center justify-between p-2 rounded bg-subsurface">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded bg-surface border border-divider text-primary dark:text-sky-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {data.icon || '⌘'}
                    </span>
                    <span className="font-semibold text-content-primary truncate max-w-[130px]">
                      {name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-content-muted">
                    {data.riasecMapped?.join('')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      )}

      <footer className="pt-6 pb-2 border-t border-divider text-center text-xs text-content-muted">
        CareerPath TI: Panel Administrator Sistem Pendukung Keputusan Rekomendasi Karir
      </footer>
    </main>
  );
}
