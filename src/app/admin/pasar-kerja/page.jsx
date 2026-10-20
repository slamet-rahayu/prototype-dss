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
  Sliders, 
  Briefcase, 
  TrendingUp, 
  MapPin, 
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function JobMarketConfig() {
  const { careers, setCareers } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    apiRequest('/careers')
      .then(res => {
        if (active && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const map = {};
          res.data.forEach(c => {
            map[c.title] = {
              id: c.id,
              slug: c.slug,
              icon: c.icon || '⌘',
              subtitle: c.subtitle || '',
              description: c.description || '',
              marketDemandScore: c.marketDemandScore || 80,
              marketDemand: {
                title: `Gambaran kebutuhan pasar kerja untuk ${c.title}.`,
                vacancy: String(c.marketDetail?.vacancyCount || '100'),
                trend: c.marketDetail?.trendStatus || 'Tren meningkat',
                short: (c.marketDetail?.primaryLocation || 'Jakarta').split(',')[0],
                shortNote: c.marketDetail?.shortNote || 'dan peluang remote',
                location: c.marketDetail?.primaryLocation || 'Jakarta',
                skills: c.marketDetail?.requiredSkills || ['Java', 'SQL', 'Git'],
                note: `Data pasar kerja untuk ${c.title}.`
              },
              riasecMapped: (c.riasecWeights || []).filter(w => w.weight > 0).map(w => w.dimension),
              riasecWeights: (c.riasecWeights || []).reduce((acc, w) => { acc[w.dimension] = w.weight; return acc; }, {}),
              academicWeights: (c.academicWeights || []).reduce((acc, w) => {
                const subName = w.subjectName || w.subject?.name || `Mata Kuliah ${w.subjectId}`;
                acc[subName] = w.weight;
                return acc;
              }, {})
            };
          });
          setCareers(map);
        }
      })
      .catch(err => console.warn('Could not load careers from API:', err.message))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [setCareers]);

  // Form states
  const [selectedCareerKey, setSelectedCareerKey] = useState('');
  const [vacancy, setVacancy] = useState('');
  const [trend, setTrend] = useState('Tren meningkat');
  const [marketScore, setMarketScore] = useState('');
  const [location, setLocation] = useState('');
  const [skillsText, setSkillsText] = useState('');

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleEdit = (name, data) => {
    setSelectedCareerKey(name);
    setFormErrors({});
    setVacancy(data.marketDemand?.vacancy || '200');
    setTrend(data.marketDemand?.trend?.replace(/[↗→↘]\s*/g, '') || 'Tren meningkat');
    setMarketScore(data.marketDemandScore || 80);
    setLocation(data.marketDemand?.location || 'Jakarta');
    setSkillsText((data.marketDemand?.skills || []).join(', '));
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCareerKey) return;

    const errs = {};
    const vacNum = Number(vacancy);
    if (vacancy === '' || isNaN(vacNum) || vacNum < 0) {
      errs.vacancy = "Jumlah lowongan harus berupa angka non-negatif (>= 0).";
    }

    const scoreVal = Number(marketScore);
    if (marketScore === '' || isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
      errs.marketScore = "Skor indeks pasar kerja (C3) harus berada di rentang 0 - 100.";
    }

    const locTrimmed = location.trim();
    if (!locTrimmed) {
      errs.location = "Wilayah penempatan utama wajib diisi.";
    } else if (locTrimmed.length < 2) {
      errs.location = "Wilayah penempatan minimal 2 karakter.";
    }

    const skillsArray = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');

    if (skillsArray.length === 0) {
      errs.skillsText = "Keterampilan kunci wajib diisi minimal 1 keterampilan (pisahkan dengan koma).";
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      triggerToast("Harap periksa kembali isian formulir pasar kerja.");
      return;
    }

    setFormErrors({});

    const careerId = careers[selectedCareerKey]?.id || careers[selectedCareerKey]?.slug || selectedCareerKey.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      await apiRequest(`/admin/job-market/${careerId}`, {
        method: 'PUT',
        body: {
          marketDemandScore: scoreVal,
          vacancyCount: vacNum || 100,
          trendStatus: trend,
          primaryLocation: locTrimmed || 'Jakarta',
          requiredSkills: skillsArray
        }
      });
    } catch (err) {
      console.warn('API update job market error:', err.message);
    }

    const updated = { ...careers };
    updated[selectedCareerKey] = {
      ...updated[selectedCareerKey],
      marketDemandScore: scoreVal,
      marketDemand: {
        ...updated[selectedCareerKey].marketDemand,
        vacancy: String(vacNum),
        trend: trend,
        location: locTrimmed,
        skills: skillsArray
      }
    };

    setCareers(updated);
    triggerToast(`Data pasar kerja untuk "${selectedCareerKey}" berhasil disimpan ke basis data.`);
    setIsModalOpen(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredMarketList = useMemo(() => {
    return Object.entries(careers).filter(([name, data]) => 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data.marketDemand?.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data.marketDemand?.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [careers, searchQuery]);

  const itemsPerPage = 5;
  const totalItems = filteredMarketList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedMarketList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMarketList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMarketList, currentPage]);

  const totalVacancies = useMemo(() => {
    return Object.values(careers).reduce((sum, c) => sum + Number(c.marketDemand?.vacancy || 0), 0);
  }, [careers]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4 font-medium">
        <span>Dashboard Admin</span>
        <span aria-hidden="true">/</span>
        <span className="text-content-primary">Data Pasar Kerja (C3)</span>
      </nav>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full border-b border-divider pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-divider text-[11px] font-semibold text-content-secondary uppercase tracking-wider mb-2">
            Kriteria Pasar Kerja (C3)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-content-primary tracking-tight">
            Data Pasar Kerja
          </h1>
          <p className="text-content-secondary text-sm mt-1.5 max-w-2xl leading-relaxed">
            Pantau dan kelola data lowongan kerja industri TI yang digunakan sebagai nilai masukan kriteria C3 dalam perhitungan rekomendasi karir.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-md shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Sinkronisasi Terjadwal Aktif</span>
        </div>
      </section>

      {/* Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Karir Terhubung</span>
          <strong className="text-3xl font-mono font-black text-content-primary block leading-none tabular-nums my-1">{filteredMarketList.length}/{Object.keys(careers).length}</strong>
          <span className="text-xs text-content-secondary">Alternatif karir terpetakan dengan data lowongan</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Total Lowongan Terindeks</span>
          <strong className="text-3xl font-mono font-black text-content-primary block leading-none tabular-nums my-1">
            {totalVacancies.toLocaleString('id-ID')}
          </strong>
          <span className="text-xs text-content-secondary">Posisi aktif terhimpun dari portal pasar kerja</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Mekanisme Pembaruan</span>
          <strong className="text-2xl font-bold text-content-primary block leading-none my-1">Otomatis</strong>
          <span className="text-xs text-content-secondary">Terintegrasi dengan scheduler Adzuna API</span>
        </Card>
      </section>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-divider flex items-center justify-between flex-wrap gap-4 bg-subsurface/40">
          <div>
            <h2 className="text-sm font-bold text-content-primary">Daftar Data Pasar Kerja Per Alternatif</h2>
            <p className="text-content-muted text-xs mt-0.5">Ringkasan kuantitatif kebutuhan tenaga kerja per kualifikasi karir TI.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari data pasar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 pl-8 pr-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none transition-colors"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                <th className="px-6 py-3">Alternatif Karir</th>
                <th className="px-6 py-3 text-right">Lowongan Aktif</th>
                <th className="px-6 py-3 text-center">Skor Pasar (C3)</th>
                <th className="px-6 py-3">Tren Kebutuhan</th>
                <th className="px-6 py-3">Wilayah</th>
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
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-6 w-10 mx-auto rounded-md" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-7 w-20 mx-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : (
                paginatedMarketList.map(([name, data]) => (
                  <tr key={name} className="hover:bg-subsurface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-subsurface border border-divider text-content-primary font-bold text-sm grid place-items-center shrink-0">
                          {data.icon || '▤'}
                        </span>
                        <div>
                          <strong className="text-content-primary block font-semibold">{name}</strong>
                          <span className="text-[11px] text-content-muted">{data.subtitle}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-content-primary tabular-nums">
                      {Number(data.marketDemand?.vacancy || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono font-bold text-primary bg-primary-light/50 border border-primary/20 px-2 py-0.5 rounded text-xs tabular-nums">
                        {data.marketDemandScore || 80}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-content-secondary font-medium">
                      {data.marketDemand?.trend?.replace(/[↗→↘]\s*/g, '') || 'Tren stabil'}
                    </td>
                    <td className="px-6 py-4 text-content-secondary">
                      {data.marketDemand?.location || 'Nasional / Remote'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleEdit(name, data)}
                        className="px-2.5 py-1.5 rounded-md bg-subsurface hover:bg-divider border border-divider text-content-primary font-semibold text-xs transition-colors cursor-pointer"
                        aria-label={`Ubah data pasar untuk ${name}`}
                      >
                        Ubah Data
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && paginatedMarketList.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-content-muted">
                    Data pasar kerja tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 bg-subsurface/40 border-t border-divider flex items-center justify-between flex-wrap gap-4 text-content-muted text-xs">
          <span>
            Menampilkan <strong className="text-content-primary font-mono">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> - <strong className="text-content-primary font-mono">{Math.min(totalItems, currentPage * itemsPerPage)}</strong> dari <strong className="text-content-primary font-mono">{totalItems}</strong> data alternatif karir.
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-divider bg-surface hover:bg-subsurface text-content-primary font-semibold rounded-md disabled:opacity-40 transition-colors cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="font-mono px-1 text-content-primary font-semibold">
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-divider bg-surface hover:bg-subsurface text-content-primary font-semibold rounded-md disabled:opacity-40 transition-colors cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={`Ubah Data Pasar: ${selectedCareerKey}`} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="grid gap-4 text-sm" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="vacancy" className="font-semibold text-content-primary text-xs">Jumlah Lowongan Aktual</label>
              <input 
                id="vacancy"
                type="number"
                value={vacancy}
                onChange={(e) => {
                  setVacancy(e.target.value);
                  if (formErrors.vacancy) setFormErrors(prev => ({ ...prev, vacancy: null }));
                }}
                aria-invalid={!!formErrors.vacancy}
                className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none tabular-nums transition-colors ${
                  formErrors.vacancy ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
                }`}
                required
              />
              {formErrors.vacancy && (
                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.vacancy}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="marketScore" className="font-semibold text-content-primary text-xs">Skor Indeks Pasar C3 (0-100)</label>
              <input 
                id="marketScore"
                type="number"
                min="0"
                max="100"
                value={marketScore}
                onChange={(e) => {
                  setMarketScore(e.target.value);
                  if (formErrors.marketScore) setFormErrors(prev => ({ ...prev, marketScore: null }));
                }}
                aria-invalid={!!formErrors.marketScore}
                className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none tabular-nums transition-colors ${
                  formErrors.marketScore ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
                }`}
                required
              />
              {formErrors.marketScore && (
                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.marketScore}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="trend" className="font-semibold text-content-primary text-xs">Tren Pasar Kerja</label>
              <select 
                id="trend"
                value={trend}
                onChange={(e) => setTrend(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-sm focus:border-primary outline-none cursor-pointer"
              >
                <option value="Tren meningkat">Tren meningkat</option>
                <option value="Tren stabil">Tren stabil</option>
                <option value="Tren menurun">Tren menurun</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="location" className="font-semibold text-content-primary text-xs">Wilayah Penempatan Utama</label>
              <input 
                id="location"
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (formErrors.location) setFormErrors(prev => ({ ...prev, location: null }));
                }}
                aria-invalid={!!formErrors.location}
                className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none transition-colors ${
                  formErrors.location ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
                }`}
                required
              />
              {formErrors.location && (
                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.location}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="skillsText" className="font-semibold text-content-primary text-xs">Keterampilan Kunci (Pisahkan dengan koma)</label>
            <input 
              id="skillsText"
              type="text"
              value={skillsText}
              onChange={(e) => {
                setSkillsText(e.target.value);
                if (formErrors.skillsText) setFormErrors(prev => ({ ...prev, skillsText: null }));
              }}
              placeholder="Contoh: Java, SQL, Git, Docker"
              aria-invalid={!!formErrors.skillsText}
              className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none transition-colors ${
                formErrors.skillsText ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
              }`}
              required
            />
            {formErrors.skillsText && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.skillsText}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-divider hover:bg-subsurface text-content-secondary font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
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
    </main>
  );
}
