import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSequences() {
  console.log('Fixing PostgreSQL autoincrement sequences...');
  try {
    const tables = [
      { table: 'AcademicSubject', seq: 'AcademicSubject_id_seq' },
      { table: 'RiasecQuestion', seq: 'RiasecQuestion_id_seq' },
      { table: 'SchedulerLog', seq: 'SchedulerLog_id_seq' }
    ];

    for (const t of tables) {
      try {
        const maxRes = await prisma.$queryRawUnsafe(`SELECT MAX(id) as max_id FROM "${t.table}"`);
        const maxId = Number(maxRes[0]?.max_id || 0);
        const nextVal = maxId + 1;
        await prisma.$queryRawUnsafe(`SELECT setval('"${t.seq}"', ${nextVal}, false)`);
        console.log(`[PASS] Sequence "${t.seq}" synced. Max ID was ${maxId}, next value set to ${nextVal}`);
      } catch (err) {
        console.warn(`Could not sync sequence "${t.seq}":`, err.message);
      }
    }
  } catch (err) {
    console.error('Fatal sequence fix error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fixSequences();
