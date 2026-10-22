import { z } from 'zod';
import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

const careerCreateSchema = z.object({
  title: z.string().min(2, 'Nama karir wajib diisi'),
  slug: z.string().min(2, 'Slug karir wajib diisi').optional(),
  subtitle: z.string().optional(),
  description: z.string().min(5, 'Deskripsi karir wajib diisi'),
  icon: z.string().optional(),
  jobMarketKeyword: z.string().optional(),
  marketDemandScore: z.number().min(0).max(100).optional(),
  riasecWeights: z.array(
    z.object({
      dimension: z.enum(['R', 'I', 'A', 'S', 'E', 'C']),
      weight: z.number().min(0).max(100)
    })
  ).optional(),
  academicWeights: z.array(
    z.object({
      subjectId: z.number().optional(),
      subjectName: z.string().optional(),
      weight: z.number().min(0).max(100)
    })
  ).optional(),
  marketDetail: z.object({
    jobMarketKeyword: z.string().optional(),
    vacancyCount: z.number().optional(),
    trendStatus: z.string().optional(),
    primaryLocation: z.string().optional(),
    requiredSkills: z.array(z.string()).optional(),
    shortNote: z.string().optional()
  }).optional()
});

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const careers = await dbRepository.getCareers();
    return successResponse(careers, 'Master data karir berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat master karir', 500);
  }
}

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const body = await request.json();
    const parseResult = careerCreateSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.message
      }));
      return errorResponse('Validasi penambahan karir gagal', 400, errors);
    }

    const data = parseResult.data;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newCareer = {
      id: `car-${Date.now()}`,
      slug,
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description,
      icon: data.icon || '⌘',
      jobMarketKeyword: data.jobMarketKeyword || data.marketDetail?.jobMarketKeyword || data.title,
      marketDemandScore: data.marketDemandScore || 80,
      riasecWeights: data.riasecWeights || [],
      academicWeights: data.academicWeights || [],
      marketDetail: data.marketDetail || {
        jobMarketKeyword: data.jobMarketKeyword || data.marketDetail?.jobMarketKeyword || data.title,
        vacancyCount: 100,
        trendStatus: 'Tren stabil',
        primaryLocation: 'Jakarta & Remote',
        requiredSkills: []
      }
    };

    // Save
    const existing = await dbRepository.getCareerById(slug);
    if (existing) {
      return errorResponse('Karir dengan slug atau judul tersebut sudah ada', 409);
    }

    const created = await dbRepository.updateCareer(newCareer.id, newCareer);
    return successResponse(created || newCareer, 'Karir baru berhasil ditambahkan', 201);
  } catch (error) {
    return errorResponse(error.message || 'Gagal menambahkan karir baru', 500);
  }
}
