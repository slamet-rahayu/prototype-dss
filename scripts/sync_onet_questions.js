import { PrismaClient } from '@prisma/client';
import { FALLBACK_ONET_QUESTIONS, ONET_QUESTIONS_ID_TRANSLATIONS } from '../src/server/services/onetService.js';

const prisma = new PrismaClient();

async function sync() {
  console.log('🔄 Memulai sinkronisasi 30 butir pertanyaan O*NET ke basis data...');

  for (const q of FALLBACK_ONET_QUESTIONS) {
    const dimLetter = q.area.charAt(0).toUpperCase();
    const indonesian = ONET_QUESTIONS_ID_TRANSLATIONS[q.index] || '';
    const questionText = q.text;

    await prisma.riasecQuestion.upsert({
      where: { id: q.index },
      update: {
        type: dimLetter,
        question: questionText,
        isActive: true
      },
      create: {
        id: q.index,
        type: dimLetter,
        question: questionText,
        isActive: true
      }
    });
  }

  const allQuestions = await prisma.riasecQuestion.findMany({ orderBy: { id: 'asc' } });
  console.log(`✅ Berhasil! Total pertanyaan di DB: ${allQuestions.length}`);
  console.log('Contoh Soal 1:', allQuestions[0]);
  console.log('Contoh Soal 30:', allQuestions[29]);
}

sync()
  .catch(err => console.error('❌ Gagal sinkronisasi:', err))
  .finally(() => prisma.$disconnect());
