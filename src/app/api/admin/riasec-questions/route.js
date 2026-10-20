import { z } from 'zod';
import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const questionSchema = z.object({
  type: z.enum(['R', 'I', 'A', 'S', 'E', 'C']),
  question: z.string().min(5, 'Teks pertanyaan minimal 5 karakter')
});

export async function GET(request) {
  try {
    const questions = await dbRepository.getRiasecQuestions();
    return successResponse(questions, 'Daftar pertanyaan RIASEC berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat pertanyaan RIASEC', 500);
  }
}

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const body = await request.json();
    const parseResult = questionSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse('Validasi pertanyaan RIASEC gagal', 400);
    }

    const created = await dbRepository.createRiasecQuestion(parseResult.data);
    return successResponse(created, 'Pertanyaan RIASEC berhasil ditambahkan', 201);
  } catch (error) {
    return errorResponse(error.message || 'Gagal menambahkan pertanyaan RIASEC', 500);
  }
}
