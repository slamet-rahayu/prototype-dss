import assert from 'node:assert/strict';
import { 
  initScheduler, 
  validateCronExpression, 
  executeSync, 
  executeScheduledWorkflow,
  processQueueRecursive,
  stopScheduler 
} from '../src/server/services/schedulerService.js';
import { dbRepository } from '../src/server/db/index.js';

console.log('====================================================');
console.log('   TEST SCHEDULER ALUR ANTRIAN REKURSIF & CRON');
console.log('====================================================\n');

async function runTests() {
  // Test 1: Validasi Ekspresi Cron
  console.log('--- Test 1: Validasi Ekspresi Cron ---');
  assert.equal(validateCronExpression('0 2 * * *'), true, 'Pola harian 02:00 WIB valid');
  assert.equal(validateCronExpression('0 * * * *'), true, 'Pola per jam valid');
  assert.equal(validateCronExpression('invalid cron'), false, 'String sembarang invalid');
  console.log('[PASS] Validasi ekspresi cron node-cron berhasil.');

  // Test 2: Inisialisasi & Verifikasi Tabel SchedulerConfig
  console.log('\n--- Test 2: Pengecekan Data Tabel SchedulerConfig ---');
  const configs = await dbRepository.getSchedulerConfigs();
  assert.ok(Array.isArray(configs), 'Tabel scheduler config harus berupa array');
  assert.equal(configs.length, 9, 'Tabel scheduler config harus memuat 9 karir');
  assert.ok(configs.every(c => c.careerName && c.cronExpression), 'Setiap data config harus memiliki careerName dan cronExpression');
  console.log(`[PASS] Terverifikasi ${configs.length} konfigurasi karir di tabel SchedulerConfig.`);

  // Test 3: Pengujian Antrian Sekuensial Rekursif Async
  console.log('\n--- Test 3: Pengujian Antrian Sekuensial Rekursif Async ---');
  const sampleQueue = configs.slice(0, 3); // Ambil 3 sampel karir
  const queueStartTime = Date.now();
  const queueResults = await processQueueRecursive(sampleQueue, 0, []);
  const queueDuration = Date.now() - queueStartTime;

  assert.equal(queueResults.length, 3, 'Hasil antrian harus memuat 3 item');
  assert.ok(queueResults.every(r => r.status === 'Berhasil'), 'Seluruh sampel harus berstatus Berhasil');
  assert.ok(queueDuration >= 150, 'Antrian sekuensial rekursif harus memiliki jeda waktu berurutan');
  console.log(`[PASS] Antrian rekursif async memproses ${queueResults.length} karir satu demi satu (durasi: ${queueDuration}ms).`);

  // Test 4: Eksekusi Alur Lengkap Scheduler (Config -> Antrian -> SchedulerLog)
  console.log('\n--- Test 4: Eksekusi Alur Penuh (Cron -> Config -> Antrian -> Log) ---');
  const prevLogs = await dbRepository.getSchedulerLogs({ limit: 100 });
  const workflowResult = await executeScheduledWorkflow({ executionType: 'Otomatis' });

  assert.ok(workflowResult.processed > 0, 'Karir yang diproses harus > 0');
  assert.equal(workflowResult.successCount + workflowResult.failedCount, workflowResult.processed, 'Total sukses dan gagal harus sama dengan processed');
  
  const updatedLogs = await dbRepository.getSchedulerLogs({ limit: 100 });
  const latestLog = updatedLogs[0];
  assert.ok(latestLog && (latestLog.id !== prevLogs[0]?.id || updatedLogs.length >= prevLogs.length), 'Log eksekusi baru harus tersimpan di tabel SchedulerLog');
  assert.equal(latestLog.executionType, 'Otomatis', 'Execution type harus Otomatis');
  assert.ok(latestLog.durationSec >= 0, 'Durasi harus terhitung');
  console.log(`[PASS] Alur selesai. Diproses: ${workflowResult.processed} karir, Tersimpan ke log ID: ${latestLog.id}`);

  // Test 5: Eksekusi Manual On-Demand & Karir Spesifik
  console.log('\n--- Test 5: Eksekusi Manual (On-Demand & Karir Tertentu) ---');
  const singleCareerResult = await executeSync({ 
    executionType: 'Manual', 
    configId: configs[0].id 
  });
  assert.equal(singleCareerResult.processed, 1, 'Eksekusi spesifik ID hanya memproses 1 karir');
  assert.equal(singleCareerResult.successCount, 1, 'Karir tunggal harus berhasil dieksekusi');
  console.log(`[PASS] Eksekusi manual karir tunggal (${configs[0].careerName}) berhasil.`);

  // Test 6: Inisialisasi & Penghentian Cron Daemon
  console.log('\n--- Test 6: Inisialisasi & Penghentian Cron Daemon ---');
  const cronStatus = initScheduler();
  assert.equal(cronStatus.isScheduled, true, 'Scheduler harus aktif');
  const stopped = stopScheduler();
  assert.equal(stopped.isScheduled, false, 'Scheduler harus berhenti setelah stopScheduler');
  console.log('[PASS] Cron daemon diinisialisasi dan dihentikan dengan bersih.');

  // Test 7: Sinkronisasi Antrian dari Data Alternatif Karir & Eksekusi Manual
  console.log('\n--- Test 7: Sinkronisasi Antrian dari Data Alternatif Karir & Eksekusi Manual ---');
  const careers = await dbRepository.getCareers();
  const queueConfigs = await dbRepository.getSchedulerConfigs();

  assert.ok(careers.length > 0, 'Data alternatif karir harus ada');
  assert.equal(queueConfigs.length, careers.length, 'Jumlah antrian scheduler harus sama dengan jumlah alternatif karir aktif');

  // Pastikan setiap alternatif karir terwakili di antrian
  for (const career of careers) {
    const matching = queueConfigs.find(q => q.careerId === career.id || q.careerName.toLowerCase() === (career.title || career.name).toLowerCase());
    assert.ok(matching, `Alternatif karir "${career.title || career.name}" harus ada di antrian scheduler`);
  }
  console.log(`[PASS] Terverifikasi seluruh ${careers.length} alternatif karir otomatis disinkronkan ke antrian scheduler.`);

  // Pengujian Eksekusi Manual Karir Terpilih
  const firstItem = queueConfigs[0];
  const manualResult = await executeSync({ executionType: 'Manual', configId: firstItem.id });
  assert.equal(manualResult.processed, 1, 'Eksekusi manual harus memproses tepat 1 karir');
  assert.equal(manualResult.successCount, 1, 'Eksekusi manual harus berstatus sukses');
  console.log(`[PASS] Eksekusi manual on-demand karir (${firstItem.careerName}) berhasil.`);

  console.log('\n====================================================');
  console.log('   Seluruh Pengujian Alur Scheduler Berhasil! (7/7)');
  console.log('====================================================\n');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  });
