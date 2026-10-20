import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const subjects = await dbRepository.getAcademicSubjects();
    return successResponse(subjects, 'Daftar master mata kuliah berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat mata kuliah', 500);
  }
}
