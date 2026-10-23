import { OnetService } from '@/server/services/onetService.js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') || '1';
    const end = searchParams.get('end') || '2000';

    const baseUrl = OnetService.getBaseUrl();
    const headers = OnetService.getHeaders();

    const onetUrl = `${baseUrl}/mnm/interestprofiler/questions_30?start=${start}&end=${end}`;
    const res = await fetch(onetUrl, { headers, cache: 'no-store' });

    if (!res.ok) {
      // Fallback ke OnetService getQuestions jika O*NET error
      const fallback = await OnetService.getQuestions();
      return NextResponse.json({
        start: Number(start),
        end: Math.min(Number(end), fallback.questions.length),
        total: fallback.questions.length,
        answer_option: fallback.answerOptions,
        question: fallback.questions.map(q => ({
          index: q.index,
          area: q.area,
          text: q.text
        }))
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil data pertanyaan dari O*NET' },
      { status: 500 }
    );
  }
}
