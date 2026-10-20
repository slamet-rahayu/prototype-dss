import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { id } = await params;
    const body = await request.json();

    const updated = await dbRepository.updateCareer(id, body);
    if (!updated) {
      return errorResponse('Karir tidak ditemukan', 404);
    }

    return successResponse(updated, 'Informasi dan bobot karir berhasil diperbarui');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memperbarui data karir', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbRepository.deleteCareer(id);

    return successResponse(null, 'Alternatif karir berhasil dihapus');
  } catch (error) {
    return errorResponse(error.message || 'Gagal menghapus alternatif karir', 500);
  }
}
