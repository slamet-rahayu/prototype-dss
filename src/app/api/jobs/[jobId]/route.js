import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';
import { mapJobToDssCareer } from '@/services/jobPortalService.js';
import { JOB_VACANCIES } from '@/data/jobVacancies.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { jobId } = await params;
    if (!jobId) {
      return errorResponse('jobId parameter is required', 400);
    }

    const portalBaseUrl = 
      process.env.JOB_PORTAL_API || 
      process.env.JOB_PORTAL || 
      process.env.NEXT_PUBLIC_JOB_PORTAL_API;

    if (portalBaseUrl) {
      try {
        const cleanBase = portalBaseUrl.replace(/\/+$/, '');
        const targetUrl = `${cleanBase}/${encodeURIComponent(jobId)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          const job = json?.data || json;
          return successResponse({
            ...job,
            id: job.jobId || job.id,
            careerName: job.careerName || mapJobToDssCareer(job)
          }, 'Detail lowongan berhasil dimuat dari Job Portal API', 200);
        } else if (response.status === 404) {
          return errorResponse(`Lowongan dengan ID '${jobId}' tidak ditemukan`, 404);
        }
      } catch (externalErr) {
        console.warn('Gagal memuat detail dari external JOB_PORTAL_API:', externalErr.message);
      }
    }

    // Fallback: search in local mock data
    const localJob = JOB_VACANCIES.find(j => j.id === jobId || j.jobId === jobId);
    if (localJob) {
      return successResponse(localJob, 'Detail lowongan dimuat dari fallback lokal', 200);
    }

    return errorResponse(`Lowongan dengan ID '${jobId}' tidak ditemukan`, 404);
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat detail lowongan', 500);
  }
}
