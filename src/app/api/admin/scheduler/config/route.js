import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

let schedulerConfigStore = {
  schedulerName: 'Pembaruan Data Pasar Kerja',
  schedulerCode: 'MARKET_DATA_REFRESH',
  frequency: 'Setiap Hari',
  executionTime: '02.00',
  timezone: 'Asia/Jakarta (WIB)',
  cronExpression: process.env.MARKET_CRON_EXPRESSION || '0 2 * * *',
  isAutoEnabled: true,
  updatedAt: new Date().toISOString()
};

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    return successResponse(schedulerConfigStore, 'Konfigurasi scheduler berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat konfigurasi scheduler', 500);
  }
}

export async function PUT(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const body = await request.json();
    schedulerConfigStore = {
      ...schedulerConfigStore,
      ...body,
      updatedAt: new Date().toISOString()
    };

    return successResponse(schedulerConfigStore, 'Konfigurasi scheduler berhasil diperbarui');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memperbarui scheduler', 500);
  }
}
