import { authenticate } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { SawEngineService } from '@/server/services/sawEngineService.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const studentId = user.student?.id || user.id;

    // Optional override params from client body
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // 1. Fetch student's RIASEC scores
    let riasecResult = await dbRepository.getRiasecResult(studentId);
    let riasecScores = body.riasecScores || null;
    let hollandCode = body.hollandCode || null;

    if (!riasecScores && riasecResult) {
      riasecScores = {
        R: riasecResult.scoreR,
        I: riasecResult.scoreI,
        A: riasecResult.scoreA,
        S: riasecResult.scoreS,
        E: riasecResult.scoreE,
        C: riasecResult.scoreC
      };
      hollandCode = riasecResult.topHolland;
    }

    // Default neutral RIASEC scores if not yet completed
    if (!riasecScores) {
      riasecScores = { R: 10, I: 10, A: 10, S: 10, E: 10, C: 10 };
      hollandCode = "RIA";
    }

    // 2. Fetch student's Academic grades
    let studentGrades = await dbRepository.getStudentGrades(studentId);
    if (body.studentGrades && Array.isArray(body.studentGrades)) {
      studentGrades = body.studentGrades;
    }

    // 3. Fetch Master Careers & SAW Config
    const careers = await dbRepository.getCareers();
    const sawConfig = await dbRepository.getSawConfig();

    const weights = body.weights || {
      c1Weight: sawConfig.c1Weight,
      c2Weight: sawConfig.c2Weight,
      c3Weight: sawConfig.c3Weight
    };

    // 4. Execute SAW Algorithm
    const rankings = SawEngineService.calculate({
      riasecScores,
      studentGrades,
      careers,
      weights
    });

    // 5. Save execution to RecommendationHistory
    if (rankings.length > 0) {
      const topCareer = rankings[0];
      await dbRepository.createRecommendationHistory({
        userId: user.id,
        hollandCode: hollandCode || 'IRC',
        topCareerName: topCareer.name,
        highestScore: topCareer.finalScore,
        status: 'Valid',
        fullResult: {
          calculatedAt: new Date().toISOString(),
          weightsApplied: weights,
          rankings
        }
      });
    }

    return successResponse(
      {
        hollandCode,
        weightsApplied: {
          c1: weights.c1Weight,
          c2: weights.c2Weight,
          c3: weights.c3Weight
        },
        rankings
      },
      'Kalkulasi rekomendasi SAW selesai'
    );
  } catch (error) {
    return errorResponse(error.message || 'Gagal memproses rekomendasi SAW', 500);
  }
}
