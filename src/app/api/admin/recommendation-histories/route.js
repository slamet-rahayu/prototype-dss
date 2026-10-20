import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const histories = await dbRepository.getAllRecommendationHistories();
    return successResponse(histories, 'Seluruh riwayat rekomendasi berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat riwayat rekomendasi', 500);
  }
}
