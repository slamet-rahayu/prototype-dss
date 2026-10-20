import { z } from 'zod';
import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const sawConfigSchema = z.object({
  c1Weight: z.number().min(0).max(100),
  c2Weight: z.number().min(0).max(100),
  c3Weight: z.number().min(0).max(100)
}).refine(data => Math.round(data.c1Weight + data.c2Weight + data.c3Weight) === 100, {
  message: 'Total akumulasi bobot C1, C2, dan C3 harus bernilai tepat 100%'
});

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN', 'STUDENT']);
    if (roleErr) return roleErr;

    const config = await dbRepository.getSawConfig();
    return successResponse(config, 'Konfigurasi bobot SAW berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat konfigurasi SAW', 500);
  }
}

export async function PUT(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const body = await request.json();
    const parseResult = sawConfigSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi bobot SAW gagal', 400, errors);
    }

    const updated = await dbRepository.updateSawConfig({
      ...parseResult.data,
      updatedBy: user.email
    });

    return successResponse(updated, 'Konfigurasi bobot kriteria SAW berhasil diperbarui');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memperbarui konfigurasi SAW', 500);
  }
}
