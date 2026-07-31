import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Toast from '../../components/Toast';
import { ArrowLeft, ArrowRight, RotateCcw, Award, CheckCircle, Info } from 'lucide-react';



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
  const { riasecProgress, setRiasecProgress, riasecResult, setRiasecResult, riasecQuestions } = useContext(AppContext);
  const navigate = useNavigate();

  const QUESTIONS = riasecQuestions || [];

  const [currentIndex, setCurrentIndex] = useState(riasecProgress.currentIndex || 0);
  const [answers, setAnswers] = useState(() => {
    if (riasecProgress.answers && riasecProgress.answers.length === QUESTIONS.length) {
      return riasecProgress.answers;
    }
    return Array(QUESTIONS.length).fill(null);
  });
  const [isQuizForced, setIsQuizForced] = useState(false);
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
      if (answeredCount !== QUESTIONS.length) {
        const firstUnanswered = answers.findIndex(a => a === null);
        setCurrentIndex(firstUnanswered);
        triggerToast("Masih ada pernyataan yang belum dijawab.");
        return;
      }
      
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
    triggerToast("Hasil tes berhasil disimpan!");
    setTimeout(() => {
      navigate('/riasec/hasil');
    }, 800);
  };

  const handleForceStart = () => {
    if (window.confirm("Mengambil ulang tes? Seluruh jawaban yang telah tersimpan akan dihapus.")) {
      setCurrentIndex(0);
      setAnswers(Array(QUESTIONS.length).fill(null));
      setRiasecResult(null);
      setRiasecProgress({ currentIndex: 0, answers: Array(QUESTIONS.length).fill(null) });
      setIsQuizForced(true);
      triggerToast("Tes diatur ulang. Silakan mulai menjawab.");
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <Link to="/" className="text-primary-dark hover:underline">Beranda</Link>
        <span>›</span>
        <span className="text-slate-500">Tes RIASEC</span>
      </div>

      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Tes Minat Karir RIASEC</h1>
          <p className="text-slate-500 text-sm mt-2">Jawab setiap pernyataan berdasarkan ketertarikan Anda. Hasil tes digunakan untuk menghitung kesesuaian minat mahasiswa terhadap setiap alternatif karir sebagai bagian dari kriteria C1.</p>
        </div>
        <span className="inline-flex px-3 py-1 bg-blue-50 border border-blue-200 text-primary-dark text-xs font-black rounded-full">
          ● {QUESTIONS.length} pernyataan
        </span>
      </section>

      {/* Conditional Screens: Finished Splash vs Quiz */}
      {riasecResult && riasecResult.completedAt && !isQuizForced ? (
        <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-xl shadow-slate-100 animate-fade-in mt-8">
          <span className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 text-3xl grid place-items-center mx-auto mb-5">
            ✓
          </span>
          <h2 className="text-xl font-black text-slate-900 mb-2">Tes RIASEC Selesai</h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">
            Anda telah menyelesaikan tes minat RIASEC. Anda bisa melihat grafiknya langsung di halaman hasil.
          </p>
          <div className="grid gap-3">
            <button 
              onClick={() => navigate('/riasec/hasil')}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Lihat Hasil Tes
            </button>
            <button 
              onClick={handleForceStart}
              className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Ulangi Tes Baru
            </button>
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-650 font-bold mt-2">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <article className="bg-gradient-to-br from-white to-blue-50/20 border border-blue-200/60 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full translate-x-12 -translate-y-12" />
            
            <div className="flex-1 relative z-10">
              <h2 className="text-lg font-black text-slate-900 mb-1.5">Kenali kecenderungan minat karir Anda</h2>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 max-w-xl">
                Tes ini mengelompokkan minat ke dalam enam tipe: Realistic, Investigative, Artistic, Social, Enterprising, dan Conventional. Pilih tingkat kesesuaian yang paling menggambarkan diri Anda.
              </p>
            </div>

            <div className="w-full md:w-36 h-36 rounded-2xl bg-white border border-blue-100 p-5 shadow-lg shadow-blue-500/5 grid place-items-center text-center shrink-0">
              <div>
                <strong className="text-2xl font-black text-slate-900 tracking-tight block">RIASEC</strong>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mt-1">6 Tipe Minat</span>
              </div>
            </div>
          </article>

          <article className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Jawab Pernyataan Berikut</h2>
                <p className="text-slate-500 text-xs mt-0.5">Pilih satu jawaban yang paling sesuai.</p>
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

            <div className="p-6 md:p-8">
              <span className="inline-flex px-3 py-1 bg-primary-light text-primary-dark text-xs font-black rounded-full mb-4">
                {QUESTIONS[currentIndex].type} · {TYPE_INFO[QUESTIONS[currentIndex].type].name}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-950 leading-snug tracking-tight mb-8 max-w-3xl">
                {QUESTIONS[currentIndex].text}
              </h2>
              
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

            <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-550 hover:text-slate-800 rounded-xl text-xs font-black flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                ← Sebelumnya
              </button>
              <button 
                onClick={handleNext}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/10 transition-all active:scale-95 cursor-pointer"
              >
                {currentIndex === QUESTIONS.length - 1 ? 'Selesai & Lihat Hasil' : 'Selanjutnya →'}
              </button>
            </div>
            
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
      )}

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
