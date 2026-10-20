import { z } from 'zod';
import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const subjectUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  icon: z.string().optional()
});

export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { id } = await params;
    const body = await request.json();
    const parseResult = subjectUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse('Validasi pembaruan mata kuliah gagal', 400);
    }

    const updated = await dbRepository.updateSubject(id, parseResult.data);
    return successResponse(updated, 'Mata kuliah berhasil diperbarui');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memperbarui mata kuliah', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbRepository.deleteSubject(id);

    return successResponse(null, 'Mata kuliah berhasil dihapus');
  } catch (error) {
    return errorResponse(error.message || 'Gagal menghapus mata kuliah', 500);
  }
}
