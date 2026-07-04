import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Toast from '../../components/Toast';
import { 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Compass, 
  Lock, 
  TrendingUp,
  FileCheck2,
  BookOpen
} from 'lucide-react';

export default function Home() {
  const { user, academicComponents, riasecResult, careers, sawResults } = useContext(AppContext);
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  const topCareer = sawResults && sawResults.length > 0 ? sawResults[0] : null;
  const topCareerData = topCareer && careers ? careers[topCareer.name] : null;

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  // Calculate student progress
  const hasProfile = user && user.name && user.university && user.studyProgram;
  const hasAcademic = academicComponents && academicComponents.length >= 5;
  const hasRiasec = riasecResult && riasecResult.completedAt;

  let stepsCompleted = 0;
  if (hasProfile) stepsCompleted += 1;
  if (hasAcademic) stepsCompleted += 1;
  if (hasRiasec) stepsCompleted += 1;

  const progressPercentage = Math.round((stepsCompleted / 3) * 100);

  const getStepStatus = (stepNum) => {
    if (stepNum === 1) {
      return hasProfile 
        ? { text: 'Selesai', classes: 'text-emerald-700 bg-emerald-50 border-emerald-100' }
        : { text: 'Siap dikerjakan', classes: 'text-blue-700 bg-blue-50 border-blue-100' };
    }
    if (stepNum === 2) {
      if (hasRiasec) return { text: 'Selesai', classes: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
      return hasProfile 
        ? { text: 'Siap dikerjakan', classes: 'text-blue-700 bg-blue-50 border-blue-100' }
        : { text: 'Tahap berikutnya', classes: 'text-amber-700 bg-amber-50 border-amber-100' };
    }
    if (stepNum === 3) {
      if (hasRiasec && hasAcademic) return { text: 'Tersedia', classes: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
      return { text: 'Terkunci', classes: 'text-slate-500 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-dark via-blue-600 to-primary text-white p-8 md:p-12 shadow-xl shadow-blue-500/10 mb-10 flex flex-col md:flex-row gap-8 justify-between items-center">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full border border-white/5 translate-x-20 -translate-y-20 bg-white/5" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full border border-white/5 translate-y-32 bg-white/5" />

        <div className="flex-1 relative z-10">
          <span className="inline-flex px-3 py-1 border border-white/20 bg-white/10 rounded-full text-xs font-black uppercase tracking-wider mb-4 animate-pulse">
            Selamat datang, {user?.name || 'Mahasiswa'}
          </span>
          <h1 className="text-3xl md:text-4.5xl font-black leading-tight tracking-tight mb-4 max-w-2xl">
            Mulai kenali potensi dan arah karirmu di bidang TI.
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8 max-w-xl">
            Dapatkan rekomendasi karir berdasarkan hasil tes minat RIASEC, kemampuan akademik, dan informasi kebutuhan pasar kerja.
          </p>

          <div className="flex flex-wrap gap-3.5">
            <button 
              onClick={() => navigate((hasRiasec && hasAcademic) ? '/rekomendasi' : (hasRiasec ? '/akademik' : '/riasec'))}
              className="px-6 py-3 rounded-xl bg-white text-primary-dark hover:text-primary font-black text-sm shadow-lg hover:translate-y-[-1px] transition-all duration-200"
            >
              {(hasRiasec && hasAcademic) ? 'Lihat Hasil Rekomendasi' : (hasRiasec ? 'Lengkapi Akademik' : 'Mulai Tes RIASEC')}
            </button>
            <button 
              onClick={() => document.getElementById('karir').scrollIntoView({ behavior: 'smooth' })}
              className="px-5 py-3 rounded-xl border border-white/30 hover:border-white bg-white/10 hover:bg-white/20 text-white font-black text-sm hover:translate-y-[-1px] transition-all duration-200"
            >
              Eksplor Karir TI
            </button>
          </div>
        </div>

        {/* Progress Tracker Card */}
        <aside className="relative z-10 w-full md:w-80 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-6 text-white self-stretch flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black mb-1">Progress Anda</h3>
            <p className="text-white/70 text-xs mb-4 leading-relaxed">Lengkapi tiga tahap berikut untuk mendapatkan rekomendasi karir.</p>
          </div>
          <div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{stepsCompleted} dari 3 tahap</span>
              <strong className="text-sm font-black">{progressPercentage}%</strong>
            </div>
          </div>
        </aside>
      </section>

      {/* Three Steps Grid */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Mulai dalam tiga langkah</h2>
          <p className="text-slate-500 text-sm mt-1">Proses dibuat sederhana agar Anda dapat fokus memahami arah karir yang sesuai.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-primary-dark font-black text-lg flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Lengkapi Profil</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Masukkan data dasar dan informasi akademik sebagai salah satu pertimbangan rekomendasi.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[11px] font-black tracking-wide ${getStepStatus(1).classes}`}>
                ● {getStepStatus(1).text}
              </span>
              <button 
                onClick={() => navigate('/profile')}
                className="text-xs font-black text-primary hover:text-primary-dark flex items-center gap-1 hover:underline"
              >
                {/* Mulai <ArrowRight className="w-3.5 h-3.5" /> */}
              </button>
            </div>
          </article>

          {/* Step 2 */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-primary-dark font-black text-lg flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Ikuti Tes RIASEC</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Kenali kecenderungan minat karir dari enam tipe RIASEC secara terstruktur.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[11px] font-black tracking-wide ${getStepStatus(2).classes}`}>
                ● {getStepStatus(2).text}
              </span>
              <button 
                onClick={() => navigate(hasRiasec ? '/riasec/hasil' : '/riasec')}
                className="text-xs font-black text-primary hover:text-primary-dark flex items-center gap-1 hover:underline"
              >
                {hasRiasec ? 'Lihat Hasil' : 'Mulai'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>

          {/* Step 3 */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-primary-dark font-black text-lg flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Lihat Rekomendasi</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Lihat ranking karir berdasarkan metode SAW dan informasi pasar kerja yang relevan.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[11px] font-black tracking-wide ${getStepStatus(3).classes}`}>
                ● {getStepStatus(3).text}
              </span>
              {(hasRiasec && hasAcademic) ? (
                <button 
                  onClick={() => navigate('/rekomendasi')}
                  className="text-xs font-black text-primary hover:text-primary-dark flex items-center gap-1 hover:underline"
                >
                  Lihat <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </article>
        </div>
      </section>

      {/* Main Grid: Career Recommendations Preview & Job Market Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Recommendation Preview (lg:col-span-7) */}
        <article className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Rekomendasi Karir Anda</h3>
              <p className="text-slate-500 text-xs mt-0.5">Hasil rekomendasi akan tersedia setelah tes RIASEC dan data akademik dilengkapi.</p>
            </div>
            {hasRiasec && (
              <button 
                onClick={() => navigate('/rekomendasi')}
                className="text-xs font-black text-primary hover:text-primary-dark hover:underline"
              >
                Lihat Detail
              </button>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            {hasRiasec && topCareer ? (
              <div className="w-full bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white border border-blue-100/80 rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                    <div className="flex items-center gap-4">
                      <span className="w-16 h-16 rounded-2xl text-primary font-black bg-white border border-blue-100 shadow-md shadow-blue-500/5 text-3xl grid place-items-center shrink-0">
                        {topCareer.icon || '✦'}
                      </span>
                      <div>
                        <span className="inline-flex px-2 py-0.5 bg-blue-100/70 text-primary-dark border border-blue-200/50 rounded-lg text-[9px] font-black uppercase tracking-wider mb-1">
                          Rekomendasi Utama
                        </span>
                        <h4 className="text-base font-black text-slate-900 leading-tight">{topCareer.name}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">{topCareer.subtitle}</p>
                      </div>
                    </div>
                    <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2 text-right sm:self-center self-start shrink-0">
                      <span className="text-slate-400 text-[10px] font-bold block mb-0.5">Skor SAW</span>
                      <strong className="text-2xl font-black text-primary-dark leading-none">{topCareer.score}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1.5">Kecocokan Minat</span>
                      <div className="flex flex-wrap gap-1.5">
                        {topCareerData?.riasecMapped?.map(tag => (
                          <span key={tag} className="px-2.5 py-0.5 bg-white border border-slate-200/80 rounded-md text-slate-600 text-[10px] font-black shadow-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Kebutuhan Pasar Kerja</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{topCareer.market?.vacancy || '520'} Lowongan</span>
                      </div>
                    </div>
                  </div>

                  {/* <p className="text-slate-600 text-xs leading-relaxed mb-6">
                    {topCareer.description}
                  </p> */}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button 
                    onClick={() => navigate(`/eksplorasi/${topCareer.name}`)}
                    className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/10 transition-colors"
                  >
                    Eksplorasi Peran
                  </button>
                  <button 
                    onClick={() => navigate('/rekomendasi')}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors"
                  >
                    Lihat Perhitungan
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center flex-1">
                <span className="w-16 h-16 rounded-2xl bg-blue-50 text-primary text-3xl grid place-items-center mb-4">
                  ✦
                </span>
                <h4 className="text-base font-black text-slate-900 mb-1">Rekomendasi Karir Belum Siap</h4>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6 leading-relaxed">
                  Kami membandingkan bakat, minat, dan kemampuan Anda dengan kebutuhan industri. Selesaikan Tes RIASEC dan isi nilai akademik Anda untuk melihat hasilnya.
                </p>
                <div className="flex gap-3">
                  {!hasRiasec && (
                    <button 
                      onClick={() => navigate('/riasec')}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black shadow-md"
                    >
                      Mulai Tes RIASEC
                    </button>
                  )}
                  {!hasAcademic && (
                    <button 
                      onClick={() => navigate('/akademik')}
                      className="px-5 py-2.5 bg-white border border-slate-250 text-slate-700 rounded-xl text-xs font-black"
                    >
                      Isi Nilai Akademik
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Job Market Summary (lg:col-span-5) */}
        <aside className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Ringkasan Pasar Kerja</h3>
            <p className="text-slate-500 text-xs mt-0.5 mb-5">Gambaran kebutuhan pasar kerja untuk bidang TI saat ini.</p>
            
            <div className="grid gap-3.5">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Software Development</h4>
                  <span className="text-[10px] text-slate-400">Data diperbarui: 22 Juni 2026</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-emerald-800 bg-emerald-50">100 Lowongan</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Data & Analytics</h4>
                  <span className="text-[10px] text-slate-400">Data diperbarui: 22 Juni 2026</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-emerald-800 bg-emerald-50">200 Lowongan</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Cybersecurity</h4>
                  <span className="text-[10px] text-slate-400">Data diperbarui: 22 Juni 2026</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-emerald-800 bg-emerald-50">150 Lowongan</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed mt-4 pt-3 border-t border-slate-50">
            * Data pasar kerja diperoleh dari Adzuna API dan diperbarui secara berkala oleh sistem.
          </p>
        </aside>
      </section>

      {/* Explore Career List Section */}
      <section id="karir" className="scroll-mt-24">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Eksplorasi Karir Bidang TI</h2>
            <p className="text-slate-500 text-sm mt-1">Alternatif karir yang dinilai dan diranking oleh sistem rekomendasi.</p>
          </div>
          <button 
            onClick={() => navigate('/eksplorasi')}
            className="text-xs font-black text-primary hover:text-primary-dark hover:underline"
          >
            Lihat semua karir
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(careers).slice(0, 4).map(([name, data]) => (
            <article 
              key={name}
              className="group bg-white border border-slate-200/80 hover:border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="w-10 h-10 grid place-items-center rounded-xl text-primary font-black bg-primary-light/50 group-hover:bg-primary-light transition-colors text-lg">
                  {data.icon}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-4 mb-1">{name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                  {data.description}
                </p>
              </div>
              <button 
                onClick={() => navigate(`/eksplorasi/${name}`)}
                className="w-fit text-left text-xs font-black text-primary hover:text-primary-dark flex items-center gap-1 mt-4 hover:translate-x-0.5 transition-transform"
              >
                Pelajari karir <ArrowRight className="w-3 h-3" />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Toast Notification */}
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
