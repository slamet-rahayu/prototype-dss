import { authenticate } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    // Admin sees all histories; Student sees their own
    const filterUserId = user.role === 'ADMIN' ? undefined : user.id;
    const histories = await dbRepository.getRecommendationHistories(filterUserId);

    return successResponse(histories, 'Riwayat rekomendasi berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat riwayat rekomendasi', 500);
  }
}
