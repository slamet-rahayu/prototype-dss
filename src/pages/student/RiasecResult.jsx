import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Toast from '../../components/Toast';
import { Award, RotateCcw, Info, ArrowRight } from 'lucide-react';

const TYPE_INFO = {
  R: {
    name: "Realistic",
    description: "Cenderung tertarik pada aktivitas praktis, teknis, dan penggunaan alat atau sistem.",
    examples: "Contoh area terkait: infrastruktur TI, jaringan, perangkat keras, dan pengujian sistem."
  },
  I: {
    name: "Investigative",
    description: "Cenderung tertarik pada analisis, pemecahan masalah, riset, dan eksplorasi data.",
    examples: "Contoh area terkait: software engineering, data analytics, data science, dan keamanan siber."
  },
  A: {
    name: "Artistic",
    description: "Cenderung tertarik pada kreativitas, desain, gagasan orisinal, dan ekspresi visual.",
    examples: "Contoh area terkait: UI/UX design, desain produk digital, dan multimedia."
  },
  S: {
    name: "Social",
    description: "Cenderung tertarik pada aktivitas membantu, membimbing, berkomunikasi, dan bekerja dengan orang lain.",
    examples: "Contoh area terkait: IT support, trainer teknologi, business analyst, dan customer success."
  },
  E: {
    name: "Enterprising",
    description: "Cenderung tertarik pada kepemimpinan, komunikasi persuasif, pengambilan keputusan, dan peluang.",
    examples: "Contoh area terkait: product management, product owner, IT sales, dan startup business."
  },
  C: {
    name: "Conventional",
    description: "Cenderung tertarik pada keteraturan, ketelitian, pengelolaan data, dan prosedur yang jelas.",
    examples: "Contoh area terkait: quality assurance, database admin, data management, dan IT audit."
  }
};

export default function RiasecResult() {
  const { riasecResult, setRiasecResult, setRiasecProgress } = useContext(AppContext);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleReset = () => {
    if (window.confirm("Ulangi tes? Seluruh jawaban yang telah disimpan akan dihapus.")) {
      setRiasecResult(null);
      setRiasecProgress({ currentIndex: 0, answers: Array(18).fill(null) });
      triggerToast("Hasil tes diatur ulang. Mengalihkan ke halaman tes...");
      setTimeout(() => {
        navigate('/riasec');
      }, 1000);
    }
  };

  if (!riasecResult || !riasecResult.completedAt) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-100">
          <span className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 text-3xl grid place-items-center mx-auto mb-5">
            ⚠
          </span>
          <h2 className="text-xl font-black text-slate-900 mb-2">Hasil Tes Belum Tersedia</h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">
            Anda belum mengikuti atau menyelesaikan Tes Minat Karir RIASEC. Silakan ikuti tes terlebih dahulu.
          </p>
          <button 
            onClick={() => navigate('/riasec')}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
          >
            Mulai Tes RIASEC
          </button>
          <div className="mt-4">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-650 font-bold">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
        <Link to="/riasec" className="text-primary-dark hover:underline">Tes RIASEC</Link>
        <span>›</span>
        <span className="text-slate-500">Hasil Tes RIASEC</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Hasil Tes Minat RIASEC</h1>
          <p className="text-slate-500 text-sm mt-2">Berikut adalah grafik distribusi skor minat kepribadian RIASEC Anda.</p>
        </div>
        <span className="inline-flex px-3 py-1.5 bg-blue-50 border border-blue-200 text-primary-dark text-[11px] font-black rounded-full">
          ◷ Selesai pada {formattedDate} WIB
        </span>
      </section>

      <div className="grid gap-6">
        {/* Result Hero Header */}
        <article className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-5 justify-between">
          <div className="flex items-center gap-5 flex-col md:flex-row text-center md:text-left w-full md:w-auto">
            {/* Giant Badge */}
            <div className="w-20 h-20 shrink-0 rounded-2xl text-white font-black bg-gradient-to-br from-primary-dark to-primary shadow-xl shadow-blue-500/20 text-3xl grid place-items-center tracking-wider">
              {riasecResult.top.join('')}
            </div>
            <div>
              <span className="text-[10px] text-primary-dark font-black uppercase tracking-wider block mb-1">Hasil Minat Dominan</span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                Tipe Minat Dominan Anda: {riasecResult.top.join('')}
              </h2>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
                Tipe dengan skor tertinggi adalah {riasecResult.top.map(t => `${t} · ${TYPE_INFO[t].name}`).join(', ')}. {TYPE_INFO[riasecResult.top[0]].description}
              </p>
            </div>
          </div>
        </article>

        {/* Score distribution grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scores List card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-1">Skor RIASEC</h3>
            <p className="text-slate-500 text-xs mb-6">Perbandingan skor dari enam tipe minat berdasarkan jawaban Anda.</p>
            
            <div className="grid gap-4">
              {Object.entries(TYPE_INFO).map(([code, info]) => {
                const score = riasecResult.scores[code] || 0;
                const pct = Math.round((score / 15) * 100);
                return (
                  <div key={code} className="grid grid-cols-1 md:grid-cols-12 items-center gap-3">
                    <div className="md:col-span-4 min-w-0">
                      <strong className="text-xs font-bold text-slate-800 block leading-tight">{code} · {info.name}</strong>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[150px] font-medium leading-none mt-1">{info.description}</span>
                    </div>
                    <div className="md:col-span-6 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="md:col-span-2 text-right">
                      <strong className="text-xs font-black text-slate-900">{score}</strong>
                      <span className="text-[10px] text-slate-400 font-bold">/15</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Dominant Types Card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-1">Tiga Tipe Dominan</h3>
            <p className="text-slate-500 text-xs mb-6">Tipe dengan skor tertinggi digunakan sebagai dasar pemetaan minat alternatif karir.</p>

            <div className="grid gap-3">
              {riasecResult.top.map((code, index) => (
                <div key={code} className="flex gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/30">
                  <span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark font-black flex items-center justify-center shrink-0 text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 mb-1">
                      {code} · {TYPE_INFO[code].name}{' '}
                      <span className="text-primary font-bold text-[10px]">({riasecResult.scores[code]}/15)</span>
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{TYPE_INFO[code].examples}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="p-4 border border-blue-150 bg-blue-50/30 rounded-xl text-blue-800 text-xs leading-relaxed flex gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Hasil ini menunjukkan kecenderungan minat mahasiswa berdasarkan jawaban tes RIASEC. Sistem membandingkan hasil tersebut dengan profil RIASEC pada setiap alternatif karir untuk menghasilkan nilai kriteria C1 sebelum proses rekomendasi menggunakan metode SAW dilakukan.
          </span>
        </div>

        {/* Results Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button 
            onClick={handleReset}
            className="px-4 py-2.5 border border-slate-200 hover:border-slate-350 text-slate-550 hover:text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ulangi Tes
          </button>
          <button 
            onClick={() => navigate('/rekomendasi')}
            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/10 transition-all active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            Lihat Rekomendasi Karir
          </button>
        </div>
      </div>

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
