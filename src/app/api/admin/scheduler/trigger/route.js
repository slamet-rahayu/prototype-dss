import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { runMarketDataSync } from '@/server/services/jobMarketService.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const result = await runMarketDataSync({ executionType: 'Manual' });

    return successResponse(result, 'Sinkronisasi data pasar kerja berhasil dijalankan');
  } catch (error) {
    return errorResponse(error.message || 'Gagal mengeksekusi scheduler', 500);
  }
}
