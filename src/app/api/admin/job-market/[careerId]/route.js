import { z } from 'zod';
import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

const jobMarketSchema = z.object({
  marketDemandScore: z.number().min(0).max(100).optional(),
  vacancyCount: z.number().min(0).optional(),
  trendStatus: z.string().optional(),
  primaryLocation: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  shortNote: z.string().optional()
});

export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const { careerId } = await params;
    const body = await request.json();
    const parseResult = jobMarketSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi data pasar kerja gagal', 400, errors);
    }

    const updated = await dbRepository.updateJobMarket(careerId, parseResult.data);
    if (!updated) {
      return errorResponse('Karir tidak ditemukan', 404);
    }

    return successResponse(updated, 'Data pasar kerja (Kriteria C3) berhasil diperbarui');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memperbarui pasar kerja karir', 500);
  }
}
