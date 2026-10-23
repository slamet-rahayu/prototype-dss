import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { prisma } from '@/server/db/index.js';
import { OnetService } from '@/server/services/onetService.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const syncResult = await OnetService.syncQuestionsToDatabase(prisma);

    return successResponse(
      syncResult,
      `Berhasil menyinkronkan ${syncResult.total} butir pertanyaan O*NET ke basis data lokal (Metode Hybrid).`
    );
  } catch (err) {
    return errorResponse(err.message || 'Gagal menyinkronkan pertanyaan O*NET', 500);
  }
}
