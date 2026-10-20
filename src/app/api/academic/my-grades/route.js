import { z } from 'zod';
import { authenticate, authorizeRole, getStudentForUser } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const updateGradesSchema = z.object({
  grades: z.array(
    z.object({
      subjectId: z.number().optional(),
      id: z.any().optional(),
      name: z.string().optional(),
      subjectName: z.string().optional(),
      grade: z.coerce.number().min(0).max(100),
      semester: z.string().optional(),
      academicYear: z.string().optional()
    })
  ).min(1, 'Data nilai tidak boleh kosong')
});

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const student = await getStudentForUser(user);
    const studentId = student?.id || user.id;

    const grades = await dbRepository.getStudentGrades(studentId);
    return successResponse(grades, 'Daftar nilai akademik berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat nilai akademik', 500);
  }
}

export async function PUT(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['STUDENT']);
    if (roleErr) return roleErr;

    const student = await getStudentForUser(user);
    const studentId = student?.id || user.id;

    const body = await request.json();
    const parseResult = updateGradesSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi pembaruan nilai gagal', 400, errors);
    }

    const updated = await dbRepository.updateStudentGrades(studentId, parseResult.data.grades);
    return successResponse(updated, 'Nilai akademik berhasil diperbarui');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memperbarui nilai akademik', 500);
  }
}
