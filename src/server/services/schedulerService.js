import cron from 'node-cron';
import { dbRepository } from '../db/index.js';

const DEFAULT_MASTER_CONFIG = {
  schedulerName: 'Pembaruan Data Pasar Kerja',
  schedulerCode: 'MARKET_DATA_REFRESH',
  frequency: 'Setiap Hari',
  executionTime: '02.00',
  timezone: 'Asia/Jakarta',
  cronExpression: process.env.MARKET_CRON_EXPRESSION || '0 2 * * *',
  isAutoEnabled: true,
  updatedAt: new Date().toISOString()
};

// Global singleton to avoid multiple timers during Next.js hot module reloads
const globalForScheduler = globalThis;

if (!globalForScheduler.__marketDataSchedulerState) {
  globalForScheduler.__marketDataSchedulerState = {
    task: null,
    config: { ...DEFAULT_MASTER_CONFIG },
    isRunning: false,
    initialized: false,
    lastRunAt: null,
    lastError: null
  };
}

const schedulerState = globalForScheduler.__marketDataSchedulerState;

/**
 * Normalizes timezone string (e.g. "Asia/Jakarta (WIB)" -> "Asia/Jakarta")
 */
function normalizeTimezone(tz) {
  if (!tz) return 'Asia/Jakarta';
  const clean = tz.split(' ')[0].trim();
  return clean || 'Asia/Jakarta';
}

/**
 * Validates a cron expression using node-cron.
 * Supports standard 5-segment and 6-segment expressions.
 */
export function validateCronExpression(expression) {
  if (!expression || typeof expression !== 'string') return false;
  return cron.validate(expression.trim());
}

/**
 * Executes market data synchronization for a single career item
 * without external API calls (safe internal market simulation & DB update).
 */
async function executeCareerDataSync(configItem) {
  const career = configItem.careerId ? await dbRepository.getCareerById(configItem.careerId) : null;
  const keyword = career?.jobMarketKeyword || career?.marketDetail?.jobMarketKeyword || career?.title || configItem.careerName;

  // Realistic market score variation: -2 to +2
  const delta = Math.floor(Math.random() * 5) - 2;
  const currentScore = career?.marketDemandScore || 80;
  const newScore = Math.min(100, Math.max(50, currentScore + delta));

  // Vacancy variation: -5 to +5
  const vacancyDelta = Math.floor(Math.random() * 11) - 5;
  const currentVacancy = career?.marketDetail?.vacancyCount || 200;
  const newVacancy = Math.max(50, currentVacancy + vacancyDelta);

  if (configItem.careerId) {
    await dbRepository.updateJobMarket(configItem.careerId, {
      marketDemandScore: newScore,
      vacancyCount: newVacancy
    });
  }

  return {
    keyword,
    score: newScore,
    vacancyCount: newVacancy,
    location: career?.marketDetail?.primaryLocation || 'Jakarta, Bandung, dan Remote',
    trend: career?.marketDetail?.trendStatus || 'Tren meningkat'
  };
}

/**
 * Processes the queue of scheduler configs sequentially using async recursion.
 * Prevents simultaneous execution of items (one-by-one sequential processing).
 *
 * @param {Array} queue - Array of SchedulerConfig objects to process
 * @param {number} index - Current queue index
 * @param {Array} results - Accumulated execution results
 * @returns {Promise<Array>} Array of execution results
 */
export async function processQueueRecursive(queue, index = 0, results = []) {
  if (index >= queue.length) {
    return results;
  }

  const item = queue[index];
  const itemStartTime = Date.now();

  console.log(`[Queue Worker] [${index + 1}/${queue.length}] Memproses karir: "${item.careerName}"...`);

  let itemResult;
  try {
    const syncRes = await executeCareerDataSync(item);
    const duration = Number(((Date.now() - itemStartTime) / 1000).toFixed(2));

    // Update individual scheduler config status in DB
    await dbRepository.updateSchedulerConfig(item.id, {
      lastRunAt: new Date().toISOString(),
      lastStatus: 'Berhasil'
    });

    itemResult = {
      configId: item.id,
      careerId: item.careerId,
      careerName: item.careerName,
      status: 'Berhasil',
      vacancyCount: syncRes.vacancyCount,
      score: syncRes.score,
      location: syncRes.location,
      trend: syncRes.trend,
      durationSec: duration,
      message: `Pembaruan data karir ${item.careerName} berhasil.`
    };
  } catch (err) {
    const duration = Number(((Date.now() - itemStartTime) / 1000).toFixed(2));

    await dbRepository.updateSchedulerConfig(item.id, {
      lastRunAt: new Date().toISOString(),
      lastStatus: 'Gagal'
    });

    itemResult = {
      configId: item.id,
      careerId: item.careerId,
      careerName: item.careerName,
      status: 'Gagal',
      durationSec: duration,
      error: err.message,
      message: `Gagal memproses karir ${item.careerName}: ${err.message}`
    };
  }

  results.push(itemResult);

  // Short pause for clean asynchronous sequential iteration
  await new Promise(resolve => setTimeout(resolve, 50));

  // Recursive call for the next item in the queue
  return processQueueRecursive(queue, index + 1, results);
}

/**
 * Main workflow:
 * 1. Checks data in table SchedulerConfig
 * 2. Filters active configs (or target config for manual retry)
 * 3. Executes items sequentially via async recursive queue
 * 4. Records summary log into SchedulerLog table
 */
export async function executeScheduledWorkflow({ 
  executionType = 'Otomatis', 
  configId = null,
  onlyFailures = false 
} = {}) {
  if (schedulerState.isRunning) {
    throw new Error('Sinkronisasi scheduler saat ini sedang berjalan. Harap tunggu hingga antrian selesai.');
  }

  schedulerState.isRunning = true;
  const startTime = new Date();
  schedulerState.lastRunAt = startTime.toISOString();
  schedulerState.lastError = null;

  try {
    // 1. Fetch configs from SchedulerConfig table
    const allConfigs = await dbRepository.getSchedulerConfigs();

    // 2. Filter queue items
    let queue = [];
    if (configId) {
      const target = allConfigs.find(c => c.id === configId || c.careerId === configId);
      if (target) queue = [target];
    } else if (onlyFailures) {
      queue = allConfigs.filter(c => c.isActive && (c.lastStatus === 'Gagal' || c.lastStatus === 'Sebagian Gagal'));
    } else {
      queue = allConfigs.filter(c => c.isActive);
    }

    if (queue.length === 0) {
      const message = configId
        ? `Konfigurasi dengan ID "${configId}" tidak ditemukan atau tidak aktif.`
        : (onlyFailures
            ? 'Tidak ada antrian karir dengan status gagal untuk dijalankan ulang.'
            : 'Tidak ada konfigurasi scheduler aktif yang perlu dieksekusi.');

      const finishedTime = new Date();
      const logEntry = await dbRepository.createSchedulerLog({
        jobName: 'MARKET_DATA_REFRESH',
        executionType,
        status: 'Berhasil',
        processed: 0,
        successCount: 0,
        failedCount: 0,
        durationSec: 0,
        message,
        startedAt: startTime.toISOString(),
        finishedAt: finishedTime.toISOString(),
        careerSyncDetails: []
      });

      return {
        log: logEntry,
        processed: 0,
        successCount: 0,
        failedCount: 0,
        durationSec: 0,
        careerSyncDetails: []
      };
    }

    // 3. Process queue sequentially using async recursion
    console.log(`[Scheduler] Memulai eksekusi antrian (${executionType}): ${queue.length} item...`);
    const results = await processQueueRecursive(queue, 0, []);

    const finishedTime = new Date();
    const durationSec = Number(((finishedTime.getTime() - startTime.getTime()) / 1000).toFixed(2));

    const successCount = results.filter(r => r.status === 'Berhasil').length;
    const failedCount = results.filter(r => r.status !== 'Berhasil').length;

    const logStatus = failedCount === 0 
      ? 'Berhasil' 
      : (successCount > 0 ? 'Sebagian Gagal' : 'Gagal');

    const logMessage = failedCount === 0
      ? `Seluruh data pasar karir (${successCount} karir) berhasil diproses melalui antrian.`
      : `${failedCount} dari ${results.length} karir mengalami kendala saat eksekusi antrian.`;

    // 4. Save execution log into SchedulerLog table
    const logEntry = await dbRepository.createSchedulerLog({
      jobName: 'MARKET_DATA_REFRESH',
      executionType,
      status: logStatus,
      processed: results.length,
      successCount,
      failedCount,
      durationSec,
      message: logMessage,
      startedAt: startTime.toISOString(),
      finishedAt: finishedTime.toISOString(),
      careerSyncDetails: results
    });

    console.log(`[Scheduler] Antrian selesai dalam ${durationSec}s. Sukses: ${successCount}, Gagal: ${failedCount}. Log ID: ${logEntry.id}`);

    return {
      log: logEntry,
      processed: results.length,
      successCount,
      failedCount,
      durationSec,
      careerSyncDetails: results
    };
  } catch (err) {
    schedulerState.lastError = err.message;
    throw err;
  } finally {
    schedulerState.isRunning = false;
  }
}

/**
 * Initializes the background node-cron scheduler (runs once a day by default).
 * When triggered, it checks SchedulerConfig and processes active items via queue.
 */
export function initScheduler() {
  if (schedulerState.initialized && schedulerState.task) {
    return getSchedulerStatus();
  }

  const { cronExpression, timezone, isAutoEnabled } = schedulerState.config;

  if (schedulerState.task) {
    try {
      schedulerState.task.stop();
      schedulerState.task.destroy();
    } catch {
      // Ignore cleanup error
    }
    schedulerState.task = null;
  }

  if (isAutoEnabled) {
    const cleanExpression = cronExpression.trim();
    if (validateCronExpression(cleanExpression)) {
      const activeTz = normalizeTimezone(timezone);
      try {
        schedulerState.task = cron.schedule(
          cleanExpression,
          async () => {
            console.log(`[node-cron] Memulai pemeriksaan harian tabel SchedulerConfig (${new Date().toISOString()})...`);
            await executeScheduledWorkflow({ executionType: 'Otomatis' });
          },
          {
            scheduled: true,
            timezone: activeTz,
            noOverlap: true
          }
        );
        console.log(`[node-cron] Scheduler harian aktif: "${cleanExpression}" [${activeTz}]. Next run: ${schedulerState.task.getNextRun?.()}`);
      } catch (err) {
        console.error('[node-cron] Gagal menjadwalkan task:', err);
        schedulerState.lastError = err.message;
      }
    } else {
      console.warn(`[node-cron] Ekspresi cron tidak valid: "${cronExpression}". Scheduler dinonaktifkan.`);
    }
  }

  schedulerState.initialized = true;
  return getSchedulerStatus();
}

/**
 * Executes a manual sync job (on-demand or specific failure retry).
 */
export async function executeSync({ 
  executionType = 'Manual', 
  configId = null, 
  onlyFailures = false 
} = {}) {
  return await executeScheduledWorkflow({ executionType, configId, onlyFailures });
}

/**
 * Updates master scheduler cron schedule dynamically.
 */
export function updateSchedulerConfig(newConfig = {}) {
  const merged = {
    ...schedulerState.config,
    ...newConfig,
    updatedAt: new Date().toISOString()
  };

  if (newConfig.cronExpression) {
    const isValid = validateCronExpression(newConfig.cronExpression);
    if (!isValid) {
      throw new Error(`Ekspresi cron "${newConfig.cronExpression}" tidak valid. Format harus 5 atau 6 segmen yang didukung node-cron.`);
    }
  }

  schedulerState.config = merged;

  // Re-register node-cron task
  schedulerState.initialized = false;
  initScheduler();

  return getSchedulerStatus();
}

/**
 * Returns current scheduler status along with master config.
 */
export function getSchedulerStatus() {
  const nextRunDate = schedulerState.task?.getNextRun ? schedulerState.task.getNextRun() : null;

  return {
    config: schedulerState.config,
    isScheduled: !!schedulerState.task,
    isRunning: schedulerState.isRunning,
    taskStatus: schedulerState.task?.getStatus ? schedulerState.task.getStatus() : 'stopped',
    nextRun: nextRunDate ? nextRunDate.toISOString() : null,
    lastRunAt: schedulerState.lastRunAt,
    lastError: schedulerState.lastError
  };
}

/**
 * Stops the master cron task.
 */
export function stopScheduler() {
  if (schedulerState.task) {
    try {
      schedulerState.task.stop();
      schedulerState.task.destroy();
    } catch {
      // Ignore
    }
    schedulerState.task = null;
  }
  schedulerState.config.isAutoEnabled = false;
  schedulerState.initialized = true;
  return getSchedulerStatus();
}
