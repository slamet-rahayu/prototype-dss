import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Toast from '../../components/Toast';
import {
  Users,
  BookOpen,
  Settings,
  Clock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const { students, careers, sawWeights, schedulerJobs, recommendationHistory } = useContext(AppContext);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const activeSchedulerCount = schedulerJobs.filter(j => j.status === 'Aktif').length;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-slate-500">Beranda Admin</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Dashboard Admin</h1>
          <p className="text-slate-500 text-sm mt-2">Selamat datang di Panel Administrator CareerPath. Kelola data master, konfigurasi, dan pantau riwayat rekomendasi mahasiswa.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sistem Online
        </span>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute right-[-24px] bottom-[-24px] w-24 h-24 rounded-full bg-primary-light/30 -z-0" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Total Mahasiswa</span>
            <div>
              <strong className="text-3xl font-black text-slate-900 leading-none block mb-1">{students.length}</strong>
              <span className="text-[10px] text-slate-400 font-medium">Mahasiswa terdaftar</span>
            </div>
          </div>
        </article>

        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute right-[-24px] bottom-[-24px] w-24 h-24 rounded-full bg-primary-light/30 -z-0" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Alternatif Karir</span>
            <div>
              <strong className="text-3xl font-black text-slate-900 leading-none block mb-1">{Object.keys(careers).length}</strong>
              <span className="text-[10px] text-slate-400 font-medium">Pilihan karir terdaftar</span>
            </div>
          </div>
        </article>

        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute right-[-24px] bottom-[-24px] w-24 h-24 rounded-full bg-primary-light/30 -z-0" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Bobot SAW</span>
            <div>
              <strong className="text-3xl font-black text-slate-900 leading-none block mb-1">{sawWeights.c1}/{sawWeights.c2}/{sawWeights.c3}</strong>
              <span className="text-[10px] text-slate-400 font-medium">Proporsi C1/C2/C3 (%)</span>
            </div>
          </div>
        </article>
      </section>

      {/* Main Grid Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left Column (lg:col-span-8) */}
        <div className="lg:col-span-8 grid gap-6">
          {/* Pure CSS Bar Chart: RIASEC interest distribution */}
          <article className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Distribusi Minat RIASEC</h2>
                <p className="text-slate-500 text-xs mt-0.5">Proporsi kecenderungan minat mahasiswa terdaftar berdasarkan hasil tes.</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-primary text-xs font-black">
                ● Mahasiswa Aktif
              </span>
            </div>

            {/* Custom Responsive CSS Bar Graph */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-stretch gap-6 h-80">
              {/* Y Axis Legend */}
              <div className="hidden md:flex flex-col justify-between text-[11px] text-slate-400 text-right pr-2 select-none">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Bars container */}
              <div className="flex-1 border-b border-slate-200 relative bg-slate-50/20 grid grid-cols-6 gap-4 items-end px-4 pb-2">
                {/* Horizontal gridlines */}
                <div className="absolute inset-x-0 top-1/4 border-b border-slate-100 pointer-events-none" />
                <div className="absolute inset-x-0 top-2/4 border-b border-slate-100 pointer-events-none" />
                <div className="absolute inset-x-0 top-3/4 border-b border-slate-100 pointer-events-none" />

                {/* Realistic */}
                <div className="flex flex-col items-center gap-2 group h-full justify-end cursor-pointer">
                  <div className="w-full bg-gradient-to-t from-primary-dark to-primary rounded-t-lg transition-all duration-350 hover:scale-x-105" style={{ height: '70%' }} />
                  <span className="text-[11px] text-slate-500 font-bold block">R</span>
                </div>
                {/* Investigative */}
                <div className="flex flex-col items-center gap-2 group h-full justify-end cursor-pointer">
                  <div className="w-full bg-gradient-to-t from-primary-dark to-primary rounded-t-lg transition-all duration-350 hover:scale-x-105" style={{ height: '85%' }} />
                  <span className="text-[11px] text-slate-500 font-bold block">I</span>
                </div>
                {/* Artistic */}
                <div className="flex flex-col items-center gap-2 group h-full justify-end cursor-pointer">
                  <div className="w-full bg-gradient-to-t from-primary-dark to-primary rounded-t-lg transition-all duration-350 hover:scale-x-105" style={{ height: '62%' }} />
                  <span className="text-[11px] text-slate-500 font-bold block">A</span>
                </div>
                {/* Social */}
                <div className="flex flex-col items-center gap-2 group h-full justify-end cursor-pointer">
                  <div className="w-full bg-gradient-to-t from-primary-dark to-primary rounded-t-lg transition-all duration-350 hover:scale-x-105" style={{ height: '48%' }} />
                  <span className="text-[11px] text-slate-500 font-bold block">S</span>
                </div>
                {/* Enterprising */}
                <div className="flex flex-col items-center gap-2 group h-full justify-end cursor-pointer">
                  <div className="w-full bg-gradient-to-t from-primary-dark to-primary rounded-t-lg transition-all duration-350 hover:scale-x-105" style={{ height: '55%' }} />
                  <span className="text-[11px] text-slate-500 font-bold block">E</span>
                </div>
                {/* Conventional */}
                <div className="flex flex-col items-center gap-2 group h-full justify-end cursor-pointer">
                  <div className="w-full bg-gradient-to-t from-primary-dark to-primary rounded-t-lg transition-all duration-350 hover:scale-x-105" style={{ height: '66%' }} />
                  <span className="text-[11px] text-slate-500 font-bold block">C</span>
                </div>
              </div>
            </div>
          </article>

          {/* Student Status Table Overview */}
          <article className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Status Data Mahasiswa</h2>
                <p className="text-slate-500 text-xs mt-0.5">Daftar mahasiswa terdaftar beserta kelengkapan data rekomendasinya.</p>
              </div>
              <button
                onClick={() => navigate('/admin/mahasiswa')}
                className="text-xs font-black text-primary hover:text-primary-dark hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                    <th className="px-5 py-3.5">Mahasiswa</th>
                    <th className="px-5 py-3.5">Program Studi</th>
                    <th className="px-5 py-3.5">Status Data</th>

                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {students.slice(0, 3).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-primary-light text-primary-dark text-[10px] font-black grid place-items-center">
                            {item.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
                          </span>
                          <div>
                            <strong className="text-slate-800 block font-bold">{item.name}</strong>
                            <span className="text-[10px] text-slate-400 font-medium">NIM: {item.nim}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-medium">
                        {item.studyProgram}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${item.status === 'Lengkap'
                          ? 'text-emerald-800 bg-emerald-50'
                          : 'text-amber-800 bg-amber-50'
                          }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        {/* Right Column (lg:col-span-4) */}
        <div className="lg:col-span-4 grid gap-6">
          {/* Quick Actions Card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-1">Aksi Cepat</h2>
            <p className="text-slate-500 text-xs mb-5">Pintasan pengaturan kriteria, data scheduler, dan log sistem.</p>

            <div className="grid gap-3.5">
              <button
                onClick={() => navigate('/admin/konfigurasi')}
                className="flex items-center gap-3.5 p-3.5 border border-slate-100 hover:border-blue-200 rounded-xl bg-slate-50/30 hover:bg-blue-50/10 text-left transition-all w-full"
              >
                <span className="w-9 h-9 rounded-lg bg-primary-light text-primary-dark grid place-items-center text-sm shrink-0">
                  ⚙
                </span>
                <div>
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">Konfigurasi SAW</strong>
                  <span className="text-[10px] text-slate-400 block font-medium">Ubah kriteria, weights, dan relevansi.</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/pasar-kerja')}
                className="flex items-center gap-3.5 p-3.5 border border-slate-100 hover:border-blue-200 rounded-xl bg-slate-50/30 hover:bg-blue-50/10 text-left transition-all w-full"
              >
                <span className="w-9 h-9 rounded-lg bg-primary-light text-primary-dark grid place-items-center text-sm shrink-0">
                  ▤
                </span>
                <div>
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">Perbarui Data Pasar Kerja</strong>
                  <span className="text-[10px] text-slate-400 block font-medium">Kelola database pasar kerja IT.</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/scheduler')}
                className="flex items-center gap-3.5 p-3.5 border border-slate-100 hover:border-blue-200 rounded-xl bg-slate-50/30 hover:bg-blue-50/10 text-left transition-all w-full"
              >
                <span className="w-9 h-9 rounded-lg bg-primary-light text-primary-dark grid place-items-center text-sm shrink-0">
                  ◷
                </span>
                <div>
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">Jalankan Pembaruan Manual</strong>
                  <span className="text-[10px] text-slate-400 block font-medium">Pembaruan data secara manual.</span>
                </div>
              </button>
            </div>
          </article>

          {/* Alternative Careers Overview */}
          <article className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">Ringkasan Alternatif Karir</h2>
              
            </div>

            <div className="px-6 py-2.5 divide-y divide-slate-100">
              {Object.entries(careers).slice(0, 4).map(([name, data], index) => (
                <div key={name} className="flex items-center gap-3 py-3 text-xs justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-primary-light text-primary-dark text-xs font-black grid place-items-center">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <strong className="text-xs font-black text-slate-900 block truncate leading-tight mb-0.5">{name}</strong>
                      <span className="text-[9.5px] text-slate-400 block font-bold leading-none">RIASEC: {data.riasecMapped.join('')}</span>
                    </div>
                  </div>
                  <strong className="text-primary-dark text-[10.5px] whitespace-nowrap">100 Lowongan</strong>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5 border-t border-slate-50 pt-5">
              <button
                onClick={() => navigate('/admin/alternatif')}
                className="w-full py-2 bg-primary-light/60 hover:bg-primary-light/85 text-primary-dark font-bold text-xs rounded-lg transition-colors border border-primary-light"
              >
                Kelola Alternatif Karir →
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <footer className="mt-16 text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        CareerPath · Sistem Rekomendasi Karir untuk Mahasiswa Tingkat Akhir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
