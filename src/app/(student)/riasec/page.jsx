"use client";

import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { QuestionSkeleton } from '@/components/Skeleton';
import { CheckCircle2, RotateCcw, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const OPTIONS_SCALE = [
  { val: 1, label: 'Sangat Tidak Suka', en: 'Strongly Dislike' },
  { val: 2, label: 'Tidak Suka', en: 'Dislike' },
  { val: 3, label: 'Ragu-ragu / Netral', en: 'Unsure' },
  { val: 4, label: 'Suka', en: 'Like' },
  { val: 5, label: 'Sangat Suka', en: 'Strongly Like' }
];

export default function RiasecQuiz() {
  const { riasecProgress, setRiasecProgress, riasecResult, setRiasecResult, riasecQuestions, setRiasecQuestions } = useContext(AppContext);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(!riasecQuestions || riasecQuestions.length !== 30);

  useEffect(() => {
    let active = true;
    const shouldFetch = !riasecQuestions || riasecQuestions.length !== 30;
    if (shouldFetch) {
      setIsLoading(true);
    }

    apiRequest('/riasec/questions')
      .then(res => {
        if (active && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map(q => ({
            id: q.id || q.index,
            index: q.index || q.id,
            type: q.type || q.dimension?.[0] || 'R',
            area: q.area || '',
            text: q.question || q.questionText || q.text || '',
            question: q.question || q.questionText || q.text || '',
            translation: q.translation || q.textId || ''
          }));
          setRiasecQuestions(formatted);
          try {
            localStorage.setItem('careerpath-riasec-questions', JSON.stringify(formatted));
          } catch {}

          setAnswers(prev => {
            if (Array.isArray(prev) && prev.length === formatted.length) {
              return prev;
            }
            return Array(formatted.length).fill(null);
          });
        }
      })
      .catch(err => console.warn('Gagal memuat butir soal RIASEC:', err.message))
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [setRiasecQuestions]);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      triggerToast("Pilih salah satu skala jawaban sebelum melanjutkan.");
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

  const calculateAndShowResults = async () => {
    setIsSubmitting(true);
    triggerToast("Menghitung skor dan menyimpan hasil RIASEC ke basis data...");

    try {
      const answersString = QUESTIONS.map((q, idx) => String(answers[idx] || 3)).join('');
      const payload = {
        answers: QUESTIONS.map((q, idx) => ({
          questionId: q.id,
          score: Number(answers[idx]) || 3
        })),
        answersString
      };

      const res = await apiRequest('/riasec/submit', {
        method: 'POST',
        body: payload
      });

      if (res.data) {
        const topLetters = res.data.topHolland 
          ? res.data.topHolland.split('') 
          : ['I', 'R', 'C'];

        const newResult = {
          scores: res.data.scores,
          top: topLetters,
          onetCareersUrl: res.data.onetCareersUrl || null,
          completedAt: res.data.completedAt || new Date().toISOString()
        };

        setRiasecResult(newResult);
        triggerToast("Hasil tes RIASEC berhasil diproses dan disimpan.");
        setTimeout(() => {
          router.push('/riasec/hasil');
        }, 500);
        return;
      }
    } catch (err) {
      console.warn('API riasec submit warning, using local calculation:', err.message);
    } finally {
      setIsSubmitting(false);
    }

    // Fallback local calculation matching O*NET rules
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    QUESTIONS.forEach((q, idx) => {
      const answerVal = Number(answers[idx]) || 3;
      const point = Math.max(0, Math.min(4, answerVal - 1));
      scores[q.type] += point;
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
    triggerToast("Hasil tes minat RIASEC berhasil dihitung.");
    setTimeout(() => {
      router.push('/riasec/hasil');
    }, 600);
  };

  const handleForceStart = () => {
    if (window.confirm("Apakah Anda yakin ingin mengulang tes? Seluruh jawaban sebelumnya akan dihapus.")) {
      setCurrentIndex(0);
      setAnswers(Array(QUESTIONS.length).fill(null));
      setRiasecResult(null);
      setRiasecProgress({ currentIndex: 0, answers: Array(QUESTIONS.length).fill(null) });
      setIsQuizForced(true);
      triggerToast("Tes diatur ulang. Silakan mulai kembali.");
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);
  const currentQuestion = QUESTIONS[currentIndex] || { id: 1, type: "R", text: "" };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span>/</span>
        <span className="text-content-primary font-medium">Tes Minat RIASEC</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-divider">
        <div>
          <h1 className="text-2xl sm:text-2.5xl font-bold text-content-primary tracking-tight">
            Tes Minat Karir RIASEC
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Pengukuran preferensi vokasional berbasis 6 orientasi kepribadian Holland sebagai input kriteria C1.
          </p>
        </div>
        <div className="text-xs font-mono text-content-muted">
          Total: {QUESTIONS.length} Pernyataan
        </div>
      </div>

      {/* Conditional View: Loading Skeleton vs Already Completed Banner vs Active Questionnaire */}
      {isLoading ? (
        <QuestionSkeleton className="mt-4" />
      ) : riasecResult && riasecResult.completedAt && !isQuizForced ? (
        <Card className="max-w-md mx-auto p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-content-primary mb-2">
            Tes RIASEC Telah Selesai
          </h2>
          <p className="text-xs text-content-muted leading-relaxed mb-6">
            Hasil tes minat Anda telah tercatat dengan kode dominan {riasecResult.top?.join(', ')}. Anda dapat meninjau grafik analisis atau mengulang tes jika diperlukan.
          </p>
          <div className="grid gap-2.5">
            <button 
              onClick={() => router.push('/riasec/hasil')}
              className="w-full py-2.5 px-4 bg-primary text-white font-semibold text-xs rounded-lg hover:bg-primary-dark transition-colors"
            >
              Lihat Analisis Hasil Tes
            </button>
            <button 
              onClick={handleForceStart}
              className="w-full py-2 px-4 bg-surface border border-divider text-content-secondary hover:text-content-primary rounded-lg text-xs font-semibold hover:bg-subsurface transition-colors"
            >
              Ulangi Tes Baru
            </button>
            <Link href="/" className="text-xs text-content-muted hover:text-content-primary font-medium mt-1">
              Kembali ke Beranda
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Progress Tracker Card */}
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold text-content-primary block">
                  Pernyataan {currentIndex + 1} dari {QUESTIONS.length}
                </span>
                <span className="text-[11px] text-content-muted">
                  Pilih tingkat kesukaan Anda terhadap aktivitas berikut
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-primary">
                  {answeredCount} Terjawab ({Math.round((answeredCount / QUESTIONS.length) * 100)}%)
                </span>
              </div>
            </div>

            {/* Accessible Progress Bar */}
            <div 
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
              className="h-2 w-full bg-subsurface rounded-full overflow-hidden border border-divider"
            >
              <div 
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </Card>

          {/* Active Question Box */}
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-content-primary leading-relaxed mb-1.5">
              {currentQuestion.text}
            </h2>
            {currentQuestion.translation && (
              <p className="text-xs sm:text-sm text-content-muted italic mb-6">
                Artinya: {currentQuestion.translation}
              </p>
            )}

            {/* 5-Point Likert Scale Buttons (Accessible) */}
            <fieldset className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
              <legend className="sr-only">Skala Kesesuaian Pernyataan</legend>
              {OPTIONS_SCALE.map((opt) => {
                const isSelected = answers[currentIndex] === opt.val;
                return (
                  <label
                    key={opt.val}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-center cursor-pointer select-none transition-colors duration-150 min-h-[84px] ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary dark:text-sky-300 font-bold ring-2 ring-primary/20'
                        : 'border-divider bg-surface hover:bg-subsurface text-content-secondary'
                    }`}
                  >
                    <input 
                      type="radio"
                      name={`riasec-scale-${currentIndex}`}
                      value={opt.val}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(opt.val)}
                      className="sr-only"
                    />
                    <span className="text-base font-mono font-bold block mb-1">
                      {opt.val}
                    </span>
                    <span className="text-[10px] leading-tight block font-medium">
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </fieldset>

            {/* Question Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-divider">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 border border-divider hover:bg-subsurface text-content-secondary hover:text-content-primary rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSubmitting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>
                  {isSubmitting 
                    ? 'Menyimpan...' 
                    : (currentIndex === QUESTIONS.length - 1 ? 'Simpan & Lihat Hasil' : 'Berikutnya')}
                </span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <footer className="pt-8 pb-4 text-center text-xs text-content-muted space-y-1.5">
        <p>Instrumen tes diadaptasi dari John L. Holland's Theory of Career Choice (RIASEC).</p>
        <p>
          This site incorporates information from{' '}
          <a 
            href="https://services.onetcenter.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-content-primary transition-colors"
          >
            O*NET Web Services
          </a>{' '}
          by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA).
        </p>
      </footer>
    </main>
  );
}
