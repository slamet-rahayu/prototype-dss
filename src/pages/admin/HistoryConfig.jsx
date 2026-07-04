import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { 
  Search, 
  Trash2, 
  Eye, 
  History, 
  Award,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export default function HistoryConfig() {
  const { recommendationHistory, setRecommendationHistory } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Selected history log for details view modal
  const [selectedLog, setSelectedLog] = useState(null);

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Hapus log riwayat perhitungan rekomendasi ini?")) {
      const updated = recommendationHistory.filter(h => h.id !== id);
      setRecommendationHistory(updated);
      triggerToast("Log riwayat perhitungan berhasil dihapus.");
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
  const reviewCount = recommendationHistory.filter(h => h.status !== 'Valid').length;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-slate-500">Riwayat Rekomendasi</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Riwayat Rekomendasi</h1>
          <p className="text-slate-500 text-sm mt-2">Pantau log perhitungan rekomendasi karir mahasiswa tingkat akhir menggunakan metode SAW yang tersimpan di sistem.</p>
        </div>
      </section>

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Perhitungan</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">{totalCalculations}</strong>
            <span className="text-[10px] text-slate-400 font-medium">Log perhitungan tersimpan</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Status Valid</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">{validCount}</strong>
            <span className="text-[10px] text-slate-400 font-medium">Rekomendasi disetujui sistem</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Perlu Review</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">{reviewCount}</strong>
            <span className="text-[10px] text-slate-400 font-medium">Rekomendasi butuh pemeriksaan</span>
          </div>
        </article>
      </section>

      {/* Main Table Card */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Daftar Log Riwayat Rekomendasi</h2>
            <p className="text-slate-500 text-xs mt-0.5">Daftar riwayat rekomendasi karir mahasiswa hasil kalkulasi algoritma SAW.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari riwayat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-xs transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                <th className="px-6 py-3.5">NIM & Mahasiswa</th>
                <th className="px-6 py-3.5 text-center">Kode RIASEC</th>
                <th className="px-6 py-3.5">Rekomendasi Teratas</th>
                <th className="px-6 py-3.5 text-center">Skor SAW</th>
                <th className="px-6 py-3.5">Tanggal Kalkulasi</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary-light text-primary-dark font-extrabold text-[10px] grid place-items-center">
                        {item.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
                      </span>
                      <div>
                        <strong className="text-slate-800 block font-bold">{item.name}</strong>
                        <span className="text-[10px] text-slate-400 font-medium">NIM: {item.nim}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black text-primary-dark bg-primary-light">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <strong className="text-slate-800 font-bold block">{item.career}</strong>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <strong className="text-sm font-black text-primary-dark">{item.score}</strong>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium leading-relaxed">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      item.status === 'Valid' 
                        ? 'text-emerald-800 bg-emerald-50' 
                        : 'text-amber-800 bg-amber-50'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleViewDetails(item)}
                        className="p-1.5 rounded-lg bg-blue-50 text-primary-dark hover:bg-blue-100 transition-colors"
                        title="Lihat Rincian"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Hapus Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    Log riwayat rekomendasi tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Details View Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title="Rincian Hasil Kalkulasi SAW" 
        onClose={() => setIsModalOpen(false)}
      >
        {selectedLog && (
          <div className="grid gap-5 text-xs text-slate-700">
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="w-9 h-9 rounded-full bg-primary-light text-primary-dark text-xs font-black grid place-items-center">
                {selectedLog.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
              </span>
              <div>
                <strong className="text-xs font-black text-slate-900 block mb-0.5">{selectedLog.name}</strong>
                <span className="text-[10px] text-slate-400 block font-medium leading-none">NIM: {selectedLog.nim} · Hasil Tes RIASEC: {selectedLog.code}</span>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium">Alternatif Terpilih:</span>
                <strong className="text-slate-800 font-bold text-xs">{selectedLog.career}</strong>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium">Nilai Akhir Preferensi SAW:</span>
                <strong className="text-primary-dark font-black text-sm">{selectedLog.score}</strong>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium">Tanggal Kalkulasi:</span>
                <span className="font-medium">{selectedLog.date}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="font-medium">Status Hasil:</span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  selectedLog.status === 'Valid' ? 'text-emerald-800 bg-emerald-50' : 'text-amber-800 bg-amber-50'
                }`}>{selectedLog.status}</span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-800 text-[11px] leading-relaxed mt-2 flex gap-2">
              <span className="font-bold text-sm shrink-0">ℹ</span>
              <span>
                Kalkulasi riwayat rekomendasi di atas dihitung dengan bobot kriteria SAW yang aktif saat pengerjaan tes: C1 40%, C2 35%, C3 25%.
              </span>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md"
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

      <footer className="mt-16 text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        CareerPath · Sistem Rekomendasi Karir untuk Mahasiswa Tingkat Akhir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
