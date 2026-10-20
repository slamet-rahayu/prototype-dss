import { PrismaClient } from '@prisma/client';
import {
  INITIAL_USERS,
  INITIAL_ACADEMIC_SUBJECTS,
  INITIAL_STUDENT_GRADES,
  INITIAL_RIASEC_QUESTIONS,
  INITIAL_RIASEC_RESULT,
  INITIAL_RIASEC_RESULTS,
  INITIAL_CAREERS,
  INITIAL_SAW_CONFIG,
  INITIAL_RECOMMENDATION_HISTORIES,
  INITIAL_SCHEDULER_LOGS
} from '../src/server/data/initialData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding database DSS Career...');

  // 1. Users & Students
  for (const user of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        student: user.student ? {
          create: {
            id: user.student.id,
            nim: user.student.nim,
            fullName: user.student.fullName,
            university: user.student.university,
            studyProgram: user.student.studyProgram,
            semester: user.student.semester,
            domicile: user.student.domicile
          }
        } : undefined
      }
    });
  }
  console.log('✅ Users dan Students berhasil di-seed.');

  // 2. Academic Subjects
  for (const subj of INITIAL_ACADEMIC_SUBJECTS) {
    await prisma.academicSubject.upsert({
      where: { id: subj.id },
      update: {},
      create: {
        id: subj.id,
        name: subj.name,
        description: subj.description,
        icon: subj.icon
      }
    });
  }
  console.log('✅ Academic Subjects berhasil di-seed.');

  // 3. Academic Grades
  for (const grd of INITIAL_STUDENT_GRADES) {
    await prisma.academicGrade.upsert({
      where: {
        studentId_subjectId: {
          studentId: grd.studentId,
          subjectId: grd.subjectId
        }
      },
      update: { grade: grd.grade, status: grd.status },
      create: {
        id: grd.id,
        studentId: grd.studentId,
        subjectId: grd.subjectId,
        grade: grd.grade,
        status: grd.status,
        semester: grd.semester,
        academicYear: grd.academicYear
      }
    });
  }
  console.log('✅ Academic Grades berhasil di-seed.');

  // 4. RIASEC Questions
  for (const q of INITIAL_RIASEC_QUESTIONS) {
    await prisma.riasecQuestion.upsert({
      where: { id: q.id },
      update: { question: q.question, type: q.type },
      create: {
        id: q.id,
        type: q.type,
        question: q.question
      }
    });
  }
  console.log('✅ RIASEC Questions (18 butir) berhasil di-seed.');

  // 5. RIASEC Results
  const riasecList = Array.isArray(INITIAL_RIASEC_RESULTS) ? INITIAL_RIASEC_RESULTS : [INITIAL_RIASEC_RESULT];
  for (const res of riasecList) {
    await prisma.riasecResult.upsert({
      where: { studentId: res.studentId },
      update: {
        scoreR: res.scoreR,
        scoreI: res.scoreI,
        scoreA: res.scoreA,
        scoreS: res.scoreS,
        scoreE: res.scoreE,
        scoreC: res.scoreC,
        topHolland: res.topHolland,
        answersJson: res.answersJson
      },
      create: {
        id: res.id,
        studentId: res.studentId,
        scoreR: res.scoreR,
        scoreI: res.scoreI,
        scoreA: res.scoreA,
        scoreS: res.scoreS,
        scoreE: res.scoreE,
        scoreC: res.scoreC,
        topHolland: res.topHolland,
        answersJson: res.answersJson
      }
    });
  }
  console.log(`✅ ${riasecList.length} RIASEC Results berhasil di-seed.`);

  // 6. Careers, Market Details & Weights
  for (const car of INITIAL_CAREERS) {
    const careerRecord = await prisma.career.upsert({
      where: { slug: car.slug },
      update: {
        title: car.title,
        subtitle: car.subtitle,
        description: car.description,
        icon: car.icon,
        marketDemandScore: car.marketDemandScore
      },
      create: {
        id: car.id,
        slug: car.slug,
        title: car.title,
        subtitle: car.subtitle,
        description: car.description,
        icon: car.icon,
        marketDemandScore: car.marketDemandScore,
        marketDetail: {
          create: {
            vacancyCount: car.marketDetail.vacancyCount,
            trendStatus: car.marketDetail.trendStatus,
            primaryLocation: car.marketDetail.primaryLocation,
            requiredSkills: car.marketDetail.requiredSkills,
            shortNote: car.marketDetail.shortNote
          }
        }
      }
    });

    // RIASEC weights
    for (const rw of car.riasecWeights) {
      await prisma.careerRiasecWeight.upsert({
        where: {
          careerId_dimension: {
            careerId: careerRecord.id,
            dimension: rw.dimension
          }
        },
        update: { weight: rw.weight },
        create: {
          careerId: careerRecord.id,
          dimension: rw.dimension,
          weight: rw.weight
        }
      });
    }

    // Academic weights
    for (const aw of car.academicWeights) {
      await prisma.careerAcademicWeight.upsert({
        where: {
          careerId_subjectId: {
            careerId: careerRecord.id,
            subjectId: aw.subjectId
          }
        },
        update: { weight: aw.weight },
        create: {
          careerId: careerRecord.id,
          subjectId: aw.subjectId,
          weight: aw.weight
        }
      });
    }
  }
  console.log('✅ Master Careers & Weights berhasil di-seed.');

  // 7. SAW Config
  await prisma.sawConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      c1Weight: INITIAL_SAW_CONFIG.c1Weight,
      c2Weight: INITIAL_SAW_CONFIG.c2Weight,
      c3Weight: INITIAL_SAW_CONFIG.c3Weight,
      isActive: true,
      updatedBy: "System"
    }
  });
  console.log('✅ SAW Config (40/35/25) berhasil di-seed.');

  // 8. Recommendation Histories
  for (const hist of INITIAL_RECOMMENDATION_HISTORIES) {
    await prisma.recommendationHistory.upsert({
      where: { id: hist.id },
      update: {
        hollandCode: hist.hollandCode,
        topCareerName: hist.topCareerName,
        highestScore: hist.highestScore,
        status: hist.status,
        fullResult: hist.fullResult,
        calculatedAt: new Date(hist.calculatedAt)
      },
      create: {
        id: hist.id,
        userId: hist.userId,
        hollandCode: hist.hollandCode,
        topCareerName: hist.topCareerName,
        highestScore: hist.highestScore,
        status: hist.status,
        fullResult: hist.fullResult,
        calculatedAt: new Date(hist.calculatedAt)
      }
    });
  }
  console.log(`✅ ${INITIAL_RECOMMENDATION_HISTORIES.length} Recommendation Histories berhasil di-seed.`);

  // 9. Scheduler Logs
  for (const log of INITIAL_SCHEDULER_LOGS) {
    await prisma.schedulerLog.upsert({
      where: { id: log.id },
      update: {
        jobName: log.jobName,
        executionType: log.executionType,
        status: log.status,
        processed: log.processed,
        successCount: log.successCount,
        failedCount: log.failedCount,
        durationSec: log.durationSec,
        message: log.message,
        startedAt: new Date(log.startedAt),
        finishedAt: new Date(log.finishedAt)
      },
      create: {
        id: log.id,
        jobName: log.jobName,
        executionType: log.executionType,
        status: log.status,
        processed: log.processed,
        successCount: log.successCount,
        failedCount: log.failedCount,
        durationSec: log.durationSec,
        message: log.message,
        startedAt: new Date(log.startedAt),
        finishedAt: new Date(log.finishedAt)
      }
    });
  }
  console.log(`✅ ${INITIAL_SCHEDULER_LOGS.length} Scheduler Logs berhasil di-seed.`);

  console.log('🎉 Seeding database selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('Error saat seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
