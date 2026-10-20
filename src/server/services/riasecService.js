/**
 * Menghitung skor masing-masing dimensi RIASEC dan menentukan 3 kode tertinggi (Holland Code).
 * @param {Array<{ questionId: number, score: number }>} answers - Nilai jawaban 1 s.d. 5
 * @param {Array<{ id: number, type: 'R'|'I'|'A'|'S'|'E'|'C' }>} questions 
 */
export function calculateRiasecScores(answers, questions) {
  const dimensionTotals = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const questionMap = new Map(questions.map(q => [q.id, q.type]));

  answers.forEach(({ questionId, score }) => {
    const dim = questionMap.get(questionId);
    if (dim && dimensionTotals[dim] !== undefined) {
      dimensionTotals[dim] += Number(score) || 0;
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
