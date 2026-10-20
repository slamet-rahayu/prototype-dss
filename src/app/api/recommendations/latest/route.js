import { authenticate } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const histories = await dbRepository.getRecommendationHistories(user.id);

    if (!histories || histories.length === 0) {
      return errorResponse('Belum ada riwayat kalkulasi rekomendasi untuk pengguna ini', 404);
    }

    const latest = histories[0];
    return successResponse(latest, 'Hasil rekomendasi terakhir berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat rekomendasi terakhir', 500);
  }
}
