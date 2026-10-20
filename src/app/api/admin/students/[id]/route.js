import { z } from 'zod';
import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const studentUpdateSchema = z.object({
  fullName: z.string().min(2, 'Nama mahasiswa minimal 2 karakter').optional(),
  name: z.string().min(2).optional(),
  nim: z.string().min(5, 'NIM minimal 5 karakter').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  studyProgram: z.string().optional(),
  semester: z.string().optional(),
  domicile: z.string().optional()
});

export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { id } = await params;
    const body = await request.json();
    const parseResult = studentUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi pembaruan mahasiswa gagal', 400, errors);
    }

    const data = parseResult.data;
    if (data.name && !data.fullName) {
      data.fullName = data.name;
    }

    const updated = await dbRepository.updateStudent(id, data);
    return successResponse(updated, 'Data mahasiswa berhasil diperbarui');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memperbarui mahasiswa', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbRepository.deleteStudent(id);

    return successResponse(null, 'Data mahasiswa berhasil dihapus');
  } catch (error) {
    return errorResponse(error.message || 'Gagal menghapus mahasiswa', 500);
  }
}
