import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  Info,
  Sliders,
  CheckCircle,
  FileSpreadsheet
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
  
  // Form states
  const [editId, setEditId] = useState(null);
  const [componentName, setComponentName] = useState('');
  const [academicScore, setAcademicScore] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState('Semester 7');
  const [academicYear, setAcademicYear] = useState('2025/2026');

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  // Calculations
  const averageScore = useMemo(() => {
    if (academicComponents.length === 0) return 0;
    const total = academicComponents.reduce((sum, item) => sum + Number(item.grade), 0);
    return Number((total / academicComponents.length).toFixed(1));
  }, [academicComponents]);

  const dataStatus = academicComponents.length >= 5 ? 'Lengkap' : 'Belum Lengkap';

  const getStatus = (score) => {
    if (score >= 85) return { label: 'Sangat Baik', colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (score >= 70) return { label: 'Baik', colorClass: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { label: 'Perlu Ditingkatkan', colorClass: 'text-rose-800 bg-rose-50 border-rose-200' };
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setComponentName(item.name);
    setAcademicScore(item.grade);
    setDescription(item.desc);
    setSemester(item.semester || 'Semester 7');
    setAcademicYear(item.academicYear || '2025/2026');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Hapus komponen nilai akademik ini?")) {
      const updated = academicComponents.filter(item => item.id !== id);
      setAcademicComponents(updated);
      triggerToast("Komponen akademik berhasil dihapus.");
    }
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setComponentName('');
    setAcademicScore('');
    setDescription('');
    setSemester('Semester 7');
    setAcademicYear('2025/2026');
    setIsModalOpen(true);
  };

  const handleComponentNameChange = (val) => {
    setComponentName(val);
    if (DESCRIPTIONS[val]) {
      setDescription(DESCRIPTIONS[val]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const scoreVal = Number(academicScore);
    if (scoreVal < 0 || scoreVal > 100) {
      triggerToast("Nilai harus berada di rentang 0 - 100.");
      return;
    }

    const today = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(new Date());

    const icon = ICONS[componentName] || "◫";
    const statusObj = getStatus(scoreVal);

    if (editId !== null) {
      // Edit mode
      const updated = academicComponents.map(item => {
        if (item.id === editId) {
          return {
            ...item,
            name: componentName,
            grade: scoreVal,
            desc: description,
            semester: semester,
            academicYear: academicYear,
            status: statusObj.label,
            updated: today,
            icon
          };
        }
        return item;
      });
      setAcademicComponents(updated);
      triggerToast("Data akademik berhasil diperbarui.");
    } else {
      // Add mode
      const duplicate = academicComponents.find(item => item.name === componentName);
      if (duplicate) {
        triggerToast("Komponen ini sudah tersedia. Silakan gunakan tombol Ubah.");
        return;
      }

      const newItem = {
        id: Date.now(),
        name: componentName,
        desc: description,
        grade: scoreVal,
        semester: semester,
        academicYear: academicYear,
        status: statusObj.label,
        updated: today,
        icon
      };

      setAcademicComponents([...academicComponents, newItem]);
      triggerToast("Data akademik berhasil ditambahkan.");
    }

    setIsModalOpen(false);
  };

  // Filter Table
  const filteredComponents = useMemo(() => {
    return academicComponents.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [academicComponents, searchQuery]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <Link to="/" className="text-primary-dark hover:underline">Beranda</Link>
        <span>›</span>
        <Link to="/profile" className="text-primary-dark hover:underline">Profil</Link>
        <span>›</span>
        <span className="text-slate-500">Data Akademik</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Data Akademik</h1>
          <p className="text-slate-500 text-sm mt-2">Kelola nilai komponen akademik yang digunakan sebagai kriteria kemampuan akademik atau C2 dalam rekomendasi karir.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-extrabold rounded-xl shadow-md shadow-blue-500/10 active:scale-95 transition-all w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Tambah Data Akademik
        </button>
      </section>

      {/* Stats Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute right-[-24px] bottom-[-24px] w-24 h-24 rounded-full bg-primary-light/30 -z-0" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Komponen Terisi</span>
            <div>
              <strong className="text-3xl font-black text-slate-900 leading-none block mb-1">{academicComponents.length}</strong>
              <span className="text-[11px] text-slate-400 font-medium">Dari {AVAILABLE_OPTIONS.length} komponen akademik tersedia.</span>
            </div>
          </div>
        </article>

        <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute right-[-24px] bottom-[-24px] w-24 h-24 rounded-full bg-primary-light/30 -z-0" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Rata-rata Nilai</span>
            <div>
              <strong className="text-3xl font-black text-slate-900 leading-none block mb-1">{averageScore.toLocaleString('id-ID')}</strong>
              <span className="text-[11px] text-slate-400 font-medium">Rata-rata nilai dari seluruh komponen.</span>
            </div>
          </div>
        </article>

        <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="absolute right-[-24px] bottom-[-24px] w-24 h-24 rounded-full bg-primary-light/30 -z-0" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Status Data</span>
            <div>
              <strong className="text-3xl font-black text-slate-900 leading-none block mb-1">{dataStatus}</strong>
              <span className="text-[11px] text-slate-400 font-medium">
                {academicComponents.length >= 5 ? 'Data akademik siap digunakan.' : 'Harap lengkapi semua komponen.'}
              </span>
            </div>
          </div>
        </article>
      </section>

      {/* Info Panel: Ring Graphic + Petunjuk */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Ring Card (lg:col-span-5) */}
        <article className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center">
          <h2 className="text-sm font-black text-slate-900 mb-1 w-full text-left">Ringkasan Kemampuan Akademik</h2>
          <p className="text-slate-500 text-xs mb-6 w-full text-left leading-relaxed">Nilai rata-rata dari data akademik yang telah Anda masukkan.</p>

          <div className="relative flex items-center justify-center mb-6">
            <div 
              className="w-44 h-44 rounded-full flex items-center justify-center shadow-inner"
              style={{
                background: `conic-gradient(var(--color-primary) 0deg ${averageScore * 3.6}deg, #f1f5f9 ${averageScore * 3.6}deg 360deg)`
              }}
            >
              <div className="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center text-center shadow">
                <strong className="text-3xl font-black text-slate-950 leading-none mb-1">{averageScore.toLocaleString('id-ID')}</strong>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nilai Rerata</span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-start gap-2.5 p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-800 text-[11px] leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Nilai akademik akan dipadukan dengan pemetaan kebutuhan akademik setiap alternatif karir untuk menghasilkan kriteria C2.
            </span>
          </div>
        </article>

        {/* Petunjuk Pengisian Card (lg:col-span-7) */}
        <article className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 mb-1">Petunjuk Pengisian</h2>
          <p className="text-slate-500 text-xs mb-6 leading-relaxed">Masukkan nilai berdasarkan komponen akademik yang relevan dengan bidang teknologi informasi.</p>

          <div className="grid gap-3 text-xs">
            <div className="flex gap-4 p-4 border border-slate-100 bg-slate-50/40 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-primary-light text-primary-dark font-extrabold flex items-center justify-center shrink-0">1</span>
              <div>
                <h4 className="font-black text-slate-800 mb-0.5">Pilih komponen akademik</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Pilih kelompok mata kuliah atau komponen penilaian yang akan diisi.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border border-slate-100 bg-slate-50/40 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-primary-light text-primary-dark font-extrabold flex items-center justify-center shrink-0">2</span>
              <div>
                <h4 className="font-black text-slate-800 mb-0.5">Masukkan nilai</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Gunakan rentang nilai 0 sampai 100 agar nilai dapat diproses secara konsisten.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border border-slate-100 bg-slate-50/40 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-primary-light text-primary-dark font-extrabold flex items-center justify-center shrink-0">3</span>
              <div>
                <h4 className="font-black text-slate-800 mb-0.5">Perbarui bila diperlukan</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Anda dapat mengubah nilai apabila ada pembaruan data akademik pada semester berikutnya.</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Main Table Card */}
      <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Daftar Nilai Akademik</h2>
            <p className="text-slate-500 text-xs mt-0.5">Data berikut digunakan untuk membentuk nilai kemampuan akademik mahasiswa.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <input 
                type="search"
                placeholder="Cari komponen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-xs transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                <th className="px-6 py-3.5">Komponen Akademik</th>
                <th className="px-6 py-3.5">Deskripsi</th>
                <th className="px-6 py-3.5 text-center">Nilai</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5">Terakhir Diperbarui</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredComponents.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark text-sm font-extrabold grid place-items-center">
                        {item.icon}
                      </span>
                      <div>
                        <strong className="text-slate-800 block font-bold">{item.name}</strong>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                          <span>{item.semester || 'Semester 7'}</span>
                          <span className="text-slate-350">•</span>
                          <span>TA {item.academicYear || '2025/2026'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-sm leading-relaxed">
                    {item.desc}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <strong className="text-base font-black text-primary-dark leading-none">{item.grade}</strong>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-black ${getStatus(item.grade).colorClass}`}>
                      {getStatus(item.grade).label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">
                    {item.updated}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded-lg bg-blue-50 text-primary-dark hover:bg-blue-100 transition-colors"
                        title="Ubah"
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
              {filteredComponents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    Komponen akademik tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>Menampilkan <strong>{filteredComponents.length}</strong> komponen akademik.</span>
          <span>Nilai dapat diperbarui sewaktu-waktu sesuai data akademik terbaru.</span>
        </div>
      </section>

      {/* CRUD Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={editId !== null ? "Ubah Data Akademik" : "Tambah Data Akademik"} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="grid gap-5 text-sm">
          <div className="grid gap-2">
            <label htmlFor="componentName" className="font-bold text-slate-700 text-xs">Komponen Akademik</label>
            <select 
              id="componentName"
              value={componentName}
              onChange={(e) => handleComponentNameChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm cursor-pointer"
              required
            >
              <option value="" disabled>Pilih komponen akademik</option>
              {AVAILABLE_OPTIONS.map(opt => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="academicScore" className="font-bold text-slate-700 text-xs">Nilai</label>
            <input 
              id="academicScore"
              type="number"
              min="0"
              max="100"
              placeholder="Masukkan nilai 0 - 100"
              value={academicScore}
              onChange={(e) => setAcademicScore(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="semester" className="font-bold text-slate-700 text-xs">Semester</label>
              <select 
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm cursor-pointer"
                required
              >
                {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="academicYear" className="font-bold text-slate-700 text-xs">Tahun Akademik</label>
              <input 
                id="academicYear"
                type="text"
                placeholder="Misal: 2025/2026"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="font-bold text-slate-700 text-xs">Keterangan</label>
            <input 
              id="description"
              type="text"
              placeholder="Contoh: Nilai rata-rata mata kuliah terkait"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm"
              required
            />
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
