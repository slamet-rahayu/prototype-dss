/**
 * Calculates SAW (Simple Additive Weighting) scores for all careers.
 * 
 * C1: Minat Karir (from RIASEC scores)
 * C2: Kemampuan Akademik (from student grades and career academic weights)
 * C3: Kebutuhan Pasar Kerja (from career market demand score)
 * 
 * Weights are configured in AppContext (default c1: 40%, c2: 35%, c3: 25%)
 */
export function calculateSaw({
  riasecScores,
  studentGrades,
  careers,
  sawWeights
}) {
  const { c1: w1, c2: w2, c3: w3 } = sawWeights;
  const weight1 = w1 / 100;
  const weight2 = w2 / 100;
  const weight3 = w3 / 100;

  // 1. Calculate raw C1, C2, C3 scores for each career
  const rawResults = Object.entries(careers).map(([name, data]) => {
    // --- C1: Minat ---
    // Weighted sum of student's scores based on suitability weights per RIASEC type
    let c1Raw = 0;
    if (riasecScores) {
      const rWeights = data.riasecWeights;
      if (rWeights) {
        let weightedScoreSum = 0;
        let wSum = 0;
        Object.entries(rWeights).forEach(([code, weight]) => {
          if (weight > 0) {
            weightedScoreSum += (riasecScores[code] || 0) * weight;
            wSum += weight;
          }
        });
        c1Raw = wSum > 0 ? (weightedScoreSum / wSum) / 15 : 0;
      } else if (data.riasecMapped && data.riasecMapped.length > 0) {
        // Fallback for backward compatibility
        const sum = data.riasecMapped.reduce((acc, code) => acc + (riasecScores[code] || 0), 0);
        c1Raw = sum / (15 * data.riasecMapped.length);
      }
    }

    // --- C2: Akademik ---
    // Weighted sum of student's grades based on component weights
    let c2Raw = 0;
    if (studentGrades && data.academicWeights) {
      let weightedSum = 0;
      let weightSum = 0;
      Object.entries(data.academicWeights).forEach(([compName, compWeight]) => {
        const gradeObj = studentGrades.find(g => g.name === compName);
        const gradeValue = gradeObj ? gradeObj.grade : 0;
        weightedSum += gradeValue * compWeight;
        weightSum += compWeight;
      });
      c2Raw = weightSum > 0 ? (weightedSum / weightSum) / 100 : 0; // Normalize to 0-1
    }

    // --- C3: Pasar Kerja ---
    // Market index score divided by 100 (e.g. 90 becomes 0.9)
    const c3Raw = (data.marketDemandScore || 80) / 100;

    return {
      name,
      icon: data.icon,
      subtitle: data.subtitle,
      description: data.description,
      tags: data.tags || [],
      market: data.marketDemand,
      c1Raw,
      c2Raw,
      c3Raw
    };
  });

  // 2. Perform normalization (since all criteria are benefit criteria)
  // r_ij = x_ij / max(x_ij)
  const maxC1 = Math.max(...rawResults.map(r => r.c1Raw), 0.01);
  const maxC2 = Math.max(...rawResults.map(r => r.c2Raw), 0.01);
  const maxC3 = Math.max(...rawResults.map(r => r.c3Raw), 0.01);

  const normalizedResults = rawResults.map(r => {
    const c1Norm = r.c1Raw / maxC1;
    const c2Norm = r.c2Raw / maxC2;
    const c3Norm = r.c3Raw / maxC3;

    // 3. Compute preference value V_i
    // V_i = sum(w_j * r_ij)
    const preferenceValue = (c1Norm * weight1) + (c2Norm * weight2) + (c3Norm * weight3);

    return {
      ...r,
      c1: {
        val: c1Norm.toFixed(2),
        pct: Math.round(c1Norm * 100),
        desc: getC1Feedback(c1Norm)
      },
      c2: {
        val: c2Norm.toFixed(2),
        pct: Math.round(c2Norm * 100),
        desc: getC2Feedback(c2Norm)
      },
      c3: {
        val: c3Norm.toFixed(2),
        pct: Math.round(c3Norm * 100),
        desc: getC3Feedback(c3Norm)
      },
      score: preferenceValue.toFixed(2),
      scoreVal: preferenceValue
    };
  });

  // 4. Sort by scoreVal in descending order and add rank
  return normalizedResults
    .sort((a, b) => b.scoreVal - a.scoreVal)
    .map((r, idx) => ({
      ...r,
      rank: `#${idx + 1}`
    }));
}

function getC1Feedback(val) {
  if (val >= 0.9) return "Hasil RIASEC sangat sesuai dengan karakteristik karir.";
  if (val >= 0.7) return "Hasil RIASEC menunjukkan kesesuaian minat yang baik.";
  return "Kesesuaian minat terhadap karir ini tergolong cukup.";
}

function getC2Feedback(val) {
  if (val >= 0.9) return "Nilai akademik pada mata kuliah utama sangat mendukung.";
  if (val >= 0.7) return "Nilai akademik relevan memiliki pencapaian yang baik.";
  return "Komponen akademik pendukung memiliki nilai cukup.";
}

function getC3Feedback(val) {
  if (val >= 0.9) return "Peluang lowongan dan tren pekerjaan termasuk sangat tinggi.";
  if (val >= 0.7) return "Permintaan pasar kerja stabil dan bertumbuh positif.";
  return "Kebutuhan pasar kerja untuk peran ini tergolong sedang.";
}
