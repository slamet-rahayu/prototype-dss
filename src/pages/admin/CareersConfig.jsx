import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Briefcase
} from 'lucide-react';

export default function CareersConfig() {
  const { careers, setCareers } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Form states
  const [editKey, setEditKey] = useState(null);
  const [careerName, setCareerName] = useState('');
  const [icon, setIcon] = useState('⌘');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [vacancy, setVacancy] = useState('');
  const [trend, setTrend] = useState('↗ Tren meningkat');
  const [location, setLocation] = useState('');

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleEdit = (name, data) => {
    setEditKey(name);
    setCareerName(name);
    setIcon(data.icon || '⌘');
    setSubtitle(data.subtitle || '');
    setDescription(data.description || '');
    setVacancy(data.marketDemand?.vacancy || '');
    setTrend(data.marketDemand?.trend || '↗ Tren meningkat');
    setLocation(data.marketDemand?.location || '');
    setIsModalOpen(true);
  };

  const handleDelete = (name) => {
    if (window.confirm(`Hapus alternatif karir "${name}"?`)) {
      const updated = { ...careers };
      delete updated[name];
      setCareers(updated);
      triggerToast("Alternatif karir berhasil dihapus.");
    }
  };

  const handleOpenAddModal = () => {
    setEditKey(null);
    setCareerName('');
    setIcon('⌘');
    setSubtitle('');
    setDescription('');
    setVacancy('');
    setTrend('↗ Tren meningkat');
    setLocation('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!careerName.trim()) return;

    const marketDemand = {
      title: `Gambaran kebutuhan pasar kerja untuk ${careerName}.`,
      vacancy: vacancy || '100',
      trend: trend,
      short: location.split(',')[0] || 'Jakarta',
      shortNote: 'dan peluang remote',
      location: location || 'Jakarta',
      skills: ['Java', 'SQL', 'Git'],
      note: `Data pasar kerja untuk ${careerName}.`
    };

    const newCareerData = {
      icon,
      subtitle,
      description,
      riasecMapped: editKey ? careers[editKey].riasecMapped : ["I"],
      academicWeights: editKey ? careers[editKey].academicWeights : { "Pemrograman": 30, "Basis Data": 20, "Analisis dan Perancangan Sistem": 20, "Jaringan dan Keamanan": 15, "Data dan Kecerdasan Buatan": 15 },
      marketDemandScore: editKey ? careers[editKey].marketDemandScore : 85,
      marketDemand
    };

    const updated = { ...careers };

    if (editKey !== null) {
      if (editKey !== careerName) {
        delete updated[editKey]; // name changed, delete old key
      }
      updated[careerName] = newCareerData;
      setCareers(updated);
      triggerToast("Alternatif karir berhasil diperbarui.");
    } else {
      if (updated[careerName]) {
        triggerToast("Alternatif karir dengan nama ini sudah tersedia.");
        return;
      }
      updated[careerName] = newCareerData;
      setCareers(updated);
      triggerToast("Alternatif karir berhasil ditambahkan.");
    }

    setIsModalOpen(false);
  };

  const filteredCareers = useMemo(() => {
    return Object.entries(careers).filter(([name, data]) => 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [careers, searchQuery]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-slate-500">Alternatif Karir</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Alternatif Karir</h1>
          <p className="text-slate-500 text-sm mt-2">Kelola alternatif karir bidang TI yang dinilai dan diranking oleh sistem rekomendasi menggunakan metode SAW.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-extrabold rounded-xl shadow-md active:scale-95 transition-all w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Tambah Alternatif Karir
        </button>
      </section>

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Alternatif</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">{filteredCareers.length}</strong>
            <span className="text-[10px] text-slate-400 font-medium">Pilihan karir TI</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Status Alternatif</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">Aktif</strong>
            <span className="text-[10px] text-slate-400 font-medium">Semua memiliki pemetaan RIASEC</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Update Terakhir</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">Hari ini</strong>
            <span className="text-[10px] text-slate-400 font-medium">Sinkronisasi database lokal</span>
          </div>
        </article>
      </section>

      {/* Main Table Card */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Daftar Alternatif Karir</h2>
            <p className="text-slate-500 text-xs mt-0.5">Database pilihan karir yang digunakan sebagai alternatif perankingan SAW.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari karir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-xs transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                <th className="px-6 py-3.5">Alternatif Karir</th>
                <th className="px-6 py-3.5">Deskripsi</th>
                <th className="px-6 py-3.5">Kode RIASEC</th>
                <th className="px-6 py-3.5 text-center">Lowongan Pasar</th>
                <th className="px-6 py-3.5">Cakupan Pencarian</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCareers.map(([name, data]) => (
                <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark text-sm font-extrabold grid place-items-center">
                        {data.icon || '⌘'}
                      </span>
                      <div>
                        <strong className="text-slate-800 block font-bold">{name}</strong>
                        <span className="text-[10px] text-slate-400 font-medium">{data.subtitle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs leading-relaxed truncate">
                    {data.description}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {data.riasecMapped.map(code => (
                        <span key={code} className="px-2 py-0.5 bg-primary-light text-primary-dark font-extrabold rounded text-[10px]">{code}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-800">
                    {data.marketDemand?.vacancy || '0'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    Singapore
                  </td>
                  <td>
                    <div className="flex items-center justify-center">
                      <span className="px-2 py-0.5 bg-primary-light text-primary-dark font-extrabold rounded text-[10px]">Aktif</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(name, data)}
                        className="p-1.5 rounded-lg bg-blue-50 text-primary-dark hover:bg-blue-100 transition-colors"
                        title="Ubah"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(name)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCareers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    Alternatif karir tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Menampilkan <strong>{filteredCareers.length}</strong> alternatif karir.</span>
          <span>Perubahan data alternatif karir, pemetaan RIASEC, atau bobot akademik akan digunakan pada proses rekomendasi berikutnya.</span>
        </div>
      </section>

      {/* CRUD Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={editKey !== null ? "Ubah Alternatif Karir" : "Tambah Alternatif Karir"} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="grid gap-4 text-sm">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3 grid gap-2">
              <label htmlFor="icon" className="font-bold text-slate-700 text-xs">Ikon</label>
              <select 
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
              >
                <option>⌘</option>
                <option>▤</option>
                <option>⌁</option>
                <option>◫</option>
                <option>◌</option>
                <option>⚙</option>
              </select>
            </div>
            <div className="col-span-9 grid gap-2">
              <label htmlFor="careerName" className="font-bold text-slate-700 text-xs">Alternatif Karir</label>
              <input 
                id="careerName"
                type="text"
                value={careerName}
                onChange={(e) => setCareerName(e.target.value)}
                placeholder="Contoh: Software Engineer"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="subtitle" className="font-bold text-slate-700 text-xs">Sub-judul / Bidang Peran</label>
            <input 
              id="subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Contoh: Pengembangan perangkat lunak dan solusi digital"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="font-bold text-slate-700 text-xs">Deskripsi Karir</label>
            <textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan peran, tanggung jawab, dan kriteria umum karir ini..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm min-h-[70px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label htmlFor="vacancy" className="font-bold text-slate-700 text-xs">Jumlah Lowongan</label>
              <input 
                id="vacancy"
                type="number"
                value={vacancy}
                onChange={(e) => setVacancy(e.target.value)}
                placeholder="Contoh: 520"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="location" className="font-bold text-slate-700 text-xs">Lokasi Utama</label>
              <input 
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Jakarta, Remote"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/10 active:scale-95"
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
