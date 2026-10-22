import assert from 'node:assert/strict';
import { dbRepository } from '../src/server/db/index.js';

console.log('Testing career jobMarketKeyword functionality...');

async function testCareerKeyword() {
  const careers = await dbRepository.getCareers();
  assert.ok(careers.length > 0, 'Harus ada data karir');

  const firstCareer = careers[0];
  console.log(`Checking career: "${firstCareer.title}"`);
  console.log(`Current jobMarketKeyword: "${firstCareer.jobMarketKeyword || firstCareer.marketDetail?.jobMarketKeyword}"`);

  // Test updating keyword
  const testKeyword = `${firstCareer.title} Specialist`;
  const updated = await dbRepository.updateCareer(firstCareer.id, {
    jobMarketKeyword: testKeyword
  });

  assert.ok(updated, 'Update harus berhasil');
  
  // Re-fetch to verify persistence
  const reloaded = await dbRepository.getCareerById(firstCareer.id);
  const reloadedKeyword = reloaded.jobMarketKeyword || reloaded.marketDetail?.jobMarketKeyword;
  assert.equal(reloadedKeyword, testKeyword, 'Keyword yang diperbarui harus tersimpan');
  console.log(`[PASS] Keyword berhasil diperbarui menjadi "${reloadedKeyword}".`);

  // Restore original keyword
  await dbRepository.updateCareer(firstCareer.id, {
    jobMarketKeyword: firstCareer.title
  });
  console.log(`[PASS] Keyword berhasil dikembalikan ke "${firstCareer.title}".`);

  console.log('\n[SUCCESS] Seluruh pengujian jobMarketKeyword berhasil!');
}

testCareerKeyword().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
