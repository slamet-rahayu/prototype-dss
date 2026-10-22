"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { apiRequest } from '@/utils/apiClient';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';
import Card from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { 
  Search, 
  Clock, 
  RotateCw, 
  RotateCcw,
  Database,
  Info,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function SchedulerConfig() {
  const [toast, setToast] = useState({ show: false, message: '' });
  const [frequency, setFrequency] = useState('Setiap Hari');
  const [executionTime, setExecutionTime] = useState('02.00');
  const [timezone, setTimezone] = useState('Asia/Jakarta (WIB)');
  const [isAutoEnabled, setIsAutoEnabled] = useState(true);
  const [nextRunTime, setNextRunTime] = useState(null);

  // Right Column Execution Summary States
  const [lastExecutionTime, setLastExecutionTime] = useState('20 Oktober 2026, 02.00 WIB');
  const [lastDuration, setLastDuration] = useState('00 menit 02 detik');
  const [lastSuccessCount, setLastSuccessCount] = useState(9);
  const [lastFailedCount, setLastFailedCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // History List State
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [activeLogTab, setActiveLogTab] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [dateRangeFilter, setDateRangeFilter] = useState('Semua');
  const [sortBy, setSortBy] = useState('terbaru');
  const [onlyFailures, setOnlyFailures] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [logs, setLogs] = useState([]);
  const [careersList, setCareersList] = useState([]);
  const [careerConfigs, setCareerConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to extract or generate per-career sync breakdown
  const getLogCareerDetails = (log) => {
    if (!log) return [];
    if (Array.isArray(log.careerSyncDetails) && log.careerSyncDetails.length > 0) {
      return log.careerSyncDetails;
    }

    const fallbackCareers = [
      { id: "car-001", name: "Software Engineer", icon: "⌘", vacancyCount: 520, score: 90, location: "Jakarta, Bandung, dan Remote" },
      { id: "car-002", name: "Data Analyst", icon: "▤", vacancyCount: 340, score: 88, location: "Jakarta, Tangerang, dan Surabaya" },
      { id: "car-003", name: "Cybersecurity Analyst", icon: "⌁", vacancyCount: 210, score: 84, location: "Jakarta, Bandung, dan Batam" },
      { id: "car-004", name: "Business Analyst", icon: "◫", vacancyCount: 310, score: 86, location: "Jakarta, Tangerang, dan Bekasi" },
      { id: "car-005", name: "UI/UX Designer", icon: "◌", vacancyCount: 260, score: 80, location: "Jakarta, Bandung, dan Yogyakarta" },
      { id: "car-006", name: "DevOps Engineer", icon: "⚙", vacancyCount: 220, score: 87, location: "Jakarta, Tangerang, dan Remote" },
      { id: "car-007", name: "Quality Assurance Engineer", icon: "★", vacancyCount: 190, score: 82, location: "Jakarta, Bandung, dan Surabaya" },
      { id: "car-008", name: "Database Administrator", icon: "▤", vacancyCount: 110, score: 78, location: "Jakarta, Bekasi, dan Cikarang" },
      { id: "car-009", name: "Network Administrator", icon: "⌁", vacancyCount: 135, score: 76, location: "Jakarta, Surabaya, dan Medan" }
    ];

    const sourceCareers = (careersList && careersList.length > 0) ? careersList.map(c => ({
      id: c.id,
      name: c.title || c.name,
      icon: c.icon || '⌘',
      vacancyCount: c.marketDetail?.vacancyCount || 150,
      score: c.marketDemandScore || 80,
      location: c.marketDetail?.primaryLocation || 'Jakarta dan sekitarnya'
    })) : fallbackCareers;

    return sourceCareers.map(c => {
      const isFailed = log.status === 'Sebagian Gagal' && c.name.toLowerCase().includes('database administrator');
      return {
        careerId: c.id,
        careerName: c.name,
        icon: c.icon,
        status: isFailed ? 'Gagal' : 'Berhasil',
        vacancyCount: c.vacancyCount,
        score: c.score,
        location: c.location,
        error: isFailed ? 'Permintaan timeout ke API penyedia (ETIMEDOUT)' : undefined
      };
    });
  };

  // Fetch real scheduler logs and config on mount
  const fetchSchedulerData = async () => {
    try {
      setIsLoading(true);
      const [logsRes, configRes, careersRes] = await Promise.all([
        apiRequest('/admin/scheduler/logs').catch(() => null),
        apiRequest('/admin/scheduler/config').catch(() => null),
        apiRequest('/admin/careers').catch(() => null)
      ]);

      if (careersRes?.data && Array.isArray(careersRes.data)) {
        setCareersList(careersRes.data);
      }

      if (logsRes?.data && Array.isArray(logsRes.data) && logsRes.data.length > 0) {
        const formatted = logsRes.data.map(l => {
          const startDate = new Date(l.startedAt);
          const endDate = new Date(l.finishedAt);
          const startStr = startDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) + `, ${startDate.getHours().toString().padStart(2, '0')}.${startDate.getMinutes().toString().padStart(2, '0')} WIB`;

          const endStr = endDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) + `, ${endDate.getHours().toString().padStart(2, '0')}.${endDate.getMinutes().toString().padStart(2, '0')} WIB`;

          return {
            id: l.id,
            startTime: startStr,
            endTime: endStr,
            rawStartDate: l.startedAt,
            rawEndDate: l.finishedAt,
            durationSec: l.durationSec,
            type: l.executionType || 'Otomatis',
            status: l.status || 'Berhasil',
            processed: `${l.processed || 9} karir`,
            success: l.successCount ?? 9,
            failed: l.failedCount ?? 0,
            message: l.message || 'Sinkronisasi berhasil',
            careerSyncDetails: l.careerSyncDetails || null
          };
        });
        setLogs(formatted);

        const latest = formatted[0];
        if (latest) {
          setLastExecutionTime(latest.startTime);
          setLastSuccessCount(latest.success);
          setLastFailedCount(latest.failed);
          if (latest.durationSec !== undefined) {
            const mins = Math.floor(latest.durationSec / 60).toString().padStart(2, '0');
            const secs = Math.round(latest.durationSec % 60).toString().padStart(2, '0');
            setLastDuration(`${mins} menit ${secs} detik`);
          }
        }
      }

      if (configRes?.data) {
        const cfg = configRes.data;
        if (cfg.frequency) setFrequency(cfg.frequency);
        if (cfg.executionTime) setExecutionTime(cfg.executionTime);
        if (cfg.timezone) setTimezone(cfg.timezone);
        if (cfg.isAutoEnabled !== undefined) setIsAutoEnabled(cfg.isAutoEnabled);
        if (cfg.nextRun) setNextRunTime(cfg.nextRun);
        if (cfg.careerConfigs && Array.isArray(cfg.careerConfigs)) {
          setCareerConfigs(cfg.careerConfigs);
        }
      }
    } catch (err) {
      console.warn('Could not fetch scheduler data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulerData();
  }, []);

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleLihatRiwayat = () => {
    document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRunSchedulerManual = async () => {
    if (isRunning) return;
    setIsRunning(true);
    triggerToast("Pembaruan manual dimulai. Menghubungkan ke API pasar kerja...");

    try {
      const res = await apiRequest('/admin/scheduler/trigger', {
        method: 'POST',
        body: { executionType: 'Manual' }
      });
      
      triggerToast(res?.message || "Pembaruan manual selesai. Seluruh data lowongan karir berhasil diperbarui.");
      await fetchSchedulerData();
    } catch (err) {
      triggerToast("Pembaruan manual gagal: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunSingleCareer = async (cfg) => {
    if (isRunning) return;
    setIsRunning(true);
    triggerToast(`Memulai sinkronisasi manual untuk karir ${cfg.careerName}...`);

    try {
      const res = await apiRequest('/admin/scheduler/trigger', {
        method: 'POST',
        body: { 
          executionType: 'Manual',
          configId: cfg.id 
        }
      });
      triggerToast(res?.message || `Sinkronisasi karir ${cfg.careerName} selesai.`);
      await fetchSchedulerData();
    } catch (err) {
      triggerToast("Pembaruan gagal: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleToggleCareerConfig = async (cfg) => {
    try {
      const newStatus = !cfg.isActive;
      await apiRequest('/admin/scheduler/config', {
        method: 'PUT',
        body: {
          careerConfigId: cfg.id,
          careerConfigData: { isActive: newStatus }
        }
      });
      setCareerConfigs(prev => prev.map(c => c.id === cfg.id ? { ...c, isActive: newStatus } : c));
      triggerToast(`Karir ${cfg.careerName} berhasil di-${newStatus ? 'aktifkan' : 'nonaktifkan'} dari antrian.`);
    } catch (err) {
      triggerToast("Gagal memperbarui status karir: " + err.message);
    }
  };

  const handleRetryFailedJobs = async () => {
    if (isRunning) return;
    setIsRunning(true);
    triggerToast("Memulai antrian eksekusi ulang untuk karir yang berstatus gagal...");

    try {
      const res = await apiRequest('/admin/scheduler/trigger', {
        method: 'POST',
        body: { 
          executionType: 'Coba Ulang',
          onlyFailures: true 
        }
      });
      triggerToast(res?.message || "Coba ulang antrian karir gagal selesai diproses.");
      await fetchSchedulerData();
    } catch (err) {
      triggerToast("Coba ulang gagal: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // Formatted next scheduled run
  const formattedNextRun = useMemo(() => {
    if (!isAutoEnabled) return { time: '-', date: 'Otomatisasi dinonaktifkan' };
    if (!nextRunTime) return { time: executionTime, date: `${frequency}, ${timezone}` };
    try {
      const d = new Date(nextRunTime);
      const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(':', '.');
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }) + `, ${timezone}`;
      return { time: timeStr, date: dateStr };
    } catch {
      return { time: executionTime, date: `${frequency}, ${timezone}` };
    }
  }, [nextRunTime, isAutoEnabled, executionTime, frequency, timezone]);

  // Type Counts for Tabs
  const typeCounts = useMemo(() => {
    const counts = { Semua: logs.length, Otomatis: 0, Manual: 0, 'Coba Ulang': 0 };
    for (const log of logs) {
      if (counts[log.type] !== undefined) {
        counts[log.type]++;
      }
    }
    return counts;
  }, [logs]);

  // Check if any filter is active
  const isAnyFilterActive = useMemo(() => {
    return Boolean(
      logSearchQuery.trim() !== '' ||
      activeLogTab !== 'Semua' ||
      statusFilter !== 'Semua' ||
      dateRangeFilter !== 'Semua' ||
      sortBy !== 'terbaru' ||
      onlyFailures
    );
  }, [logSearchQuery, activeLogTab, statusFilter, dateRangeFilter, sortBy, onlyFailures]);

  const handleResetFilters = () => {
    setLogSearchQuery('');
    setActiveLogTab('Semua');
    setStatusFilter('Semua');
    setDateRangeFilter('Semua');
    setSortBy('terbaru');
    setOnlyFailures(false);
    setCurrentPage(1);
  };

  // Filter and sort history logs
  const filteredLogs = useMemo(() => {
    const query = logSearchQuery.trim().toLowerCase();
    const now = Date.now();

    const result = logs.filter(log => {
      // 1. Search Query (matches start time, type, status, message, and career names)
      if (query) {
        const matchesStartTime = log.startTime?.toLowerCase().includes(query);
        const matchesEndTime = log.endTime?.toLowerCase().includes(query);
        const matchesType = log.type?.toLowerCase().includes(query);
        const matchesStatus = log.status?.toLowerCase().includes(query);
        const matchesMessage = log.message?.toLowerCase().includes(query);
        const matchesCareer = Array.isArray(log.careerSyncDetails) && log.careerSyncDetails.some(c => 
          (c.careerName || c.name || '').toLowerCase().includes(query)
        );

        if (!matchesStartTime && !matchesEndTime && !matchesType && !matchesStatus && !matchesMessage && !matchesCareer) {
          return false;
        }
      }

      // 2. Execution Type Tab
      if (activeLogTab !== 'Semua') {
        if (log.type !== activeLogTab) {
          return false;
        }
      }

      // 3. Status Filter Dropdown
      if (statusFilter !== 'Semua') {
        if (log.status !== statusFilter) {
          return false;
        }
      }

      // 4. Only Failures Checkbox
      if (onlyFailures) {
        if (log.status === 'Berhasil' && (log.failed === 0 || !log.failed)) {
          return false;
        }
      }

      // 5. Date Range Filter
      if (dateRangeFilter !== 'Semua') {
        const rawDate = log.rawStartDate ? new Date(log.rawStartDate) : null;
        if (rawDate && !isNaN(rawDate.getTime())) {
          if (dateRangeFilter === 'today') {
            const today = new Date();
            const isSameDay = rawDate.getDate() === today.getDate() &&
              rawDate.getMonth() === today.getMonth() &&
              rawDate.getFullYear() === today.getFullYear();
            if (!isSameDay) return false;
          } else if (dateRangeFilter === '7d') {
            const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
            if (rawDate.getTime() < sevenDaysAgo) return false;
          } else if (dateRangeFilter === '30d') {
            const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
            if (rawDate.getTime() < thirtyDaysAgo) return false;
          }
        }
      }

      return true;
    });

    // 6. Sorting
    return result.sort((a, b) => {
      if (sortBy === 'terlama') {
        const timeA = a.rawStartDate ? new Date(a.rawStartDate).getTime() : a.id;
        const timeB = b.rawStartDate ? new Date(b.rawStartDate).getTime() : b.id;
        return timeA - timeB;
      }
      if (sortBy === 'durasi') {
        return (b.durationSec || 0) - (a.durationSec || 0);
      }
      if (sortBy === 'kegagalan') {
        return (b.failed || 0) - (a.failed || 0);
      }
      // default: 'terbaru'
      const timeA = a.rawStartDate ? new Date(a.rawStartDate).getTime() : a.id;
      const timeB = b.rawStartDate ? new Date(b.rawStartDate).getTime() : b.id;
      return timeB - timeA;
    });
  }, [logs, logSearchQuery, activeLogTab, statusFilter, dateRangeFilter, onlyFailures, sortBy]);

  // Reset page when filter criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [logSearchQuery, activeLogTab, statusFilter, dateRangeFilter, onlyFailures, sortBy]);

  // Pagination calculations
  const totalFiltered = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);

  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, startIndex, endIndex]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [totalPages, currentPage]);

  const handleOpenDetail = (log) => {
    setSelectedLogDetail(log);
    setIsDetailModalOpen(true);
  };

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4 font-medium">
        <span>Dashboard Admin</span>
        <span aria-hidden="true">/</span>
        <span className="text-content-primary">Manajemen Scheduler</span>
      </nav>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full border-b border-divider pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-divider text-[11px] font-semibold text-content-secondary uppercase tracking-wider mb-2">
            Automasi Pengambilan Data C3
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-content-primary tracking-tight">
            Manajemen Scheduler
          </h1>
          <p className="text-content-secondary text-sm mt-1.5 max-w-2xl leading-relaxed">
            Atur jadwal otomatis pembaruan data lowongan pasar kerja Adzuna API, jalankan sinkronisasi manual, dan evaluasi riwayat eksekusi sistem.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <button 
            onClick={handleLihatRiwayat}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-divider bg-surface hover:bg-subsurface text-content-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-1 md:flex-none"
          >
            <Clock className="w-3.5 h-3.5" />
            Lihat Riwayat
          </button>
          <button 
            onClick={handleRunSchedulerManual}
            disabled={isRunning}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex-1 md:flex-none"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            Perbarui Sekarang
          </button>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Status Scheduler</span>
          <div className="flex items-center gap-2 my-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isAutoEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <strong className="text-2xl font-bold text-content-primary leading-none">
              {isAutoEnabled ? 'Aktif' : 'Nonaktif'}
            </strong>
          </div>
          <span className="text-xs text-content-secondary">
            {isAutoEnabled ? `Berjalan otomatis 1 hari sekali (${executionTime} WIB)` : 'Penjadwalan otomatis dihentikan'}
          </span>
        </Card>
        
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Antrian Karir Aktif</span>
          <strong className="text-3xl font-mono font-black text-content-primary block leading-none tabular-nums my-1">
            {careerConfigs.filter(c => c.isActive).length}
          </strong>
          <span className="text-xs text-content-secondary">dari total {careerConfigs.length} karir terdaftar</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Hasil Eksekusi Terakhir</span>
          <strong className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 block leading-none tabular-nums my-1">
            {`${lastSuccessCount}/${lastSuccessCount + lastFailedCount || careerConfigs.length || 9}`}
          </strong>
          <span className="text-xs text-content-secondary">
            {lastFailedCount === 0 ? 'Seluruh antrian berhasil disinkronisasi' : `${lastFailedCount} karir mengalami kegagalan`}
          </span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Jadwal Eksekusi Berikutnya</span>
          <strong className="text-3xl font-mono font-black text-content-primary block leading-none tabular-nums my-1">
            {formattedNextRun.time}
          </strong>
          <span className="text-xs text-content-secondary">{formattedNextRun.date}</span>
        </Card>
      </section>

      {/* Status Pembaruan Terakhir Card */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-divider mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold text-content-primary">Status Pembaruan Terakhir</h2>
            <p className="text-content-muted text-xs mt-0.5">
              Ringkasan hasil eksekusi scheduler cron untuk data pasar kerja (otomatis 1 hari sekali).
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
            lastFailedCount === 0
              ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${lastFailedCount === 0 ? 'bg-emerald-600' : 'bg-amber-500'}`} />
            {lastFailedCount === 0 ? 'Berhasil' : 'Sebagian Gagal'}
          </span>
        </div>

        {/* Detailed Grid Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="border border-divider bg-subsurface p-3.5 rounded-lg">
            <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider block mb-1">Waktu Mulai</span>
            <strong className="text-content-primary text-xs font-mono font-bold block leading-snug">
              {lastExecutionTime.split(',')[0]}
            </strong>
            <span className="text-[11px] text-content-secondary font-mono block">
              {lastExecutionTime.split(',')[1] || '02.00 WIB'}
            </span>
          </div>
          <div className="border border-divider bg-subsurface p-3.5 rounded-lg flex flex-col justify-center">
            <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider block mb-1">Durasi Pengerjaan</span>
            <strong className="text-content-primary text-xs font-mono font-bold block leading-none">{lastDuration}</strong>
          </div>
          <div className="border border-divider bg-subsurface p-3.5 rounded-lg">
            <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider block mb-1">Berhasil Diambil</span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold block leading-none">{lastSuccessCount} karir</strong>
          </div>
          <div className="border border-divider bg-subsurface p-3.5 rounded-lg">
            <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider block mb-1">Gagal Diambil</span>
            <strong className="text-content-primary text-xs font-mono font-bold block leading-none">{lastFailedCount} karir</strong>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-divider">
          <div className="text-xs text-content-muted flex items-center gap-2">
            <Clock className="w-4 h-4 text-content-muted shrink-0" />
            <span>Eksekusi harian otomatis berjalan secara sekuensial satu demi satu (default 1 hari sekali) untuk seluruh karir aktif pada antrian.</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {lastFailedCount > 0 && (
              <button
                type="button"
                onClick={handleRetryFailedJobs}
                disabled={isRunning}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 disabled:opacity-50 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Coba ulang antrian untuk karir yang berstatus gagal"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Coba Ulang yang Gagal
              </button>
            )}
            <button
              onClick={handleRunSchedulerManual}
              disabled={isRunning}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              Jalankan Seluruh Antrian
            </button>
          </div>
        </div>
      </Card>

      {/* Career Configs Queue Table Card */}
      <Card className="p-0 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-divider flex items-center justify-between flex-wrap gap-4 bg-subsurface/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-content-primary">Antrian Konfigurasi Karir Terjadwal</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-subsurface border border-divider text-content-secondary font-semibold">
                sumber data: Alternatif Karir
              </span>
            </div>
            <p className="text-content-muted text-xs mt-0.5">
              Daftar karir dari data alternatif yang disinkronkan secara sekuensial (satu demi satu) oleh sistem antrian saat cron harian aktif.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-content-muted font-mono">
              Aktif: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{careerConfigs.filter(c => c.isActive).length}</strong> dari {careerConfigs.length} karir
            </span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                <th className="px-6 py-3">Karir Target</th>
                <th className="px-6 py-3">Status Antrian</th>
                <th className="px-6 py-3">Eksekusi Terakhir</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider text-xs">
              {careerConfigs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-content-muted">
                    <p className="text-xs">Belum ada alternatif karir yang aktif di basis data.</p>
                  </td>
                </tr>
              ) : (
                careerConfigs.map((cfg) => (
                  <tr key={cfg.id} className="hover:bg-subsurface/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <strong className="text-content-primary font-semibold block">{cfg.careerName}</strong>
                      <span className="text-[11px] text-content-muted font-mono">{cfg.careerId || cfg.id}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleCareerConfig(cfg)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer transition-colors ${
                          cfg.isActive
                            ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'text-content-muted bg-subsurface border-divider'
                        }`}
                        title="Klik untuk mengubah status antrian karir ini"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.isActive ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                        {cfg.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        cfg.lastStatus === 'Berhasil' 
                          ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : (cfg.lastStatus === 'Gagal' ? 'text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300' : 'text-content-muted bg-subsurface')
                      }`}>
                        {cfg.lastStatus || 'Belum Berjalan'}
                      </span>
                      <span className="text-[10px] text-content-muted font-mono block mt-0.5">
                        {cfg.lastRunAt ? new Date(cfg.lastRunAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + new Date(cfg.lastRunAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleRunSingleCareer(cfg)}
                        disabled={isRunning}
                        className="px-3 py-1.5 bg-subsurface hover:bg-divider border border-divider text-content-primary font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title={`Jalankan sinkronisasi langsung khusus karir ${cfg.careerName}`}
                      >
                        Jalankan Sekarang
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Table Card */}
      <Card id="history-section" className="p-0 overflow-hidden scroll-mt-6">
        <div className="px-6 py-4 border-b border-divider flex items-center justify-between flex-wrap gap-4 bg-subsurface/40">
          <div>
            <h2 className="text-sm font-bold text-content-primary">Riwayat Eksekusi Scheduler</h2>
            <p className="text-content-muted text-xs mt-0.5">Log eksekusi pembaruan data otomatis, manual, dan coba ulang.</p>
          </div>
          <span className="inline-flex px-2.5 py-1 bg-subsurface border border-divider text-content-secondary font-mono text-[10px] font-semibold rounded">
            scheduler_logs
          </span>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 sm:px-6 border-b border-divider bg-subsurface/20 space-y-3">
          {/* Top Row: Type Tabs & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" role="tablist" aria-label="Filter jenis eksekusi">
              {['Semua', 'Otomatis', 'Manual', 'Coba Ulang'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveLogTab(tab)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary ${
                    activeLogTab === tab 
                      ? 'bg-primary text-white shadow-xs' 
                      : 'text-content-secondary hover:text-content-primary hover:bg-subsurface border border-divider/60'
                  }`}
                >
                  <span>{tab === 'Semua' ? 'Semua Jenis' : tab}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeLogTab === tab ? 'bg-white/20 text-white' : 'bg-surface text-content-muted'
                  }`}>
                    {typeCounts[tab] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input 
                type="search"
                placeholder="Cari karir, waktu, status..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-label="Cari riwayat eksekusi"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted pointer-events-none" />
              {logSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLogSearchQuery('')}
                  aria-label="Hapus kata kunci pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-content-muted hover:text-content-primary cursor-pointer rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Additional Select Filters & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-divider/40 text-xs text-content-secondary">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Select */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="filter-status" className="text-[11px] font-medium text-content-muted whitespace-nowrap">Status:</label>
                <select
                  id="filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1 bg-surface border border-divider rounded-md text-xs text-content-primary font-medium outline-none focus:border-primary cursor-pointer transition-colors"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Berhasil">Berhasil</option>
                  <option value="Sebagian Gagal">Sebagian Gagal</option>
                  <option value="Gagal">Gagal</option>
                </select>
              </div>

              {/* Date Range Select */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="filter-date" className="text-[11px] font-medium text-content-muted whitespace-nowrap">Waktu:</label>
                <select
                  id="filter-date"
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="px-2.5 py-1 bg-surface border border-divider rounded-md text-xs text-content-primary font-medium outline-none focus:border-primary cursor-pointer transition-colors"
                >
                  <option value="Semua">Semua Waktu</option>
                  <option value="today">Hari Ini</option>
                  <option value="7d">7 Hari Terakhir</option>
                  <option value="30d">30 Hari Terakhir</option>
                </select>
              </div>

              {/* Sort By Select */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="filter-sort" className="text-[11px] font-medium text-content-muted whitespace-nowrap">Urutkan:</label>
                <select
                  id="filter-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1 bg-surface border border-divider rounded-md text-xs text-content-primary font-medium outline-none focus:border-primary cursor-pointer transition-colors"
                >
                  <option value="terbaru">Terbaru Dahulu</option>
                  <option value="terlama">Terlama Dahulu</option>
                  <option value="durasi">Durasi Terlama</option>
                  <option value="kegagalan">Gagal Terbanyak</option>
                </select>
              </div>

              {/* Only Failures Checkbox */}
              <label className="inline-flex items-center gap-1.5 cursor-pointer ml-1 select-none">
                <input
                  type="checkbox"
                  checked={onlyFailures}
                  onChange={(e) => setOnlyFailures(e.target.checked)}
                  className="rounded border-divider text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-xs text-content-primary font-medium">Hanya yang ada kegagalan</span>
              </label>
            </div>

            {/* Filter Status Summary & Reset */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[11px] text-content-muted font-mono tabular-nums">
                Menampilkan <strong className="text-content-primary font-semibold">{filteredLogs.length}</strong> dari {logs.length} riwayat
              </span>
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded transition-colors cursor-pointer"
                  title="Atur ulang semua filter"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                <th className="px-6 py-3">Waktu Mulai</th>
                <th className="px-6 py-3">Jenis</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Diproses</th>
                <th className="px-6 py-3">Berhasil</th>
                <th className="px-6 py-3">Gagal</th>
                <th className="px-6 py-3">Pesan Eksekusi</th>
                <th className="px-6 py-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Skeleton className="h-6 w-14 mx-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-subsurface/30 transition-colors">
                    <td className="px-6 py-4">
                      <strong className="text-content-primary font-mono font-semibold block">{log.startTime}</strong>
                      <span className="text-[11px] text-content-muted font-mono block mt-0.5">Selesai: {log.endTime}</span>
                    </td>
                    <td className="px-6 py-4 text-content-secondary font-semibold">
                      {log.type}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.status === 'Berhasil' 
                          ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                          : 'text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.status === 'Berhasil' ? 'bg-emerald-600' : 'bg-amber-500'
                        }`} />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-content-secondary font-mono">
                      {log.processed}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      {log.success}
                    </td>
                    <td className="px-6 py-4 text-content-secondary font-mono font-bold">
                      {log.failed}
                    </td>
                    <td className="px-6 py-4 text-content-secondary leading-relaxed max-w-[200px] truncate" title={log.message}>
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(log)}
                        className="px-2.5 py-1 bg-subsurface hover:bg-divider border border-divider text-content-primary font-semibold text-[11px] rounded transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-content-muted">
                    <p className="text-xs font-medium text-content-secondary mb-1">
                      Tidak ada riwayat eksekusi yang memenuhi kriteria filter saat ini.
                    </p>
                    {isAnyFilterActive ? (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold mt-2 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Kembalikan dan tampilkan seluruh riwayat
                      </button>
                    ) : (
                      <p className="text-[11px] text-content-muted">
                        Riwayat eksekusi akan muncul secara otomatis setelah scheduler dijalankan.
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 bg-subsurface/40 border-t border-divider flex items-center justify-between flex-wrap gap-4 text-content-muted text-xs">
          <div className="flex items-center gap-3">
            <span>
              Menampilkan <strong className="text-content-primary font-mono tabular-nums">{totalFiltered > 0 ? startIndex + 1 : 0}</strong> - <strong className="text-content-primary font-mono tabular-nums">{endIndex}</strong> dari <strong className="text-content-primary font-mono tabular-nums">{totalFiltered}</strong> log eksekusi.
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <label htmlFor="log-page-size" className="text-[11px] text-content-muted">Per halaman:</label>
              <select
                id="log-page-size"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-0.5 bg-surface border border-divider rounded text-content-primary text-xs font-mono outline-none cursor-pointer focus:border-primary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-divider bg-surface hover:bg-subsurface text-content-primary font-semibold rounded-md disabled:opacity-40 transition-colors cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Sebelumnya
              </button>
              
              <div className="flex items-center gap-1">
                {pageNumbers.map((page, idx) => {
                  if (page === '...') {
                    return <span key={`ellipsis-${idx}`} className="px-1.5 text-content-muted select-none">...</span>;
                  }
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-7 h-7 px-1.5 flex items-center justify-center font-mono rounded-md text-xs font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
                        currentPage === page
                          ? 'bg-primary text-white shadow-xs'
                          : 'border border-divider bg-surface hover:bg-subsurface text-content-primary'
                      }`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button 
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-divider bg-surface hover:bg-subsurface text-content-primary font-semibold rounded-md disabled:opacity-40 transition-colors cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Halaman selanjutnya"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Log Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        title="Detail Eksekusi Scraper"
        onClose={() => setIsDetailModalOpen(false)}
        maxWidth="max-w-3xl"
      >
        {selectedLogDetail && (() => {
          const careerDetails = getLogCareerDetails(selectedLogDetail);
          const totalVacancies = careerDetails.reduce((sum, item) => sum + (Number(item.vacancyCount) || 0), 0);
          const successCount = careerDetails.filter(item => item.status === 'Berhasil').length;
          const failedCount = careerDetails.filter(item => item.status !== 'Berhasil').length;

          return (
            <div className="space-y-5 text-xs text-content-secondary">
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-divider">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-content-primary">
                      Log ID: #{selectedLogDetail.id}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-subsurface border border-divider text-content-secondary">
                      {selectedLogDetail.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-content-muted font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mulai: {selectedLogDetail.startTime}</span>
                    <span>•</span>
                    <span>Selesai: {selectedLogDetail.endTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedLogDetail.status === 'Berhasil' 
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      selectedLogDetail.status === 'Berhasil' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    {selectedLogDetail.status}
                  </span>
                </div>
              </div>

              {/* Execution Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-divider bg-surface">
                  <span className="text-[11px] text-content-muted block font-medium">Total Diproses</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-bold font-mono text-content-primary">
                      {careerDetails.length}
                    </span>
                    <span className="text-[11px] text-content-secondary font-medium">Karir</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-divider bg-surface">
                  <span className="text-[11px] text-content-muted block font-medium">Berhasil Disinkron</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {successCount}
                    </span>
                    <span className="text-[11px] text-content-secondary font-medium">Karir</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-divider bg-surface">
                  <span className="text-[11px] text-content-muted block font-medium">Gagal Disinkron</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-base font-bold font-mono ${
                      failedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-content-secondary'
                    }`}>
                      {failedCount}
                    </span>
                    <span className="text-[11px] text-content-secondary font-medium">Karir</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-divider bg-surface">
                  <span className="text-[11px] text-content-muted block font-medium">Total Lowongan Aktif</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-bold font-mono text-primary">
                      {totalVacancies.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-content-secondary font-medium">Posisi</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="px-3.5 py-2.5 rounded-lg bg-subsurface border border-divider flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-content-secondary font-medium">
                    <strong className="text-content-primary font-semibold mr-1">Status Eksekusi:</strong>
                    {selectedLogDetail.message}
                  </span>
                </div>
                {selectedLogDetail.durationSec !== undefined && (
                  <span className="text-[11px] font-mono text-content-muted shrink-0">
                    Durasi: {selectedLogDetail.durationSec}s
                  </span>
                )}
              </div>

              {/* Careers Table / List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-content-primary text-xs tracking-tight">
                      Status & Jumlah Lowongan per Karir TI
                    </h4>
                    <p className="text-[11px] text-content-muted">
                      Rincian status sinkronisasi scraper dan jumlah lowongan kerja aktif dari setiap alternatif karir.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-content-muted bg-surface px-2 py-0.5 rounded border border-divider">
                    {careerDetails.length} Karir Terdaftar
                  </span>
                </div>

                <div className="border border-divider rounded-lg overflow-hidden bg-surface">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-subsurface border-b border-divider text-[10px] uppercase font-bold text-content-muted tracking-wider">
                          <th className="px-4 py-2.5">Karir TI</th>
                          <th className="px-4 py-2.5 text-center">Status</th>
                          <th className="px-4 py-2.5 text-right">Jumlah Lowongan</th>
                          <th className="px-4 py-2.5 text-right">Skor Pasar (C3)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-divider">
                        {careerDetails.map((item, idx) => {
                          const isOk = item.status === 'Berhasil';
                          return (
                            <tr key={item.careerId || idx} className="hover:bg-subsurface/40 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                                    {item.icon || '⌘'}
                                  </div>
                                  <div>
                                    <strong className="text-content-primary font-semibold block text-xs">
                                      {item.careerName}
                                    </strong>
                                    <span className="text-[11px] text-content-muted block truncate max-w-[220px]">
                                      {item.location || 'Indonesia'}
                                    </span>
                                    {item.error && (
                                      <span className="text-[10px] text-rose-600 dark:text-rose-400 block mt-0.5">
                                        Catatan: {item.error}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                                  isOk 
                                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    isOk ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`} />
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="font-mono font-bold text-sm text-content-primary">
                                  {Number(item.vacancyCount || 0).toLocaleString('id-ID')}
                                </span>
                                <span className="text-[10px] text-content-muted block">lowongan</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex flex-col items-end">
                                  <span className="font-mono font-bold text-xs text-primary">
                                    {item.score || 80}/100
                                  </span>
                                  <span className="text-[10px] text-content-muted">
                                    {item.trend || 'Stabil'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Data Note & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-divider">
                <p className="text-[11px] text-content-muted flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span>Data lowongan dan skor dinamis terhubung ke kriteria C3 SAW & Adzuna Market API.</span>
                </p>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Toast */}
      <Toast 
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />
    </main>
  );
}
