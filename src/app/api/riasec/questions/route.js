import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const questions = await dbRepository.getRiasecQuestions();
    return successResponse(questions, 'Daftar butir pertanyaan RIASEC berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat pertanyaan RIASEC', 500);
  }
}
