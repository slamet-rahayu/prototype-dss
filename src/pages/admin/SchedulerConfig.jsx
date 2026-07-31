import React, { useState, useMemo, useEffect } from 'react';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { 
  Search, 
  Clock, 
  RotateCw, 
  Calendar, 
  Hourglass, 
  CheckCircle, 
  Database,
  Sliders,
  Info,
  SlidersHorizontal
} from 'lucide-react';

export default function SchedulerConfig() {
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Left Column Config Form States
  const [schedulerName, setSchedulerName] = useState('Pembaruan Data Pasar Kerja');
  const [schedulerCode, setSchedulerCode] = useState('MARKET_DATA_REFRESH');
  const [frequency, setFrequency] = useState('Setiap Hari');
  const [executionTime, setExecutionTime] = useState('02.00');
  const [timezone, setTimezone] = useState('Asia/Jakarta (WIB)');
  const [cronExpression, setCronExpression] = useState('0 0 2 * * *');
  const [isAutoEnabled, setIsAutoEnabled] = useState(true);

  // Right Column Execution Summary States
  const [lastExecutionTime, setLastExecutionTime] = useState('26 Juni 2026, 02.00 WIB');
  const [lastDuration, setLastDuration] = useState('00 menit 18 detik');
  const [lastSuccessCount, setLastSuccessCount] = useState(8);
  const [lastFailedCount, setLastFailedCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // History List State
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [activeLogTab, setActiveLogTab] = useState('Semua');
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [logs, setLogs] = useState([
    {
      id: 1,
      startTime: "26 Juni 2026, 02.00 WIB",
      endTime: "26 Juni 2026, 02.00.18 WIB",
      type: "Otomatis",
      status: "Berhasil",
      processed: "8 karir",
      success: 8,
      failed: 0,
      message: "Seluruh data berhasil diperbarui"
    },
    {
      id: 2,
      startTime: "25 Juni 2026, 02.00 WIB",
      endTime: "25 Juni 2026, 02.00.21 WIB",
      type: "Otomatis",
      status: "Sebagian Gagal",
      processed: "8 karir",
      success: 7,
      failed: 1,
      message: "Satu permintaan API gagal"
    },
    {
      id: 3,
      startTime: "25 Juni 2026, 02.15 WIB",
      endTime: "25 Juni 2026, 02.15.04 WIB",
      type: "Coba Ulang",
      status: "Berhasil",
      processed: "1 karir",
      success: 1,
      failed: 0,
      message: "Business Analyst berhasil diperbarui"
    },
    {
      id: 4,
      startTime: "24 Juni 2026, 13.25 WIB",
      endTime: "24 Juni 2026, 13.25.17 WIB",
      type: "Manual",
      status: "Berhasil",
      processed: "8 karir",
      success: 8,
      failed: 0,
      message: "Dijalankan oleh Administrator"
    }
  ]);

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  const handleResetConfig = () => {
    setSchedulerName('Pembaruan Data Pasar Kerja');
    setSchedulerCode('MARKET_DATA_REFRESH');
    setFrequency('Setiap Hari');
    setExecutionTime('02.00');
    setTimezone('Asia/Jakarta (WIB)');
    setCronExpression('0 0 2 * * *');
    setIsAutoEnabled(true);
    triggerToast("Konfigurasi diatur ulang ke default.");
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    triggerToast("Konfigurasi scheduler berhasil disimpan.");
  };

  const handleLihatRiwayat = () => {
    document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRunSchedulerManual = () => {
    if (isRunning) return;
    setIsRunning(true);
    triggerToast("Pembaruan manual dimulai. Menghubungkan ke Adzuna API...");

    setTimeout(() => {
      const now = new Date();
      const formatTimeStr = (d) => {
        const day = d.getDate().toString().padStart(2, '0');
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const hour = d.getHours().toString().padStart(2, '0');
        const minute = d.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year}, ${hour}.${minute} WIB`;
      };
      
      const startTimeStr = formatTimeStr(now);
      const finishedTime = new Date(now.getTime() + 15000); // 15s duration
      const endTimeStr = formatTimeStr(finishedTime);

      const newLog = {
        id: Date.now(),
        startTime: startTimeStr,
        endTime: endTimeStr,
        type: "Manual",
        status: "Berhasil",
        processed: "8 karir",
        success: 8,
        failed: 0,
        message: "Dijalankan oleh Administrator"
      };

      setLogs(prev => [newLog, ...prev]);
      setLastExecutionTime(startTimeStr);
      setLastDuration("00 menit 15 detik");
      setLastSuccessCount(8);
      setLastFailedCount(0);
      setIsRunning(false);
      triggerToast("Pembaruan manual selesai. Seluruh data karir berhasil diperbarui.");
    }, 2000);
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
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-slate-500">Manajemen Scheduler</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Manajemen Scheduler</h1>
          <p className="text-slate-500 text-sm mt-2">
            Atur jadwal pembaruan data pasar kerja dari Adzuna API, jalankan pembaruan manual, dan pantau riwayat proses pengambilan data setiap alternatif karir.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button 
            onClick={handleLihatRiwayat}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:border-slate-350 bg-white text-slate-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex-1 md:flex-none"
          >
            <Clock className="w-3.5 h-3.5" />
            Lihat Riwayat
          </button>
          <button 
            onClick={handleRunSchedulerManual}
            disabled={isRunning}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 disabled:opacity-50 flex-1 md:flex-none"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            Perbarui Sekarang
          </button>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Metric 1 */}
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-blue-50 text-primary-dark grid place-items-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Status Scheduler</span>
            <strong className="text-2.5xl font-black text-slate-900 block leading-none">Aktif</strong>
            <span className="text-[10px] text-emerald-600 font-extrabold block mt-2">Berjalan setiap hari</span>
          </div>
        </article>
        
        {/* Metric 2 */}
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-blue-50 text-primary-dark grid place-items-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Karir Aktif</span>
            <strong className="text-2.5xl font-black text-slate-900 block leading-none">8</strong>
            <span className="text-[10px] text-slate-400 font-medium block mt-2">Diproses pada setiap eksekusi</span>
          </div>
        </article>

        {/* Metric 3 */}
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-blue-50 text-primary-dark grid place-items-center">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Eksekusi Terakhir</span>
            <strong className="text-2.5xl font-black text-slate-900 block leading-none">8/8</strong>
            <span className="text-[10px] text-emerald-600 font-extrabold block mt-2">Seluruh karir berhasil diperbarui</span>
          </div>
        </article>

        {/* Metric 4 */}
        <article className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-blue-50 text-primary-dark grid place-items-center">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Jadwal Berikutnya</span>
            <strong className="text-2.5xl font-black text-slate-900 block leading-none">02.00</strong>
            <span className="text-[10px] text-slate-400 font-medium block mt-2">27 Juni 2026, Asia/Jakarta</span>
          </div>
        </article>
      </section>

      {/* Two Column Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left Column: Config Form */}
        <article className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                Konfigurasi Scheduler
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Pengaturan jadwal otomatis pembaruan jumlah lowongan kerja setiap alternatif karir.</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100">
              ● Aktif
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="grid gap-4 text-xs font-bold text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="name-sched">Nama Scheduler</label>
                <input 
                  id="name-sched"
                  type="text"
                  value={schedulerName}
                  onChange={(e) => setSchedulerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="code-sched">Kode Scheduler</label>
                <input 
                  id="code-sched"
                  type="text"
                  value={schedulerCode}
                  onChange={(e) => setSchedulerCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="freq-sched">Frekuensi</label>
                <select 
                  id="freq-sched"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800 cursor-pointer"
                >
                  <option>Setiap Hari</option>
                  <option>Setiap Minggu</option>
                  <option>Setiap Bulan</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="time-sched">Waktu Eksekusi</label>
                <div className="relative">
                  <input 
                    id="time-sched"
                    type="text"
                    value={executionTime}
                    onChange={(e) => setExecutionTime(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800"
                    required
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="tz-sched">Zona Waktu</label>
                <select 
                  id="tz-sched"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800 cursor-pointer"
                >
                  <option>Asia/Jakarta (WIB)</option>
                  <option>Asia/Makassar (WITA)</option>
                  <option>Asia/Jayapura (WIT)</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="cron-sched">Cron Expression</label>
                <input 
                  id="cron-sched"
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="mt-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h4 className="text-slate-800 text-[11px] font-black">Aktifkan scheduler otomatis</h4>
                <p className="text-slate-400 text-[10px] font-medium leading-relaxed mt-0.5">
                  Jika dinonaktifkan, pembaruan data pasar kerja hanya dapat dilakukan manual oleh administrator.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoEnabled(!isAutoEnabled)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${isAutoEnabled ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isAutoEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={handleResetConfig}
                className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500 font-extrabold text-[11px] rounded-xl cursor-pointer"
              >
                Atur Ulang
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-extrabold text-[11px] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </article>

        {/* Right Column: Execution Summary */}
        <article className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 flex flex-col justify-between self-stretch">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-sm font-black text-slate-900">Status Pembaruan Terakhir</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Ringkasan eksekusi scheduler paling baru.</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100">
                ● Berhasil
              </span>
            </div>

            {/* Success Alert Banner */}
            <div className="bg-blue-50/55 border border-blue-100 rounded-xl p-4 mb-4 flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <h4 className="text-primary-dark text-[11px] font-black">Pembaruan data selesai tanpa kendala</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5">
                  Scheduler berhasil mengambil jumlah lowongan dari Adzuna API untuk seluruh alternatif karir aktif.
                </p>
              </div>
            </div>

            {/* Detailed Grid Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border border-slate-100 bg-slate-50/30 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Waktu Mulai</span>
                <strong className="text-slate-800 text-xs font-black block leading-snug">
                  {lastExecutionTime.split(',')[0]}
                </strong>
                <span className="text-[10px] text-slate-500 font-bold block">
                  {lastExecutionTime.split(',')[1] || '02.00 WIB'}
                </span>
              </div>
              <div className="border border-slate-100 bg-slate-50/30 p-3 rounded-xl flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Durasi</span>
                <strong className="text-slate-800 text-xs font-black block leading-none">{lastDuration}</strong>
              </div>
              <div className="border border-slate-100 bg-slate-50/30 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Berhasil</span>
                <strong className="text-slate-800 text-xs font-black block leading-none">{lastSuccessCount} alternatif karir</strong>
              </div>
              <div className="border border-slate-100 bg-slate-50/30 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Gagal</span>
                <strong className="text-slate-800 text-xs font-black block leading-none">{lastFailedCount} alternatif karir</strong>
              </div>
            </div>
          </div>

          {/* Manual Scrape Box */}
          <div className="border-t border-slate-100 pt-5 mt-auto">
            <h4 className="text-slate-800 text-[11px] font-black mb-1">Butuh data terbaru sekarang?</h4>
            <p className="text-slate-500 text-[10px] leading-relaxed mb-4">
              Jalankan pembaruan manual untuk seluruh alternatif karir aktif tanpa menunggu jadwal berikutnya.
            </p>
            <button
              onClick={handleRunSchedulerManual}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md active:scale-[0.98]"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              Jalankan Pembaruan Manual
            </button>
          </div>
        </article>
      </section>

      {/* Bottom Table Card */}
      <section id="history-section" className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between scroll-mt-6">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Riwayat Eksekusi Scheduler</h2>
            <p className="text-slate-500 text-xs mt-0.5">Daftar proses pembaruan otomatis, manual, maupun proses coba ulang.</p>
          </div>
          <span className="inline-flex px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black rounded-full">
            Data dari scheduler_logs
          </span>
        </div>

        {/* Filters and Search Bar */}
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4 bg-slate-50/20">
          <div className="flex items-center gap-1.5 overflow-x-auto p-0.5">
            {['Semua', 'Otomatis', 'Manual', 'Coba Ulang', 'Sebagian Gagal'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveLogTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeLogTab === tab 
                    ? 'bg-primary-light text-primary-dark shadow-sm border border-primary/10' 
                    : 'text-slate-500 hover:bg-slate-100/80'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <input 
              type="search"
              placeholder="Cari status atau jenis eksekusi..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="w-56 sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-xs transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                <th className="px-6 py-3.5">Waktu Mulai</th>
                <th className="px-6 py-3.5">Jenis</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Diproses</th>
                <th className="px-6 py-3.5">Berhasil</th>
                <th className="px-6 py-3.5">Gagal</th>
                <th className="px-6 py-3.5">Pesan</th>
                <th className="px-6 py-3.5 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <strong className="text-slate-800 font-bold block">{log.startTime}</strong>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Selesai: {log.endTime}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-650 font-bold">
                    {log.type}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      log.status === 'Berhasil' 
                        ? 'text-emerald-800 bg-emerald-50 border border-emerald-100' 
                        : 'text-amber-800 bg-amber-50 border border-amber-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.status === 'Berhasil' ? 'bg-emerald-600' : 'bg-amber-500'
                      }`} />
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {log.processed}
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-bold">
                    {log.success}
                  </td>
                  <td className="px-6 py-4 text-slate-850 font-bold">
                    {log.failed}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium leading-relaxed max-w-[200px] truncate" title={log.message}>
                    {log.message}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenDetail(log)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-600 font-black text-[10px] rounded-lg cursor-pointer transition-all active:scale-[0.97]"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    Tidak ada riwayat eksekusi scheduler yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Log Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        title="Detail Eksekusi Scraper"
        onClose={() => setIsDetailModalOpen(false)}
      >
        {selectedLogDetail && (
          <div className="grid gap-4 text-sm leading-relaxed">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <strong className="text-slate-800 font-black block">Log ID: #{selectedLogDetail.id}</strong>
                <span className="text-slate-400 text-xs font-bold block mt-0.5">{selectedLogDetail.startTime}</span>
              </div>
              <span className={`px-3 py-0.5 rounded-full text-xs font-black ${
                selectedLogDetail.status === 'Berhasil' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
              }`}>
                {selectedLogDetail.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-xs block">Tipe Eksekusi</span>
                <strong className="text-slate-700 font-extrabold block">{selectedLogDetail.type}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Waktu Selesai</span>
                <strong className="text-slate-700 font-extrabold block">{selectedLogDetail.endTime}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Total Diproses</span>
                <strong className="text-slate-700 font-extrabold block">{selectedLogDetail.processed}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Pesan Status</span>
                <strong className="text-slate-700 font-extrabold block">{selectedLogDetail.message}</strong>
              </div>
            </div>

            <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
              <h4 className="font-black text-slate-800 text-xs mb-3">Statistik Detail Alternatif Karir</h4>
              <div className="grid gap-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 font-bold">Eksekusi Berhasil:</span>
                  <strong className="text-emerald-700 font-black">{selectedLogDetail.success} Karir</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Eksekusi Gagal:</span>
                  <strong className="text-rose-600 font-black">{selectedLogDetail.failed} Karir</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      <Toast 
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <footer className="mt-16 text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        CareerPath · Sistem Rekomendasi Karir untuk Mahasiswa Tingkat Akhir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
