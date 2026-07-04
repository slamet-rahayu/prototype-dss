import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  Clock, 
  Play,
  PlayCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function SchedulerConfig() {
  const { schedulerJobs, setSchedulerJobs } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Form states
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [interval, setIntervalVal] = useState('Setiap 24 Jam');
  const [status, setStatus] = useState('Aktif');

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleEdit = (job) => {
    setEditId(job.id);
    setName(job.name);
    setTarget(job.target);
    setIntervalVal(job.interval);
    setStatus(job.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Hapus cron-job scheduler scraper IT ini?")) {
      const updated = schedulerJobs.filter(j => j.id !== id);
      setSchedulerJobs(updated);
      triggerToast("Cron-job scheduler scraper berhasil dihapus.");
    }
  };

  const handleToggleStatus = (job) => {
    const newStatus = job.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    const updated = schedulerJobs.map(j => {
      if (j.id === job.id) {
        return { ...j, status: newStatus };
      }
      return j;
    });
    setSchedulerJobs(updated);
    triggerToast(`Status scraper "${job.name}" diubah menjadi ${newStatus}.`);
  };

  const handleRunNow = (job) => {
    triggerToast(`Scraper "${job.name}" dijalankan secara manual. Memperbarui data kriteria C3...`);
    const today = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date()) + " WIB";

    setTimeout(() => {
      const updated = schedulerJobs.map(j => {
        if (j.id === job.id) {
          return { ...j, lastRun: today };
        }
        return j;
      });
      setSchedulerJobs(updated);
      triggerToast(`Kalkulasi scraper selesai. Data pasar kerja kriteria C3 berhasil disinkronisasi.`);
    }, 2000);
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setName('');
    setTarget('');
    setIntervalVal('Setiap 24 Jam');
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name || !target) return;

    if (editId !== null) {
      const updated = schedulerJobs.map(j => {
        if (j.id === editId) {
          return { ...j, name, target, interval, status };
        }
        return j;
      });
      setSchedulerJobs(updated);
      triggerToast("Scheduler scraper berhasil diperbarui.");
    } else {
      const newJob = {
        id: Date.now(),
        name,
        target,
        interval,
        status,
        lastRun: "Belum pernah dijalankan"
      };
      setSchedulerJobs([...schedulerJobs, newJob]);
      triggerToast("Scheduler scraper baru berhasil ditambahkan.");
    }

    setIsModalOpen(false);
  };

  const filteredJobs = useMemo(() => {
    return schedulerJobs.filter(j => 
      j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.interval.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schedulerJobs, searchQuery]);

  const totalCount = schedulerJobs.length;
  const activeCount = schedulerJobs.filter(j => j.status === 'Aktif').length;
  const inactiveCount = totalCount - activeCount;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-slate-500">Manajemen Scheduler</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Manajemen Scheduler</h1>
          <p className="text-slate-500 text-sm mt-2">Kelola scheduler cron-jobs scraper lowongan pekerjaan bidang TI secara real-time untuk memperbarui kriteria C3.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-extrabold rounded-xl shadow-md active:scale-95 transition-all w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Tambah Scheduler Scraper
        </button>
      </section>

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Cron Jobs</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">{totalCount}</strong>
            <span className="text-[10px] text-slate-400 font-medium">Scrapers terdaftar</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Scraper Aktif</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">{activeCount}</strong>
            <span className="text-[10px] text-slate-400 font-medium">Scrapers sinkronisasi terjadwal</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Scraper Nonaktif</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">{inactiveCount}</strong>
            <span className="text-[10px] text-slate-400 font-medium">Scrapers dalam pemeliharaan</span>
          </div>
        </article>
      </section>

      {/* Main Table Card */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Daftar Scheduler Scraper</h2>
            <p className="text-slate-500 text-xs mt-0.5">Konfigurasi interval waktu scraping dan status online data scraper portal karir.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari scheduler..."
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
                <th className="px-6 py-3.5">Nama Scraper</th>
                <th className="px-6 py-3.5">Target Scrape</th>
                <th className="px-6 py-3.5">Interval Scraping</th>
                <th className="px-6 py-3.5">Terakhir Dijalankan</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredJobs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark font-extrabold text-[11px] grid place-items-center">
                        <Clock className="w-4 h-4" />
                      </span>
                      <strong className="text-slate-800 block font-bold">{item.name}</strong>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium leading-relaxed">
                    {item.target}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {item.interval}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">
                    {item.lastRun}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleToggleStatus(item)}
                      className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      title={item.status === 'Aktif' ? 'Matikan Scraper' : 'Aktifkan Scraper'}
                    >
                      {item.status === 'Aktif' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black text-emerald-800 bg-emerald-50">Aktif</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black text-slate-500 bg-slate-100">Nonaktif</span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleRunNow(item)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Jalankan Scraper Sekarang"
                        disabled={item.status !== 'Aktif'}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded-lg bg-blue-50 text-primary-dark hover:bg-blue-100 transition-colors"
                        title="Ubah Konfigurasi"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    Cron-job scraper tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CRUD Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={editId !== null ? "Ubah Konfigurasi Scheduler" : "Tambah Scheduler Scraper"} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="grid gap-4 text-sm">
          <div className="grid gap-2">
            <label htmlFor="name" className="font-bold text-slate-700 text-xs">Nama Scraper Job</label>
            <input 
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Scraper LinkedIn IT Jobs"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="target" className="font-bold text-slate-700 text-xs">Target Scrape / Bidang Karir</label>
            <input 
              id="target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Contoh: Lowongan software, data, security TI..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label htmlFor="interval" className="font-bold text-slate-700 text-xs">Interval Penjadwalan</label>
              <select 
                id="interval"
                value={interval}
                onChange={(e) => setIntervalVal(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer"
              >
                <option>Setiap 12 Jam</option>
                <option>Setiap 24 Jam</option>
                <option>Setiap 48 Jam</option>
                <option>Setiap Minggu</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="font-bold text-slate-700 text-xs">Status Awal</label>
              <select 
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer"
              >
                <option>Aktif</option>
                <option>Tidak Aktif</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-500 font-bold text-xs rounded-xl"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95"
            >
              Simpan Data
            </button>
          </div>
        </form>
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
