import { SawEngineService } from '../src/server/services/sawEngineService.js';
import { calculateRiasecScores } from '../src/server/services/riasecService.js';

function runSawEngineTests() {
  console.log('====================================================');
  console.log('   SAW & HOLLAND RIASEC MATHEMATICAL UNIT TEST');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
    }
  }

  // TEST SUITE 1: RIASEC Scoring Logic
  console.log('--- Test Suite 1: RIASEC Scoring Algorithm ---');
  const mockQuestions = [
    { id: 1, type: 'R' }, { id: 2, type: 'R' }, { id: 3, type: 'R' },
    { id: 4, type: 'I' }, { id: 5, type: 'I' }, { id: 6, type: 'I' },
    { id: 7, type: 'A' }, { id: 8, type: 'A' }, { id: 9, type: 'A' },
    { id: 10, type: 'S' }, { id: 11, type: 'S' }, { id: 12, type: 'S' },
    { id: 13, type: 'E' }, { id: 14, type: 'E' }, { id: 15, type: 'E' },
    { id: 16, type: 'C' }, { id: 17, type: 'C' }, { id: 18, type: 'C' },
  ];

  // Case 1.1: Known answers leading to "IRA"
  const answers1 = [
    { questionId: 1, score: 4 }, { questionId: 2, score: 4 }, { questionId: 3, score: 4 }, // R = 12
    { questionId: 4, score: 5 }, { questionId: 5, score: 5 }, { questionId: 6, score: 5 }, // I = 15
    { questionId: 7, score: 3 }, { questionId: 8, score: 4 }, { questionId: 9, score: 4 }, // A = 11
    { questionId: 10, score: 2 }, { questionId: 11, score: 2 }, { questionId: 12, score: 2 }, // S = 6
    { questionId: 13, score: 3 }, { questionId: 14, score: 3 }, { questionId: 15, score: 2 }, // E = 8
    { questionId: 16, score: 3 }, { questionId: 17, score: 3 }, { questionId: 18, score: 3 }, // C = 9
  ];

  const riasec1 = calculateRiasecScores(answers1, mockQuestions);
  assert(riasec1.scores.I === 15, 'I score calculation correct', `Expected 15, got ${riasec1.scores.I}`);
  assert(riasec1.scores.R === 12, 'R score calculation correct', `Expected 12, got ${riasec1.scores.R}`);
  assert(riasec1.scores.A === 11, 'A score calculation correct', `Expected 11, got ${riasec1.scores.A}`);
  assert(riasec1.topHolland === 'IRA', 'Top Holland code is IRA', `Expected IRA, got ${riasec1.topHolland}`);
  assert(riasec1.primaryDimension === 'I', 'Primary dimension is I', `Expected I, got ${riasec1.primaryDimension}`);

  // Case 1.2: All minimum scores (18 questions x 1)
  const answersMin = mockQuestions.map(q => ({ questionId: q.id, score: 1 }));
  const riasecMin = calculateRiasecScores(answersMin, mockQuestions);
  assert(Object.values(riasecMin.scores).every(s => s === 3), 'All dimensions minimum score = 3');

  // Case 1.3: All maximum scores (18 questions x 5)
  const answersMax = mockQuestions.map(q => ({ questionId: q.id, score: 5 }));
  const riasecMax = calculateRiasecScores(answersMax, mockQuestions);
  assert(Object.values(riasecMax.scores).every(s => s === 15), 'All dimensions maximum score = 15');

  // TEST SUITE 2: SAW Preference Value & Normalization Logic
  console.log('\n--- Test Suite 2: SAW Calculation & Mathematical Formula ---');

  const mockCareers = [
    {
      id: 'c1',
      slug: 'software-engineer',
      title: 'Software Engineer',
      marketDemandScore: 90,
      riasecWeights: [
        { dimension: 'I', weight: 0.5 },
        { dimension: 'R', weight: 0.3 },
        { dimension: 'C', weight: 0.2 }
      ],
      academicWeights: [
        { subjectName: 'Pemrograman Berorientasi Objek', weight: 0.4 },
        { subjectName: 'Basis Data', weight: 0.3 },
        { subjectName: 'Analisis & Perancangan Sistem', weight: 0.3 }
      ]
    },
    {
      id: 'c2',
      slug: 'data-analyst',
      title: 'Data Analyst',
      marketDemandScore: 88,
      riasecWeights: [
        { dimension: 'I', weight: 0.5 },
        { dimension: 'C', weight: 0.3 },
        { dimension: 'E', weight: 0.2 }
      ],
      academicWeights: [
        { subjectName: 'Pemrograman Berorientasi Objek', weight: 0.2 },
        { subjectName: 'Basis Data', weight: 0.5 },
        { subjectName: 'Analisis & Perancangan Sistem', weight: 0.3 }
      ]
    },
    {
      id: 'c3',
      slug: 'ui-ux-designer',
      title: 'UI/UX Designer',
      marketDemandScore: 80,
      riasecWeights: [
        { dimension: 'A', weight: 0.6 },
        { dimension: 'S', weight: 0.2 },
        { dimension: 'I', weight: 0.2 }
      ],
      academicWeights: [
        { subjectName: 'Pemrograman Berorientasi Objek', weight: 0.1 },
        { subjectName: 'Basis Data', weight: 0.2 },
        { subjectName: 'Analisis & Perancangan Sistem', weight: 0.7 }
      ]
    }
  ];

  const studentGrades = [
    { subjectName: 'Pemrograman Berorientasi Objek', grade: 90 },
    { subjectName: 'Basis Data', grade: 85 },
    { subjectName: 'Analisis & Perancangan Sistem', grade: 80 }
  ];

  const weights = { c1Weight: 40, c2Weight: 35, c3Weight: 25 };

  const results = SawEngineService.calculate({
    riasecScores: riasec1.scores,
    studentGrades,
    careers: mockCareers,
    weights
  });

  // Verify rank assignment
  assert(results.length === 3, 'All 3 careers evaluated', `Got ${results.length}`);
  assert(results[0].rank === 1 && results[1].rank === 2 && results[2].rank === 3, 'Ranks correctly assigned 1, 2, 3');
  assert(results[0].preferenceValue >= results[1].preferenceValue, 'Monotonic descending ranking (Rank 1 >= Rank 2)');
  assert(results[1].preferenceValue >= results[2].preferenceValue, 'Monotonic descending ranking (Rank 2 >= Rank 3)');

  // Verify Normalization Values are between 0 and 1
  results.forEach(r => {
    assert(r.criteriaScores.c1.normalized <= 1.0 && r.criteriaScores.c1.normalized >= 0, `${r.name} C1 normalized in [0, 1]`);
    assert(r.criteriaScores.c2.normalized <= 1.0 && r.criteriaScores.c2.normalized >= 0, `${r.name} C2 normalized in [0, 1]`);
    assert(r.criteriaScores.c3.normalized <= 1.0 && r.criteriaScores.c3.normalized >= 0, `${r.name} C3 normalized in [0, 1]`);
    assert(r.finalScore <= 1.0 && r.finalScore >= 0, `${r.name} Final Score in [0, 1]`);
  });

  // Verification of Benefit Normalization: at least one alternative must have normalized = 1.0000 for each criterion
  const maxNormC1 = Math.max(...results.map(r => r.criteriaScores.c1.normalized));
  const maxNormC2 = Math.max(...results.map(r => r.criteriaScores.c2.normalized));
  const maxNormC3 = Math.max(...results.map(r => r.criteriaScores.c3.normalized));
  assert(maxNormC1 === 1.0, 'Benefit normalization C1 has maximum = 1.0000');
  assert(maxNormC2 === 1.0, 'Benefit normalization C2 has maximum = 1.0000');
  assert(maxNormC3 === 1.0, 'Benefit normalization C3 has maximum = 1.0000');

  // Mathematical hand calculation verification for Software Engineer:
  // C1 weighted score: (15*0.5 + 12*0.3 + 9*0.2) / 1.0 = (7.5 + 3.6 + 1.8) = 12.9
  // C1 raw: 12.9 / 15 = 0.86
  // C2 weighted score: (90*0.4 + 85*0.3 + 80*0.3) / 1.0 = (36 + 25.5 + 24) = 85.5
  // C2 raw: 85.5 / 100 = 0.855
  // C3 raw: 90 / 100 = 0.90
  const se = results.find(r => r.slug === 'software-engineer');
  console.log(`\nVerification of Software Engineer:`);
  console.log(`   - Final Score: ${se.finalScore} (Rank ${se.rank})`);
  console.log(`   - C1 (RIASEC): ${se.criteriaScores.c1.percentage}% (${se.criteriaScores.c1.feedback})`);
  console.log(`   - C2 (Akademik): ${se.criteriaScores.c2.percentage}% (${se.criteriaScores.c2.feedback})`);
  console.log(`   - C3 (Pasar Kerja): ${se.criteriaScores.c3.percentage}% (${se.criteriaScores.c3.feedback})`);

  // Manual calculation of V_SE:
  const manualV_se = (se.criteriaScores.c1.normalized * 0.4) + (se.criteriaScores.c2.normalized * 0.35) + (se.criteriaScores.c3.normalized * 0.25);
  assert(Math.abs(se.finalScore - manualV_se) < 0.001, 'Formula V_i = sum(w_j * r_ij) matches manual calculation', `Diff: ${Math.abs(se.finalScore - manualV_se)}`);

  console.log('\n====================================================');
  console.log(`Mathematical Unit Tests Completed: ${passedTests}/${totalTests} Passed`);
  console.log('====================================================');
  return { passed: passedTests, total: totalTests };
}

runSawEngineTests();
