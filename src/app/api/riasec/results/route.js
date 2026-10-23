import { OnetService } from '@/server/services/onetService.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const answers = searchParams.get('answers');

    if (!answers) {
      return errorResponse('Parameter query answers wajib diisi (contoh: ?answers=411111411111411111411111411111)', 400);
    }

    const result = await OnetService.calculateResults(answers);

    return successResponse(
      result,
      'Hasil evaluasi RIASEC O*NET berhasil dimuat'
    );
  } catch (error) {
    return errorResponse(error.message || 'Gagal menghitung hasil RIASEC', 500);
  }
}
