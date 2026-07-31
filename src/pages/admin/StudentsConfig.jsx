import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { 
  Search, 
  Trash2, 
  Eye,
  X
} from 'lucide-react';

export default function StudentsConfig() {
  const { students, setStudents } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

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
    setNim(student.nim);
    setName(student.name);
    setEmail(student.email);
    setStudyProgram(student.studyProgram);
    setStatus(student.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Hapus data mahasiswa ini?")) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      triggerToast("Data mahasiswa berhasil dihapus.");
    }
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setNim('');
    setName('');
    setEmail('');
    setStudyProgram('Teknologi Informasi');
    setStatus('Proses');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!nim || !name || !email) return;

    if (editId !== null) {
      const updated = students.map(s => {
        if (s.id === editId) {
          return { ...s, nim, name, email, studyProgram, status };
        }
        return s;
      });
      setStudents(updated);
      triggerToast("Data mahasiswa berhasil diperbarui.");
    } else {
      const duplicate = students.find(s => s.nim === nim || s.email === email);
      if (duplicate) {
        triggerToast("Mahasiswa dengan NIM atau Email ini sudah terdaftar.");
        return;
      }
      const newStudent = {
        id: Date.now(),
        nim,
        name,
        email,
        studyProgram,
        semester: "Semester 7",
        status
      };
      setStudents([...students, newStudent]);
      triggerToast("Data mahasiswa berhasil ditambahkan.");
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

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-slate-500">Mahasiswa</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Manajemen Mahasiswa</h1>
          <p className="text-slate-500 text-sm mt-2">Memantau data mahasiswa, status akun, dan kelengkapan data rekomendasi.</p>
        </div>
        
      </section>

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Mahasiswa</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">{students.length}</strong>
            <span className="text-[10px] text-slate-400 font-medium">Terdaftar di sistem</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Data Lengkap</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">
              {students.filter(s => s.status === 'Lengkap').length}
            </strong>
            <span className="text-[10px] text-slate-400 font-medium">Siap diproses SAW</span>
          </div>
        </article>
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-[-20px] bottom-[-20px] w-20 h-20 rounded-full bg-primary-light/35 -z-0" />
          <div className="relative z-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Menunggu Proses</span>
            <strong className="text-2xl font-black text-slate-900 block leading-none">
              {students.filter(s => s.status === 'Proses').length}
            </strong>
            <span className="text-[10px] text-slate-400 font-medium">Mengisi data / tes RIASEC</span>
          </div>
        </article>
      </section>

      {/* Main Table Card */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Daftar Mahasiswa</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari mahasiswa..."
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
                <th className="px-6 py-3.5">Mahasiswa</th>
                <th className="px-6 py-3.5">Alamat Email</th>
                <th className="px-6 py-3.5">Program Studi</th>
                <th className="px-6 py-3.5">Semester</th>
                <th className="px-6 py-3.5">Status Data</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary-light text-primary-dark font-extrabold text-[10px] grid place-items-center">
                        {item.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
                      </span>
                      <div>
                        <strong className="text-slate-800 block font-bold">{item.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {item.studyProgram}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {item.semester || 'Semester 7'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      item.status === 'Lengkap' 
                        ? 'text-emerald-800 bg-emerald-50' 
                        : 'text-amber-800 bg-amber-50'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded-lg bg-blue-50 text-primary-dark hover:bg-blue-100 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        title="Nonaktifkan"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    Data mahasiswa tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Menampilkan <strong>{filteredStudents.length}</strong> mahasiswa.</span>
          <span>Credential mahasiswa tersimpan secara lokal pada prototype.</span>
        </div>
      </section>

      {/* CRUD Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={editId !== null ? "Ubah Data Mahasiswa" : "Tambah Mahasiswa"} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label htmlFor="nim" className="font-bold text-slate-700 text-xs">NIM Mahasiswa</label>
              <input 
                id="nim"
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Contoh: 20220801001"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="name" className="font-bold text-slate-700 text-xs">Nama Lengkap</label>
              <input 
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Mame Riyadi"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="email" className="font-bold text-slate-700 text-xs">Alamat Email</label>
            <input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: student@email.com"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label htmlFor="studyProgram" className="font-bold text-slate-700 text-xs">Program Studi</label>
              <select 
                id="studyProgram"
                value={studyProgram}
                onChange={(e) => setStudyProgram(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer"
              >
                <option>Teknik Informatika</option>
                <option>Sistem Informasi</option>
                <option>Ilmu Komputer</option>
                <option>Teknologi Informasi</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="font-bold text-slate-700 text-xs">Status Data</label>
              <select 
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer"
              >
                <option>Lengkap</option>
                <option>Proses</option>
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
