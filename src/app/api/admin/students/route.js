import { z } from 'zod';
import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const studentCreateSchema = z.object({
  fullName: z.string().min(2, 'Nama mahasiswa minimal 2 karakter'),
  nim: z.string().min(5, 'NIM minimal 5 karakter'),
  email: z.string().email('Format email tidak valid'),
  studyProgram: z.string().default('Teknologi Informasi'),
  semester: z.string().default('Semester 7'),
  domicile: z.string().optional().default('Jakarta, Indonesia'),
  password: z.string().optional().default('PasswordRahasia123!')
});

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const students = await dbRepository.getAllStudents();
    return successResponse(students, 'Daftar data mahasiswa berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat data mahasiswa', 500);
  }
}

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const body = await request.json();
    const parseResult = studentCreateSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi penambahan mahasiswa gagal', 400, errors);
    }

    const created = await dbRepository.createStudent(parseResult.data);
    return successResponse(created, 'Data mahasiswa berhasil didaftarkan', 201);
  } catch (error) {
    return errorResponse(error.message || 'Gagal menambahkan mahasiswa', 500);
  }
}
