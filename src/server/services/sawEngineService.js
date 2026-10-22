export class SawEngineService {
  /**
   * Menghitung nilai SAW dan perankingan rekomendasi karir.
   * @param {Object} params
   * @param {Object} params.riasecScores - { R, I, A, S, E, C }
   * @param {Array<{ name?: string, subjectName?: string, grade: number }>} params.studentGrades
   * @param {Array<Object>} params.careers - List master karir beserta bobotnya
   * @param {{ c1Weight: number, c2Weight: number, c3Weight: number }} params.weights
   */
  static calculate({ riasecScores, studentGrades, careers, weights }) {
    const w1 = weights.c1Weight / 100;
    const w2 = weights.c2Weight / 100;
    const w3 = weights.c3Weight / 100;

    // 1. Hitung Nilai Mentah (Raw Scores x_ij)
    const rawMatrix = careers.map((career) => {
      // --- C1: Minat Karir (RIASEC) ---
      let c1Raw = 0;
      if (riasecScores && career.riasecWeights?.length > 0) {
        let weightedSum = 0;
        let totalWeight = 0;

        career.riasecWeights.forEach(({ dimension, weight }) => {
          if (weight > 0) {
            weightedSum += (riasecScores[dimension] || 0) * weight;
            totalWeight += weight;
          }
        });

        // Skor maksimal per pertanyaan adalah 5 x 3 = 15 per dimensi
        c1Raw = totalWeight > 0 ? (weightedSum / totalWeight) / 15 : 0;
      }

      // --- C2: Kemampuan Akademik ---
      let c2Raw = 0;
      if (studentGrades?.length > 0 && career.academicWeights?.length > 0) {
        let weightedGradeSum = 0;
        let totalAcademicWeight = 0;

        // Build lookup map by both subjectName and subjectId
        const gradeMap = new Map();
        studentGrades.forEach(g => {
          if (g.name) gradeMap.set(g.name, g.grade);
          if (g.subjectName) gradeMap.set(g.subjectName, g.grade);
          if (g.subject?.name) gradeMap.set(g.subject.name, g.grade);
          if (g.subjectId) gradeMap.set(`id_${g.subjectId}`, g.grade);
        });

        career.academicWeights.forEach(({ subjectId, subjectName, weight, subject }) => {
          let studentGrade = 0;
          const resolvedName = subjectName || subject?.name;
          if (resolvedName && gradeMap.has(resolvedName)) {
            studentGrade = gradeMap.get(resolvedName);
          } else if (subjectId && gradeMap.has(`id_${subjectId}`)) {
            studentGrade = gradeMap.get(`id_${subjectId}`);
          }
          weightedGradeSum += (Number(studentGrade) || 0) * weight;
          totalAcademicWeight += weight;
        });

        // Normalisasi skala nilai 0-100 menjadi 0-1
        c2Raw = totalAcademicWeight > 0 ? (weightedGradeSum / totalAcademicWeight) / 100 : 0;
      }

      // --- C3: Pasar Kerja ---
      const c3Raw = (career.marketDemandScore || 80) / 100;

      return {
        careerId: career.id,
        slug: career.slug,
        name: career.title,
        icon: career.icon,
        subtitle: career.subtitle,
        description: career.description,
        marketDetail: career.marketDetail,
        c1Raw,
        c2Raw,
        c3Raw
      };
    });

    // 2. Tentukan Nilai Maksimum tiap Kriteria (max x_ij)
    const maxC1 = Math.max(...rawMatrix.map(item => item.c1Raw), 0.001);
    const maxC2 = Math.max(...rawMatrix.map(item => item.c2Raw), 0.001);
    const maxC3 = Math.max(...rawMatrix.map(item => item.c3Raw), 0.001);

    // 3. Normalisasi (r_ij) dan Hitung Nilai Preferensi (V_i)
    const evaluatedCareers = rawMatrix.map(item => {
      const r1 = item.c1Raw / maxC1;
      const r2 = item.c2Raw / maxC2;
      const r3 = item.c3Raw / maxC3;

      const preferenceValue = (r1 * w1) + (r2 * w2) + (r3 * w3);

      return {
        careerId: item.careerId,
        slug: item.slug,
        name: item.name,
        icon: item.icon,
        subtitle: item.subtitle,
        description: item.description,
        market: item.marketDetail,
        criteriaScores: {
          c1: {
            normalized: Number(r1.toFixed(4)),
            percentage: Math.round(r1 * 100),
            feedback: this.getFeedbackC1(r1)
          },
          c2: {
            normalized: Number(r2.toFixed(4)),
            percentage: Math.round(r2 * 100),
            feedback: this.getFeedbackC2(r2)
          },
          c3: {
            normalized: Number(r3.toFixed(4)),
            percentage: Math.round(r3 * 100),
            feedback: this.getFeedbackC3(r3)
          }
        },
        finalScore: Number(preferenceValue.toFixed(4)),
        preferenceValue
      };
    });

    // 4. Perangkingan Descending
    return evaluatedCareers
      .sort((a, b) => b.preferenceValue - a.preferenceValue)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }

  static getFeedbackC1(val) {
    if (val >= 0.9) return "Hasil RIASEC sangat sesuai dengan karakteristik karir.";
    if (val >= 0.7) return "Hasil RIASEC menunjukkan kesesuaian minat yang baik.";
    return "Kesesuaian minat terhadap karir ini tergolong cukup.";
  }

  static getFeedbackC2(val) {
    if (val >= 0.9) return "Nilai akademik pada mata kuliah utama sangat mendukung.";
    if (val >= 0.7) return "Nilai akademik relevan memiliki pencapaian yang baik.";
    return "Komponen akademik pendukung memiliki nilai cukup.";
  }

  static getFeedbackC3(val) {
    if (val >= 0.9) return "Peluang lowongan dan tren pekerjaan termasuk sangat tinggi.";
    if (val >= 0.7) return "Permintaan pasar kerja stabil dan bertumbuh positif.";
    return "Kebutuhan pasar kerja untuk peran ini tergolong sedang.";
  }
}
