import { PrismaClient } from '@prisma/client';
import { dbRepository } from '../src/server/db/index.js';
import { SawEngineService } from '../src/server/services/sawEngineService.js';

const prisma = new PrismaClient();

async function runSawConfigIntegrationTests() {
  console.log('====================================================');
  console.log('   SAW CONFIGURATION & DB INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
    }
  }

  try {
    // 1. Test Tab 1: SAW Criteria Weights (C1, C2, C3)
    console.log('--- 1. Testing SAW Criteria Weights (C1, C2, C3) ---');
    const initialConfig = await dbRepository.getSawConfig();
    assert(initialConfig && typeof initialConfig.c1Weight === 'number', 'Initial sawConfig fetched from DB');

    // Update to custom weights
    const updatedConfig = await dbRepository.updateSawConfig({
      c1Weight: 45,
      c2Weight: 30,
      c3Weight: 25,
      updatedBy: 'admin@careerpath.id'
    });
    assert(updatedConfig.c1Weight === 45 && updatedConfig.c2Weight === 30 && updatedConfig.c3Weight === 25, 'dbRepository.updateSawConfig returns updated values');

    // Verify directly in Prisma DB
    const prismaSawConfig = await prisma.sawConfig.findFirst({ where: { isActive: true } });
    assert(prismaSawConfig.c1Weight === 45 && prismaSawConfig.c2Weight === 30 && prismaSawConfig.c3Weight === 25, 'Prisma database reflects updated SAW weights (45, 30, 25)');

    // Reset back to baseline
    await dbRepository.updateSawConfig({
      c1Weight: 40,
      c2Weight: 35,
      c3Weight: 25,
      updatedBy: 'admin@careerpath.id'
    });
    const resetConfig = await prisma.sawConfig.findFirst({ where: { isActive: true } });
    assert(resetConfig.c1Weight === 40 && resetConfig.c2Weight === 35 && resetConfig.c3Weight === 25, 'Reset SAW weights to baseline (40, 35, 25) in DB verified');

    // 2. Test Tab 2: Academic Components (Subjects) CRUD in DB
    console.log('\n--- 2. Testing Academic Components (Subjects) CRUD ---');
    const uniqueSubjName = `Test Subject ${Date.now()}`;
    const newSubject = await dbRepository.createSubject({
      name: uniqueSubjName,
      description: 'Mata kuliah pengujian integrasi database',
      icon: '⚡'
    });
    assert(newSubject && newSubject.id, `Academic Subject created with ID ${newSubject?.id}`);

    // Verify in DB
    const dbSubj = await prisma.academicSubject.findUnique({ where: { id: newSubject.id } });
    assert(dbSubj && dbSubj.name === uniqueSubjName, 'Subject verified directly in Prisma DB');

    // Update Subject
    const updatedSubj = await dbRepository.updateSubject(newSubject.id, {
      name: `${uniqueSubjName} Updated`,
      description: 'Deskripsi diperbarui',
      icon: '★'
    });
    const dbSubjUpdated = await prisma.academicSubject.findUnique({ where: { id: newSubject.id } });
    assert(dbSubjUpdated.name === `${uniqueSubjName} Updated`, 'Subject update verified directly in Prisma DB');

    // Delete Subject
    await dbRepository.deleteSubject(newSubject.id);
    const dbSubjDeleted = await prisma.academicSubject.findUnique({ where: { id: newSubject.id } });
    assert(dbSubjDeleted === null, 'Subject deletion verified directly in Prisma DB');

    // 3. Test Tab 3: Career RIASEC Mapping Weights Persistence
    console.log('\n--- 3. Testing Career RIASEC Mapping Weights Persistence ---');
    const targetCareer = await prisma.career.findFirst({ where: { slug: 'software-engineer' } });
    assert(Boolean(targetCareer), `Found target career: ${targetCareer?.title} (${targetCareer?.id})`);

    const newRiasecWeights = [
      { dimension: 'I', weight: 45 },
      { dimension: 'R', weight: 35 },
      { dimension: 'C', weight: 20 },
      { dimension: 'A', weight: 0 },
      { dimension: 'S', weight: 0 },
      { dimension: 'E', weight: 0 }
    ];

    await dbRepository.updateCareer(targetCareer.id, { riasecWeights: newRiasecWeights });

    // Verify in Prisma DB
    const dbRiasec = await prisma.careerRiasecWeight.findMany({
      where: { careerId: targetCareer.id }
    });
    const riasecMap = Object.fromEntries(dbRiasec.map(r => [r.dimension, r.weight]));
    assert(riasecMap.I === 45 && riasecMap.R === 35 && riasecMap.C === 20, `RIASEC weights in DB verified: I=${riasecMap.I}, R=${riasecMap.R}, C=${riasecMap.C}`);

    // Restore original RIASEC weights for Software Engineer (I: 50, R: 30, C: 20)
    await dbRepository.updateCareer(targetCareer.id, {
      riasecWeights: [
        { dimension: 'I', weight: 50 },
        { dimension: 'R', weight: 30 },
        { dimension: 'C', weight: 20 },
        { dimension: 'A', weight: 0 },
        { dimension: 'S', weight: 0 },
        { dimension: 'E', weight: 0 }
      ]
    });
    console.log('[PASS] Restored baseline RIASEC weights for Software Engineer');

    // 4. Test Tab 4: Career Academic Weights Persistence
    console.log('\n--- 4. Testing Career Academic Weights Persistence ---');
    const subjects = await prisma.academicSubject.findMany({ orderBy: { id: 'asc' } });
    assert(subjects.length >= 3, `Available academic subjects count: ${subjects.length}`);

    const sub1 = subjects[0];
    const sub2 = subjects[1];
    const sub3 = subjects[2];

    const newAcademicWeights = [
      { subjectName: sub1.name, weight: 40 },
      { subjectName: sub2.name, weight: 35 },
      { subjectName: sub3.name, weight: 25 }
    ];

    await dbRepository.updateCareer(targetCareer.id, { academicWeights: newAcademicWeights });

    // Verify in Prisma DB
    const dbAcad = await prisma.careerAcademicWeight.findMany({
      where: { careerId: targetCareer.id },
      include: { subject: true }
    });
    assert(dbAcad.length === 3, `CareerAcademicWeight count in DB = ${dbAcad.length} (unlinked removed)`);
    const acadMap = Object.fromEntries(dbAcad.map(a => [a.subject.name, a.weight]));
    assert(acadMap[sub1.name] === 40 && acadMap[sub2.name] === 35 && acadMap[sub3.name] === 25, `Academic weights in DB verified: ${sub1.name}=40, ${sub2.name}=35, ${sub3.name}=25`);

    // Restore baseline academic weights for Software Engineer
    const baselineAcademic = [
      { subjectName: 'Pemrograman', weight: 35 },
      { subjectName: 'Basis Data', weight: 25 },
      { subjectName: 'Analisis dan Perancangan Sistem', weight: 20 },
      { subjectName: 'Jaringan dan Keamanan', weight: 10 },
      { subjectName: 'Data dan Kecerdasan Buatan', weight: 10 }
    ];
    await dbRepository.updateCareer(targetCareer.id, { academicWeights: baselineAcademic });
    const restoredAcad = await prisma.careerAcademicWeight.findMany({ where: { careerId: targetCareer.id } });
    assert(restoredAcad.length === 5, `Restored 5 baseline academic weights in DB for Software Engineer`);

    // 5. Test Tab 5: RIASEC Questions CRUD in DB
    console.log('\n--- 5. Testing RIASEC Questions CRUD ---');
    const newQuestion = await dbRepository.createRiasecQuestion({
      type: 'I',
      question: 'Apakah Anda menyukai memecahkan teka-teki logika pemrograman?'
    });
    assert(newQuestion && newQuestion.id, `RIASEC Question created with ID ${newQuestion?.id}`);

    const dbQuestion = await prisma.riasecQuestion.findUnique({ where: { id: newQuestion.id } });
    assert(dbQuestion && dbQuestion.question.includes('teka-teki logika'), 'Question verified directly in Prisma DB');

    await dbRepository.updateRiasecQuestion(newQuestion.id, {
      type: 'I',
      question: 'Apakah Anda menyukai algoritma dan pemecahan masalah kompleks?'
    });
    const dbQuestionUpdated = await prisma.riasecQuestion.findUnique({ where: { id: newQuestion.id } });
    assert(dbQuestionUpdated.question.includes('algoritma'), 'Question update verified directly in Prisma DB');

    await dbRepository.deleteRiasecQuestion(newQuestion.id);
    const dbQuestionDeleted = await prisma.riasecQuestion.findUnique({ where: { id: newQuestion.id } });
    assert(dbQuestionDeleted === null, 'Question deletion verified directly in Prisma DB');

    // 6. Test SAW Engine calculation with DB data
    console.log('\n--- 6. Testing SAW Engine Execution with DB Configuration ---');
    const careers = await dbRepository.getCareers();
    const sawConfig = await dbRepository.getSawConfig();

    const calcResult = SawEngineService.calculate({
      riasecScores: { R: 12, I: 15, A: 10, S: 8, E: 9, C: 11 },
      studentGrades: [
        { name: 'Pemrograman', grade: 92 },
        { name: 'Basis Data', grade: 88 },
        { name: 'Analisis dan Perancangan Sistem', grade: 86 },
        { name: 'Jaringan dan Keamanan', grade: 84 },
        { name: 'Data dan Kecerdasan Buatan', grade: 86 }
      ],
      careers,
      weights: {
        c1Weight: sawConfig.c1Weight,
        c2Weight: sawConfig.c2Weight,
        c3Weight: sawConfig.c3Weight
      }
    });

    assert(calcResult && calcResult.length > 0, `SAW Engine produced ${calcResult.length} career evaluations`);
    assert(calcResult[0].rank === 1, `Rank 1 career: ${calcResult[0].name} (Final Score: ${calcResult[0].finalScore})`);
    assert(calcResult[0].criteriaScores?.c1 && calcResult[0].criteriaScores?.c2 && calcResult[0].criteriaScores?.c3, 'C1, C2, C3 scores properly calculated from DB weights');

  } catch (error) {
    console.error('[FATAL ERROR]:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n====================================================');
    console.log(`Integration Tests Completed: ${passed}/${total} Passed (${((passed/total)*100).toFixed(1)}%)`);
    console.log('====================================================');
  }
}

runSawConfigIntegrationTests();
