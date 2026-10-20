import { z } from 'zod';
import { authenticate } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').optional(),
  university: z.string().optional(),
  studyProgram: z.string().optional(),
  semester: z.string().optional(),
  domicile: z.string().optional(),
  avatarUrl: z.string().nullable().optional()
});

export async function PUT(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const body = await request.json();
    const parseResult = profileUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi profil gagal', 400, errors);
    }

    const updatedUser = await dbRepository.updateStudentProfile(user.id, parseResult.data);

    return successResponse(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        student: updatedUser.student
      },
      'Profil berhasil diperbarui'
    );
  } catch (error) {
    return errorResponse(error.message || 'Gagal memperbarui profil', 500);
  }
}
