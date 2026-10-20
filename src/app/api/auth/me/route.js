import { authenticate } from '@/server/utils/routeMiddleware.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    return successResponse(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        student: user.student
      },
      'Profil pengguna berhasil dimuat'
    );
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat profil pengguna', 500);
  }
}
