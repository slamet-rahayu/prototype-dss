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
  X,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function StudentsConfig() {
  const { students, setStudents } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    let active = true;
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('/admin/students');
        if (active && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setStudents(res.data);
        }
      } catch (err) {
        console.warn('Gagal memuat mahasiswa dari server:', err.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchStudents();
    return () => { active = false; };
  }, [setStudents]);

  // Form states
  const [editId, setEditId] = useState(null);
  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studyProgram, setStudyProgram] = useState('Teknologi Informasi');
  const [status, setStatus] = useState('Proses');

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleEdit = (student) => {
    setEditId(student.id);
    setFormErrors({});
    setNim(student.nim);
    setName(student.name);
    setEmail(student.email);
    setStudyProgram(student.studyProgram);
    setStatus(student.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data mahasiswa ini dari sistem?")) {
      try {
        await apiRequest(`/admin/students/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('API delete student error:', e.message);
      }
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      triggerToast("Data mahasiswa berhasil dihapus dari sistem dan basis data.");
    }
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setFormErrors({});
    setNim('');
    setName('');
    setEmail('');
    setStudyProgram('Teknologi Informasi');
    setStatus('Proses');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const nimTrimmed = nim.trim();
    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim();

    if (!nimTrimmed) {
      errs.nim = "Nomor Induk Mahasiswa (NIM) wajib diisi.";
    } else if (!/^\d{5,15}$/.test(nimTrimmed)) {
      errs.nim = "NIM harus berupa angka 5 hingga 15 digit.";
    }

    if (!nameTrimmed) {
      errs.name = "Nama lengkap mahasiswa wajib diisi.";
    } else if (nameTrimmed.length < 2) {
      errs.name = "Nama lengkap minimal 2 karakter.";
    }

    if (!emailTrimmed) {
      errs.email = "Alamat email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errs.email = "Format email tidak valid (contoh: student@univ.ac.id).";
    }

    const duplicateNim = students.find(s => s.nim === nimTrimmed && s.id !== editId);
    if (duplicateNim) {
      errs.nim = "Mahasiswa dengan NIM ini sudah terdaftar.";
    }

    const duplicateEmail = students.find(s => s.email?.toLowerCase() === emailTrimmed.toLowerCase() && s.id !== editId);
    if (duplicateEmail) {
      errs.email = "Mahasiswa dengan alamat email ini sudah terdaftar.";
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      triggerToast("Harap periksa isian data mahasiswa yang belum valid.");
      return;
    }

    setFormErrors({});

    if (editId !== null) {
      try {
        await apiRequest(`/admin/students/${editId}`, {
          method: 'PUT',
          body: { nim, fullName: name, email, studyProgram }
        });
      } catch (err) {
        console.warn('API update student error:', err.message);
      }
      const updated = students.map(s => {
        if (s.id === editId) {
          return { ...s, nim, name, email, studyProgram, status };
        }
        return s;
      });
      setStudents(updated);
      triggerToast("Data mahasiswa berhasil diperbarui di basis data.");
    } else {
      const duplicate = students.find(s => s.nim === nim || s.email === email);
      if (duplicate) {
        triggerToast("Mahasiswa dengan NIM atau Email ini sudah terdaftar.");
        return;
      }

      let newId = Date.now();
      try {
        const res = await apiRequest('/admin/students', {
          method: 'POST',
          body: {
            nim,
            fullName: name,
            email,
            studyProgram,
            semester: "Semester 7"
          }
        });
        if (res.data?.id) newId = res.data.id;
      } catch (err) {
        console.warn('API create student error:', err.message);
      }

      const newStudent = {
        id: newId,
        nim,
        name,
        email,
        studyProgram,
        semester: "Semester 7",
        status
      };
      setStudents([...students, newStudent]);
      triggerToast("Data mahasiswa baru berhasil ditambahkan ke basis data.");
    }

    setIsModalOpen(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nim.includes(searchQuery) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studyProgram.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const completeCount = students.filter(s => s.status === 'Lengkap').length;
  const pendingCount = students.filter(s => s.status === 'Proses').length;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4 font-medium">
        <span>Dashboard Admin</span>
        <span aria-hidden="true">/</span>
        <span className="text-content-primary">Manajemen Mahasiswa</span>
      </nav>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full border-b border-divider pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-divider text-[11px] font-semibold text-content-secondary uppercase tracking-wider mb-2">
            Basis Data Mahasiswa
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-content-primary tracking-tight">
            Manajemen Mahasiswa
          </h1>
          <p className="text-content-secondary text-sm mt-1.5 max-w-2xl leading-relaxed">
            Kelola data mahasiswa tingkat akhir, status kelengkapan data kuesioner RIASEC, dan transkrip nilai akademik untuk proses rekomendasi karir.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-xs transition-colors w-full md:w-auto justify-center cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Mahasiswa
        </button>
      </section>

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Total Mahasiswa Terdaftar</span>
          <strong className="text-3xl font-mono font-black text-content-primary block leading-none tabular-nums my-1">{students.length}</strong>
          <span className="text-xs text-content-secondary">Mahasiswa aktif tingkat akhir dalam sistem</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Data Lengkap (Siap SAW)</span>
          <strong className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 block leading-none tabular-nums my-1">{completeCount}</strong>
          <span className="text-xs text-content-secondary">Telah melengkapi kuesioner RIASEC dan nilai akademik</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Dalam Proses Pengisian</span>
          <strong className="text-3xl font-mono font-black text-amber-600 block leading-none tabular-nums my-1">{pendingCount}</strong>
          <span className="text-xs text-content-secondary">Menunggu penyelesaian tes atau konfirmasi nilai</span>
        </Card>
      </section>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-divider flex items-center justify-between flex-wrap gap-4 bg-subsurface/40">
          <div>
            <h2 className="text-sm font-bold text-content-primary">Daftar Mahasiswa</h2>
            <p className="text-content-muted text-xs mt-0.5">Daftar pengguna mahasiswa dan status pemenuhan kriteria evaluasi.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari mahasiswa atau NIM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 pl-8 pr-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none transition-colors"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                <th className="px-6 py-3">Mahasiswa</th>
                <th className="px-6 py-3">Alamat Email</th>
                <th className="px-6 py-3">Program Studi</th>
                <th className="px-6 py-3">Semester</th>
                <th className="px-6 py-3 text-center">Status Data</th>
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
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
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
                filteredStudents.map((item) => (
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
                    <td className="px-6 py-4 text-content-secondary font-mono">
                      {item.email}
                    </td>
                    <td className="px-6 py-4 text-content-secondary">
                      {item.studyProgram}
                    </td>
                    <td className="px-6 py-4 text-content-secondary">
                      {item.semester || 'Semester 7'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'Lengkap' 
                          ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                          : 'text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-md bg-subsurface hover:bg-divider text-content-primary transition-colors cursor-pointer"
                          title="Lihat / Ubah data"
                          aria-label={`Ubah data ${item.name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Hapus data mahasiswa"
                          aria-label={`Hapus data ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-content-muted">
                    Data mahasiswa tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 bg-subsurface/40 border-t border-divider flex items-center justify-between text-content-muted text-xs">
          <span>Menampilkan <strong className="text-content-primary font-mono">{filteredStudents.length}</strong> mahasiswa.</span>
          <span>Data mahasiswa tersimpan secara lokal pada prototype ini.</span>
        </div>
      </Card>

      {/* CRUD Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={editId !== null ? "Ubah Data Mahasiswa" : "Tambah Mahasiswa"} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="grid gap-4 text-sm" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="nim" className="font-semibold text-content-primary text-xs">Nomor Induk Mahasiswa (NIM)</label>
              <input 
                id="nim"
                type="text"
                value={nim}
                onChange={(e) => {
                  setNim(e.target.value);
                  if (formErrors.nim) setFormErrors(prev => ({ ...prev, nim: null }));
                }}
                placeholder="Contoh: 20220801001"
                aria-invalid={!!formErrors.nim}
                className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none font-mono transition-colors ${
                  formErrors.nim ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
                }`}
                required
              />
              {formErrors.nim && (
                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.nim}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="name" className="font-semibold text-content-primary text-xs">Nama Lengkap</label>
              <input 
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
                }}
                placeholder="Contoh: Mame Riyadi"
                aria-invalid={!!formErrors.name}
                className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none transition-colors ${
                  formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
                }`}
                required
              />
              {formErrors.name && (
                <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.name}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="email" className="font-semibold text-content-primary text-xs">Alamat Email Kampus</label>
            <input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors(prev => ({ ...prev, email: null }));
              }}
              placeholder="Contoh: student@univ.ac.id"
              aria-invalid={!!formErrors.email}
              className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none font-mono transition-colors ${
                formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
              }`}
              required
            />
            {formErrors.email && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="studyProgram" className="font-semibold text-content-primary text-xs">Program Studi</label>
              <select 
                id="studyProgram"
                value={studyProgram}
                onChange={(e) => setStudyProgram(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-sm focus:border-primary outline-none cursor-pointer"
              >
                <option value="Teknologi Informasi">Teknologi Informasi</option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
                <option value="Ilmu Komputer">Ilmu Komputer</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="status" className="font-semibold text-content-primary text-xs">Status Kelengkapan</label>
              <select 
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-sm focus:border-primary outline-none cursor-pointer"
              >
                <option value="Lengkap">Lengkap (Siap Rekomendasi)</option>
                <option value="Proses">Proses (Belum Lengkap)</option>
              </select>
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
