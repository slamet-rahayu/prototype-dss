import React, { useContext, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Search, ArrowRight, Award, DollarSign, MapPin, Sparkles } from 'lucide-react';

const RIASEC_CATEGORIES = [
  { code: 'ALL', name: 'Semua Tipe' },
  { code: 'R', name: 'R - Realistic' },
  { code: 'I', name: 'I - Investigative' },
  { code: 'A', name: 'A - Artistic' },
  { code: 'S', name: 'S - Social' },
  { code: 'E', name: 'E - Enterprising' },
  { code: 'C', name: 'C - Conventional' }
];

// Mock salary summaries for catalog view consistency
const CAREER_SALARIES = {
  "Software Engineer": "Rp 8M - Rp 22M",
  "Data Analyst": "Rp 7M - Rp 18M",
  "Cybersecurity Analyst": "Rp 9M - Rp 25M",
  "Business Analyst": "Rp 8M - Rp 20M",
  "UI/UX Designer": "Rp 7M - Rp 18M"
};

export default function CareerCatalog() {
  const { careers } = useContext(AppContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiasec, setSelectedRiasec] = useState('ALL');

  const filteredCareers = useMemo(() => {
    return Object.entries(careers).filter(([name, data]) => {
      // 1. Search Query filter
      const matchesSearch = 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (data.marketDemand?.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. RIASEC code filter
      const matchesRiasec = 
        selectedRiasec === 'ALL' || 
        data.riasecMapped.includes(selectedRiasec);

      return matchesSearch && matchesRiasec;
    });
  }, [careers, searchQuery, selectedRiasec]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <Link to="/" className="text-primary-dark hover:underline">Beranda</Link>
        <span>›</span>
        <span className="text-slate-500">Eksplorasi Karir</span>
      </div>

      {/* Heading */}
      <section className="mb-8">
        <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Katalog Karir Teknologi Informasi</h1>
        <p className="text-slate-500 text-sm mt-2">Telusuri seluruh opsi karir IT, filter berdasarkan kategori minat RIASEC, dan pelajari detail prospek kerja serta persyaratannya.</p>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm mb-8 grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8 relative">
            <input 
              type="search"
              placeholder="Cari nama karir, deskripsi, atau keterampilan (misal: SQL, Java)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          </div>
          <div className="md:col-span-4 text-xs font-bold text-slate-400 md:text-right">
            Menampilkan <span className="text-primary-dark font-black">{filteredCareers.length}</span> karir teknologi informasi.
          </div>
        </div>

        {/* RIASEC Filters */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Filter Minat RIASEC</span>
          <div className="flex flex-wrap gap-1.5">
            {RIASEC_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setSelectedRiasec(cat.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedRiasec === cat.code
                    ? 'bg-primary text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCareers.map(([name, data]) => {
          const salaryStr = CAREER_SALARIES[name] || "Rp 6M - Rp 15M";
          return (
            <article 
              key={name}
              className="group bg-white border border-slate-200/80 hover:border-blue-200 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="w-12 h-12 grid place-items-center rounded-2xl text-primary font-black bg-primary-light/50 group-hover:bg-primary-light transition-colors text-xl">
                    {data.icon || '⌘'}
                  </span>
                  {/* RIASEC codes */}
                  <div className="flex gap-1">
                    {data.riasecMapped.slice(0, 3).map(code => (
                      <span key={code} className="px-2 py-0.5 bg-slate-50 border border-slate-250 text-slate-500 font-extrabold rounded text-[9px]" title={RIASEC_CATEGORIES.find(c => c.code === code)?.name || ''}>
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">{name}</h3>
                <p className="text-slate-400 text-[10.5px] font-bold mb-3 block leading-tight">{data.subtitle}</p>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">
                  {data.description}
                </p>
                
                {/* Micro info panel */}
                <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-50 py-3.5 mb-4 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{salaryStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 justify-end">
                    <MapPin className="w-3.5 h-3.5 text-primary-dark shrink-0" />
                    <span className="truncate max-w-[90px]">{data.marketDemand?.short || 'Jakarta'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/eksplorasi/${name}`)}
                className="w-full py-2.5 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all duration-200"
              >
                Pelajari Karir Selengkapnya
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </article>
          );
        })}
        {filteredCareers.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-450 bg-white border border-dashed border-slate-200 rounded-3xl">
            <span className="text-3xl block mb-2">🔍</span>
            <strong className="text-sm font-black text-slate-800 block">Karir tidak ditemukan</strong>
            <p className="text-slate-500 text-xs mt-1">Coba sesuaikan kata kunci pencarian atau bersihkan filter RIASEC Anda.</p>
          </div>
        )}
      </section>

      <footer className="mt-16 text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        CareerPath · Sistem Rekomendasi Karir untuk Mahasiswa Tingkat Akhir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
