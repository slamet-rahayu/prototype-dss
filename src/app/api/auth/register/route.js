import { z } from 'zod';
import { dbRepository } from '@/server/db/index.js';
import { hashPassword, signToken } from '@/server/utils/auth.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nim: z.string().optional(),
  name: z.string().optional(),
  fullName: z.string().optional(),
  studyProgram: z.string().optional(),
  university: z.string().optional(),
  semester: z.string().optional(),
  domicile: z.string().optional()
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi formulir gagal', 400, errors);
    }

    const { email, password, nim, name, fullName, studyProgram, university, semester, domicile } = parseResult.data;
    const finalFullName = (fullName || name || '').trim();

    if (!finalFullName) {
      return errorResponse('Nama lengkap wajib diisi', 400, [
        { field: 'fullName', issue: 'Nama lengkap wajib diisi' }
      ]);
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await dbRepository.findUserByEmail(cleanEmail);
    if (existingUser) {
      return errorResponse('Email sudah terdaftar dalam sistem', 409);
    }

    const finalNim = (nim && nim.trim().length >= 5) 
      ? nim.trim() 
      : `2026${String(Date.now()).slice(-7)}`;

    const passwordHash = await hashPassword(password);
    const newUser = await dbRepository.createUser({
      email: cleanEmail,
      passwordHash,
      role: 'STUDENT',
      studentData: {
        nim: finalNim,
        fullName: finalFullName,
        studyProgram: studyProgram || 'Teknologi Informasi',
        university: university || 'Universitas Esa Unggul',
        semester: semester || 'Semester 7',
        domicile: domicile || 'Jakarta, Indonesia'
      }
    });

    const token = signToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const response = successResponse(
      {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          student: newUser.student
        }
      },
      'Pendaftaran berhasil diselesaikan',
      201
    );

    // Set HTTP cookies for Next.js middleware route guard
    const userRole = String(newUser.role).toLowerCase();
    response.cookies.set({
      name: 'careerpath-token',
      value: token,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    });
    response.cookies.set({
      name: 'careerpath-role',
      value: userRole,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    return errorResponse(error.message || 'Terjadi kesalahan pada server saat registrasi', 500);
  }
}
