import { z } from 'zod';
import { authenticate, authorizeRole, getStudentForUser } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { OnetService } from '@/server/services/onetService.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const submitSchema = z.object({
  answers: z.union([
    z.string().min(1, 'String jawaban tidak boleh kosong'),
    z.array(
      z.union([
        z.object({
          questionId: z.coerce.number().optional(),
          id: z.coerce.number().optional(),
          score: z.coerce.number().min(1).max(5).optional(),
          value: z.coerce.number().min(1).max(5).optional()
        }),
        z.coerce.number().min(1).max(5)
      ])
    ).min(1, 'Lembar jawaban tidak boleh kosong')
  ]).optional(),
  answersString: z.string().optional()
}).refine(data => data.answers !== undefined || data.answersString !== undefined, {
  message: 'Lembar jawaban (answers atau answersString) wajib disertakan'
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

    const rawAnswers = parseResult.data.answersString || parseResult.data.answers;

    // Hitung skor resmi via O*NET Web Services API
    const evaluated = await OnetService.calculateResults(rawAnswers);

    // Simpan hasil ke basis data (Supabase / In-Memory fallback)
    const savedResult = await dbRepository.saveRiasecResult(studentId, {
      scores: evaluated.scores,
      topHolland: evaluated.topHolland,
      answersJson: {
        answersString: evaluated.answersString,
        rawAnswers,
        source: evaluated.source,
        onetCareersUrl: evaluated.careersUrl,
        onetRaw: evaluated.rawResults
      }
    });

    return successResponse(
      {
        scores: evaluated.scores,
        topHolland: evaluated.topHolland,
        primaryDimension: evaluated.primaryDimension,
        onetCareersUrl: evaluated.careersUrl,
        source: evaluated.source,
        completedAt: savedResult.completedAt
      },
      'Hasil asesmen RIASEC O*NET berhasil disimpan',
      201
    );
  } catch (error) {
    return errorResponse(error.message || 'Gagal memproses asesmen RIASEC', 500);
  }
}
