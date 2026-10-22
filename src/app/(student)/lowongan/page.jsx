"use client";

import React, { useContext, useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import {
  fetchJobsFromPortal,
  fetchJobDetailFromPortal,
  getCompanyName,
  getCompanyInitials,
  getLocationText,
  getSalaryDisplay,
  formatPostedDate,
  mapJobToDssCareer
} from '@/services/jobPortalService';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { Skeleton, CardGridSkeleton } from '@/components/Skeleton';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  X,
  CheckCircle2,
  Info,
  ChevronRight,
  ChevronLeft,
  Filter,
  AlertCircle,
  Tag,
  Flame,
  Globe2,
  RefreshCw
} from 'lucide-react';

const ALL_CAREER_NAMES = [
  "Semua Karir",
  "Software Engineer",
  "Data Analyst",
  "Cybersecurity Analyst",
  "Business Analyst",
  "UI/UX Designer",
  "DevOps Engineer",
  "Quality Assurance Engineer",
  "Database Administrator",
  "Network Administrator"
];

const ITEMS_PER_PAGE = 10;

function JobMarketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sawResults, careers } = useContext(AppContext);

  const initialCareerParam = searchParams.get('career') || 'Semua Karir';

  // State
  const [jobList, setJobList] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(initialCareerParam);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [selectedWorkModel, setSelectedWorkModel] = useState('Semua');
  const [selectedEmpType, setSelectedEmpType] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorNotice, setErrorNotice] = useState(null);

  // Modal detail states
  const [activeJobModal, setActiveJobModal] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Sync if career query param changes from external link
  useEffect(() => {
    const param = searchParams.get('career');
    if (param && ALL_CAREER_NAMES.includes(param)) {
      setSelectedCareer(param);
    }
  }, [searchParams]);

  // Fetch jobs from Portal API (all jobs or keyword search)
  const loadJobs = async (searchKeyword = '') => {
    try {
      if (searchKeyword) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      setErrorNotice(null);

      const result = await fetchJobsFromPortal(searchKeyword);
      const items = (result.items || []).map(item => ({
        ...item,
        id: item.jobId || item.id,
        careerName: item.careerName || mapJobToDssCareer(item)
      }));

      setJobList(items);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching jobs from portal:', err);
      setErrorNotice(err.message || 'Gagal memuat lowongan kerja dari portal API.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Initial load: fetch all jobs (endpoint: /)
  useEffect(() => {
    loadJobs('');
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    setActiveSearchQuery(query);
    loadJobs(query);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearchQuery('');
    loadJobs('');
  };

  // Top recommended career from SAW if available
  const topRecommendedCareer = sawResults && sawResults.length > 0 ? sawResults[0].name : null;

  // Filtered jobs calculation (applies secondary in-memory filters like career, work arrangement, and employment type)
  const filteredJobs = useMemo(() => {
    return jobList.filter(job => {
      // Filter by Career Path
      if (selectedCareer !== 'Semua Karir') {
        const target = selectedCareer.toLowerCase().trim();
        const career = (job.careerName || '').toLowerCase().trim();
        const matchesCareer = career === target || career.includes(target) || target.includes(career);
        if (!matchesCareer) return false;
      }

      // Filter by Work Arrangement / Model
      if (selectedWorkModel !== 'Semua') {
        const arrangement = String(job.workArrangement || (job.isRemote ? 'Remote' : job.isHybrid ? 'Hybrid' : 'On-site')).toLowerCase();
        if (arrangement !== selectedWorkModel.toLowerCase()) return false;
      }

      // Filter by Employment Type
      if (selectedEmpType !== 'Semua') {
        const empType = String(job.employmentType || '').toLowerCase();
        if (!empType.includes(selectedEmpType.toLowerCase())) return false;
      }

      return true;
    });
  }, [jobList, selectedCareer, selectedWorkModel, selectedEmpType]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  // Market metrics computed from current catalog
  const marketMetrics = useMemo(() => {
    const totalJobs = jobList.length;
    const remoteCount = jobList.filter(j => j.isRemote || j.isHybrid || j.workArrangement === 'Remote' || j.workArrangement === 'Hybrid').length;
    const remotePct = totalJobs > 0 ? Math.round((remoteCount / totalJobs) * 100) : 0;
    const uniqueCompanies = new Set(jobList.map(j => getCompanyName(j))).size;

    return {
      totalJobs,
      remotePct,
      uniqueCompanies
    };
  }, [jobList]);

  // Load Job Detail from API (endpoint: /(jobId))
  const handleOpenJobDetail = async (job) => {
    setActiveJobModal(job);
    setIsDetailLoading(true);

    try {
      const detailedData = await fetchJobDetailFromPortal(job.jobId || job.id);
      setActiveJobModal({
        ...job,
        ...detailedData,
        careerName: detailedData.careerName || job.careerName || mapJobToDssCareer(detailedData)
      });
    } catch (err) {
      console.warn('Gagal mengambil detail terpisah, menggunakan data dasar:', err.message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleApplyClick = (job) => {
    const targetUrl = job.applyUrl || job.url;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      setToast({
        show: true,
        message: `Tautan lowongan untuk ${job.title} di ${getCompanyName(job)} dialihkan ke portal mitra.`
      });
    }
  };

  const handleClearFilters = () => {
    setSelectedCareer('Semua Karir');
    setSelectedWorkModel('Semua');
    setSelectedEmpType('Semua');
    setSearchInput('');
    setActiveSearchQuery('');
    router.replace('/lowongan');
    loadJobs('');
  };

  const isFilterActive =
    selectedCareer !== 'Semua Karir' ||
    activeSearchQuery.trim() !== '' ||
    selectedWorkModel !== 'Semua' ||
    selectedEmpType !== 'Semua';

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/rekomendasi" className="hover:text-primary transition-colors">Hasil Rekomendasi</Link>
        <span>/</span>
        <span className="text-content-primary font-medium">Lowongan Kerja Pasar TI</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-divider">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Market Monitoring</span>
            </span>
            <span className="text-[11px] font-mono text-content-muted">
              Kriteria C3 (Kebutuhan Pasar)
            </span>
          </div>
          <h1 className="text-2xl sm:text-2.5xl font-bold text-content-primary tracking-tight">
            Eksplorasi Lowongan Kerja TI
          </h1>
          <p className="text-xs text-content-muted mt-1 max-w-3xl leading-relaxed">
            Data pasar industri teknologi informasi terhubung langsung dari live job portal API. Dinamika lowongan ini diintegrasikan sebagai kriteria empiris kebutuhan pasar (C3) pada pemeringkatan Simple Additive Weighting (SAW).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadJobs(activeSearchQuery)}
            disabled={isLoading || isSearching}
            className="px-3 py-1.5 rounded-lg border border-divider hover:bg-subsurface text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Muat ulang data dari API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isSearching ? 'animate-spin text-primary' : ''}`} />
            <span>Sinkronkan API</span>
          </button>
          <Link
            href="/rekomendasi"
            className="px-3 py-1.5 rounded-lg border border-divider hover:bg-subsurface text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors flex items-center gap-1.5"
          >
            <span>Cek Skor Rekomendasi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Error alert banner if any */}
      {errorNotice && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            onClick={() => loadJobs(activeSearchQuery)}
            className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Active Filter Focus Banner (if filtered by career from recommendation) */}
      {selectedCareer !== 'Semua Karir' && (
        <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              {careers[selectedCareer]?.icon || '⌘'}
            </div>
            <div>
              <div className="text-xs font-semibold text-primary dark:text-sky-300">
                Fokus Karir Terpilih dari Hasil Rekomendasi
              </div>
              <div className="text-sm font-bold text-content-primary">
                {selectedCareer}
                {topRecommendedCareer === selectedCareer && (
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    Peringkat 1 Rekomendasi Anda
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/eksplorasi/${encodeURIComponent(selectedCareer)}`}
              className="px-3 py-1.5 text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <span>Profil Kompetensi</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={() => {
                setSelectedCareer('Semua Karir');
                router.replace('/lowongan');
              }}
              className="px-3 py-1.5 rounded-lg border border-divider bg-surface hover:bg-subsurface text-xs font-semibold text-content-secondary transition-colors"
            >
              Tampilkan Semua Karir
            </button>
          </div>
        </div>
      )}

      {/* High-Level Market Insights Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between text-content-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Posisi</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-content-primary">
            {marketMetrics.totalJobs} <span className="text-xs font-normal text-content-muted">lowongan</span>
          </div>
          <p className="text-[10px] text-content-muted mt-1 truncate">
            Dari live catalog Job Portal API
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-content-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Perusahaan Mitra</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-content-primary">
            {marketMetrics.uniqueCompanies} <span className="text-xs font-normal text-content-muted">korporasi</span>
          </div>
          <p className="text-[10px] text-content-muted mt-1 truncate">
            Perekrut aktif terverifikasi
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-content-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Fleksibilitas Kerja</span>
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-content-primary">
            {marketMetrics.remotePct}% <span className="text-xs font-normal text-content-muted">Remote/Hybrid</span>
          </div>
          <p className="text-[10px] text-content-muted mt-1 truncate">
            Mendukung fleksibilitas kerja
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-content-muted mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Status Integrasi</span>
            <Globe2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm sm:text-base font-mono font-bold text-content-primary truncate flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Portal API</span>
          </div>
          <p className="text-[10px] text-content-muted mt-1 truncate font-mono">
            Provider: JobStreet Engine
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search (API: ?search=) */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari kata kunci lowongan (React, Golang, Data, Security, QA)..."
              className="w-full pl-9 pr-20 py-2 bg-subsurface/60 border border-divider rounded-lg text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary p-1"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-primary hover:bg-primary-dark text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Cari...' : 'Cari'}
            </button>
          </div>

          {/* Work Arrangement Filter */}
          <div className="w-full md:w-44 shrink-0">
            <select
              value={selectedWorkModel}
              onChange={(e) => {
                setSelectedWorkModel(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-subsurface/60 border border-divider rounded-lg text-xs text-content-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Semua">Semua Model Kerja</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Employment Type Filter */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={selectedEmpType}
              onChange={(e) => {
                setSelectedEmpType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 bg-subsurface/60 border border-divider rounded-lg text-xs text-content-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Semua">Semua Tipe Kerja</option>
              <option value="Full time">Full time</option>
              <option value="Contract">Kontrak / Temp</option>
              <option value="Part time">Part time</option>
            </select>
          </div>
        </form>

        {/* Career Horizontal Category Pills */}
        <div className="mt-3.5 pt-3 border-t border-divider flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Karir:</span>
          </span>
          {ALL_CAREER_NAMES.map((name) => {
            const isSelected = selectedCareer === name;
            const isTopMatch = name === topRecommendedCareer;
            return (
              <button
                key={name}
                onClick={() => {
                  setSelectedCareer(name);
                  setCurrentPage(1);
                  if (name === 'Semua Karir') {
                    router.replace('/lowongan');
                  } else {
                    router.replace(`/lowongan?career=${encodeURIComponent(name)}`);
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium transition-colors duration-150 shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-subsurface hover:bg-subsurface/80 text-content-secondary hover:text-content-primary border border-divider'
                }`}
              >
                <span>{name}</span>
                {isTopMatch && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} title="Rekomendasi Utama" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Filter State Summary & Reset */}
        <div className="mt-3 flex items-center justify-between text-xs text-content-muted">
          <span>
            {activeSearchQuery && (
              <span className="mr-2">
                Pencarian: <strong className="text-content-primary font-mono">&quot;{activeSearchQuery}&quot;</strong> |
              </span>
            )}
            Menampilkan <strong className="font-mono text-content-primary">{filteredJobs.length}</strong> lowongan dari total <span className="font-mono">{jobList.length}</span>
          </span>
          {isFilterActive && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>
      </Card>

      {/* Main Job Listing Grid */}
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : filteredJobs.length === 0 ? (
        <Card className="p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-subsurface text-content-muted flex items-center justify-center mx-auto mb-3 border border-divider">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-content-primary mb-1">
            Tidak Ada Lowongan yang Cocok
          </h3>
          <p className="text-xs text-content-muted leading-relaxed mb-4">
            Tidak ditemukan lowongan dengan kata kunci atau filter saat ini dari Job Portal API. Silakan ubah kata kunci pencarian atau reset filter.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-primary text-white font-semibold text-xs rounded-lg hover:bg-primary-dark transition-colors"
          >
            Reset Semua Filter
          </button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {paginatedJobs.map((job) => {
              const companyName = getCompanyName(job);
              const companyInitials = getCompanyInitials(companyName);
              const locationText = getLocationText(job);
              const salaryText = getSalaryDisplay(job.salary);
              const postedDateText = formatPostedDate(job.postedAt);
              const isTopCareer = topRecommendedCareer && topRecommendedCareer === job.careerName;

              const workModel = job.workArrangement || (job.isRemote ? 'Remote' : job.isHybrid ? 'Hybrid' : 'On-site');

              return (
                <Card 
                  key={job.jobId || job.id} 
                  className="p-5 flex flex-col justify-between hover:border-primary/50 transition-all duration-150 group"
                >
                  <div>
                    {/* Card Header: Company, Location, and Work Arrangement */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-divider">
                          {companyInitials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-content-muted truncate">
                            {companyName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-content-secondary mt-0.5">
                            <MapPin className="w-3 h-3 text-content-muted shrink-0" />
                            <span className="truncate">{locationText}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          workModel === 'Remote' || job.isRemote
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : workModel === 'Hybrid' || job.isHybrid
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                            : 'bg-subsurface text-content-secondary border border-divider'
                        }`}>
                          {workModel}
                        </span>
                        <span className="text-[10px] font-mono text-content-muted">
                          {postedDateText}
                        </span>
                      </div>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-sm sm:text-base font-bold text-content-primary group-hover:text-primary transition-colors leading-snug mb-1.5">
                      {job.title}
                    </h3>

                    {/* Career Badge, Employment Type, and Match Indicator */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-subsurface text-content-secondary border border-divider">
                        {job.careerName}
                      </span>
                      {job.employmentType && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-subsurface text-content-muted border border-divider flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{job.employmentType}</span>
                        </span>
                      )}
                      {job.isUrgent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20 flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" />
                          <span>Urgent Hiring</span>
                        </span>
                      )}
                      {isTopCareer && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Kesesuaian Rank 1</span>
                        </span>
                      )}
                    </div>

                    {/* Salary Estimate / Display */}
                    {salaryText && (
                      <div className="mb-3 p-2 rounded-lg bg-subsurface/60 border border-divider flex items-center justify-between text-xs">
                        <span className="text-[11px] text-content-muted">
                          {job.salary?.shown ? 'Kompensasi Perekrut:' : 'Estimasi Kompensasi:'}
                        </span>
                        <span className="font-mono font-bold text-content-primary">
                          {salaryText}
                        </span>
                      </div>
                    )}

                    {/* Snippet Description */}
                    {job.description && (
                      <p className="text-xs text-content-muted leading-relaxed line-clamp-2 mb-3.5">
                        {job.description}
                      </p>
                    )}

                    {/* Role Titles / Categories Tags */}
                    {((job.roleTitles && job.roleTitles.length > 0) || (job.categories && job.categories.length > 0)) && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(job.roleTitles || job.categories?.map(c => c.label) || []).slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-subsurface text-content-secondary border border-divider"
                          >
                            {typeof tag === 'string' ? tag.replace(/[-_]/g, ' ') : tag.label}
                          </span>
                        ))}
                        {(job.roleTitles || []).length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-content-muted">
                            +{(job.roleTitles.length - 3)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Buttons */}
                  <div className="pt-3 border-t border-divider flex items-center justify-between gap-2 mt-auto">
                    <span className="text-[10px] text-content-muted flex items-center gap-1 font-mono">
                      <span>ID:</span>
                      <strong className="text-content-secondary">{job.jobId || job.id}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenJobDetail(job)}
                        className="px-3 py-1.5 rounded-lg border border-divider hover:bg-subsurface text-content-primary font-semibold text-xs transition-colors flex items-center gap-1"
                      >
                        <span>Detail Lowongan</span>
                      </button>
                      <button
                        onClick={() => handleApplyClick(job)}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <span>Lamar</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mb-8 p-3 rounded-xl border border-divider bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-content-muted">
                Halaman <strong className="text-content-primary font-mono">{currentPage}</strong> dari <strong className="text-content-primary font-mono">{totalPages}</strong> ({filteredJobs.length} total posisi)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-md border border-divider hover:bg-subsurface text-content-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-md font-mono text-xs font-semibold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-white shadow-xs'
                            : 'hover:bg-subsurface text-content-secondary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-md border border-divider hover:bg-subsurface text-content-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Connection with SPK Methodology Advisory */}
      <Card className="p-5 bg-subsurface/40 mb-8 border border-divider">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-content-primary mb-0.5">
              Hubungan Pasar Kerja dengan Sistem Pendukung Keputusan (SAW)
            </h4>
            <p className="text-xs text-content-muted leading-relaxed">
              Kriteria C3 (Kebutuhan Pasar) pada sistem ini merefleksikan dinamika volume lowongan dan keterampilan yang paling banyak dicari oleh industri di Indonesia. Kebutuhan pasar kerja dikombinasikan dengan minat RIASEC (C1) dan nilai akademik mahasiswa (C2) untuk menghasilkan rekomendasi karir yang seimbang antara passion, kompetensi, dan peluang kerja nyata.
            </p>
          </div>
        </div>
      </Card>

      {/* Detail Job Modal (Loaded via API /(jobId)) */}
      {activeJobModal && (
        <Modal
          isOpen={!!activeJobModal}
          title={activeJobModal.title}
          onClose={() => setActiveJobModal(null)}
          maxWidth="max-w-2xl"
        >
          {isDetailLoading ? (
            <div className="py-12 space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-5 text-xs text-content-secondary leading-relaxed">
              {/* Header Company & Meta */}
              <div className="p-4 rounded-xl bg-subsurface/60 border border-divider flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border border-divider">
                    {getCompanyInitials(getCompanyName(activeJobModal))}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-content-primary">
                        {getCompanyName(activeJobModal)}
                      </h4>
                      {activeJobModal.company?.profileUrl && (
                        <a
                          href={activeJobModal.company.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-[11px] flex items-center gap-0.5"
                        >
                          <span>Profil Perusahaan</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {getLocationText(activeJobModal)}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-primary">
                        {activeJobModal.workArrangement || (activeJobModal.isRemote ? 'Remote' : activeJobModal.isHybrid ? 'Hybrid' : 'On-site')}
                      </span>
                      {activeJobModal.employmentType && (
                        <>
                          <span>•</span>
                          <span>{activeJobModal.employmentType}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] text-content-muted block">
                    {activeJobModal.salary?.shown ? 'Kompensasi Perekrut:' : 'Estimasi Gaji:'}
                  </span>
                  <span className="text-sm font-mono font-bold text-content-primary">
                    {getSalaryDisplay(activeJobModal.salary) || 'Kompensasi Kompetitif'}
                  </span>
                </div>
              </div>

              {/* SAW Alignment Card */}
              <div className="p-3.5 rounded-lg border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-content-primary block mb-0.5 text-xs">
                    Relevansi Kriteria SAW ({activeJobModal.careerName})
                  </span>
                  <p className="text-[11px] text-content-muted leading-relaxed">
                    Posisi ini berkontribusi pada perhitungan Kriteria C3 (Kebutuhan Pasar Kerja). Mahasiswa yang memiliki minat dominan dan capaian akademik terkait bidang {activeJobModal.careerName} diprioritaskan dalam pemeringkatan alternatif karir.
                  </p>
                </div>
              </div>

              {/* Industry Function & Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-subsurface/40 border border-divider">
                <div>
                  <span className="text-[10px] text-content-muted block uppercase tracking-wider font-semibold">
                    Fungsi Pekerjaan
                  </span>
                  <span className="text-xs font-semibold text-content-primary">
                    {activeJobModal.function || 'Information Technology'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-content-muted block uppercase tracking-wider font-semibold">
                    Klasifikasi Industri
                  </span>
                  <span className="text-xs font-semibold text-content-primary">
                    {activeJobModal.classification || 'Information & Communication Technology'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="font-bold text-content-primary mb-1.5 text-xs uppercase tracking-wider">
                  Deskripsi Lowongan
                </h5>
                <p className="text-content-secondary leading-relaxed whitespace-pre-line">
                  {activeJobModal.description || 'Tidak ada deskripsi rinci yang tersedia.'}
                </p>
              </div>

              {/* Role Titles / Keywords */}
              {activeJobModal.roleTitles && activeJobModal.roleTitles.length > 0 && (
                <div>
                  <h5 className="font-bold text-content-primary mb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span>Kata Kunci & Peran Terkait</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJobModal.roleTitles.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-subsurface text-content-primary border border-divider"
                      >
                        {String(role).replace(/[-_]/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {activeJobModal.categories && activeJobModal.categories.length > 0 && (
                <div>
                  <h5 className="font-bold text-content-primary mb-1.5 text-xs uppercase tracking-wider">
                    Kategori Terdaftar
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJobModal.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs bg-subsurface text-content-secondary border border-divider"
                      >
                        {cat.label || cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-divider flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href={`/eksplorasi/${encodeURIComponent(activeJobModal.careerName)}`}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-divider hover:bg-subsurface text-content-primary text-xs font-semibold transition-colors text-center"
                >
                  Lihat Profil Karir ({activeJobModal.careerName})
                </Link>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {activeJobModal.url && (
                    <a
                      href={activeJobModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2 rounded-lg border border-divider hover:bg-subsurface text-content-secondary text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Buka di JobStreet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      handleApplyClick(activeJobModal);
                    }}
                    className="w-full sm:w-auto px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Lamar Sekarang</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <footer className="pt-6 pb-2 border-t border-divider text-center text-xs text-content-muted font-mono">
        CareerPath TI: Modul Pemantauan Pasar Kerja (Live JobStreet API Integration)
      </footer>
    </main>
  );
}

export default function JobMarketPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <CardGridSkeleton count={6} />
        </main>
      }
    >
      <JobMarketContent />
    </Suspense>
  );
}
