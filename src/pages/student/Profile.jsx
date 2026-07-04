import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Toast from '../../components/Toast';
import {
  User,
  Mail,
  School,
  BookOpen,
  Calendar,
  MapPin,
  Check,
  ArrowRight
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, academicComponents, riasecResult } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [studyProgram, setStudyProgram] = useState(user?.studyProgram || 'Teknologi Informasi');
  const [semester, setSemester] = useState(user?.semester || 'Semester 7');
  const [domicile, setDomicile] = useState(user?.domicile || '');
  const [showSavedLabel, setShowSavedLabel] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      university,
      studyProgram,
      semester,
      domicile
    });

    setShowSavedLabel(true);
    triggerToast("Perubahan profil berhasil disimpan.");
    setTimeout(() => {
      setShowSavedLabel(false);
    }, 2500);
  };

  const handleReset = () => {
    setName(user?.name || '');
    setUniversity(user?.university || '');
    setStudyProgram(user?.studyProgram || 'Teknologi Informasi');
    setSemester(user?.semester || 'Semester 7');
    setDomicile(user?.domicile || '');
    triggerToast("Perubahan pada formulir dibatalkan.");
  };

  // Profile completeness computation
  const hasProfile = user && user.name && user.university && user.studyProgram;
  const hasAcademic = academicComponents && academicComponents.length >= 5;
  const hasRiasec = riasecResult && riasecResult.completedAt;

  let completionScore = 50; // base profile setup
  if (hasProfile) completionScore += 10;
  if (hasAcademic) completionScore += 20;
  if (hasRiasec) completionScore += 20;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <Link to="/" className="text-primary-dark hover:underline">Beranda</Link>
        <span>›</span>
        <span className="text-slate-500">Profil</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Profil Mahasiswa</h1>
          <p className="text-slate-500 text-sm mt-2">Kelola informasi profil agar sistem dapat memberikan rekomendasi karir yang lebih relevan.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Profil aktif
        </span>
      </section>

      {/* Layout: Sidebar Summary + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Sidebar Summary (lg:col-span-4) */}
        <aside className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary-light/40 translate-x-16 -translate-y-16 -z-0" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Large avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-dark to-primary text-white text-2xl font-black grid place-items-center shadow-lg shadow-blue-500/20 border-4 border-white">
              {user?.initials || 'MR'}
            </div>

            <h2 className="text-lg font-black text-slate-900 mt-4 mb-0.5">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-medium mb-3">{user?.email}</p>
            <span className="inline-flex px-2.5 py-1 bg-primary-light text-primary-dark text-[11px] font-black rounded-lg">
              Mahasiswa
            </span>

            <div className="w-full h-px bg-slate-100 my-6" />

            {/* Profile Education details */}
            <div className="w-full grid gap-4 text-left">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-primary-dark grid place-items-center shrink-0">
                  <School className="w-4 h-4" />
                </span>
                <div>
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">{user?.university || 'Belum diisi'}</strong>
                  <span className="text-[10px] text-slate-400 block font-medium">Perguruan tinggi</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-primary-dark grid place-items-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">{user?.studyProgram || 'Belum diisi'}</strong>
                  <span className="text-[10px] text-slate-400 block font-medium">Program studi</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-primary-dark grid place-items-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">{user?.semester || 'Belum diisi'}</strong>
                  <span className="text-[10px] text-slate-400 block font-medium">Semester saat ini</span>
                </div>
              </div>
            </div>

            {/* Completion Meter */}
            <div className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-4 mt-6 text-left">
              <div className="flex items-center justify-between text-xs font-black mb-2">
                <span className="text-slate-600">Kelengkapan profil</span>
                <span className="text-primary-dark">{completionScore}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Lengkapi data akademik dan ikuti tes RIASEC untuk memperoleh rekomendasi karir.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Form (lg:col-span-8) */}
        <section className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Informasi Pribadi dan Akademik</h2>
              <p className="text-slate-500 text-xs mt-0.5">Perbarui data yang digunakan oleh sistem sebagai informasi pendukung rekomendasi.</p>
            </div>
            {showSavedLabel && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black rounded-lg">
                <Check className="w-3.5 h-3.5" />
                Tersimpan
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} onReset={handleReset} className="p-6 grid gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-dark block mb-[-8px]">
              Data Akun
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="fullName" className="text-xs font-bold text-slate-700">Nama lengkap</label>
                <div className="relative">
                  <input
                    id="fullName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                    required
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-700">Email</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200 rounded-xl outline-none text-sm"
                    readOnly
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-350" />
                </div>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-primary-dark block mb-[-8px]">
              Data Pendidikan
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="university" className="text-xs font-bold text-slate-700">Perguruan tinggi</label>
                <div className="relative">
                  <input
                    id="university"
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                    required
                  />
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="studyProgram" className="text-xs font-bold text-slate-700">Program studi</label>
                <div className="relative">
                  <select
                    id="studyProgram"
                    value={studyProgram}
                    onChange={(e) => setStudyProgram(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm transition-all cursor-pointer appearance-none"
                    required
                  >
                    <option>Teknik Informatika</option>
                    <option>Sistem Informasi</option>
                    <option>Ilmu Komputer</option>
                    <option>Teknologi Informasi</option>
                    <option>Lainnya</option>
                  </select>
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="semester" className="text-xs font-bold text-slate-700">Semester saat ini</label>
                <div className="relative">
                  <select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm transition-all cursor-pointer appearance-none"
                    required
                  >
                    <option>Semester 7</option>
                    <option>Semester 8</option>
                    <option>Semester 9 atau lebih</option>
                  </select>
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="domicile" className="text-xs font-bold text-slate-700">Domisili</label>
                <div className="relative">
                  <input
                    id="domicile"
                    type="text"
                    value={domicile}
                    onChange={(e) => setDomicile(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                    required
                  />
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl text-blue-800 text-[11px] leading-relaxed flex gap-2">
              <span className="font-bold text-sm leading-none shrink-0">ℹ</span>
              <span>
                Data profil digunakan sebagai informasi pendukung. Nilai akademik dan hasil tes RIASEC dikelola pada halaman terpisah agar proses rekomendasi tetap terstruktur.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="reset"
                className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500 font-bold text-xs transition-colors duration-150"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs transition-colors duration-150 shadow-md shadow-blue-500/10 active:scale-95"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Bottom Grid: Academic box & Security box */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Card */}
        <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-1">Data Akademik</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Lengkapi data kemampuan akademik untuk digunakan sebagai kriteria C2 pada perhitungan rekomendasi.
            </p>

            <div className="flex items-center justify-between gap-4 p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-primary-light text-primary-dark grid place-items-center font-bold text-base">
                  ◫
                </span>
                <div>
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">
                    {hasAcademic ? 'Data akademik lengkap' : 'Data akademik belum lengkap'}
                  </strong>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {hasAcademic ? `${academicComponents.length} komponen nilai terisi` : 'Tambahkan nilai komponen akademik Anda.'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/akademik')}
                className="px-3.5 py-1.5 text-xs font-black text-primary-dark hover:text-primary transition-colors flex items-center gap-1.5"
              >
                Kelola <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </article>

        {/* Security Card */}
        <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 mb-1">Keamanan Akun</h3>
          <p className="text-slate-500 text-xs leading-relaxed mb-4">Kelola pengaturan penting untuk menjaga keamanan akun Anda.</p>

          <div className="grid gap-3 text-xs">
            <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
              <div>
                <strong className="text-xs font-bold text-slate-800 block mb-0.5">Kata sandi</strong>
                <span className="text-[10px] text-slate-400 block font-medium">Terakhir diperbarui beberapa waktu lalu</span>
              </div>
              <button
                onClick={() => triggerToast('Fitur ubah kata sandi akan dibuka.')}
                className="px-3 py-1.5 rounded-lg bg-primary-light text-primary-dark hover:bg-blue-100 text-[11px] font-black transition-colors"
              >
                Ubah
              </button>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <strong className="text-xs font-bold text-slate-800 block mb-0.5">Alamat email</strong>
                <span className="text-[10px] text-slate-400 block font-medium">Email digunakan untuk masuk ke sistem</span>
              </div>
              <button
                onClick={() => triggerToast('Email hanya dapat diubah melalui verifikasi akun.')}
                className="px-3 py-1.5 rounded-lg bg-primary-light text-primary-dark hover:bg-blue-100 text-[11px] font-black transition-colors"
              >
                Atur
              </button>
            </div>
          </div>
        </article>
      </section>

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
