import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { executeSync } from '@/server/services/schedulerService.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    let executionType = 'Manual';
    let configId = null;
    let onlyFailures = false;

    try {
      const body = await request.json();
      if (body?.executionType) {
        executionType = body.executionType;
      }
      if (body?.configId) {
        configId = body.configId;
      }
      if (body?.onlyFailures) {
        onlyFailures = Boolean(body.onlyFailures);
      }
    } catch {
      // Body may be empty, defaults to Manual
    }

    const result = await executeSync({ executionType, configId, onlyFailures });

    return successResponse(result, 'Sinkronisasi data pasar kerja berhasil dijalankan');
  } catch (error) {
    const statusCode = error.message?.includes('sedang berjalan') ? 409 : 500;
    return errorResponse(error.message || 'Gagal mengeksekusi scheduler', statusCode);
  }
}
