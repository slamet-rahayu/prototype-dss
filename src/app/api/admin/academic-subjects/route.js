import { z } from 'zod';
import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const subjectSchema = z.object({
  name: z.string().min(2, 'Nama mata kuliah minimal 2 karakter'),
  description: z.string().min(5, 'Deskripsi mata kuliah minimal 5 karakter'),
  icon: z.string().optional().default('⌘')
});

export async function GET(request) {
  try {
    const subjects = await dbRepository.getAllSubjects();
    return successResponse(subjects, 'Daftar mata kuliah berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat mata kuliah', 500);
  }
}

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const body = await request.json();
    const parseResult = subjectSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi mata kuliah gagal', 400, errors);
    }

    const created = await dbRepository.createSubject(parseResult.data);
    return successResponse(created, 'Mata kuliah berhasil ditambahkan', 201);
  } catch (error) {
    return errorResponse(error.message || 'Gagal menambahkan mata kuliah', 500);
  }
}
