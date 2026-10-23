import { OnetService } from '@/server/services/onetService.js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const answers = searchParams.get('answers');

    if (!answers) {
      return NextResponse.json(
        { error: 'Parameter answers wajib diisi (contoh: ?answers=411111411111411111411111411111)' },
        { status: 400 }
      );
    }

    const normalizedAnswers = OnetService.normalizeAnswersString(answers);
    const baseUrl = OnetService.getBaseUrl();
    const headers = OnetService.getHeaders();

    const onetUrl = `${baseUrl}/mnm/interestprofiler/results?answers=${normalizedAnswers}`;
    const res = await fetch(onetUrl, { headers, cache: 'no-store' });

    if (!res.ok) {
      // Fallback ke kalkulasi lokal O*NET
      const localRes = await OnetService.calculateResults(normalizedAnswers);
      return NextResponse.json({
        careers: null,
        result: [
          { code: 'realistic', title: 'Realistic', score: localRes.scores.R },
          { code: 'investigative', title: 'Investigative', score: localRes.scores.I },
          { code: 'artistic', title: 'Artistic', score: localRes.scores.A },
          { code: 'social', title: 'Social', score: localRes.scores.S },
          { code: 'enterprising', title: 'Enterprising', score: localRes.scores.E },
          { code: 'conventional', title: 'Conventional', score: localRes.scores.C }
        ]
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Gagal menghitung hasil RIASEC melalui O*NET' },
      { status: 500 }
    );
  }
}
