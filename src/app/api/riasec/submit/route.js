import { z } from 'zod';
import { authenticate, authorizeRole, getStudentForUser } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { calculateRiasecScores } from '@/server/services/riasecService.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.coerce.number(),
      score: z.coerce.number().min(1).max(5)
    })
  ).min(1, 'Lembar jawaban tidak boleh kosong')
});

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['STUDENT']);
    if (roleErr) return roleErr;

    const student = await getStudentForUser(user);
    const studentId = student?.id || user.id;

    const body = await request.json();
    const parseResult = submitSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi jawaban RIASEC gagal', 400, errors);
    }

    const { answers } = parseResult.data;
    const questions = await dbRepository.getRiasecQuestions();

    const evaluated = calculateRiasecScores(answers, questions);

    const savedResult = await dbRepository.saveRiasecResult(studentId, {
      scores: evaluated.scores,
      topHolland: evaluated.topHolland,
      answersJson: answers
    });

    return successResponse(
      {
        scores: evaluated.scores,
        topHolland: evaluated.topHolland,
        primaryDimension: evaluated.primaryDimension,
        completedAt: savedResult.completedAt
      },
      'Hasil asesmen RIASEC berhasil disimpan',
      201
    );
  } catch (error) {
    return errorResponse(error.message || 'Gagal memproses asesmen RIASEC', 500);
  }
}
