import { z } from 'zod';
import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const questionUpdateSchema = z.object({
  type: z.enum(['R', 'I', 'A', 'S', 'E', 'C']).optional(),
  question: z.string().min(5).optional(),
  text: z.string().min(5).optional()
});

export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { id } = await params;
    const body = await request.json();
    const parseResult = questionUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse('Validasi pembaruan pertanyaan gagal', 400);
    }

    const data = parseResult.data;
    if (data.text && !data.question) {
      data.question = data.text;
    }

    const updated = await dbRepository.updateRiasecQuestion(id, data);
    return successResponse(updated, 'Pertanyaan RIASEC berhasil diperbarui');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memperbarui pertanyaan RIASEC', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbRepository.deleteRiasecQuestion(id);

    return successResponse(null, 'Pertanyaan RIASEC berhasil dihapus');
  } catch (error) {
    return errorResponse(error.message || 'Gagal menghapus pertanyaan RIASEC', 500);
  }
}
