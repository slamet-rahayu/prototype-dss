import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Toast from '../../components/Toast';
import { ArrowLeft, ArrowRight, RotateCcw, Award, CheckCircle, Info } from 'lucide-react';

const QUESTIONS = [
  { type: "R", text: "Saya tertarik merakit, memperbaiki, atau menguji perangkat keras dan perangkat teknis." },
  { type: "R", text: "Saya menikmati aktivitas yang menghasilkan sesuatu secara nyata melalui alat, sistem, atau teknologi." },
  { type: "R", text: "Saya tertarik memahami cara kerja jaringan, perangkat komputer, atau infrastruktur teknologi." },

  { type: "I", text: "Saya menikmati memecahkan masalah yang membutuhkan analisis dan penalaran yang mendalam." },
  { type: "I", text: "Saya tertarik mencari pola dari data untuk memahami suatu permasalahan." },
  { type: "I", text: "Saya senang mempelajari konsep baru dan menguji berbagai kemungkinan solusi." },

  { type: "A", text: "Saya tertarik membuat desain visual, ide kreatif, atau pengalaman digital yang menarik." },
  { type: "A", text: "Saya menikmati kebebasan untuk mengekspresikan gagasan melalui karya atau rancangan." },
  { type: "A", text: "Saya tertarik mengembangkan tampilan aplikasi agar lebih mudah dan menyenangkan digunakan." },

  { type: "S", text: "Saya menikmati membantu orang lain memahami masalah atau mempelajari hal baru." },
  { type: "S", text: "Saya tertarik bekerja dalam tim dan mendengarkan kebutuhan orang lain." },
  { type: "S", text: "Saya senang memberikan arahan atau dukungan ketika seseorang mengalami kesulitan." },

  { type: "E", text: "Saya tertarik memimpin diskusi dan mengajak orang lain mencapai suatu tujuan." },
  { type: "E", text: "Saya nyaman menyampaikan ide serta meyakinkan orang lain terhadap suatu solusi." },
  { type: "E", text: "Saya tertarik pada perencanaan, pengambilan keputusan, dan pengembangan peluang." },

  { type: "C", text: "Saya nyaman bekerja dengan data, aturan, dan prosedur yang terstruktur." },
  { type: "C", text: "Saya teliti dalam mengatur informasi, dokumentasi, atau rincian pekerjaan." },
  { type: "C", text: "Saya menikmati pekerjaan yang membutuhkan ketepatan, keteraturan, dan konsistensi." }
];

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

const OPTIONS_SCALE = [
  { val: 1, label: 'Sangat tidak sesuai' },
  { val: 2, label: 'Tidak sesuai' },
  { val: 3, label: 'Cukup sesuai' },
  { val: 4, label: 'Sesuai' },
  { val: 5, label: 'Sangat sesuai' }
];

export default function RiasecQuiz() {
  const { riasecProgress, setRiasecProgress, riasecResult, setRiasecResult } = useContext(AppContext);
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(riasecProgress.currentIndex || 0);
  const [answers, setAnswers] = useState(riasecProgress.answers || Array(QUESTIONS.length).fill(null));
  const [showResult, setShowResult] = useState(!!(riasecResult && riasecResult.completedAt));
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  useEffect(() => {
    setRiasecProgress({ currentIndex, answers });
  }, [currentIndex, answers, setRiasecProgress]);

  const handleSelectAnswer = (val) => {
    const updated = [...answers];
    updated[currentIndex] = val;
    setAnswers(updated);
  };

  const answeredCount = answers.filter(a => a !== null).length;

  const handleNext = () => {
    if (answers[currentIndex] === null) {
      triggerToast("Pilih salah satu jawaban sebelum melanjutkan.");
      return;
    }

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all questions! Verify if there are missing ones
      if (answeredCount !== QUESTIONS.length) {
        const firstUnanswered = answers.findIndex(a => a === null);
        setCurrentIndex(firstUnanswered);
        triggerToast("Masih ada pernyataan yang belum dijawab.");
        return;
      }
      
      // Calculate scores
      calculateAndShowResults();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateAndShowResults = () => {
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    QUESTIONS.forEach((q, idx) => {
      scores[q.type] += Number(answers[idx] || 0);
    });

    const top = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);

    const newResult = {
      scores,
      top,
      completedAt: new Date().toISOString()
    };

    setRiasecResult(newResult);
    setShowResult(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerToast("Hasil tes disimpan. Klik 'Lihat Rekomendasi' untuk hasil pemetaan karir.");
  };

  const handleReset = () => {
    if (window.confirm("Ulangi tes? Seluruh jawaban yang telah dipilih akan dihapus.")) {
      setCurrentIndex(0);
      setAnswers(Array(QUESTIONS.length).fill(null));
      setRiasecResult(null);
      setRiasecProgress({ currentIndex: 0, answers: Array(QUESTIONS.length).fill(null) });
      setShowResult(false);
      triggerToast("Tes telah diatur ulang.");
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <Link to="/" className="text-primary-dark hover:underline">Beranda</Link>
        <span>›</span>
        <span className="text-slate-500">Tes RIASEC</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Tes Minat Karir RIASEC</h1>
          <p className="text-slate-500 text-sm mt-2">Jawab setiap pernyataan berdasarkan ketertarikan Anda. Hasil tes digunakan sebagai kriteria Minat Karir atau C1.</p>
        </div>
        <span className="inline-flex px-3 py-1 bg-blue-50 border border-blue-200 text-primary-dark text-xs font-black rounded-full">
          ● {QUESTIONS.length} pernyataan
        </span>
      </section>

      {/* Conditional Screens: Quiz vs Results */}
      {!showResult ? (
        <div className="grid gap-6">
          {/* Intro Card */}
          <article className="bg-gradient-to-br from-white to-blue-50/20 border border-blue-200/60 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full translate-x-12 -translate-y-12" />
            
            <div className="flex-1 relative z-10">
              <h2 className="text-lg font-black text-slate-900 mb-1.5">Kenali kecenderungan minat karir Anda</h2>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 max-w-xl">
                Tes ini mengelompokkan minat ke dalam enam tipe: Realistic, Investigative, Artistic, Social, Enterprising, dan Conventional. Pilih tingkat kesesuaian yang paling menggambarkan diri Anda.
              </p>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-[11px] leading-relaxed max-w-xl">
                <span className="font-bold text-xs shrink-0">ℹ</span>
                <span>Ini adalah rancangan antarmuka dan contoh pernyataan untuk prototype. Instrumen final disesuaikan berdasarkan rujukan RIASEC.</span>
              </div>
            </div>

            <div className="w-full md:w-36 h-36 rounded-2xl bg-white border border-blue-100 p-5 shadow-lg shadow-blue-500/5 grid place-items-center text-center shrink-0">
              <div>
                <strong className="text-2xl font-black text-slate-900 tracking-tight block">RIASEC</strong>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mt-1">6 Tipe Minat</span>
              </div>
            </div>
          </article>

          {/* Quiz Card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            {/* Top progress bar info */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Jawab Pernyataan Berikut</h2>
                <p className="text-slate-500 text-xs mt-0.5">Pilih satu jawaban yang paling sesuai. Jawaban Anda tersimpan otomatis.</p>
              </div>

              <div className="flex items-end gap-3 text-right">
                <div className="text-xs font-bold w-44">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-700">Pernyataan {currentIndex + 1} dari {QUESTIONS.length}</span>
                    <span className="text-primary-dark">{answeredCount} tersimpan</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Question section */}
            <div className="p-6 md:p-8">
              <span className="inline-flex px-3 py-1 bg-primary-light text-primary-dark text-xs font-black rounded-full mb-4">
                {QUESTIONS[currentIndex].type} · {TYPE_INFO[QUESTIONS[currentIndex].type].name}
              </span>
              <span className="text-slate-400 text-xs font-bold block mb-2">Pernyataan {currentIndex + 1}</span>
              <h2 className="text-xl md:text-2xl font-black text-slate-950 leading-snug tracking-tight mb-8 max-w-3xl">
                {QUESTIONS[currentIndex].text}
              </h2>

              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-3">Seberapa sesuai pernyataan ini dengan minat Anda?</p>
              
              {/* Option scale */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                {OPTIONS_SCALE.map((opt) => (
                  <div key={opt.val} className="relative">
                    <input 
                      type="radio" 
                      id={`opt-${opt.val}`}
                      name="riasec-option" 
                      value={opt.val}
                      checked={answers[currentIndex] === opt.val}
                      onChange={() => handleSelectAnswer(opt.val)}
                      className="absolute opacity-0 pointer-events-none"
                    />
                    <label 
                      htmlFor={`opt-${opt.val}`}
                      className={`flex flex-col justify-center items-center gap-1.5 p-4 border rounded-xl text-center cursor-pointer select-none transition-all duration-200 min-h-[96px] ${
                        answers[currentIndex] === opt.val 
                          ? 'border-primary bg-blue-50/50 text-primary-dark shadow-md shadow-blue-500/5 ring-2 ring-primary/10'
                          : 'border-slate-200 bg-white hover:bg-slate-50/80 text-slate-700 hover:border-slate-350'
                      }`}
                    >
                      <strong className="text-xl font-black leading-none block">{opt.val}</strong>
                      <span className={`text-[10px] leading-relaxed font-bold tracking-tight ${answers[currentIndex] === opt.val ? 'text-primary-dark' : 'text-slate-400'}`}>
                        {opt.label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Sebelumnya
              </button>
              <button 
                onClick={handleNext}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/10 transition-all active:scale-95"
              >
                {currentIndex === QUESTIONS.length - 1 ? 'Lihat Hasil Tes' : 'Selanjutnya →'}
              </button>
            </div>
            
            {/* Status Hint */}
            <div className="px-6 pb-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>
                {answers[currentIndex] !== null 
                  ? "Jawaban tersimpan. Anda dapat melanjutkan atau kembali ke pernyataan sebelumnya." 
                  : "Pilih jawaban untuk melanjutkan."
                }
              </span>
            </div>
          </article>
        </div>
      ) : (
        /* Results Screen */
        <div className="grid gap-6 animate-fade-in">
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

          <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl text-amber-800 text-xs leading-relaxed flex gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Hasil ini menunjukkan kecenderungan minat berdasarkan jawaban. Sistem memetakan skor tersebut ke alternatif karir bidang TI sebelum menghitung rekomendasi menggunakan metode SAW.
            </span>
          </div>

          {/* Results Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ulangi Tes
            </button>
            <button 
              onClick={() => navigate('/rekomendasi')}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/10 transition-all active:scale-95"
            >
              <Award className="w-4 h-4" />
              Lihat Rekomendasi Karir
            </button>
          </div>
        </div>
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
