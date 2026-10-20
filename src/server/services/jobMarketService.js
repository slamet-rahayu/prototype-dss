import { dbRepository } from '../db/index.js';

export async function runMarketDataSync({ executionType = 'Manual' } = {}) {
  const startTime = new Date();
  const careers = await dbRepository.getCareers();

  let successCount = 0;
  let failedCount = 0;
  const careerSyncDetails = [];

  for (const career of careers) {
    try {
      // Simulate real-world market fluctuation: -2 to +2
      const delta = Math.floor(Math.random() * 5) - 2;
      const currentScore = career.marketDemandScore || 80;
      const newScore = Math.min(100, Math.max(50, currentScore + delta));

      const vacancyDelta = Math.floor(Math.random() * 11) - 5;
      const currentVacancy = career.marketDetail?.vacancyCount || 200;
      const newVacancy = Math.max(50, currentVacancy + vacancyDelta);

      await dbRepository.updateJobMarket(career.id, {
        marketDemandScore: newScore,
        vacancyCount: newVacancy
      });

      successCount++;
      careerSyncDetails.push({
        careerId: career.id,
        careerName: career.title || career.name,
        icon: career.icon || '⌘',
        status: 'Berhasil',
        vacancyCount: newVacancy,
        score: newScore,
        location: career.marketDetail?.primaryLocation || 'Jakarta, Bandung, dan Remote',
        trend: career.marketDetail?.trendStatus || 'Tren meningkat'
      });
    } catch (err) {
      failedCount++;
      careerSyncDetails.push({
        careerId: career.id,
        careerName: career.title || career.name,
        icon: career.icon || '⌘',
        status: 'Gagal',
        vacancyCount: career.marketDetail?.vacancyCount || 0,
        score: career.marketDemandScore || 0,
        error: err.message
      });
    }
  }

  const finishedTime = new Date();
  const durationSec = Number(((finishedTime.getTime() - startTime.getTime()) / 1000).toFixed(2));

  const logEntry = await dbRepository.createSchedulerLog({
    jobName: 'MARKET_DATA_REFRESH',
    executionType,
    status: failedCount === 0 ? 'Berhasil' : 'Sebagian Gagal',
    processed: careers.length,
    successCount,
    failedCount,
    durationSec,
    message: failedCount === 0
      ? 'Seluruh data pasar karir berhasil diperbarui.'
      : `${failedCount} dari ${careers.length} karir gagal disinkronisasi.`,
    startedAt: startTime.toISOString(),
    finishedAt: finishedTime.toISOString(),
    careerSyncDetails
  });

  return {
    log: logEntry,
    processed: careers.length,
    successCount,
    failedCount,
    durationSec,
    careerSyncDetails
  };
}
