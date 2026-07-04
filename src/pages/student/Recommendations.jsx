import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Toast from '../../components/Toast';
import {
  Award,
  MapPin,
  TrendingUp,
  Info,
  HelpCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

export default function Recommendations() {
  const { user, sawResults, riasecResult, academicComponents } = useContext(AppContext);
  const navigate = useNavigate();

  const [selectedCareerName, setSelectedCareerName] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  useEffect(() => {
    if (sawResults && sawResults.length > 0) {
      setSelectedCareerName(sawResults[0].name);
    }
  }, [sawResults]);

  // If no RIASEC result or no academic components entered, block page and suggest taking tests
  const hasAcademic = academicComponents && academicComponents.length >= 5;
  const hasRiasec = riasecResult && riasecResult.completedAt;

  if (!hasRiasec || !hasAcademic) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-100">
          <span className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 text-3xl grid place-items-center mx-auto mb-5">
            ⚠
          </span>
          <h2 className="text-xl font-black text-slate-900 mb-2">Rekomendasi Belum Tersedia</h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">
            Hasil rekomendasi karir membutuhkan pengisian data akademik lengkap dan penyelesaian Tes RIASEC.
          </p>
          <div className="grid gap-3">
            {!hasAcademic && (
              <button
                onClick={() => navigate('/akademik')}
                className="w-full py-2.5 bg-primary text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Lengkapi Data Akademik
              </button>
            )}
            {!hasRiasec && (
              <button
                onClick={() => navigate('/riasec')}
                className="w-full py-2.5 bg-primary text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Ikuti Tes RIASEC
              </button>
            )}
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 font-bold mt-2">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Get selected career details
  const selectedCareer = sawResults.find(r => r.name === selectedCareerName) || sawResults[0];
  const topResult = sawResults[0];

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(riasecResult.completedAt));

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <Link to="/" className="text-primary-dark hover:underline">Beranda</Link>
        <span>›</span>
        <span className="text-slate-500">Hasil Rekomendasi Karir</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Hasil Rekomendasi Karir</h1>
          <p className="text-slate-500 text-sm mt-2">Hasil pengolahan minat karir, kemampuan akademik, dan kebutuhan pasar kerja menggunakan metode Simple Additive Weighting (SAW).</p>
        </div>
        <span className="inline-flex px-3 py-1.5 bg-blue-50 border border-blue-200 text-primary-dark text-[11px] font-black rounded-full whitespace-nowrap">
          ◷ Dibuat pada {formattedDate} WIB
        </span>
      </section>

      {/* Top recommendation banner */}
      {topResult && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-dark via-blue-600 to-primary text-white p-8 md:p-10 shadow-xl shadow-blue-500/20 mb-6 flex flex-col lg:flex-row gap-8 justify-between items-stretch">
          {/* Glow circle overlay */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full border border-white/5 translate-x-12 -translate-y-24 bg-white/5" />

          <div className="flex-1 relative z-10 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-white/20 bg-white/10 rounded-full text-xs font-black uppercase tracking-wider mb-4 animate-pulse">
                ✦ Rekomendasi Utama Anda
              </span>
              <div className="flex items-center gap-4 mb-4">
                <span className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 font-black text-2xl grid place-items-center">
                  {topResult.icon}
                </span>
                <div>
                  <h2 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none mb-1">{topResult.name}</h2>
                  <p className="text-white/80 text-xs md:text-sm">{topResult.subtitle}</p>
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-6 max-w-xl">
                Hasil ini menunjukkan kesesuaian yang tinggi antara minat {riasecResult.top.join('–')}, kemampuan akademik Anda, dan kondisi kebutuhan pasar kerja untuk peran {topResult.name}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg font-bold">RIASEC: {topResult.tags[0] || 'I R C'}</span>
              <span className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg font-bold">{topResult.market?.vacancy || '500'} lowongan</span>
            </div>
          </div>

          {/* SAW score box */}
          <aside className="relative z-10 w-full lg:w-72 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-6 text-white flex flex-col justify-between">
            <div>
              <span className="text-white/70 text-xs font-bold block mb-1">Nilai Preferensi SAW</span>
              <strong className="text-5xl font-black tracking-tighter leading-none block mb-1">{topResult.score}</strong>
              <span className="text-white/75 text-[10px] leading-relaxed block">Nilai tertinggi dari seluruh alternatif karir yang dibandingkan.</span>
            </div>
            <div className="w-full h-px bg-white/15 my-4" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-white/60 text-[10px] block leading-none mb-1">Ranking</span>
                <strong className="text-sm font-black">#1</strong>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-white/60 text-[10px] block leading-none mb-1">Data lengkap</span>
                <strong className="text-sm font-black">100%</strong>
              </div>
            </div>
          </aside>
        </section>
      )}

      {/* Advisory Note */}
      <section className="p-4 border border-blue-100 bg-blue-50/50 rounded-2xl text-blue-800 text-xs leading-relaxed flex gap-2.5 mb-8">
        <span className="font-bold text-sm leading-none shrink-0">ℹ</span>
        <span>
          Rekomendasi ini dapat menjadi bahan pertimbangan awal. Tetap eksplorasi minat, portofolio, pengalaman proyek, dan informasi pekerjaan sebelum menentukan pilihan karir.
        </span>
      </section>

      {/* Main Grid: SAW Ranking list + Criteria contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-start">
        {/* Left: Careers list ranking (lg:col-span-7) */}
        <article className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-50">
            <h2 className="text-base font-black text-slate-900">Ranking Alternatif Karir</h2>
            <p className="text-slate-500 text-xs mt-0.5">Pilih salah satu alternatif untuk melihat detail kesesuaian dan informasi pasar kerjanya.</p>
          </div>

          <div className="px-6 py-2 divide-y divide-slate-100">
            {sawResults.slice(0, 5).map((item, index) => (
              <button
                key={item.name}
                onClick={() => setSelectedCareerName(item.name)}
                className={`w-full grid grid-cols-12 items-center gap-3 py-3.5 px-3 -mx-3 rounded-xl text-left border-0 transition-all ${selectedCareerName === item.name
                  ? 'bg-blue-50/40 text-primary-dark font-bold'
                  : 'bg-transparent text-slate-800 hover:bg-slate-50/50'
                  }`}
              >
                <div className="col-span-1">
                  <span className="w-7 h-7 rounded-lg bg-primary-light text-primary-dark text-xs font-black grid place-items-center">
                    {index + 1}
                  </span>
                </div>
                <div className="col-span-6 md:col-span-7 min-w-0">
                  <strong className="text-xs font-black text-slate-900 block mb-0.5">{item.name}</strong>
                  <span className="text-[10px] text-slate-400 block truncate font-medium">{item.subtitle}</span>
                </div>
                <div className="hidden md:block col-span-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
                    style={{ width: `${item.scoreVal * 100}%` }}
                  />
                </div>
                <div className="col-span-5 md:col-span-1 text-right">
                  <strong className="text-sm font-black text-primary-dark leading-none">{item.score}</strong>
                </div>
              </button>
            ))}
          </div>
        </article>

        {/* Right: Selected Career Criteria values (lg:col-span-5) */}
        {selectedCareer && (
          <aside className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-black text-slate-900 mb-0.5">Rincian Nilai Kriteria</h2>
              <p className="text-slate-500 text-xs">Kontribusi C1, C2, dan C3 terhadap alternatif {selectedCareer.name}.</p>
            </div>

            <div className="grid gap-5">
              <div className="grid grid-cols-12 items-center gap-3">
                <span className="col-span-2 w-9 h-9 rounded-xl bg-primary-light text-primary-dark font-black text-xs grid place-items-center">
                  C1
                </span>
                <div className="col-span-8">
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">Minat Karir</strong>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight mb-2">{selectedCareer.c1.desc}</p>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${selectedCareer.c1.pct}%` }} />
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <strong className="text-sm font-black text-primary-dark">{selectedCareer.c1.val}</strong>
                </div>
              </div>

              <div className="grid grid-cols-12 items-center gap-3">
                <span className="col-span-2 w-9 h-9 rounded-xl bg-primary-light text-primary-dark font-black text-xs grid place-items-center">
                  C2
                </span>
                <div className="col-span-8">
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">Kemampuan Akademik</strong>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight mb-2">{selectedCareer.c2.desc}</p>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${selectedCareer.c2.pct}%` }} />
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <strong className="text-sm font-black text-primary-dark">{selectedCareer.c2.val}</strong>
                </div>
              </div>

              <div className="grid grid-cols-12 items-center gap-3">
                <span className="col-span-2 w-9 h-9 rounded-xl bg-primary-light text-primary-dark font-black text-xs grid place-items-center">
                  C3
                </span>
                <div className="col-span-8">
                  <strong className="text-xs font-bold text-slate-800 block mb-0.5">Kebutuhan Pasar Kerja</strong>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight mb-2">{selectedCareer.c3.desc}</p>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${selectedCareer.c3.pct}%` }} />
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <strong className="text-sm font-black text-primary-dark">{selectedCareer.c3.val}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-500 text-[10px] leading-relaxed">
              Nilai akhir diperoleh dari penjumlahan nilai normalisasi yang telah dikalikan bobot: C1 40%, C2 35%, dan C3 25%.
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Grid: Market Info + Explanations */}
      {selectedCareer && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Market Info card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-0.5">Informasi Pasar Kerja</h3>
            <p className="text-slate-500 text-xs mb-5">Gambaran kebutuhan pasar kerja untuk {selectedCareer.name}.</p>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">Jumlah Lowongan</span>
                <strong className="text-lg font-black text-primary-dark">{selectedCareer.market?.vacancy || '500'}</strong>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">Cakupan Pencarian</span>
                <strong className="text-sm font-black text-slate-800 leading-tight block truncate">Singapore</strong>
              </div>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed">
              {selectedCareer.market?.note || 'Data pasar kerja ini digunakan sebagai salah satu pertimbangan dalam kriteria kebutuhan pasar kerja (C3).'}
            </p>

            <span className="text-[10.5px] italic text-slate-800 leading-relaxed block mt-2">Data diperbarui pada tanggal 1 Juli 2026 melalui adzuna.com</span>
          </article>

          {/* Calculations step info */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-0.5">Bagaimana Hasil Ini Dihitung?</h3>
              <p className="text-slate-500 text-xs mb-5">Ringkasan proses rekomendasi menggunakan SAW.</p>

              <div className="grid gap-3.5 text-xs">
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-light text-primary-dark font-black text-[11px] grid place-items-center shrink-0">1</span>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-0.5">Mengumpulkan nilai kriteria</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">Nilai minat dari RIASEC, nilai akademik, dan data kebutuhan pasar kerja digunakan sebagai masukan.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-light text-primary-dark font-black text-[11px] grid place-items-center shrink-0">2</span>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-0.5">Melakukan normalisasi</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">Nilai setiap kriteria disetarakan agar dapat dibandingkan antar alternatif karir (benefit criteria).</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-light text-primary-dark font-black text-[11px] grid place-items-center shrink-0">3</span>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-0.5">Mengalikan dengan bobot SAW</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">Nilai normalisasi dikalikan dengan bobot C1, C2, dan C3 yang diatur oleh admin.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-light text-primary-dark font-black text-[11px] grid place-items-center shrink-0">4</span>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-0.5">Menentukan ranking</h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">Alternatif dengan nilai preferensi tertinggi ditampilkan sebagai rekomendasi utama.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[10.5px] leading-relaxed mt-5">
              Hasil dapat berubah apabila Anda memperbarui hasil tes RIASEC, data akademik, atau sistem memperbarui data pasar kerja.
            </div>
          </article>
        </section>
      )}

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
