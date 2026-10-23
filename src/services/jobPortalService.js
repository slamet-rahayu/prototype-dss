/**
 * Service for consuming the External Job Portal API.
 * 
 * Endpoints:
 * - All jobs: /
 * - Search with keyword: ?search=
 * - Job detail: /(jobId)
 */

export function getJobPortalApiBaseUrl() {
  const envUrl = 
    process.env.NEXT_PUBLIC_JOB_PORTAL_API ||
    process.env.JOB_PORTAL_API ||
    process.env.JOB_PORTAL;

  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // Fallback to local Next.js proxy route
  return '/api/jobs';
}

/**
 * Fetch all jobs or search jobs by keyword from the Job Portal API.
 * @param {string} search - Optional search keyword
 * @returns {Promise<{ items: Array, total: number, count: number, provider: string, query: string }>}
 */
export async function fetchJobsFromPortal(search = '') {
  const baseUrl = getJobPortalApiBaseUrl();
  const trimmed = (search || '').trim();
  const url = trimmed 
    ? `${baseUrl}?search=${encodeURIComponent(trimmed)}`
    : baseUrl;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari Job Portal API (${res.status} ${res.statusText})`);
  }

  const json = await res.json();

  // If response has the standard { project, data: { items: [...], total, count } }
  if (json?.data?.items && Array.isArray(json.data.items)) {
    return {
      items: json.data.items,
      total: json.data.total ?? json.data.items.length,
      count: json.data.count ?? json.data.items.length,
      provider: json.data.provider || 'jobstreet',
      query: json.data.query || (trimmed || 'all')
    };
  }

  // If proxy /api/jobs wrapped it in { success: true, data: [...] }
  if (json?.data && Array.isArray(json.data)) {
    return {
      items: json.data,
      total: json.meta?.totalAll ?? json.data.length,
      count: json.meta?.filteredCount ?? json.data.length,
      provider: 'jobstreet',
      query: trimmed || 'all'
    };
  }

  // If directly an array
  if (Array.isArray(json)) {
    return {
      items: json,
      total: json.length,
      count: json.length,
      provider: 'jobstreet',
      query: trimmed || 'all'
    };
  }

  return {
    items: [],
    total: 0,
    count: 0,
    provider: 'jobstreet',
    query: trimmed || 'all'
  };
}

/**
 * Fetch single job detail by jobId from the Job Portal API.
 * @param {string|number} jobId - Target job id
 * @returns {Promise<Object>} Job detail object
 */
export async function fetchJobDetailFromPortal(jobId) {
  if (!jobId) {
    throw new Error('jobId wajib disertakan');
  }

  const baseUrl = getJobPortalApiBaseUrl();
  const url = `${baseUrl}/${encodeURIComponent(jobId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Lowongan dengan ID '${jobId}' tidak ditemukan.`);
    }
    throw new Error(`Gagal memuat detail lowongan (${res.status} ${res.statusText})`);
  }

  const json = await res.json();
  // If wrapped in data property
  if (json?.data && !Array.isArray(json.data) && typeof json.data === 'object') {
    return json.data;
  }
  return json;
}

/**
 * Helper: Extract company display name safely.
 */
export function getCompanyName(job) {
  if (!job) return 'Perusahaan Mitra';
  if (typeof job.company === 'string') return job.company;
  return job.company?.name || job.company?.advertiserName || 'Perusahaan Mitra';
}

/**
 * Helper: Extract initials for company badge (e.g. "PT Cashlez Worldwide" -> "CW").
 */
export function getCompanyInitials(name) {
  if (!name || typeof name !== 'string') return 'IT';
  const clean = name.replace(/^(PT|CV|PT\.|CV\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Helper: Extract location display string safely.
 */
export function getLocationText(job) {
  if (!job) return 'Indonesia';
  if (typeof job.location === 'string') return job.location;
  if (!job.location) return 'Indonesia';

  const parts = [job.location.city, job.location.region].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  return job.location.country || 'Indonesia';
}

/**
 * Helper: Format salary range safely into readable text.
 */
export function getSalaryDisplay(salary) {
  if (!salary) return null;
  if (typeof salary === 'string') return salary;
  if (salary.display) {
    // Normalize any corrupted characters like RpA, ?, en-dash, and translations
    return salary.display
      .replace(/RpA\S*/g, 'Rp ')
      .replace(/[?]+/g, '-')
      .replace(/–/g, '-')
      .replace(/per month/i, '/ bln')
      .replace(/per year/i, '/ thn')
      .trim();
  }

  const min = Number(salary.min);
  const max = Number(salary.max);

  if (min > 0 && max > 0) {
    const minJt = (min / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 });
    const maxJt = (max / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 });
    return `Rp ${minJt} - ${maxJt} Jt / bln`;
  }
  if (min > 0) {
    const minJt = (min / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 });
    return `Mulai Rp ${minJt} Jt / bln`;
  }

  return null;
}

/**
 * Helper: Format posted date into friendly relative or localized date.
 */
export function formatPostedDate(isoString) {
  if (!isoString) return 'Baru ditayangkan';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Baru ditayangkan';
  }
}

/**
 * Helper: Map external job attributes to one of the 9 DSS IT Career paths.
 * Careers:
 * 1. Software Engineer
 * 2. Data Analyst
 * 3. Cybersecurity Analyst
 * 4. Business Analyst
 * 5. UI/UX Designer
 * 6. DevOps Engineer
 * 7. Quality Assurance Engineer
 * 8. Database Administrator
 * 9. Network Administrator
 */
export function mapJobToDssCareer(job) {
  if (!job) return 'Software Engineer';
  if (job.careerName) return job.careerName;

  const fn = String(job.function || '').toLowerCase();
  const title = String(job.title || '').toLowerCase();
  const desc = String(job.description || '').toLowerCase();
  const roles = (job.roleTitles || []).map(r => String(r).toLowerCase());
  const combined = `${fn} ${title} ${desc} ${roles.join(' ')}`;

  if (combined.includes('qa') || combined.includes('quality assurance') || combined.includes('tester') || combined.includes('testing')) {
    return 'Quality Assurance Engineer';
  }
  if (combined.includes('devops') || combined.includes('sre') || combined.includes('site reliability') || combined.includes('cloud engineer') || combined.includes('infrastructure engineer')) {
    return 'DevOps Engineer';
  }
  if (combined.includes('security') || combined.includes('cyber') || combined.includes('soc analyst') || combined.includes('infosec') || combined.includes('penetration')) {
    return 'Cybersecurity Analyst';
  }
  if (combined.includes('ui/ux') || combined.includes('ux/ui') || combined.includes('product designer') || combined.includes('interaction design') || combined.includes('ui designer') || combined.includes('ux designer') || combined.includes('graphic') || combined.includes('figma')) {
    return 'UI/UX Designer';
  }
  if (combined.includes('database administrator') || combined.includes('dba') || combined.includes('database development & administration')) {
    return 'Database Administrator';
  }
  if (combined.includes('network') || combined.includes('networks & systems administration') || combined.includes('jaringan') || combined.includes('telecommunication') || combined.includes('routing')) {
    return 'Network Administrator';
  }
  if (combined.includes('business analyst') || combined.includes('analis bisnis')) {
    return 'Business Analyst';
  }
  if (combined.includes('data analyst') || combined.includes('business intelligence') || combined.includes('bi analyst') || combined.includes('data science') || combined.includes('data engineer') || combined.includes('data processing')) {
    return 'Data Analyst';
  }
  if (combined.includes('software') || combined.includes('developer') || combined.includes('programmer') || combined.includes('full stack') || combined.includes('frontend') || combined.includes('backend') || combined.includes('web') || combined.includes('mobile') || combined.includes('react') || combined.includes('golang') || combined.includes('java') || combined.includes('architect')) {
    return 'Software Engineer';
  }

  // Fallback based on function category
  if (fn.includes('analyst')) return 'Business Analyst';
  if (fn.includes('design')) return 'UI/UX Designer';
  if (fn.includes('network')) return 'Network Administrator';
  if (fn.includes('security')) return 'Cybersecurity Analyst';

  return 'Software Engineer';
}
