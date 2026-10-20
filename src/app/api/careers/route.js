import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const careers = await dbRepository.getCareers();
    return successResponse(careers, 'Daftar jalur karir berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat katalog karir', 500);
  }
}
