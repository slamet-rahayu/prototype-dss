import { extractBearerToken, verifyToken } from './auth.js';
import { dbRepository } from '../db/index.js';
import { errorResponse } from './apiResponse.js';

/**
 * Authenticates an incoming Next.js API Request via Bearer JWT.
 * Returns { user, student } or an errorResponse.
 * @param {Request} request 
 */
export async function authenticate(request) {
  const token = extractBearerToken(request);

  if (!token) {
    return {
      user: null,
      error: errorResponse('Akses ditolak. Token otentikasi tidak ditemukan.', 401)
    };
  }

  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return {
      user: null,
      error: errorResponse('Token otentikasi kedaluwarsa atau tidak valid.', 403)
    };
  }

  const user = await dbRepository.findUserById(payload.sub);
  if (!user) {
    return {
      user: null,
      error: errorResponse('Pengguna tidak ditemukan atau token tidak lagi valid.', 401)
    };
  }

  return { user, error: null };
}

/**
 * Checks if the user has one of the allowed roles (case-insensitive).
 * @param {Object} user 
 * @param {Array<string>|string} allowedRoles 
 */
export function authorizeRole(user, allowedRoles) {
  if (!user || !user.role) {
    return errorResponse('Akses terlarang: Anda belum terautentikasi atau data peran tidak ditemukan.', 401);
  }

  const userRole = String(user.role).toUpperCase();
  const normalizedAllowed = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles])
    .map(r => String(r).toUpperCase());

  if (!normalizedAllowed.includes(userRole)) {
    const roleLabels = {
      'ADMIN': 'Administrator',
      'STUDENT': 'Mahasiswa'
    };
    const requiredLabels = normalizedAllowed.map(r => roleLabels[r] || r).join(' atau ');
    const currentLabel = roleLabels[userRole] || userRole;

    return errorResponse(
      `Akses terlarang: Akun Anda memiliki peran ${currentLabel}. Aksi ini hanya dapat diakses oleh peran ${requiredLabels}.`,
      403
    );
  }

  return null;
}

/**
 * Ensures and retrieves the Student record for a given User.
 * @param {Object} user 
 */
export async function getStudentForUser(user) {
  if (user?.student?.id) return user.student;
  try {
    const student = await dbRepository.prisma?.student?.findUnique({ where: { userId: user.id } });
    if (student) return student;

    if (user.role === 'STUDENT') {
      const created = await dbRepository.prisma?.student?.create({
        data: {
          userId: user.id,
          nim: `2026${String(Date.now()).slice(-7)}`,
          fullName: user.email.split('@')[0],
          studyProgram: 'Teknologi Informasi',
          semester: 'Semester 7'
        }
      });
      return created;
    }
  } catch {
    // Fallback
  }
  return user?.student || { id: user.id, userId: user.id, fullName: user.email };
}
