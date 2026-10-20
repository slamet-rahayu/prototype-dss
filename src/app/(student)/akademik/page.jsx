"use client";

import React, { useContext, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const DESCRIPTIONS = {
  "Pemrograman": "Dasar pemrograman, pemrograman web, dan pengembangan aplikasi.",
  "Basis Data": "Perancangan basis data, SQL, dan manajemen data.",
  "Analisis dan Perancangan Sistem": "Analisis kebutuhan, pemodelan sistem, dan perancangan solusi.",
  "Jaringan dan Keamanan": "Jaringan komputer, keamanan informasi, dan infrastruktur TI.",
  "Data dan Kecerdasan Buatan": "Statistika, analitik data, dan konsep kecerdasan buatan."
};

const ICONS = {
  "Pemrograman": "⌘",
  "Basis Data": "▤",
  "Analisis dan Perancangan Sistem": "◫",
  "Jaringan dan Keamanan": "⌁",
  "Data dan Kecerdasan Buatan": "◌"
};

const AVAILABLE_OPTIONS = [
  "Pemrograman",
  "Basis Data",
  "Analisis dan Perancangan Sistem",
  "Jaringan dan Keamanan",
  "Data dan Kecerdasan Buatan"
];

export default function Academic() {
  const { academicComponents, setAcademicComponents } = useContext(AppContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [editId, setEditId] = useState(null);
  const [componentName, setComponentName] = useState('');
  const [academicScore, setAcademicScore] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState('Semester 7');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [formErrors, setFormErrors] = useState({});

  // Fetch academic grades from backend on mount
  useEffect(() => {
    let active = true;
    const fetchGrades = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('/academic/my-grades');
        if (active && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const sanitized = res.data.map(item => ({
            ...item,
            name: item.name || item.subjectName || item.subject?.name || 'Mata Kuliah',
            desc: item.desc || item.description || item.subject?.description || (DESCRIPTIONS[item.name || item.subjectName] || ''),
            icon: item.icon || (ICONS[item.name || item.subjectName] || '⌘'),
            grade: Number(item.grade) || 0
          }));
          setAcademicComponents(sanitized);
        }
      } catch (err) {
        console.warn('Gagal memuat nilai dari server:', err.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchGrades();
    return () => { active = false; };
  }, [setAcademicComponents]);

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  // Calculations
  const averageScore = useMemo(() => {
    if (!Array.isArray(academicComponents) || academicComponents.length === 0) return 0;
    const validScores = academicComponents
      .map(item => Number(item?.grade))
      .filter(val => !isNaN(val));
    if (validScores.length === 0) return 0;
    const total = validScores.reduce((sum, val) => sum + val, 0);
    return Number((total / validScores.length).toFixed(1));
  }, [academicComponents]);

  const isComplete = Array.isArray(academicComponents) && academicComponents.length >= 5;

  const getStatus = (score) => {
    const s = Number(score) || 0;
    if (s >= 85) {
      return { 
        label: 'Sangat Baik', 
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' 
      };
    }
    if (s >= 70) {
      return { 
        label: 'Baik', 
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' 
      };
    }
    return { 
      label: 'Cukup', 
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' 
    };
  };

  const handleEdit = (item) => {
    if (!item) return;
    setFormErrors({});
    setEditId(item.id);
    setComponentName(item.name || item.subjectName || item.subject?.name || '');
    setAcademicScore(item.grade ?? '');
    setDescription(item.desc || item.description || item.subject?.description || '');
    setSemester(item.semester || 'Semester 7');
    setAcademicYear(item.academicYear || '2025/2026');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus komponen nilai ini?")) {
      const updated = (academicComponents || []).filter(item => item && item.id !== id);
      setAcademicComponents(updated);
      triggerToast("Komponen akademik berhasil dihapus.");

      try {
        const payload = updated.map(item => ({
          subjectId: item.subjectId,
          name: item.name || item.subjectName || item.subject?.name,
          grade: Number(item.grade) || 0,
          semester: item.semester || 'Semester 7',
          academicYear: item.academicYear || '2025/2026'
        }));
        if (payload.length > 0) {
          await apiRequest('/academic/my-grades', {
            method: 'PUT',
            body: { grades: payload }
          });
        }
      } catch (err) {
        console.warn('Gagal memperbarui di server:', err.message);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setFormErrors({});
    // Find the first option not yet added
    const currentList = Array.isArray(academicComponents) ? academicComponents : [];
    const existingNames = new Set(
      currentList.map(item => String(item?.name || item?.subjectName || item?.subject?.name || '').toLowerCase())
    );
    const unusedOption = AVAILABLE_OPTIONS.find(opt => !existingNames.has(opt.toLowerCase())) || AVAILABLE_OPTIONS[0];

    setComponentName(unusedOption || '');
    setAcademicScore('');
    setDescription(unusedOption && DESCRIPTIONS[unusedOption] ? DESCRIPTIONS[unusedOption] : '');
    setSemester('Semester 7');
    setAcademicYear('2025/2026');
    setIsModalOpen(true);
  };

  const handleComponentNameChange = (val) => {
    setComponentName(val);
    if (formErrors.componentName) setFormErrors(prev => ({ ...prev, componentName: undefined }));
    if (DESCRIPTIONS[val]) {
      setDescription(DESCRIPTIONS[val]);
      if (formErrors.description) setFormErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const trimmedDesc = description.trim();
    const trimmedYear = academicYear.trim();

    if (!componentName) {
      errs.componentName = "Silakan pilih komponen mata kuliah.";
    }

    if (academicScore === '' || academicScore === null || academicScore === undefined) {
      errs.academicScore = "Nilai angka wajib diisi.";
    } else {
      const scoreVal = Number(academicScore);
      if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
        errs.academicScore = "Nilai harus berupa angka antara 0 sampai 100.";
      }
    }

    if (!trimmedYear) {
      errs.academicYear = "Tahun akademik wajib diisi.";
    } else if (!/^\d{4}\/\d{4}$/.test(trimmedYear)) {
      errs.academicYear = "Format tahun akademik harus YYYY/YYYY (contoh: 2025/2026).";
    }

    if (!trimmedDesc) {
      errs.description = "Keterangan mata kuliah wajib diisi.";
    } else if (trimmedDesc.length < 5) {
      errs.description = "Keterangan mata kuliah minimal 5 karakter.";
    }

    const currentList = Array.isArray(academicComponents) ? academicComponents : [];
    if (editId === null) {
      const duplicate = currentList.find(item => 
        String(item?.name || item?.subjectName || item?.subject?.name || '').toLowerCase() === componentName.toLowerCase()
      );
      if (duplicate) {
        errs.componentName = "Mata kuliah ini sudah ada dalam daftar. Gunakan tombol ubah untuk memperbarui.";
      }
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      triggerToast("Harap periksa dan lengkapi kolom nilai yang belum valid.");
      return;
    }

    setFormErrors({});
    const scoreVal = Number(academicScore);
    const today = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date());

    const icon = ICONS[componentName] || "◫";
    const statusObj = getStatus(scoreVal);
    const resolvedDesc = trimmedDesc || DESCRIPTIONS[componentName] || "Komponen penilaian akademik TI";

    let updatedList = [];
    if (editId !== null) {
      updatedList = currentList.map(item => {
        if (item && item.id === editId) {
          return {
            ...item,
            name: componentName,
            grade: scoreVal,
            desc: resolvedDesc,
            semester: semester,
            academicYear: trimmedYear,
            status: statusObj.label,
            updated: today,
            icon
          };
        }
        return item;
      });
    } else {
      const newItem = {
        id: `grd-local-${Date.now()}`,
        name: componentName,
        desc: resolvedDesc,
        grade: scoreVal,
        semester: semester,
        academicYear: trimmedYear,
        status: statusObj.label,
        updated: today,
        icon
      };

      updatedList = [...currentList, newItem];
    }

    // Update local state immediately for instant feedback
    setAcademicComponents(updatedList);
    setIsModalOpen(false);

    // Persist to Supabase backend
    try {
      setIsSaving(true);
      const payload = updatedList.map(item => ({
        subjectId: item.subjectId,
        name: item.name || item.subjectName || item.subject?.name,
        grade: Number(item.grade) || 0,
        semester: item.semester || 'Semester 7',
        academicYear: item.academicYear || '2025/2026'
      }));

      const res = await apiRequest('/academic/my-grades', {
        method: 'PUT',
        body: { grades: payload }
      });

      if (res.data && Array.isArray(res.data)) {
        const sanitized = res.data.map(item => ({
          ...item,
          name: item.name || item.subjectName || item.subject?.name || 'Mata Kuliah',
          desc: item.desc || item.description || item.subject?.description || (DESCRIPTIONS[item.name || item.subjectName] || ''),
          icon: item.icon || (ICONS[item.name || item.subjectName] || '⌘'),
          grade: Number(item.grade) || 0
        }));
        setAcademicComponents(sanitized);
      }
      triggerToast("Data nilai akademik berhasil disimpan ke basis data.");
    } catch (err) {
      triggerToast("Tersimpan secara lokal. Sinkronisasi server: " + (err.message || 'Gagal'));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredComponents = useMemo(() => {
    if (!Array.isArray(academicComponents)) return [];
    const query = (searchQuery || '').toLowerCase().trim();

    return academicComponents.filter(item => {
      if (!item) return false;
      const name = String(item.name || item.subjectName || item.subject?.name || '').toLowerCase();
      const desc = String(item.desc || item.description || item.subject?.description || '').toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
  }, [academicComponents, searchQuery]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span>/</span>
        <span className="text-content-primary font-medium">Data Akademik (C2)</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-divider">
        <div>
          <h1 className="text-2xl sm:text-2.5xl font-bold text-content-primary tracking-tight">
            Data Nilai Akademik Mahasiswa
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Data nilai mata kuliah inti bidang TI yang menjadi masukan kriteria kemampuan akademik (C2) dalam matriks SAW.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Komponen Nilai</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-surface border border-divider rounded-xl p-5 shadow-xs space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-36" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-5">
            <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
              Komponen Terisi
            </span>
            <div className="text-2xl font-mono font-bold text-content-primary leading-tight mb-1">
              {academicComponents.length} <span className="text-sm font-normal text-content-muted">/ {AVAILABLE_OPTIONS.length}</span>
            </div>
            <span className="text-[11px] text-content-muted">
              {isComplete ? 'Kriteria C2 siap dihitung' : 'Lengkapi 5 komponen inti'}
            </span>
          </Card>

          <Card className="p-5">
            <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
              Nilai Rerata Akademik
            </span>
            <div className="text-2xl font-mono font-bold text-primary dark:text-sky-300 leading-tight mb-1">
              {averageScore.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-content-muted">
              Skala standar penilaian 0 sampai 100
            </span>
          </Card>

          <Card className="p-5">
            <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
              Status Kelengkapan
            </span>
            <div className="text-base font-bold text-content-primary leading-tight mb-1 flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isComplete ? 'Lengkap (100%)' : 'Belum Lengkap'}</span>
            </div>
            <span className="text-[11px] text-content-muted">
              {isComplete ? 'Memenuhi syarat normalisasi SAW' : 'Butuh semua 5 mata kuliah inti'}
            </span>
          </Card>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="overflow-hidden mb-8">
        <div className="p-5 border-b border-divider flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-content-primary">
              Daftar Komponen Akademik
            </h2>
            <p className="text-xs text-content-muted mt-0.5">
              Nilai yang dimasukkan akan dinormalisasi berdasarkan bobot mata kuliah per alternatif karir.
            </p>
          </div>

          <div className="relative">
            <input 
              type="search"
              placeholder="Cari komponen mata kuliah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 bg-subsurface border border-divider rounded-lg outline-none focus:border-primary text-xs text-content-primary"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted font-semibold">
                <th className="py-2.5 px-4">Mata Kuliah / Bidang</th>
                <th className="py-2.5 px-4 hidden md:table-cell">Deskripsi Kompetensi</th>
                <th className="py-2.5 px-4 text-center font-mono">Nilai</th>
                <th className="py-2.5 px-4 text-center">Status Mutu</th>
                <th className="py-2.5 px-4 hidden sm:table-cell">Semester</th>
                <th className="py-2.5 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <Skeleton className="h-3.5 w-56" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Skeleton className="h-5 w-10 mx-auto rounded-md" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Skeleton className="h-5 w-20 mx-auto rounded-full" />
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <Skeleton className="h-3.5 w-20" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Skeleton className="h-6 w-14 mx-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : (
                filteredComponents.map((item) => (
                  <tr key={item.id} className="hover:bg-subsurface/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded bg-subsurface border border-divider text-primary dark:text-sky-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {item.icon || '⌘'}
                        </span>
                        <div>
                          <strong className="font-semibold text-content-primary block leading-tight">
                            {item.name || item.subjectName || 'Mata Kuliah'}
                          </strong>
                          <span className="text-[10px] text-content-muted">
                            TA {item.academicYear || '2025/2026'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-content-secondary max-w-sm hidden md:table-cell leading-relaxed">
                      {item.desc || item.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm text-content-primary">
                      {item.grade ?? 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getStatus(item.grade).colorClass}`}>
                        {getStatus(item.grade).label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-content-muted hidden sm:table-cell">
                      {item.semester || 'Semester 7'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-1 rounded text-content-secondary hover:text-primary hover:bg-subsurface transition-colors"
                          title="Ubah nilai"
                          aria-label="Ubah nilai"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded text-content-secondary hover:text-rose-600 hover:bg-subsurface transition-colors"
                          title="Hapus"
                          aria-label="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && filteredComponents.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-content-muted">
                    Tidak ada komponen nilai akademik yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-subsurface/40 border-t border-divider flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted gap-2">
          <span>Menampilkan {filteredComponents.length} komponen nilai.</span>
          <span>Perubahan nilai akan secara otomatis memperbarui ranking SAW.</span>
        </div>
      </Card>

      {/* CRUD Modal Dialog */}
      <Modal 
        isOpen={isModalOpen} 
        title={editId !== null ? "Ubah Nilai Akademik" : "Tambah Komponen Nilai"} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs" noValidate>
          <div>
            <label htmlFor="componentName" className="font-semibold text-content-primary block mb-1">
              Komponen Mata Kuliah <span className="text-red-500">*</span>
            </label>
            <select 
              id="componentName"
              value={componentName}
              onChange={(e) => handleComponentNameChange(e.target.value)}
              className={`w-full px-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
                formErrors.componentName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-divider focus:border-primary'
              }`}
              aria-invalid={!!formErrors.componentName}
              required
            >
              <option value="" disabled>Pilih komponen mata kuliah</option>
              {AVAILABLE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {formErrors.componentName && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{formErrors.componentName}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="academicScore" className="font-semibold text-content-primary block mb-1">
              Nilai Angka (Skala 0 sampai 100) <span className="text-red-500">*</span>
            </label>
            <input 
              id="academicScore"
              type="number"
              min="0"
              max="100"
              placeholder="Contoh: 85"
              value={academicScore}
              onChange={(e) => {
                setAcademicScore(e.target.value);
                if (formErrors.academicScore) setFormErrors(prev => ({ ...prev, academicScore: undefined }));
              }}
              className={`w-full px-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary font-mono transition-colors ${
                formErrors.academicScore 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-divider focus:border-primary'
              }`}
              aria-invalid={!!formErrors.academicScore}
              required
            />
            {formErrors.academicScore && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{formErrors.academicScore}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="semester" className="font-semibold text-content-primary block mb-1">
                Semester
              </label>
              <select 
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 bg-subsurface border border-divider rounded-lg outline-none focus:border-primary text-xs text-content-primary"
                required
              >
                {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="academicYear" className="font-semibold text-content-primary block mb-1">
                Tahun Akademik <span className="text-red-500">*</span>
              </label>
              <input 
                id="academicYear"
                type="text"
                placeholder="2025/2026"
                value={academicYear}
                onChange={(e) => {
                  setAcademicYear(e.target.value);
                  if (formErrors.academicYear) setFormErrors(prev => ({ ...prev, academicYear: undefined }));
                }}
                className={`w-full px-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
                  formErrors.academicYear 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-divider focus:border-primary'
                }`}
                aria-invalid={!!formErrors.academicYear}
                required
              />
              {formErrors.academicYear && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.academicYear}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="font-semibold text-content-primary block mb-1">
              Keterangan Mata Kuliah <span className="text-red-500">*</span>
            </label>
            <input 
              id="description"
              type="text"
              placeholder="Deskripsi ringkas materi perkuliahan"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (formErrors.description) setFormErrors(prev => ({ ...prev, description: undefined }));
              }}
              className={`w-full px-3 py-2 bg-subsurface border rounded-lg outline-none text-xs text-content-primary transition-colors ${
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

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-divider">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 border border-divider hover:bg-subsurface text-content-secondary rounded-lg font-medium text-xs transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <footer className="pt-6 pb-2 text-center text-xs text-content-muted">
        Data akademik diverifikasi untuk perhitungan bobot Simple Additive Weighting.
      </footer>
    </main>
  );
}
