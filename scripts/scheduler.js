#!/usr/bin/env node

/**
 * CareerPath TI - Standalone Background Scheduler Runner
 * Powered by node-cron
 *
 * Usage:
 *   node scripts/scheduler.js          -> Starts continuous cron daemon
 *   node scripts/scheduler.js --now    -> Runs market sync immediately and exits
 */

import { existsSync } from 'node:fs';

// Auto-load .env if available
if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch (err) {
    console.warn('[Scheduler Warning] Tidak dapat memuat .env:', err.message);
  }
}

import { 
  initScheduler, 
  executeSync, 
  stopScheduler 
} from '../src/server/services/schedulerService.js';

const isImmediateRun = process.argv.includes('--now') || process.argv.includes('--run-now');

console.log('========================================================');
console.log('   CAREERPATH TI - BACKGROUND SCHEDULER WORKER');
console.log('   Sinkronisasi Data Pasar Kerja berbasis node-cron');
console.log('========================================================\n');

async function main() {
  if (isImmediateRun) {
    console.log('[Worker] Menjalankan sinkronisasi data pasar kerja langsung (--now)...');
    try {
      const result = await executeSync({ executionType: 'Manual' });
      console.log(`[Worker] Selesai. Diproses: ${result.processed}, Sukses: ${result.successCount}, Gagal: ${result.failedCount}`);
      process.exit(0);
    } catch (err) {
      console.error('[Worker Error] Sinkronisasi gagal:', err.message);
      process.exit(1);
    }
    return;
  }

  // Initialize node-cron background schedule
  const status = initScheduler();

  console.log(`[Worker] Status Scheduler: ${status.isScheduled ? 'AKTIF (Berjalan)' : 'NONAKTIF'}`);
  console.log(`[Worker] Pola Cron       : ${status.config.cronExpression}`);
  console.log(`[Worker] Zona Waktu      : ${status.config.timezone}`);
  console.log(`[Worker] Eksekusi Berikut : ${status.nextRun ? new Date(status.nextRun).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB' : 'Tidak terjadwal'}`);
  console.log('\n[Worker] Worker daemon sedang berjalan dan mendengarkan jadwal cron.');
  console.log('[Worker] Tekan CTRL + C untuk menghentikan proses.\n');

  // Graceful shutdown handling
  const handleShutdown = (signal) => {
    console.log(`\n[Worker] Menerima sinyal ${signal}. Menghentikan scheduler node-cron secara bersih...`);
    stopScheduler();
    console.log('[Worker] Scheduler dihentikan. Keluar.');
    process.exit(0);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[Fatal Worker Error]:', err);
  process.exit(1);
});
