import { JOB_VACANCIES, queryJobVacancies } from '@/data/jobVacancies.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';
import { mapJobToDssCareer } from '@/services/jobPortalService.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const career = searchParams.get('career') || '';
    const workModel = searchParams.get('workModel') || '';

    const portalBaseUrl = 
      process.env.JOB_PORTAL_API || 
      process.env.JOB_PORTAL || 
      process.env.NEXT_PUBLIC_JOB_PORTAL_API;

    if (portalBaseUrl) {
      try {
        const cleanBase = portalBaseUrl.replace(/\/+$/, '');
        const targetUrl = search.trim()
          ? `${cleanBase}?search=${encodeURIComponent(search.trim())}`
          : cleanBase;

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
          let rawItems = [];
          let totalCount = 0;

          if (json?.data?.items && Array.isArray(json.data.items)) {
            rawItems = json.data.items;
            totalCount = json.data.total ?? rawItems.length;
          } else if (Array.isArray(json?.data)) {
            rawItems = json.data;
            totalCount = rawItems.length;
          } else if (Array.isArray(json)) {
            rawItems = json;
            totalCount = rawItems.length;
          }

          // Augment with mapped careerName for DSS integration
          const enhancedItems = rawItems.map(item => ({
            ...item,
            id: item.jobId || item.id,
            careerName: item.careerName || mapJobToDssCareer(item)
          }));

          // Compute career counts
          const careerCounts = {};
          enhancedItems.forEach(job => {
            careerCounts[job.careerName] = (careerCounts[job.careerName] || 0) + 1;
          });

          return successResponse(enhancedItems, 'Data lowongan kerja berhasil dimuat dari Job Portal API', 200, {
            totalAll: totalCount,
            filteredCount: enhancedItems.length,
            provider: json?.data?.provider || 'jobstreet',
            query: search || 'all',
            careerCounts
          });
        }
      } catch (externalErr) {
        console.warn('Gagal menghubungi external JOB_PORTAL_API, menggunakan fallback:', externalErr.message);
      }
    }

    // Fallback: in-memory mock vacancies
    const vacancies = queryJobVacancies({
      career,
      search,
      workModel
    });

    return successResponse(vacancies, 'Data lowongan kerja dimuat dari basis data lokal fallback', 200, {
      totalAll: JOB_VACANCIES.length,
      filteredCount: vacancies.length
    });
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat lowongan kerja', 500);
  }
}
