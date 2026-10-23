import { OnetService } from '../src/server/services/onetService.js';
import { SawEngineService } from '../src/server/services/sawEngineService.js';
import { calculateSaw } from '../src/utils/sawCalculator.js';
import assert from 'node:assert';

console.log('====================================================');
console.log(' PENGUJIAN INTEGRASI O*NET WEB SERVICES (RIASEC)    ');
console.log('====================================================\n');

async function runTests() {
  let passedCount = 0;
  let failedCount = 0;

  // Test 1: Fetch 30 Questions from O*NET
  console.log('[TEST 1] Memuat 30 Butir Pertanyaan dari O*NET Web Services...');
  try {
    const qData = await OnetService.getQuestions({ forceRefresh: true });
    assert.strictEqual(qData.questions.length, 30, 'Total pertanyaan harus 30 butir');
    assert.strictEqual(qData.questions[0].index, 1, 'Index pertama adalah 1');
    assert.strictEqual(qData.questions[0].area, 'realistic', 'Area pertama adalah realistic');
    assert.strictEqual(qData.questions[0].type, 'R', 'Tipe pertama adalah R');
    assert.ok(qData.questions[0].text.length > 0, 'Teks pertanyaan O*NET ada');
    assert.ok(qData.questions[0].translation.length > 0, 'Terjemahan bahasa Indonesia ada');

    console.log(`  ✓ Berhasil mengambil 30 pertanyaan dari O*NET (Source: ${qData.source})`);
    console.log(`  ✓ Contoh Soal 1: "${qData.questions[0].text}" -> "${qData.questions[0].translation}"`);
    console.log(`  ✓ Opsi Jawaban: ${qData.answerOptions.map(o => `${o.value}: ${o.label}`).join(', ')}`);
    passedCount++;
  } catch (err) {
    console.error('  ✗ GAGAL:', err.message);
    failedCount++;
  }

  // Test 2: Calculate Results with O*NET using sample answers
  console.log('\n[TEST 2] Evaluasi Hasil RIASEC O*NET dengan answers=411111411111411111411111411111...');
  const sampleAnswers = '411111411111411111411111411111';
  try {
    const rData = await OnetService.calculateResults(sampleAnswers);
    assert.strictEqual(rData.scores.R, 15, 'Skor Realistic harus 15');
    assert.strictEqual(rData.scores.I, 0, 'Skor Investigative harus 0');
    assert.strictEqual(rData.scores.A, 0, 'Skor Artistic harus 0');
    assert.strictEqual(rData.scores.S, 0, 'Skor Social harus 0');
    assert.strictEqual(rData.scores.E, 0, 'Skor Enterprising harus 0');
    assert.strictEqual(rData.scores.C, 0, 'Skor Conventional harus 0');
    assert.strictEqual(rData.primaryDimension, 'R', 'Dimensi utama adalah R');
    assert.ok(rData.topHolland.startsWith('R'), 'Top Holland dimulai dengan R');

    console.log(`  ✓ Berhasil menghitung skor melalui O*NET (Source: ${rData.source})`);
    console.log('  ✓ Skor Dimensi:', JSON.stringify(rData.scores));
    console.log('  ✓ Holland Code:', rData.topHolland);
    console.log('  ✓ Careers URL:', rData.careersUrl || '(none)');
    passedCount++;
  } catch (err) {
    console.error('  ✗ GAGAL:', err.message);
    failedCount++;
  }

  // Test 3: Normalisasi Format Jawaban (Array of Objects -> 30-digit String)
  console.log('\n[TEST 3] Normalisasi Format Jawaban Array ke String 30 Karakter...');
  try {
    const arrayAnswers = [
      { questionId: 1, score: 5 },
      { questionId: 2, score: 4 },
      { questionId: 3, score: 3 }
    ];
    const normalized = OnetService.normalizeAnswersString(arrayAnswers);
    assert.strictEqual(normalized.length, 30, 'String harus memiliki panjang 30 karakter');
    assert.strictEqual(normalized[0], '5', 'Jawaban nomor 1 adalah 5');
    assert.strictEqual(normalized[1], '4', 'Jawaban nomor 2 adalah 4');
    assert.strictEqual(normalized[2], '3', 'Jawaban nomor 3 adalah 3');
    assert.strictEqual(normalized[3], '3', 'Jawaban yang tidak diisi dipad dengan 3 (netral)');

    console.log(`  ✓ Normalisasi string berhasil: ${normalized.slice(0, 10)}... (Panjang: ${normalized.length})`);
    passedCount++;
  } catch (err) {
    console.error('  ✗ GAGAL:', err.message);
    failedCount++;
  }

  // Test 4: Integrasi SAW Engine dengan Skor RIASEC Skala O*NET (0-20)
  console.log('\n[TEST 4] Perhitungan SAW Engine dengan Skor O*NET (Skala Maks 20)...');
  try {
    const onetScores = { R: 18, I: 15, A: 6, S: 8, E: 12, C: 14 };
    const mockGrades = [
      { subjectName: 'Pemrograman', grade: 90 },
      { subjectName: 'Basis Data', grade: 85 },
      { subjectName: 'Analisis dan Perancangan Sistem', grade: 80 },
      { subjectName: 'Jaringan dan Keamanan', grade: 88 },
      { subjectName: 'Data dan Kecerdasan Buatan', grade: 82 }
    ];
    const mockCareers = [
      {
        id: 'c1',
        title: 'Software Engineer',
        name: 'Software Engineer',
        marketDemandScore: 90,
        riasecWeights: [
          { dimension: 'I', weight: 50 },
          { dimension: 'R', weight: 30 },
          { dimension: 'C', weight: 20 }
        ],
        academicWeights: [
          { subjectName: 'Pemrograman', weight: 35 },
          { subjectName: 'Basis Data', weight: 25 },
          { subjectName: 'Analisis dan Perancangan Sistem', weight: 20 },
          { subjectName: 'Jaringan dan Keamanan', weight: 10 },
          { subjectName: 'Data dan Kecerdasan Buatan', weight: 10 }
        ]
      },
      {
        id: 'c2',
        title: 'Network Administrator',
        name: 'Network Administrator',
        marketDemandScore: 80,
        riasecWeights: [
          { dimension: 'R', weight: 60 },
          { dimension: 'C', weight: 30 },
          { dimension: 'I', weight: 10 }
        ],
        academicWeights: [
          { subjectName: 'Jaringan dan Keamanan', weight: 50 },
          { subjectName: 'Pemrograman', weight: 20 },
          { subjectName: 'Basis Data', weight: 15 },
          { subjectName: 'Analisis dan Perancangan Sistem', weight: 15 }
        ]
      }
    ];

    const sawResult = SawEngineService.calculate({
      riasecScores: onetScores,
      studentGrades: mockGrades,
      careers: mockCareers,
      weights: { c1Weight: 40, c2Weight: 35, c3Weight: 25 }
    });

    assert.ok(sawResult.length === 2, 'Harus menghasilkan 2 perankingan');
    assert.ok(sawResult[0].finalScore > 0 && sawResult[0].finalScore <= 1, 'Skor akhir harus antara 0 dan 1');
    const c1Norm = sawResult[0].criteriaScores.c1.normalized;
    assert.ok(c1Norm >= 0 && c1Norm <= 1, 'Skor C1 ternormalisasi harus <= 1.0');

    console.log(`  ✓ SAW berhasil dihitung:`);
    sawResult.forEach((rank, idx) => {
      console.log(`    ${idx + 1}. ${rank.name}: Skor Akhir = ${rank.finalScore} (C1=${rank.criteriaScores.c1.normalized}, C2=${rank.criteriaScores.c2.normalized}, C3=${rank.criteriaScores.c3.normalized})`);
    });
    passedCount++;
  } catch (err) {
    console.error('  ✗ GAGAL:', err.message);
    failedCount++;
  }

  // Summary
  console.log('\n====================================================');
  console.log(` RINGKASAN: ${passedCount} Berhasil, ${failedCount} Gagal`);
  console.log('====================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
