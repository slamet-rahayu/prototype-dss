/**
 * Menghitung skor masing-masing dimensi RIASEC dan menentukan 3 kode tertinggi (Holland Code).
 * Mendukung instrumen O*NET 30 butir (0-20 poin per dimensi) maupun instrumen 18 butir lokal.
 * 
 * @param {Array<{ questionId: number, score: number }>} answers - Nilai jawaban 1 s.d. 5
 * @param {Array<{ id: number, type: 'R'|'I'|'A'|'S'|'E'|'C' }>} questions 
 */
export function calculateRiasecScores(answers, questions = []) {
  const dimensionTotals = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const questionMap = new Map((questions || []).map(q => [q.id, q.type]));
  const isOnetScale = questions.length === 30 || answers.length === 30;

  answers.forEach(({ questionId, score }) => {
    // Jika tidak ada di questionMap, fallback ke modulo 6 (R, I, A, S, E, C)
    const dimOrder = ['R', 'I', 'A', 'S', 'E', 'C'];
    const fallbackDim = dimOrder[(Number(questionId) - 1) % 6] || 'R';
    const dim = questionMap.get(questionId) || fallbackDim;

    if (dim && dimensionTotals[dim] !== undefined) {
      const rawScore = Number(score) || 3;
      // Pada skala O*NET Interest Profiler, skor jawaban 1..5 dipetakan ke 0..4 poin
      const points = isOnetScale
        ? Math.max(0, Math.min(4, rawScore - 1))
        : rawScore;
      dimensionTotals[dim] += points;
    }
  });

  // Urutkan dimensi berdasarkan skor tertinggi untuk mendapatkan 3 huruf teratas
  const sortedDimensions = Object.entries(dimensionTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([dim]) => dim);

  const topThree = sortedDimensions.slice(0, 3).join('');

  return {
    scores: dimensionTotals,
    topHolland: topThree,
    primaryDimension: sortedDimensions[0]
  };
}
