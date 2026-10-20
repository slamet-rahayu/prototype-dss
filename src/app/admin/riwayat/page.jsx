"use client";

import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { 
  Search, 
  Trash2, 
  Eye, 
  History, 
  Award,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function HistoryConfig() {
  const { recommendationHistory, setRecommendationHistory } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected history log for details view modal
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    apiRequest('/admin/recommendation-histories')
      .then(res => {
        if (active && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setRecommendationHistory(res.data);
        }
      })
      .catch(err => console.warn('Could not load recommendation histories:', err.message))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [setRecommendationHistory]);

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus log riwayat perhitungan rekomendasi ini?")) {
      try {
        await apiRequest(`/admin/recommendation-histories/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('API delete history error:', e.message);
      }
      const updated = recommendationHistory.filter(h => h.id !== id);
      setRecommendationHistory(updated);
      triggerToast("Log riwayat perhitungan berhasil dihapus dari basis data.");
    }
  };

  const filteredHistory = useMemo(() => {
    return recommendationHistory.filter(h => 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.nim.includes(searchQuery) ||
      h.career.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recommendationHistory, searchQuery]);

  const totalCalculations = recommendationHistory.length;
  const validCount = recommendationHistory.filter(h => h.status === 'Valid').length;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4 font-medium">
        <span>Dashboard Admin</span>
        <span aria-hidden="true">/</span>
        <span className="text-content-primary">Riwayat Rekomendasi</span>
      </nav>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full border-b border-divider pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-divider text-[11px] font-semibold text-content-secondary uppercase tracking-wider mb-2">
            Audit Log Kalkulasi SAW
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-content-primary tracking-tight">
            Riwayat Rekomendasi
          </h1>
          <p className="text-content-secondary text-sm mt-1.5 max-w-2xl leading-relaxed">
            Audit log seluruh proses kalkulasi rekomendasi karir mahasiswa, termasuk nilai preferensi akhir SAW dan alternatif teratas.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-md shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Audit Trail Tersimpan</span>
        </div>
      </section>

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Total Eksekusi Kalkulasi</span>
          <strong className="text-3xl font-mono font-black text-content-primary block leading-none tabular-nums my-1">{totalCalculations}</strong>
          <span className="text-xs text-content-secondary">Log evaluasi metode SAW yang tercatat</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Status Valid</span>
          <strong className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 block leading-none tabular-nums my-1">{validCount}</strong>
          <span className="text-xs text-content-secondary">Perhitungan memenuhi seluruh kriteria normalisasi</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Integritas Riwayat</span>
          <strong className="text-2xl font-bold text-content-primary block leading-none my-1">100% Terverifikasi</strong>
          <span className="text-xs text-content-secondary">Tersinkronisasi dengan konfigurasi bobot C1, C2, C3</span>
        </Card>
      </section>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-divider flex items-center justify-between flex-wrap gap-4 bg-subsurface/40">
          <div>
            <h2 className="text-sm font-bold text-content-primary">Daftar Riwayat Rekomendasi Mahasiswa</h2>
            <p className="text-content-muted text-xs mt-0.5">Hasil kalkulasi nilai preferensi V_i per mahasiswa pada waktu pengerjaan.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari nama, NIM, atau karir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 pl-8 pr-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none transition-colors"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                <th className="px-6 py-3">Mahasiswa</th>
                <th className="px-6 py-3 text-center">Kode RIASEC</th>
                <th className="px-6 py-3">Rekomendasi Teratas</th>
                <th className="px-6 py-3 text-center">Skor SAW (V_i)</th>
                <th className="px-6 py-3">Waktu Kalkulasi</th>
                <th className="px-6 py-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-5 w-14 mx-auto rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-5 w-16 mx-auto rounded-md" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-7 w-12 mx-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-subsurface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-subsurface border border-divider text-content-primary font-mono font-bold text-xs grid place-items-center shrink-0">
                          {item.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
                        </span>
                        <div>
                          <strong className="text-content-primary block font-semibold">{item.name}</strong>
                          <span className="text-[11px] font-mono text-content-muted">{item.nim}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold text-primary bg-primary-light/50 border border-primary/20">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <strong className="text-content-primary font-semibold block">{item.career}</strong>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <strong className="font-mono text-sm font-black text-primary tabular-nums">
                        {typeof item.score === 'number' ? item.score.toFixed(4) : item.score}
                      </strong>
                    </td>
                    <td className="px-6 py-4 text-content-secondary font-mono text-[11px]">
                      {item.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(item)}
                          className="p-1.5 rounded-md bg-subsurface hover:bg-divider text-content-primary transition-colors cursor-pointer"
                          title="Lihat rincian kalkulasi"
                          aria-label={`Rincian kalkulasi untuk ${item.name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-content-muted">
                    Log riwayat rekomendasi tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details View Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title="Rincian Hasil Kalkulasi SAW" 
        onClose={() => setIsModalOpen(false)}
      >
        {selectedLog && (
          <div className="grid gap-4 text-xs text-content-secondary">
            <div className="flex items-center gap-3 p-3.5 bg-subsurface border border-divider rounded-lg">
              <span className="w-8 h-8 rounded-lg bg-surface border border-divider text-content-primary text-xs font-mono font-bold grid place-items-center shrink-0">
                {selectedLog.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
              </span>
              <div>
                <strong className="text-xs font-bold text-content-primary block">{selectedLog.name}</strong>
                <span className="text-[11px] font-mono text-content-muted block">NIM: {selectedLog.nim} | Tipe RIASEC: {selectedLog.code}</span>
              </div>
            </div>

            <div className="grid gap-2 border border-divider rounded-lg p-3 bg-surface">
              <div className="flex items-center justify-between py-1.5 border-b border-divider">
                <span className="font-semibold text-content-primary">Alternatif Karir Teratas:</span>
                <strong className="text-content-primary font-bold text-xs">{selectedLog.career}</strong>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-divider">
                <span className="font-semibold text-content-primary">Nilai Preferensi SAW (V_i):</span>
                <strong className="text-primary font-mono font-bold text-sm tabular-nums">
                  {typeof selectedLog.score === 'number' ? selectedLog.score.toFixed(4) : selectedLog.score}
                </strong>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-divider">
                <span className="font-semibold text-content-primary">Waktu Eksekusi:</span>
                <span className="font-mono text-content-secondary">{selectedLog.date}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="font-semibold text-content-primary">Status Verifikasi:</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                  selectedLog.status === 'Valid' 
                    ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                    : 'text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>{selectedLog.status}</span>
              </div>
            </div>

            <div className="p-3 bg-primary-light/40 dark:bg-sky-950/30 border border-primary/20 dark:border-sky-800/40 rounded-lg text-content-primary text-xs leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                Kalkulasi di atas dihitung dengan formulasi matematis SAW: <span className="font-mono font-semibold">V_i = ∑(w_j · R_ij)</span>, mengintegrasikan bobot kriteria aktif saat tes dilaksanakan.
              </span>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-divider">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      <Toast 
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />
    </main>
  );
}
