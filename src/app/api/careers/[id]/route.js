import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const career = await dbRepository.getCareerById(id);

    if (!career) {
      return errorResponse('Karir tidak ditemukan', 404);
    }

    return successResponse(career, 'Detail karir berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat detail karir', 500);
  }
}
