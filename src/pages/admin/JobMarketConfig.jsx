import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Briefcase, 
  TrendingUp, 
  MapPin, 
  Award,
  Sliders
} from 'lucide-react';

export default function JobMarketConfig() {
  const { careers, setCareers } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Form states
  const [selectedCareerKey, setSelectedCareerKey] = useState('');
  const [vacancy, setVacancy] = useState('');
  const [trend, setTrend] = useState('↗ Tren meningkat');
  const [marketScore, setMarketScore] = useState('');
  const [location, setLocation] = useState('');
  const [skillsText, setSkillsText] = useState('');

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleEdit = (name, data) => {
    setSelectedCareerKey(name);
    setVacancy(data.marketDemand?.vacancy || '200');
    setTrend(data.marketDemand?.trend || '↗ Tren meningkat');
    setMarketScore(data.marketDemandScore || 80);
    setLocation(data.marketDemand?.location || 'Jakarta');
    setSkillsText((data.marketDemand?.skills || []).join(', '));
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedCareerKey) return;

    const scoreVal = Number(marketScore);
    if (scoreVal < 0 || scoreVal > 100) {
      triggerToast("Skor indeks pasar kerja harus berada di rentang 0 - 100.");
      return;
    }

    const skillsArray = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');

    const updated = { ...careers };
    updated[selectedCareerKey] = {
      ...updated[selectedCareerKey],
      marketDemandScore: scoreVal,
      marketDemand: {
        ...updated[selectedCareerKey].marketDemand,
        vacancy: vacancy,
        trend: trend,
        location: location,
        skills: skillsArray
      }
    };

    setCareers(updated);
    triggerToast(`Data pasar kerja untuk "${selectedCareerKey}" berhasil diperbarui.`);
    setIsModalOpen(false);
  };

  const filteredMarketList = useMemo(() => {
    return Object.entries(careers).filter(([name, data]) => 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data.marketDemand?.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data.marketDemand?.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [careers, searchQuery]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-slate-500">Data Pasar Kerja</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Data Pasar Kerja</h1>
          <p className="text-slate-500 text-sm mt-2">Pantau dan kelola database lowongan pekerjaan bidang TI yang digunakan sebagai nilai kualifikasi kriteria C3.</p>
        </div>
      </section>

      {/* Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Rerata Indeks Pasar</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">85.6</strong>
            <span className="text-[10px] text-slate-400 font-medium">Kategori kualifikasi C3</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Lowongan</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">1.640+</strong>
            <span className="text-[10px] text-slate-400 font-medium">Lowongan kerja TI terindeks</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Status Sinkronisasi</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">Otomatis</strong>
            <span className="text-[10px] text-slate-400 font-medium">Melalui scheduler Scraper IT</span>
          </div>
        </article>
      </section>

      {/* Main Table Card */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Daftar Data Pasar Kerja</h2>
            <p className="text-slate-500 text-xs mt-0.5">Ringkasan statistik data pasar kerja bidang TI per kualifikasi alternatif karir.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari data pasar..."
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
                <th className="px-6 py-3.5">Alternatif Karir</th>
                <th className="px-6 py-3.5 text-center">Indeks C3 (0-100)</th>
                <th className="px-6 py-3.5 text-center">Lowongan Kerja</th>
                <th className="px-6 py-3.5">Keterampilan Utama</th>
                <th className="px-6 py-3.5">Lokasi Utama</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMarketList.map(([name, data]) => (
                <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark text-sm font-extrabold grid place-items-center">
                        {data.icon || '▤'}
                      </span>
                      <strong className="text-slate-800 block font-bold">{name}</strong>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <strong className="text-base font-black text-primary-dark leading-none">{data.marketDemandScore || 80}</strong>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <strong className="text-slate-800 font-bold">{data.marketDemand?.vacancy || '200'}</strong>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black">{data.marketDemand?.trend || '↗'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {data.marketDemand?.skills?.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded text-[10px]">{skill}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium leading-relaxed">
                    {data.marketDemand?.location || 'Jakarta, Remote'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleEdit(name, data)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-primary-dark hover:bg-blue-100 font-black text-[10px] transition-colors"
                    >
                      Ubah
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMarketList.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    Data pasar kerja tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={`Ubah Data Pasar: ${selectedCareerKey}`} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label htmlFor="vacancy" className="font-bold text-slate-700 text-xs">Jumlah Lowongan</label>
              <input 
                id="vacancy"
                type="number"
                value={vacancy}
                onChange={(e) => setVacancy(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="marketScore" className="font-bold text-slate-700 text-xs">Skor Indeks Pasar C3 (0-100)</label>
              <input 
                id="marketScore"
                type="number"
                min="0"
                max="100"
                value={marketScore}
                onChange={(e) => setMarketScore(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label htmlFor="trend" className="font-bold text-slate-700 text-xs">Tren Pasar Kerja</label>
              <select 
                id="trend"
                value={trend}
                onChange={(e) => setTrend(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer"
              >
                <option>↗ Tren meningkat</option>
                <option>→ Tren stabil</option>
                <option>↘ Tren menurun</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="location" className="font-bold text-slate-700 text-xs">Lokasi Utama</label>
              <input 
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="skillsText" className="font-bold text-slate-700 text-xs">Keterampilan yang Dibutuhkan (Pisahkan dengan koma)</label>
            <input 
              id="skillsText"
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Contoh: Java, JavaScript, SQL, Git"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm"
              required
            />
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
              Simpan Perubahan
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
