import { authenticate, getStudentForUser } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const student = await getStudentForUser(user);
    const studentId = student?.id || user.id;

    const result = await dbRepository.getRiasecResult(studentId);

    if (!result) {
      return errorResponse('Hasil asesmen RIASEC belum ditemukan untuk mahasiswa ini', 404);
    }

    return successResponse(
      {
        id: result.id,
        scores: {
          R: result.scoreR,
          I: result.scoreI,
          A: result.scoreA,
          S: result.scoreS,
          E: result.scoreE,
          C: result.scoreC
        },
        topHolland: result.topHolland,
        completedAt: result.completedAt,
        source: result.answersJson?.source || 'onet',
        onetCareersUrl: result.answersJson?.onetCareersUrl || null,
        answersJson: result.answersJson
      },
      'Hasil RIASEC berhasil dimuat'
    );
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat hasil RIASEC', 500);
  }
}
