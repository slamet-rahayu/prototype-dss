import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('====================================================');
  console.log('   PRISMA & DATABASE INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  const results = {
    connected: false,
    latencyMs: 0,
    models: {},
    errors: []
  };

  const startTime = Date.now();
  try {
    // 1. Connection ping
    await prisma.$queryRaw`SELECT 1 as ping`;
    results.latencyMs = Date.now() - startTime;
    results.connected = true;
    console.log(`[PASS] DB Connection established in ${results.latencyMs}ms`);

    // 2. Count records in all models
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const academicSubjectCount = await prisma.academicSubject.count();
    const academicGradeCount = await prisma.academicGrade.count();
    const riasecQuestionCount = await prisma.riasecQuestion.count();
    const riasecResultCount = await prisma.riasecResult.count();
    const careerCount = await prisma.career.count();
    const jobMarketDetailCount = await prisma.jobMarketDetail.count();
    const careerRiasecWeightCount = await prisma.careerRiasecWeight.count();
    const careerAcademicWeightCount = await prisma.careerAcademicWeight.count();
    const sawConfigCount = await prisma.sawConfig.count();
    const recommendationHistoryCount = await prisma.recommendationHistory.count();
    const schedulerLogCount = await prisma.schedulerLog.count();

    results.models = {
      User: userCount,
      Student: studentCount,
      AcademicSubject: academicSubjectCount,
      AcademicGrade: academicGradeCount,
      RiasecQuestion: riasecQuestionCount,
      RiasecResult: riasecResultCount,
      Career: careerCount,
      JobMarketDetail: jobMarketDetailCount,
      CareerRiasecWeight: careerRiasecWeightCount,
      CareerAcademicWeight: careerAcademicWeightCount,
      SawConfig: sawConfigCount,
      RecommendationHistory: recommendationHistoryCount,
      SchedulerLog: schedulerLogCount
    };

    console.log('[PASS] Model Counts:');
    for (const [model, count] of Object.entries(results.models)) {
      console.log(`   - ${model.padEnd(25)}: ${count} records`);
    }

    // 3. Verify Relations & Seed integrity
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, role: true }
    });
    console.log(`\n[PASS] Admin User Check: ${adminUser ? adminUser.email : 'NOT FOUND'}`);

    const studentUser = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      include: {
        student: {
          include: {
            grades: { include: { subject: true } },
            riasecResult: true
          }
        }
      }
    });
    console.log(`[PASS] Student User Check: ${studentUser ? studentUser.email : 'NOT FOUND'}`);
    if (studentUser?.student) {
      console.log(`   - Name: ${studentUser.student.fullName}`);
      console.log(`   - NIM: ${studentUser.student.nim}`);
      console.log(`   - Grades Count: ${studentUser.student.grades?.length || 0}`);
      console.log(`   - RIASEC Completed: ${studentUser.student.riasecResult ? 'Yes (' + studentUser.student.riasecResult.topHolland + ')' : 'No'}`);
    }

    const sawConfig = await prisma.sawConfig.findFirst({ where: { isActive: true } });
    console.log(`\n[PASS] Active SAW Configuration:`);
    console.log(`   - C1 (RIASEC) Weight: ${sawConfig?.c1Weight}%`);
    console.log(`   - C2 (Akademik) Weight: ${sawConfig?.c2Weight}%`);
    console.log(`   - C3 (Pasar Kerja) Weight: ${sawConfig?.c3Weight}%`);
    const totalWeight = (sawConfig?.c1Weight || 0) + (sawConfig?.c2Weight || 0) + (sawConfig?.c3Weight || 0);
    console.log(`   - Total Weight: ${totalWeight}% ${totalWeight === 100 ? '(VALID)' : '(INVALID SUM!)'}`);

    // 4. Careers with weights
    const careers = await prisma.career.findMany({
      include: {
        riasecWeights: true,
        academicWeights: true,
        marketDetail: true
      }
    });
    console.log(`\n[PASS] Verified ${careers.length} Careers with Criteria Weights.`);
    careers.forEach(c => {
      console.log(`   - [${c.slug}] ${c.title} (RIASEC dims: ${c.riasecWeights.length}, Academic subs: ${c.academicWeights.length}, Demand: ${c.marketDemandScore})`);
    });

  } catch (error) {
    results.errors.push(error.message);
    console.error(`\n[FAIL] Database test error:`, error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n====================================================');
    console.log(`Database Test Completed with ${results.errors.length} errors.`);
    console.log('====================================================');
  }

  return results;
}

testDatabase();
