import { OnetService } from '@/server/services/onetService.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceParam = searchParams.get('source'); // 'onet', 'db', or auto

    if (sourceParam === 'db') {
      const dbQuestions = await dbRepository.getRiasecQuestions();
      return successResponse(dbQuestions, 'Daftar butir pertanyaan RIASEC dari basis data berhasil dimuat');
    }

    // Default: Ambil dari O*NET Web Services
    const onetData = await OnetService.getQuestions();
    
    if (onetData.questions && onetData.questions.length > 0) {
      return successResponse(onetData.questions, 'Daftar butir pertanyaan RIASEC O*NET berhasil dimuat', 200, {
        source: onetData.source,
        total: onetData.questions.length,
        answerOptions: onetData.answerOptions
      });
    }

    // Fallback jika O*NET kosong
    const questions = await dbRepository.getRiasecQuestions();
    return successResponse(questions, 'Daftar butir pertanyaan RIASEC lokal berhasil dimuat');
  } catch (error) {
    try {
      const fallbackQuestions = await dbRepository.getRiasecQuestions();
      return successResponse(fallbackQuestions, 'Daftar pertanyaan RIASEC dimuat dari cadangan lokal');
    } catch {
      return errorResponse(error.message || 'Gagal memuat pertanyaan RIASEC', 500);
    }
  }
}
