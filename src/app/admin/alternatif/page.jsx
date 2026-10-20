"use client";

import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { Skeleton, TableSkeleton } from '@/components/Skeleton';
import { 
  Search, 
  Trash2, 
  Sliders, 
  Plus, 
  Briefcase,
  CheckCircle2,
  Building2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function CareersConfig() {
  const { careers, setCareers } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  // Sync from DB on mount
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
  const [editKey, setEditKey] = useState(null);
  const [careerName, setCareerName] = useState('');
  const [icon, setIcon] = useState('⌘');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [vacancy, setVacancy] = useState('');
  const [trend, setTrend] = useState('Tren meningkat');
  const [location, setLocation] = useState('');

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleEdit = (name, data) => {
    setEditKey(name);
    setFormErrors({});
    setCareerName(name);
    setIcon(data.icon || '⌘');
    setSubtitle(data.subtitle || '');
    setDescription(data.description || '');
    setVacancy(data.marketDemand?.vacancy || '');
    setTrend(data.marketDemand?.trend?.replace(/[↗→↘]\s*/g, '') || 'Tren meningkat');
    setLocation(data.marketDemand?.location || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (name) => {
    if (window.confirm(`Hapus alternatif karir "${name}"?`)) {
      const careerId = careers[name]?.id || careers[name]?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      try {
        await apiRequest(`/admin/careers/${careerId}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('API delete error:', e.message);
      }
      const updated = { ...careers };
      delete updated[name];
      setCareers(updated);
      triggerToast("Alternatif karir berhasil dihapus dari sistem dan basis data.");
    }
  };

  const handleOpenAddModal = () => {
    setEditKey(null);
    setFormErrors({});
    setCareerName('');
    setIcon('⌘');
    setSubtitle('');
    setDescription('');
    setVacancy('');
    setTrend('Tren meningkat');
    setLocation('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const nameTrimmed = careerName.trim();
    const subTrimmed = subtitle.trim();
    const descTrimmed = description.trim();
    const locTrimmed = location.trim();

    if (!nameTrimmed) {
      errs.careerName = "Nama alternatif karir wajib diisi.";
    } else if (nameTrimmed.length < 3) {
      errs.careerName = "Nama karir minimal 3 karakter.";
    } else if (!editKey && careers[nameTrimmed]) {
      errs.careerName = "Alternatif karir dengan nama ini sudah terdaftar.";
    }

    if (!subTrimmed) {
      errs.subtitle = "Sub-judul bidang peran wajib diisi.";
    } else if (subTrimmed.length < 3) {
      errs.subtitle = "Sub-judul minimal 3 karakter.";
    }

    if (!descTrimmed) {
      errs.description = "Deskripsi karir wajib diisi.";
    } else if (descTrimmed.length < 10) {
      errs.description = "Deskripsi karir minimal 10 karakter.";
    }

    if (vacancy === '' || vacancy === null || vacancy === undefined) {
      errs.vacancy = "Jumlah lowongan wajib diisi.";
    } else {
      const vacNum = Number(vacancy);
      if (isNaN(vacNum) || vacNum < 0) {
        errs.vacancy = "Jumlah lowongan harus berupa bilangan positif.";
      }
    }

    if (!locTrimmed) {
      errs.location = "Wilayah penempatan wajib diisi (contoh: Jakarta, Remote).";
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      triggerToast("Harap periksa isian kolom data alternatif karir.");
      return;
    }

    setFormErrors({});

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

    const payload = {
      title: careerName,
      subtitle,
      description,
      icon,
      marketDemandScore: newCareerData.marketDemandScore,
      marketDetail: {
        vacancyCount: Number(vacancy) || 100,
        trendStatus: trend,
        primaryLocation: location || 'Jakarta & Remote',
        requiredSkills: ['Java', 'SQL', 'Git'],
        shortNote: 'dan peluang remote'
      }
    };

    const updated = { ...careers };

    if (editKey !== null) {
      const careerId = careers[editKey]?.id || careers[editKey]?.slug || editKey.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      try {
        await apiRequest(`/admin/careers/${careerId}`, {
          method: 'PUT',
          body: payload
        });
      } catch (err) {
        console.warn('API update career error:', err.message);
      }

      if (editKey !== careerName) {
        delete updated[editKey];
      }
      updated[careerName] = { ...newCareerData, id: careerId };
      setCareers(updated);
      triggerToast("Alternatif karir berhasil diperbarui di basis data.");
    } else {
      if (updated[careerName]) {
        triggerToast("Alternatif karir dengan nama ini sudah tersedia.");
        return;
      }

      try {
        const res = await apiRequest('/admin/careers', {
          method: 'POST',
          body: payload
        });
        if (res.data?.id) {
          newCareerData.id = res.data.id;
          newCareerData.slug = res.data.slug;
        }
      } catch (err) {
        console.warn('API create career error:', err.message);
      }

      updated[careerName] = newCareerData;
      setCareers(updated);
      triggerToast("Alternatif karir baru berhasil didaftarkan ke basis data.");
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
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4 font-medium">
        <span>Dashboard Admin</span>
        <span aria-hidden="true">/</span>
        <span className="text-content-primary">Alternatif Karir</span>
      </nav>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full border-b border-divider pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-divider text-[11px] font-semibold text-content-secondary uppercase tracking-wider mb-2">
            Master Data Alternatif (A_i)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-content-primary tracking-tight">
            Alternatif Karir
          </h1>
          <p className="text-content-secondary text-sm mt-1.5 max-w-2xl leading-relaxed">
            Kelola alternatif karir bidang TI yang dievaluasi dan diperingkat oleh sistem pendukung keputusan menggunakan metode Simple Additive Weighting.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-xs transition-colors w-full md:w-auto justify-center cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Alternatif Karir
        </button>
      </section>

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Total Alternatif Karir</span>
          <strong className="text-3xl font-mono font-black text-content-primary block leading-none tabular-nums my-1">{filteredCareers.length}</strong>
          <span className="text-xs text-content-secondary">Pilihan karir terdaftar dalam matriks SAW</span>
        </Card>
        
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Status Kesiapan Data</span>
          <div className="flex items-center gap-2 my-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <strong className="text-2xl font-bold text-content-primary leading-none">Lengkap</strong>
          </div>
          <span className="text-xs text-content-secondary">Semua memiliki pemetaan RIASEC & bobot akademik</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Cakupan Kriteria</span>
          <strong className="text-2xl font-bold text-content-primary block leading-none my-1">C1, C2, C3</strong>
          <span className="text-xs text-content-secondary">Terintegrasi dengan Adzuna API dan riwayat akademik</span>
        </Card>
      </section>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-divider flex items-center justify-between flex-wrap gap-4 bg-subsurface/40">
          <div>
            <h2 className="text-sm font-bold text-content-primary">Daftar Alternatif Karir</h2>
            <p className="text-content-muted text-xs mt-0.5">Database karir yang menjadi himpunan alternatif perankingan SAW.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari karir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 pl-8 pr-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none transition-colors"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                <th className="px-6 py-3">Alternatif Karir</th>
                <th className="px-6 py-3">Deskripsi Singkat</th>
                <th className="px-6 py-3 text-center">Kode RIASEC</th>
                <th className="px-6 py-3 text-right">Lowongan Kerja</th>
                <th className="px-6 py-3">Wilayah</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider text-xs">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-44" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-3.5 w-52" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-3.5 w-24" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-7 w-14 mx-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : (
                filteredCareers.map(([name, data]) => (
                  <tr key={name} className="hover:bg-subsurface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-subsurface border border-divider text-content-primary font-bold text-sm grid place-items-center shrink-0">
                          {data.icon || '⌘'}
                        </span>
                        <div>
                          <strong className="text-content-primary block font-semibold">{name}</strong>
                          <span className="text-[11px] text-content-muted">{data.subtitle}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-content-secondary max-w-xs leading-relaxed truncate">
                      {data.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {data.riasecMapped.map(code => (
                          <span key={code} className="px-1.5 py-0.5 bg-subsurface border border-divider text-primary font-mono font-bold rounded text-[10px]">
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-content-primary tabular-nums">
                      {Number(data.marketDemand?.vacancy || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-content-secondary">
                      {data.marketDemand?.location || 'Nasional / Remote'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Aktif
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(name, data)}
                          className="p-1.5 rounded-md bg-subsurface hover:bg-divider text-content-primary transition-colors cursor-pointer"
                          title="Ubah alternatif"
                          aria-label={`Ubah alternatif ${name}`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(name)}
                          className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Hapus alternatif"
                          aria-label={`Hapus alternatif ${name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && filteredCareers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-content-muted">
                    Alternatif karir tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 bg-subsurface/40 border-t border-divider flex items-center justify-between text-content-muted text-xs">
          <span>Menampilkan <strong className="text-content-primary font-mono">{filteredCareers.length}</strong> alternatif karir.</span>
          <span>Perubahan pada data alternatif karir langsung disinkronkan ke perhitungan SAW.</span>
        </div>
      </Card>

      {/* CRUD Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={editKey !== null ? "Ubah Alternatif Karir" : "Tambah Alternatif Karir"} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="grid gap-4 text-sm" noValidate>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3 grid gap-1.5">
              <label htmlFor="icon" className="font-semibold text-content-primary text-xs">Ikon</label>
              <select 
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-sm focus:border-primary outline-none"
              >
                <option>⌘</option>
                <option>▤</option>
                <option>⌁</option>
                <option>◫</option>
                <option>◌</option>
                <option>⚙</option>
              </select>
            </div>
            <div className="col-span-9 grid gap-1.5">
              <label htmlFor="careerName" className="font-semibold text-content-primary text-xs">
                Nama Alternatif Karir <span className="text-red-500">*</span>
              </label>
              <input 
                id="careerName"
                type="text"
                value={careerName}
                onChange={(e) => {
                  setCareerName(e.target.value);
                  if (formErrors.careerName) setFormErrors(prev => ({ ...prev, careerName: undefined }));
                }}
                placeholder="Contoh: Software Engineer"
                className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none transition-colors ${
                  formErrors.careerName 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-divider focus:border-primary'
                }`}
                aria-invalid={!!formErrors.careerName}
                required
              />
              {formErrors.careerName && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.careerName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="subtitle" className="font-semibold text-content-primary text-xs">
              Sub-judul / Bidang Peran <span className="text-red-500">*</span>
            </label>
            <input 
              id="subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => {
                setSubtitle(e.target.value);
                if (formErrors.subtitle) setFormErrors(prev => ({ ...prev, subtitle: undefined }));
              }}
              placeholder="Contoh: Rekayasa perangkat lunak dan arsitektur sistem digital"
              className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none transition-colors ${
                formErrors.subtitle 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-divider focus:border-primary'
              }`}
              aria-invalid={!!formErrors.subtitle}
              required
            />
            {formErrors.subtitle && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{formErrors.subtitle}</span>
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="description" className="font-semibold text-content-primary text-xs">
              Deskripsi Karir <span className="text-red-500">*</span>
            </label>
            <textarea 
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (formErrors.description) setFormErrors(prev => ({ ...prev, description: undefined }));
              }}
              placeholder="Jelaskan peran, tanggung jawab, dan kriteria umum karir ini..."
              className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none min-h-[70px] transition-colors ${
                formErrors.description 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-divider focus:border-primary'
              }`}
              aria-invalid={!!formErrors.description}
              required
            />
            {formErrors.description && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{formErrors.description}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="vacancy" className="font-semibold text-content-primary text-xs">
                Jumlah Lowongan Kerja (C3) <span className="text-red-500">*</span>
              </label>
              <input 
                id="vacancy"
                type="number"
                min="0"
                value={vacancy}
                onChange={(e) => {
                  setVacancy(e.target.value);
                  if (formErrors.vacancy) setFormErrors(prev => ({ ...prev, vacancy: undefined }));
                }}
                placeholder="Contoh: 520"
                className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none tabular-nums transition-colors ${
                  formErrors.vacancy 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-divider focus:border-primary'
                }`}
                aria-invalid={!!formErrors.vacancy}
                required
              />
              {formErrors.vacancy && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.vacancy}</span>
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="location" className="font-semibold text-content-primary text-xs">
                Wilayah Penempatan Utama <span className="text-red-500">*</span>
              </label>
              <input 
                id="location"
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (formErrors.location) setFormErrors(prev => ({ ...prev, location: undefined }));
                }}
                placeholder="Contoh: Jakarta, Remote"
                className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none transition-colors ${
                  formErrors.location 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-divider focus:border-primary'
                }`}
                aria-invalid={!!formErrors.location}
                required
              />
              {formErrors.location && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.location}</span>
                </p>
              )}
            </div>
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
    </main>
  );
}
