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

    const stats = await dbRepository.getDashboardStats();
    return successResponse(stats, 'Statistik dasbor admin berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat statistik admin', 500);
  }
}
