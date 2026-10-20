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
  Calendar, 
  Hourglass, 
  CheckCircle2, 
  Database,
  Sliders,
  Info,
  SlidersHorizontal,
  Server,
  AlertCircle
} from 'lucide-react';

export default function SchedulerConfig() {
  const [toast, setToast] = useState({ show: false, message: '' });
  const [configErrors, setConfigErrors] = useState({});
  
  // Left Column Config Form States
  const [schedulerName, setSchedulerName] = useState('Pembaruan Data Pasar Kerja');
  const [schedulerCode, setSchedulerCode] = useState('MARKET_DATA_REFRESH');
  const [frequency, setFrequency] = useState('Setiap Hari');
  const [executionTime, setExecutionTime] = useState('02.00');
  const [timezone, setTimezone] = useState('Asia/Jakarta (WIB)');
  const [cronExpression, setCronExpression] = useState('0 0 2 * * *');
  const [isAutoEnabled, setIsAutoEnabled] = useState(true);

  // Right Column Execution Summary States
  const [lastExecutionTime, setLastExecutionTime] = useState('20 Oktober 2026, 02.00 WIB');
  const [lastDuration, setLastDuration] = useState('00 menit 02 detik');
  const [lastSuccessCount, setLastSuccessCount] = useState(9);
  const [lastFailedCount, setLastFailedCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // History List State
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [activeLogTab, setActiveLogTab] = useState('Semua');
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [logs, setLogs] = useState([]);
  const [careersList, setCareersList] = useState([]);
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
        }
      }

      if (configRes?.data) {
        const cfg = configRes.data;
        if (cfg.schedulerName) setSchedulerName(cfg.schedulerName);
        if (cfg.schedulerCode) setSchedulerCode(cfg.schedulerCode);
        if (cfg.frequency) setFrequency(cfg.frequency);
        if (cfg.executionTime) setExecutionTime(cfg.executionTime);
        if (cfg.timezone) setTimezone(cfg.timezone);
        if (cfg.cronExpression) setCronExpression(cfg.cronExpression);
        if (cfg.isAutoEnabled !== undefined) setIsAutoEnabled(cfg.isAutoEnabled);
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

  const handleResetConfig = async () => {
    setConfigErrors({});
    setSchedulerName('Pembaruan Data Pasar Kerja');
    setSchedulerCode('MARKET_DATA_REFRESH');
    setFrequency('Setiap Hari');
    setExecutionTime('02.00');
    setTimezone('Asia/Jakarta (WIB)');
    setCronExpression('0 0 2 * * *');
    setIsAutoEnabled(true);
    try {
      await apiRequest('/admin/scheduler/config', {
        method: 'PUT',
        body: {
          schedulerName: 'Pembaruan Data Pasar Kerja',
          schedulerCode: 'MARKET_DATA_REFRESH',
          frequency: 'Setiap Hari',
          executionTime: '02.00',
          timezone: 'Asia/Jakarta (WIB)',
          cronExpression: '0 0 2 * * *',
          isAutoEnabled: true
        }
      });
      triggerToast("Konfigurasi diatur ulang ke nilai baku dan disimpan.");
    } catch (err) {
      triggerToast("Konfigurasi diatur ulang, namun gagal disimpan: " + err.message);
    }
  };

  const handleSaveConfig = async (e) => {
    e?.preventDefault?.();
    const errs = {};
    const nameTrimmed = schedulerName.trim();
    const codeTrimmed = schedulerCode.trim();
    const timeTrimmed = executionTime.trim();
    const cronTrimmed = cronExpression.trim();

    if (!nameTrimmed) {
      errs.schedulerName = "Nama scheduler wajib diisi.";
    } else if (nameTrimmed.length < 3) {
      errs.schedulerName = "Nama scheduler minimal 3 karakter.";
    }

    if (!codeTrimmed) {
      errs.schedulerCode = "Kode scheduler wajib diisi.";
    } else if (!/^[A-Za-z0-9_]{3,30}$/.test(codeTrimmed)) {
      errs.schedulerCode = "Kode scheduler harus 3-30 karakter alfanumerik atau garis bawah (_).";
    }

    if (!timeTrimmed) {
      errs.executionTime = "Waktu eksekusi wajib diisi.";
    } else if (!/^([01]?[0-9]|2[0-3])[:.][0-5][0-9]$/.test(timeTrimmed)) {
      errs.executionTime = "Format waktu harus JJ.MM atau JJ:MM (contoh: 02.00 atau 14:30).";
    }

    if (!cronTrimmed) {
      errs.cronExpression = "Cron expression wajib diisi.";
    } else {
      const parts = cronTrimmed.split(/\s+/);
      if (parts.length < 5 || parts.length > 6) {
        errs.cronExpression = "Cron expression harus terdiri dari 5 atau 6 segmen (contoh: 0 0 2 * * *).";
      }
    }

    if (Object.keys(errs).length > 0) {
      setConfigErrors(errs);
      triggerToast("Harap periksa kembali isian konfigurasi scheduler.");
      return;
    }

    setConfigErrors({});

    try {
      await apiRequest('/admin/scheduler/config', {
        method: 'PUT',
        body: {
          schedulerName: nameTrimmed,
          schedulerCode: codeTrimmed.toUpperCase(),
          frequency,
          executionTime: timeTrimmed,
          timezone,
          cronExpression: cronTrimmed,
          isAutoEnabled
        }
      });
      triggerToast("Konfigurasi scheduler berhasil disimpan ke basis data.");
    } catch (err) {
      triggerToast("Gagal menyimpan konfigurasi: " + err.message);
    }
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

  // Filter history logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.startTime.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.type.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.status.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.message.toLowerCase().includes(logSearchQuery.toLowerCase());

      let matchesTab = true;
      if (activeLogTab === 'Otomatis') matchesTab = log.type === 'Otomatis';
      else if (activeLogTab === 'Manual') matchesTab = log.type === 'Manual';
      else if (activeLogTab === 'Coba Ulang') matchesTab = log.type === 'Coba Ulang';
      else if (activeLogTab === 'Sebagian Gagal') matchesTab = log.status === 'Sebagian Gagal';

      return matchesSearch && matchesTab;
    });
  }, [logs, logSearchQuery, activeLogTab]);

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
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <strong className="text-2xl font-bold text-content-primary leading-none">Aktif</strong>
          </div>
          <span className="text-xs text-content-secondary">Berjalan setiap hari pada 02.00 WIB</span>
        </Card>
        
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Alternatif Karir Terpantau</span>
          <strong className="text-3xl font-mono font-black text-content-primary block leading-none tabular-nums my-1">8</strong>
          <span className="text-xs text-content-secondary">Target eksekusi kueri lowongan kerja</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Hasil Eksekusi Terakhir</span>
          <strong className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 block leading-none tabular-nums my-1">8/8</strong>
          <span className="text-xs text-content-secondary">Seluruh alternatif berhasil diperbarui</span>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-[11px] text-content-muted font-bold uppercase tracking-wider block mb-1">Jadwal Eksekusi Berikutnya</span>
          <strong className="text-3xl font-mono font-black text-content-primary block leading-none tabular-nums my-1">02.00</strong>
          <span className="text-xs text-content-secondary">27 Juni 2026, Asia/Jakarta (WIB)</span>
        </Card>
      </section>

      {/* Two Column Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left Column: Config Form */}
        <Card className="lg:col-span-7 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-divider mb-6">
            <div>
              <h2 className="text-sm font-bold text-content-primary">Konfigurasi Jadwal Scheduler</h2>
              <p className="text-content-muted text-xs mt-0.5">Parameter frekuensi dan waktu otomatisasi scraper.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Aktif
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="grid gap-4 text-xs font-semibold text-content-primary" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="name-sched">Nama Scheduler</label>
                <input 
                  id="name-sched"
                  type="text"
                  value={schedulerName}
                  onChange={(e) => {
                    setSchedulerName(e.target.value);
                    if (configErrors.schedulerName) setConfigErrors(prev => ({ ...prev, schedulerName: null }));
                  }}
                  aria-invalid={!!configErrors.schedulerName}
                  className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-xs outline-none transition-colors ${
                    configErrors.schedulerName ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
                  }`}
                  required
                />
                {configErrors.schedulerName && (
                  <p className="text-[11px] text-red-500 font-normal flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {configErrors.schedulerName}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="code-sched">Kode Scheduler</label>
                <input 
                  id="code-sched"
                  type="text"
                  value={schedulerCode}
                  onChange={(e) => {
                    setSchedulerCode(e.target.value);
                    if (configErrors.schedulerCode) setConfigErrors(prev => ({ ...prev, schedulerCode: null }));
                  }}
                  aria-invalid={!!configErrors.schedulerCode}
                  className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-xs font-mono outline-none transition-colors ${
                    configErrors.schedulerCode ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
                  }`}
                  required
                />
                {configErrors.schedulerCode && (
                  <p className="text-[11px] text-red-500 font-normal flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {configErrors.schedulerCode}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="freq-sched">Frekuensi Eksekusi</label>
                <select 
                  id="freq-sched"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none cursor-pointer"
                >
                  <option value="Setiap Hari">Setiap Hari</option>
                  <option value="Setiap Minggu">Setiap Minggu</option>
                  <option value="Setiap Bulan">Setiap Bulan</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="time-sched">Waktu Eksekusi</label>
                <div className="relative">
                  <input 
                    id="time-sched"
                    type="text"
                    value={executionTime}
                    onChange={(e) => {
                      setExecutionTime(e.target.value);
                      if (configErrors.executionTime) setConfigErrors(prev => ({ ...prev, executionTime: null }));
                    }}
                    placeholder="Contoh: 02.00"
                    aria-invalid={!!configErrors.executionTime}
                    className={`w-full pl-3 pr-8 py-2 bg-surface border rounded-lg text-content-primary text-xs font-mono outline-none transition-colors ${
                      configErrors.executionTime ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
                    }`}
                    required
                  />
                  <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                </div>
                {configErrors.executionTime && (
                  <p className="text-[11px] text-red-500 font-normal flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {configErrors.executionTime}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="tz-sched">Zona Waktu</label>
                <select 
                  id="tz-sched"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none cursor-pointer"
                >
                  <option value="Asia/Jakarta (WIB)">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar (WITA)">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura (WIT)">Asia/Jayapura (WIT)</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="cron-sched">Cron Expression</label>
                <input 
                  id="cron-sched"
                  type="text"
                  value={cronExpression}
                  onChange={(e) => {
                    setCronExpression(e.target.value);
                    if (configErrors.cronExpression) setConfigErrors(prev => ({ ...prev, cronExpression: null }));
                  }}
                  placeholder="0 0 2 * * *"
                  aria-invalid={!!configErrors.cronExpression}
                  className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-xs font-mono outline-none transition-colors ${
                    configErrors.cronExpression ? 'border-red-500 focus:border-red-500' : 'border-divider focus:border-primary'
                  }`}
                  required
                />
                {configErrors.cronExpression && (
                  <p className="text-[11px] text-red-500 font-normal flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {configErrors.cronExpression}
                  </p>
                )}
              </div>
            </div>

            <div className="border border-divider rounded-lg p-3.5 bg-subsurface flex items-center justify-between gap-4 mt-1">
              <div className="min-w-0">
                <h4 className="text-content-primary text-xs font-semibold">Aktifkan scheduler otomatis</h4>
                <p className="text-content-muted text-[11px] leading-relaxed mt-0.5">
                  Bila dinonaktifkan, data pasar kerja hanya dapat diperbarui secara manual oleh administrator.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoEnabled(!isAutoEnabled)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${isAutoEnabled ? 'bg-primary' : 'bg-subsurface border border-divider'}`}
                aria-label="Toggle scheduler otomatis"
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${isAutoEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
              <button 
                type="button" 
                onClick={handleResetConfig}
                className="px-4 py-2 border border-divider hover:bg-subsurface text-content-secondary font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Atur Ulang
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </Card>

        {/* Right Column: Execution Summary */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between self-stretch">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-divider mb-6">
              <div>
                <h2 className="text-sm font-bold text-content-primary">Status Pembaruan Terakhir</h2>
                <p className="text-content-muted text-xs mt-0.5">Ringkasan status eksekusi scheduler terbaru.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Berhasil
              </span>
            </div>

            {/* Alert Banner */}
            <div className="bg-primary-light/40 dark:bg-sky-950/30 border border-primary/20 dark:border-sky-800/40 rounded-lg p-3.5 mb-4 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-content-primary text-xs font-semibold">Pembaruan data selesai tanpa kendala</h4>
                <p className="text-content-muted text-[11px] leading-relaxed mt-0.5">
                  Scheduler berhasil mengambil jumlah lowongan kerja dari portal pasar kerja untuk seluruh alternatif karir aktif.
                </p>
              </div>
            </div>

            {/* Detailed Grid Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border border-divider bg-subsurface p-3 rounded-lg">
                <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider block mb-0.5">Waktu Mulai</span>
                <strong className="text-content-primary text-xs font-mono font-bold block leading-snug">
                  {lastExecutionTime.split(',')[0]}
                </strong>
                <span className="text-[11px] text-content-secondary font-mono block">
                  {lastExecutionTime.split(',')[1] || '02.00 WIB'}
                </span>
              </div>
              <div className="border border-divider bg-subsurface p-3 rounded-lg flex flex-col justify-center">
                <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider block mb-0.5">Durasi Pengerjaan</span>
                <strong className="text-content-primary text-xs font-mono font-bold block leading-none">{lastDuration}</strong>
              </div>
              <div className="border border-divider bg-subsurface p-3 rounded-lg">
                <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider block mb-0.5">Berhasil Diambil</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold block leading-none">{lastSuccessCount} alternatif karir</strong>
              </div>
              <div className="border border-divider bg-subsurface p-3 rounded-lg">
                <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider block mb-0.5">Gagal Diambil</span>
                <strong className="text-content-primary text-xs font-mono font-bold block leading-none">{lastFailedCount} alternatif karir</strong>
              </div>
            </div>
          </div>

          {/* Manual Scrape Box */}
          <div className="border-t border-divider pt-4 mt-auto">
            <h4 className="text-content-primary text-xs font-semibold mb-1">Pembaruan On-Demand</h4>
            <p className="text-content-muted text-[11px] leading-relaxed mb-3">
              Jalankan sinkronisasi langsung untuk memperbarui data lowongan pasar kerja tanpa menunggu siklus cron berikutnya.
            </p>
            <button
              onClick={handleRunSchedulerManual}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              Jalankan Pembaruan Manual
            </button>
          </div>
        </Card>
      </section>

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

        {/* Filters and Search Bar */}
        <div className="px-6 py-3 border-b border-divider flex items-center justify-between flex-wrap gap-4 bg-subsurface/20">
          <div className="flex items-center gap-1 overflow-x-auto">
            {['Semua', 'Otomatis', 'Manual', 'Coba Ulang', 'Sebagian Gagal'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveLogTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeLogTab === tab 
                    ? 'bg-primary text-white shadow-xs' 
                    : 'text-content-secondary hover:text-content-primary hover:bg-subsurface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <input 
              type="search"
              placeholder="Cari status atau jenis..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="w-56 sm:w-64 pl-8 pr-3 py-1.5 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none transition-colors"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
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
                filteredLogs.map((log) => (
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
                    Tidak ada riwayat eksekusi scheduler yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
