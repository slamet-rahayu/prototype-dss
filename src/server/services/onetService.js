/**
 * O*NET Web Services Integration Service
 * 
 * Mengintegrasikan instrumen RIASEC O*NET Interest Profiler:
 * - Questions 30: /mnm/interestprofiler/questions_30?start=1&end=2000
 * - Results: /mnm/interestprofiler/results?answers=<30_digits>
 * - Careers: /mnm/interestprofiler/careers
 */

const ONET_BASE_URL = (
  process.env.ONET_WEB_SERVICE_API ||
  process.env.ONET_BASE_URL ||
  'https://api-v2.onetcenter.org'
).replace(/\/+$/, '');

const ONET_API_KEY = (
  process.env.ONET_XAPI_KEY ||
  process.env.ONET_X_API_KEY ||
  process.env.ONET_API_KEY ||
  ''
).trim();

// Terjemahan Bahasa Indonesia untuk 30 butir pertanyaan O*NET Interest Profiler
export const ONET_QUESTIONS_ID_TRANSLATIONS = {
  1: 'Merakit atau membuat lemari dapur',
  2: 'Mengembangkan formula obat baru',
  3: 'Menulis buku atau naskah drama/sandiwara',
  4: 'Membantu orang yang menghadapi masalah pribadi atau emosional',
  5: 'Mengelola sebuah departemen di perusahaan besar',
  6: 'Menginstal perangkat lunak di berbagai komputer pada jaringan besar',
  7: 'Memperbaiki peralatan rumah tangga atau elektronik',
  8: 'Mempelajari cara-cara menanggulangi pencemaran air',
  9: 'Menciptakan atau mengaransemen karya musik',
  10: 'Memberikan bimbingan atau konseling karir kepada orang lain',
  11: 'Merintis dan mendirikan bisnis sendiri',
  12: 'Mengoperasikan kalkulator atau mesin hitung administrasi',
  13: 'Merakit komponen dan suku cadang elektronik',
  14: 'Melakukan eksperimen kimia di laboratorium',
  15: 'Membuat efek visual khusus (VFX) untuk film',
  16: 'Menjalankan terapi rehabilitasi bagi pemulihan pasien',
  17: 'Menegosiasikan kontrak bisnis dan kemitraan komersial',
  18: 'Mencatat dan mengelola logistik pengiriman barang',
  19: 'Mengemudikan kendaraan pengiriman paket ke kantor dan rumah',
  20: 'Memeriksa sampel darah menggunakan mikroskop',
  21: 'Melukis dan mendesain tata panggung pertunjukan',
  22: 'Menjadi relawan aktif di organisasi nirlaba',
  23: 'Merancang strategi pemasaran untuk lini busana baru',
  24: 'Mendata inventaris barang menggunakan komputer genggam',
  25: 'Menguji kontrol kualitas (QC) komponen sebelum dikirim',
  26: 'Mengembangkan metode atau model prediksi cuaca yang akurat',
  27: 'Menulis naskah skenario film atau program televisi',
  28: 'Mengajar siswa dalam kelas sekolah menengah',
  29: 'Menjual produk dagang dan melayani pelanggan di toko ritel',
  30: 'Menyortir, mencap, dan mendistribusikan surat dokumen organisasi'
};

// Opsi jawaban resmi O*NET dengan label Bahasa Indonesia
export const ONET_ANSWER_OPTIONS = [
  { value: 1, name: 'Strongly Dislike', label: 'Sangat Tidak Suka', points: 0 },
  { value: 2, name: 'Dislike', label: 'Tidak Suka', points: 1 },
  { value: 3, name: 'Unsure', label: 'Ragu-ragu / Netral', points: 2 },
  { value: 4, name: 'Like', label: 'Suka', points: 3 },
  { value: 5, name: 'Strongly Like', label: 'Sangat Suka', points: 4 }
];

// Fallback lokal 30 pertanyaan O*NET jika terjadi kegagalan jaringan
export const FALLBACK_ONET_QUESTIONS = [
  { index: 1, area: 'realistic', text: 'Build kitchen cabinets' },
  { index: 2, area: 'investigative', text: 'Develop a new medicine' },
  { index: 3, area: 'artistic', text: 'Write books or plays' },
  { index: 4, area: 'social', text: 'Help people with personal or emotional problems' },
  { index: 5, area: 'enterprising', text: 'Manage a department within a large company' },
  { index: 6, area: 'conventional', text: 'Install software across computers on a large network' },
  { index: 7, area: 'realistic', text: 'Repair household appliances' },
  { index: 8, area: 'investigative', text: 'Study ways to reduce water pollution' },
  { index: 9, area: 'artistic', text: 'Compose or arrange music' },
  { index: 10, area: 'social', text: 'Give career guidance to people' },
  { index: 11, area: 'enterprising', text: 'Start your own business' },
  { index: 12, area: 'conventional', text: 'Operate a calculator' },
  { index: 13, area: 'realistic', text: 'Assemble electronic parts' },
  { index: 14, area: 'investigative', text: 'Conduct chemical experiments' },
  { index: 15, area: 'artistic', text: 'Create special effects for movies' },
  { index: 16, area: 'social', text: 'Perform rehabilitation therapy' },
  { index: 17, area: 'enterprising', text: 'Negotiate business contracts' },
  { index: 18, area: 'conventional', text: 'Keep shipping and receiving records' },
  { index: 19, area: 'realistic', text: 'Drive a truck to deliver packages to offices and homes' },
  { index: 20, area: 'investigative', text: 'Examine blood samples using a microscope' },
  { index: 21, area: 'artistic', text: 'Paint sets for plays' },
  { index: 22, area: 'social', text: 'Do volunteer work at a non-profit organization' },
  { index: 23, area: 'enterprising', text: 'Market a new line of clothing' },
  { index: 24, area: 'conventional', text: 'Inventory supplies using a hand-held computer' },
  { index: 25, area: 'realistic', text: 'Test the quality of parts before shipment' },
  { index: 26, area: 'investigative', text: 'Develop a way to better predict the weather' },
  { index: 27, area: 'artistic', text: 'Write scripts for movies or television shows' },
  { index: 28, area: 'social', text: 'Teach a high-school class' },
  { index: 29, area: 'enterprising', text: 'Sell merchandise at a department store' },
  { index: 30, area: 'conventional', text: 'Stamp, sort, and distribute mail for an organization' }
];

// In-Memory cache untuk pertanyaan O*NET agar menghemat kuota request
let cachedQuestions = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 jam

export class OnetService {
  /**
   * Mengambil base URL O*NET yang aktif
   */
  static getBaseUrl() {
    return ONET_BASE_URL;
  }

  /**
   * Mengambil API key O*NET
   */
  static getApiKey() {
    return ONET_API_KEY;
  }

  /**
   * Mengambil header standar untuk request ke O*NET Web Services
   */
  static getHeaders() {
    return {
      'X-API-Key': ONET_API_KEY,
      'Accept': 'application/json',
      'User-Agent': 'CareerPath-TI/1.0 (Next.js RIASEC Integration)'
    };
  }

  /**
   * Mengambil 30 pertanyaan Interest Profiler dari O*NET Web Services
   * Endpoint: /mnm/interestprofiler/questions_30?start=1&end=2000
   * 
   * @param {Object} options
   * @param {boolean} options.forceRefresh - Lewati cache jika true
   * @returns {Promise<{ questions: Array, answerOptions: Array, source: string }>}
   */
  static async getQuestions({ forceRefresh = false } = {}) {
    const now = Date.now();
    if (!forceRefresh && cachedQuestions && (now - cacheTimestamp) < CACHE_TTL_MS) {
      return {
        questions: cachedQuestions,
        answerOptions: ONET_ANSWER_OPTIONS,
        source: 'cache'
      };
    }

    try {
      const url = `${ONET_BASE_URL}/mnm/interestprofiler/questions_30?start=1&end=2000`;
      const res = await fetch(url, {
        headers: this.getHeaders(),
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`O*NET HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const rawQuestions = Array.isArray(data.question) ? data.question : [];

      if (rawQuestions.length === 0) {
        throw new Error('O*NET mengembalikan daftar pertanyaan kosong');
      }

      const formatted = rawQuestions.map((q) => {
        const areaLower = String(q.area || 'realistic').toLowerCase();
        const dimLetter = areaLower.charAt(0).toUpperCase();
        const indonesianText = ONET_QUESTIONS_ID_TRANSLATIONS[q.index] || q.text;

        return {
          id: q.index,
          index: q.index,
          type: dimLetter,
          area: areaLower,
          text: q.text,
          question: q.text,
          translation: indonesianText,
          textId: indonesianText,
          combinedText: `${q.text} (${indonesianText})`
        };
      });

      cachedQuestions = formatted;
      cacheTimestamp = now;

      return {
        questions: formatted,
        answerOptions: ONET_ANSWER_OPTIONS,
        source: 'onet'
      };
    } catch (err) {
      console.warn('Gagal memuat pertanyaan langsung dari O*NET, menggunakan fallback terstruktur:', err.message);

      const formattedFallback = FALLBACK_ONET_QUESTIONS.map((q) => {
        const areaLower = String(q.area).toLowerCase();
        const dimLetter = areaLower.charAt(0).toUpperCase();
        const indonesianText = ONET_QUESTIONS_ID_TRANSLATIONS[q.index] || q.text;

        return {
          id: q.index,
          index: q.index,
          type: dimLetter,
          area: areaLower,
          text: q.text,
          question: q.text,
          translation: indonesianText,
          textId: indonesianText,
          combinedText: `${q.text} (${indonesianText})`
        };
      });

      return {
        questions: formattedFallback,
        answerOptions: ONET_ANSWER_OPTIONS,
        source: 'fallback'
      };
    }
  }

  /**
   * Menormalisasi berbagai format jawaban ke string 30 karakter '1'-'5'
   * @param {string|Array} answers
   * @returns {string}
   */
  static normalizeAnswersString(answers) {
    if (typeof answers === 'string') {
      const clean = answers.trim();
      if (/^[1-5]{30}$/.test(clean)) {
        return clean;
      }
      if (/^[1-5]+$/.test(clean)) {
        return clean.padEnd(30, '3').slice(0, 30);
      }
    }

    if (Array.isArray(answers)) {
      // Format 1: Array of objects [{ questionId: 1, score: 4 }, ...]
      // Format 2: Array of numbers [4, 1, 1, ...]
      const mapped = new Array(30).fill(3);

      answers.forEach((item, idx) => {
        let qIdx = idx;
        let score = 3;

        if (typeof item === 'object' && item !== null) {
          const qId = Number(item.questionId || item.id || idx + 1);
          qIdx = qId - 1;
          score = Number(item.score || item.value || 3);
        } else {
          score = Number(item) || 3;
        }

        score = Math.max(1, Math.min(5, Math.round(score)));
        if (qIdx >= 0 && qIdx < 30) {
          mapped[qIdx] = score;
        }
      });

      return mapped.join('');
    }

    // Default neutral answers jika tidak ada format yang valid
    return '3'.repeat(30);
  }

  /**
   * Menghitung skor RIASEC menggunakan O*NET Web Services
   * Endpoint: /mnm/interestprofiler/results?answers=<30_digits>
   * 
   * @param {string|Array} answers - String 30 digit atau array jawaban
   * @returns {Promise<Object>}
   */
  static async calculateResults(answers) {
    const answersString = this.normalizeAnswersString(answers);

    try {
      const url = `${ONET_BASE_URL}/mnm/interestprofiler/results?answers=${answersString}`;
      const res = await fetch(url, {
        headers: this.getHeaders(),
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`O*NET HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const rawResults = Array.isArray(data.result) ? data.result : [];

      const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      const descriptions = {};

      rawResults.forEach((item) => {
        const codeLower = String(item.code || '').toLowerCase();
        const dimLetter = codeLower.charAt(0).toUpperCase();
        if (scores[dimLetter] !== undefined) {
          scores[dimLetter] = Number(item.score) || 0;
          descriptions[dimLetter] = item.description || '';
        }
      });

      // Urutkan dimensi untuk menentukan 3 kode dominan (Holland Code)
      const sortedDimensions = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([dim]) => dim);

      const topHolland = sortedDimensions.slice(0, 3).join('');
      const primaryDimension = sortedDimensions[0];

      return {
        scores,
        topHolland,
        primaryDimension,
        answersString,
        careersUrl: data.careers || null,
        rawResults,
        descriptions,
        source: 'onet'
      };
    } catch (err) {
      console.warn('Gagal memanggil O*NET results API, melakukan kalkulasi lokal O*NET:', err.message);

      // Kalkulasi lokal menggunakan aturan resmi O*NET (5 soal per dimensi, nilai 1..5 -> 0..4 poin)
      const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      const dimOrder = ['R', 'I', 'A', 'S', 'E', 'C'];

      for (let i = 0; i < 30; i++) {
        const dim = dimOrder[i % 6];
        const answerVal = Number(answersString[i]) || 3;
        // O*NET scoring: 1->0, 2->1, 3->2, 4->3, 5->4
        const point = Math.max(0, Math.min(4, answerVal - 1));
        scores[dim] += point;
      }

      const sortedDimensions = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([dim]) => dim);

      const topHolland = sortedDimensions.slice(0, 3).join('');

      return {
        scores,
        topHolland,
        primaryDimension: sortedDimensions[0],
        answersString,
        careersUrl: null,
        rawResults: [],
        descriptions: {},
        source: 'local-fallback'
      };
    }
  }

  /**
   * Menyinkronkan 30 butir pertanyaan O*NET ke basis data PostgreSQL / Prisma
   * @param {Object} prismaClient - Instance PrismaClient
   * @returns {Promise<{ total: number, source: string, questions: Array }>}
   */
  static async syncQuestionsToDatabase(prismaClient) {
    const qData = await this.getQuestions({ forceRefresh: true });
    const questions = qData.questions;
    const synced = [];

    for (const q of questions) {
      const dimLetter = q.type || q.area?.charAt(0).toUpperCase() || 'R';
      const questionText = q.text;

      if (prismaClient?.riasecQuestion) {
        try {
          await prismaClient.riasecQuestion.upsert({
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
        } catch (e) {
          console.warn(`Prisma upsert question #${q.index} warning:`, e.message);
        }
      }

      synced.push({
        id: q.index,
        index: q.index,
        type: dimLetter,
        area: q.area,
        text: questionText,
        question: questionText,
        translation: q.translation || ONET_QUESTIONS_ID_TRANSLATIONS[q.index] || ''
      });
    }

    return {
      total: synced.length,
      source: qData.source,
      syncedAt: new Date().toISOString(),
      questions: synced
    };
  }
}
