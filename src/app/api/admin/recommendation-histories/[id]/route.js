import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbRepository.deleteRecommendationHistory(id);

    return successResponse(null, 'Log riwayat rekomendasi berhasil dihapus');
  } catch (error) {
    return errorResponse(error.message || 'Gagal menghapus log riwayat rekomendasi', 500);
  }
}
