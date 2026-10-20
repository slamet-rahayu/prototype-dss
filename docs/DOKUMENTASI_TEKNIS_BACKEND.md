# DOKUMENTASI TEKNIS PENGEMBANGAN BACKEND (BACKEND TECHNICAL SPECIFICATION)
## Sistem Pendukung Keputusan (SPK) Pemilihan Karir Berbasis RIASEC & Simple Additive Weighting (SAW)
**Bahasa Pemrograman: JavaScript (Node.js)**  
**Target Proyek:** `prototype-dss`

---

## 1. PENDAHULUAN & RINGKASAN SISTEM

### 1.1 Latar Belakang
Aplikasi `prototype-dss` merupakan Sistem Pendukung Keputusan (SPK) untuk memberikan rekomendasi jalur karir bidang Teknologi Informasi kepada mahasiswa. Evaluasi keputusan didasarkan pada perpaduan tiga kriteria multi-faktor:
1. **Kriteria 1 (C1) - Minat Karir**: Evaluasi psikometri berbasis teori minat karir Holland (RIASEC: *Realistic, Investigative, Artistic, Social, Enterprising, Conventional*).
2. **Kriteria 2 (C2) - Kemampuan Akademik**: Pencapaian nilai mahasiswa pada kelompok mata kuliah inti teknologi informasi yang relevan.
3. **Kriteria 3 (C3) - Kebutuhan Pasar Kerja**: Indeks tren, ketersediaan lowongan, dan stabilitas permintaan industri untuk masing-masing profesi TI.

Pada fase purwarupa awal (prototype), seluruh penyimpanan dan komputasi berjalan di sisi klien (*client-side*) menggunakan browser `localStorage` dan React Context. Dokumen ini merinci rancangan dan implementasi teknis untuk membangun infrastruktur **Backend RESTful API** berbasis **JavaScript (Node.js)** guna memindahkan logika bisnis, penyimpanan data terpusat, autentikasi multi-peran, dan otomatisasi tugas (*scheduler*).

### 1.2 Tujuan Fungsional Backend
* **Penyimpanan Terpusat & Persisten**: Menggantikan `localStorage` dengan Basis Data Relasional (*Relational Database Management System*).
* **Autentikasi & Otorisasi Berbasis Peran**: Pengelolaan akun aman menggunakan JSON Web Token (JWT) dengan hak akses terpisah: `student` (mahasiswa) dan `admin` (administrator).
* **Kalkulasi Deterministik & Valid**: Pemrosesan kuesioner RIASEC dan algoritma Simple Additive Weighting (SAW) dieksekusi di server untuk menjamin integritas data dan riwayat keputusan.
* **Otomatisasi Data Pasar Kerja (*Worker/Scheduler*)**: Background cron job untuk memperbarui statistik pasar kerja secara periodik.
* **Audit Trail**: Pencatatan riwayat rekomendasi dan histori eksekusi scheduler.

---

## 2. ARSITEKTUR SISTEM & TECH STACK

### 2.1 Arsitektur Perangkat Lunak
Backend dirancang menggunakan **Layered Architecture (N-Tier)** dengan prinsip *Separation of Concerns* (SoC):

```
+-------------------------------------------------------------------------+
|                      Client Layer (React + Vite)                        |
+-------------------------------------------------------------------------+
                                    |  HTTP/HTTPS (JSON REST API)
                                    v
+-------------------------------------------------------------------------+
|                          API Gateway / Routes                           |
|       - Express.js Router                                               |
|       - CORS & Helmet Middleware                                        |
|       - Rate Limiting Middleware                                        |
|       - Authentication & Authorization Middleware (JWT)                 |
|       - Request Payload Validation (Zod / Joi)                          |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                           Controller Layer                              |
|   (Menerima Request, Memanggil Service, Mengembalikan Standard JSON)    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                            Service Layer                                |
|   (Logika Bisnis Inti, SAW Engine, RIASEC Evaluator, Auth Logic)        |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                      Data Access Layer (ORM / DAO)                      |
|       - Prisma ORM (Object-Relational Mapping)                          |
|       - Database Client Pool                                            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                   Database Layer (PostgreSQL / MySQL)                   |
+-------------------------------------------------------------------------+
                                    ^
                                    |
+-------------------------------------------------------------------------+
|                     Background Task Layer (Cron)                        |
|       - node-cron (Pembaruan Data Pasar Kerja Otomatis)                 |
+-------------------------------------------------------------------------+
```

### 2.2 Spesifikasi Teknologi (Tech Stack)
* **Runtime**: Node.js (v20+ LTS)
* **Bahasa**: JavaScript (ECMAScript 2022+ / Native ES Modules `"type": "module"`)
* **Web Framework**: Express.js (v4.21+)
* **Database**: PostgreSQL (v15+) atau MySQL (v8.0+)
* **ORM & Migrations**: Prisma ORM (v5+)
* **Autentikasi**: JSON Web Token (`jsonwebtoken`), Password Hashing (`bcryptjs`)
* **Validasi Skema**: Zod (`zod`)
* **Penjadwal Tugas (*Task Scheduler*)**: `node-cron`
* **Keamanan HTTP**: `helmet`, `cors`, `express-rate-limit`
* **Dokumentasi API**: Swagger UI (`swagger-ui-express`) / OpenAPI 3.0

---

## 3. STRUKTUR FOLDER BACKEND

Struktur direktori modular yang bersih dan mudah dipelihara:

```
backend-dss/
├── src/
│   ├── config/
│   │   ├── database.js          # Inisialisasi Prisma Client
│   │   ├── env.js               # Parser & validator environment variables
│   │   └── constants.js         # Konstanta sistem (Role, default bobot, dll)
│   ├── controllers/
│   │   ├── authController.js    # Login, Register, Profile, Logout
│   │   ├── studentController.js # Profil mahasiswa & data akademik
│   │   ├── riasecController.js  # Kuesioner, simpan jawaban, kalkulasi RIASEC
│   │   ├── careerController.js  # Katalog karir & kriteria bobot
│   │   ├── dssController.js     # Engine rekomendasi SAW & histori
│   │   ├── jobMarketController.js # Manajemen pasar kerja (C3)
│   │   └── schedulerController.js # Monitor & trigger manual scheduler
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verifikasi token JWT
│   │   ├── roleMiddleware.js    # Pengecekan otorisasi role ('admin', 'student')
│   │   ├── validateMiddleware.js# Middleware validator payload Zod
│   │   └── errorMiddleware.js   # Global Centralized Error Handling
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── riasecRoutes.js
│   │   ├── careerRoutes.js
│   │   ├── dssRoutes.js
│   │   ├── jobMarketRoutes.js
│   │   ├── schedulerRoutes.js
│   │   └── index.js             # Route aggregator (/api/v1)
│   ├── services/
│   │   ├── authService.js
│   │   ├── riasecService.js     # Logika kalkulasi skor RIASEC & Top-3 Codes
│   │   ├── sawEngineService.js  # Implementasi matematis algoritma SAW
│   │   ├── careerService.js
│   │   ├── jobMarketService.js
│   │   └── schedulerService.js  # Pengendali tugas berkala & logging
│   ├── jobs/
│   │   └── marketDataCron.js    # Definisi skrip cron pembaruan pasar kerja
│   ├── utils/
│   │   ├── apiResponse.js       # Standarisasi response payload format
│   │   └── logger.js            # Logger utilitas (Winston / Pino / Console)
│   ├── app.js                   # Konfigurasi middleware Express
│   └── server.js                # Entry point server listener
├── prisma/
│   ├── schema.prisma            # Skema entitas basis data & relasi
│   ├── seed.js                  # Data awal (default careers, questions, weights)
│   └── migrations/              # Riwayat migrasi database
├── .env.example
├── .gitignore
└── package.json
```

---

## 4. PERANCANGAN BASIS DATA (DATABASE SCHEMA)

Berikut rancangan skema menggunakan sintaks **Prisma ORM** (`prisma/schema.prisma`):

```prisma
datasource db {
  provider = "postgresql" // atau "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  ADMIN
}

// ----------------------------------------------------
// 1. PENGGUNA & MAHASISWA
// ----------------------------------------------------
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  role         Role          @default(STUDENT)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  student      Student?
  histories    RecommendationHistory[]
}

model Student {
  id           String        @id @default(uuid())
  userId       String        @unique
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  nim          String        @unique
  fullName     String
  university   String        @default("Universitas Esa Unggul")
  studyProgram String        @default("Teknologi Informasi")
  semester     String        @default("Semester 7")
  domicile     String        @default("Jakarta, Indonesia")
  avatarUrl    String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  grades       AcademicGrade[]
  riasecResult RiasecResult?
}

// ----------------------------------------------------
// 2. KRITERIA C2: AKADEMIK
// ----------------------------------------------------
model AcademicSubject {
  id          Int             @id @default(autoincrement())
  name        String          @unique // Contoh: "Pemrograman", "Basis Data"
  description String
  icon        String          @default("⌘")
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  grades      AcademicGrade[]
  careerWeights CareerAcademicWeight[]
}

model AcademicGrade {
  id          String          @id @default(uuid())
  studentId   String
  student     Student         @relation(fields: [studentId], references: [id], onDelete: Cascade)
  subjectId   Int
  subject     AcademicSubject @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  grade       Float           // Rentang 0 - 100
  status      String          // "Sangat Baik", "Baik", "Cukup"
  semester    String          // "Semester 7"
  academicYear String         // "2025/2026"
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@unique([studentId, subjectId])
}

// ----------------------------------------------------
// 3. KRITERIA C1: RIASEC ASSESSMENT
// ----------------------------------------------------
enum RiasecDimension {
  R // Realistic
  I // Investigative
  A // Artistic
  S // Social
  E // Enterprising
  C // Conventional
}

model RiasecQuestion {
  id        Int             @id @default(autoincrement())
  type      RiasecDimension
  question  String
  isActive  Boolean         @default(true)
  createdAt DateTime        @default(now())
}

model RiasecResult {
  id          String   @id @default(uuid())
  studentId   String   @unique
  student     Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  scoreR      Int      @default(0)
  scoreI      Int      @default(0)
  scoreA      Int      @default(0)
  scoreS      Int      @default(0)
  scoreE      Int      @default(0)
  scoreC      Int      @default(0)
  topHolland  String   // Contoh: "IRC"
  answersJson Json     // Array jawaban 1-18
  completedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ----------------------------------------------------
// 4. MASTER KARIR, PASAR KERJA (C3) & PEMBOBOTAN
// ----------------------------------------------------
model Career {
  id                String                 @id @default(uuid())
  slug              String                 @unique // software-engineer
  title             String                 @unique // Software Engineer
  subtitle          String
  description       String
  icon              String                 @default("⌘")
  marketDemandScore Float                  @default(80.0) // 0 - 100 (C3 Score)
  isActive          Boolean                @default(true)
  createdAt         DateTime               @default(now())
  updatedAt         DateTime               @updatedAt

  marketDetail      JobMarketDetail?
  riasecWeights     CareerRiasecWeight[]
  academicWeights   CareerAcademicWeight[]
}

model JobMarketDetail {
  id               String   @id @default(uuid())
  careerId         String   @unique
  career           Career   @relation(fields: [careerId], references: [id], onDelete: Cascade)
  vacancyCount     Int      @default(0)     // Jumlah estimasi lowongan
  trendStatus      String   @default("Tren meningkat")
  primaryLocation  String   @default("Jakarta, Bandung, dan Remote")
  requiredSkills   Json     // Array string: ["Java", "JavaScript", "SQL"]
  shortNote        String?
  updatedAt        DateTime @updatedAt
}

model CareerRiasecWeight {
  id         String          @id @default(uuid())
  careerId   String
  career     Career          @relation(fields: [careerId], references: [id], onDelete: Cascade)
  dimension  RiasecDimension
  weight     Float           // Persentase bobot kecocokan dimensi (0 - 100)

  @@unique([careerId, dimension])
}

model CareerAcademicWeight {
  id         String          @id @default(uuid())
  careerId   String
  career     Career          @relation(fields: [careerId], references: [id], onDelete: Cascade)
  subjectId  Int
  subject    AcademicSubject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  weight     Float           // Persentase kontribusi mata kuliah (0 - 100)

  @@unique([careerId, subjectId])
}

// ----------------------------------------------------
// 5. KONFIGURASI GLOBAL BOBOT SPK (SAW WEIGHTS)
// ----------------------------------------------------
model SawConfig {
  id          Int      @id @default(1)
  c1Weight    Float    @default(40.0) // Bobot C1 (Minat/RIASEC)
  c2Weight    Float    @default(35.0) // Bobot C2 (Akademik)
  c3Weight    Float    @default(25.0) // Bobot C3 (Pasar Kerja)
  isActive    Boolean  @default(true)
  updatedBy   String?
  updatedAt   DateTime @updatedAt
}

// ----------------------------------------------------
// 6. RIWAYAT PERHITUNGAN REKOMENDASI (DSS AUDIT TRAIL)
// ----------------------------------------------------
model RecommendationHistory {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  hollandCode   String   // Contoh: "IRC"
  topCareerName String   // Karir peringkat 1
  highestScore  Float    // Skor SAW tertinggi (0.00 - 1.00)
  status        String   @default("Valid") // "Valid", "Perlu Review"
  fullResult    Json     // Menyimpan detail seluruh perankingan dan matriks normalisasi
  calculatedAt  DateTime @default(now())
}

// ----------------------------------------------------
// 7. RIWAYAT EKSEKUSI PENJADWAL (SCHEDULER LOGS)
// ----------------------------------------------------
model SchedulerLog {
  id           Int      @id @default(autoincrement())
  jobName      String   // "MARKET_DATA_REFRESH"
  executionType String  // "Otomatis" atau "Manual"
  status       String   // "Berhasil", "Sebagian Gagal", "Gagal"
  processed    Int      // Jumlah data karir yang diproses
  successCount Int
  failedCount  Int
  durationSec  Float    // Durasi pengerjaan dalam detik
  message      String
  startedAt    DateTime @default(now())
  finishedAt   DateTime
}
```

---

## 5. LOGIKA BISNIS INTI & IMPLEMENTASI JAVASCRIPT

### 5.1 Evaluasi RIASEC (Holland Code Analyzer)
Kuesioner terdiri dari 18 pernyataan (3 pernyataan per dimensi). Nilai tiap dimensi merupakan akumulasi skor mahasiswa.

```javascript
// src/services/riasecService.js

/**
 * Menghitung skor masing-masing dimensi RIASEC dan menentukan 3 kode tertinggi (Holland Code).
 * @param {Array<{ questionId: number, score: number }>} answers - Nilai jawaban 1 s.d. 5
 * @param {Array<{ id: number, type: 'R'|'I'|'A'|'S'|'E'|'C' }>} questions 
 */
export function calculateRiasecScores(answers, questions) {
  const dimensionTotals = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const questionMap = new Map(questions.map(q => [q.id, q.type]));

  answers.forEach(({ questionId, score }) => {
    const dim = questionMap.get(questionId);
    if (dim && dimensionTotals[dim] !== undefined) {
      dimensionTotals[dim] += Number(score) || 0;
    }
  });

  // Urutkan dimensi berdasarkan skor tertinggi untuk mendapatkan 3 huruf teratas
  const sortedDimensions = Object.entries(dimensionTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([dim]) => dim);

  const topThree = sortedDimensions.slice(0, 3).join('');

  return {
    scores: dimensionTotals,
    topHolland: topThree,
    primaryDimension: sortedDimensions[0]
  };
}
```

### 5.2 Decision Support Engine: Simple Additive Weighting (SAW)

Algoritma SAW pada proyek ini mengolah 3 kriteria bertipe **Benefit** (semakin besar semakin baik):

$$\text{Nilai C1 (Minat)} = \frac{\sum (S_k \times W_{k})}{\sum W_{k} \times 15}$$

$$\text{Nilai C2 (Akademik)} = \frac{\sum (G_m \times W_{m})}{\sum W_{m} \times 100}$$

$$\text{Nilai C3 (Pasar)} = \frac{\text{Skor Kebutuhan Pasar}}{100}$$

#### Tahap 1: Normalisasi Matriks Keputusan ($R_{ij}$)
Karena semua kriteria bertipe *benefit*:
$$r_{ij} = \frac{x_{ij}}{\max_i(x_{ij})}$$

#### Tahap 2: Nilai Preferensi ($V_i$)
$$V_i = \sum_{j=1}^{n} w_j \cdot r_{ij} = (w_1 \cdot r_{i1}) + (w_2 \cdot r_{i2}) + (w_3 \cdot r_{i3})$$

Berikut implementasi murni JavaScript pada server:

```javascript
// src/services/sawEngineService.js

export class SawEngineService {
  /**
   * Menghitung nilai SAW dan perankingan rekomendasi karir.
   * @param {Object} params
   * @param {Object} params.riasecScores - { R, I, A, S, E, C }
   * @param {Array<{ name: string, grade: number }>} params.studentGrades
   * @param {Array<Object>} params.careers - List master karir beserta bobotnya
   * @param {{ c1Weight: number, c2Weight: number, c3Weight: number }} params.weights
   */
  static calculate({ riasecScores, studentGrades, careers, weights }) {
    const w1 = weights.c1Weight / 100;
    const w2 = weights.c2Weight / 100;
    const w3 = weights.c3Weight / 100;

    // 1. Hitung Nilai Mentah (Raw Scores x_ij)
    const rawMatrix = careers.map((career) => {
      // --- C1: Minat Karir (RIASEC) ---
      let c1Raw = 0;
      if (riasecScores && career.riasecWeights?.length > 0) {
        let weightedSum = 0;
        let totalWeight = 0;

        career.riasecWeights.forEach(({ dimension, weight }) => {
          if (weight > 0) {
            weightedSum += (riasecScores[dimension] || 0) * weight;
            totalWeight += weight;
          }
        });

        // Skor maksimal per pertanyaan adalah 5 x 3 = 15 per dimensi
        c1Raw = totalWeight > 0 ? (weightedSum / totalWeight) / 15 : 0;
      }

      // --- C2: Kemampuan Akademik ---
      let c2Raw = 0;
      if (studentGrades?.length > 0 && career.academicWeights?.length > 0) {
        let weightedGradeSum = 0;
        let totalAcademicWeight = 0;

        const gradeMap = new Map(studentGrades.map(g => [g.name, g.grade]));

        career.academicWeights.forEach(({ subjectName, weight }) => {
          const studentGrade = gradeMap.get(subjectName) || 0;
          weightedGradeSum += studentGrade * weight;
          totalAcademicWeight += weight;
        });

        // Normalisasi skala nilai 0-100 menjadi 0-1
        c2Raw = totalAcademicWeight > 0 ? (weightedGradeSum / totalAcademicWeight) / 100 : 0;
      }

      // --- C3: Pasar Kerja ---
      const c3Raw = (career.marketDemandScore || 80) / 100;

      return {
        careerId: career.id,
        name: career.title,
        icon: career.icon,
        subtitle: career.subtitle,
        description: career.description,
        marketDetail: career.marketDetail,
        c1Raw,
        c2Raw,
        c3Raw
      };
    });

    // 2. Tentukan Nilai Maksimum tiap Kriteria (max x_ij)
    const maxC1 = Math.max(...rawMatrix.map(item => item.c1Raw), 0.001);
    const maxC2 = Math.max(...rawMatrix.map(item => item.c2Raw), 0.001);
    const maxC3 = Math.max(...rawMatrix.map(item => item.c3Raw), 0.001);

    // 3. Normalisasi (r_ij) dan Hitung Nilai Preferensi (V_i)
    const evaluatedCareers = rawMatrix.map(item => {
      const r1 = item.c1Raw / maxC1;
      const r2 = item.c2Raw / maxC2;
      const r3 = item.c3Raw / maxC3;

      const preferenceValue = (r1 * w1) + (r2 * w2) + (r3 * w3);

      return {
        careerId: item.careerId,
        name: item.name,
        icon: item.icon,
        subtitle: item.subtitle,
        description: item.description,
        market: item.marketDetail,
        criteriaScores: {
          c1: {
            normalized: Number(r1.toFixed(4)),
            percentage: Math.round(r1 * 100),
            feedback: this.getFeedbackC1(r1)
          },
          c2: {
            normalized: Number(r2.toFixed(4)),
            percentage: Math.round(r2 * 100),
            feedback: this.getFeedbackC2(r2)
          },
          c3: {
            normalized: Number(r3.toFixed(4)),
            percentage: Math.round(r3 * 100),
            feedback: this.getFeedbackC3(r3)
          }
        },
        finalScore: Number(preferenceValue.toFixed(4)),
        preferenceValue
      };
    });

    // 4. Perangkingan Descending
    return evaluatedCareers
      .sort((a, b) => b.preferenceValue - a.preferenceValue)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }

  static getFeedbackC1(val) {
    if (val >= 0.9) return "Hasil RIASEC sangat sesuai dengan karakteristik karir.";
    if (val >= 0.7) return "Hasil RIASEC menunjukkan kesesuaian minat yang baik.";
    return "Kesesuaian minat terhadap karir ini tergolong cukup.";
  }

  static getFeedbackC2(val) {
    if (val >= 0.9) return "Nilai akademik pada mata kuliah utama sangat mendukung.";
    if (val >= 0.7) return "Nilai akademik relevan memiliki pencapaian yang baik.";
    return "Komponen akademik pendukung memiliki nilai cukup.";
  }

  static getFeedbackC3(val) {
    if (val >= 0.9) return "Peluang lowongan dan tren pekerjaan termasuk sangat tinggi.";
    if (val >= 0.7) return "Permintaan pasar kerja stabil dan bertumbuh positif.";
    return "Kebutuhan pasar kerja untuk peran ini tergolong sedang.";
  }
}
```

---

## 6. SPESIFIKASI RESTful API (API CONTRACTS)

### 6.1 Format Standar Respons JSON
Semua endpoint menggunakan format terpadu:

**Respons Sukses (HTTP 200/201):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operasi berhasil diselesaikan",
  "data": {},
  "meta": null
}
```

**Respons Error (HTTP 400/401/403/404/500):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Pesan deskripsi kesalahan",
  "errors": [
    { "field": "email", "issue": "Format email tidak valid" }
  ]
}
```

---

### 6.2 Daftar Endpoint API

#### A. Autentikasi (`/api/v1/auth`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Publik | Mendaftarkan akun mahasiswa baru |
| `POST` | `/api/v1/auth/login` | Publik | Otentikasi & menerbitkan JWT Token |
| `GET` | `/api/v1/auth/me` | Logged In | Mengambil profil user & mahasiswa aktif |
| `PUT` | `/api/v1/auth/profile` | Logged In | Memperbarui nama, universitas, domisili |

*Contoh Request Login:*
```json
POST /api/v1/auth/login
{
  "email": "mameriyadi6@gmail.com",
  "password": "PasswordRahasia123!"
}
```

*Contoh Response Login:*
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-12345",
      "email": "mameriyadi6@gmail.com",
      "role": "STUDENT",
      "student": {
        "nim": "20220801001",
        "fullName": "Mame Riyadi",
        "studyProgram": "Teknologi Informasi",
        "semester": "Semester 7"
      }
    }
  }
}
```

---

#### B. Asesmen RIASEC (`/api/v1/riasec`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/riasec/questions` | Student / Admin | Mengambil daftar 18 butir pertanyaan |
| `POST` | `/api/v1/riasec/submit` | Student | Mengirimkan lembar jawaban, menghitung skor |
| `GET` | `/api/v1/riasec/my-result` | Student | Mengambil hasil kalkulasi RIASEC terkini |

*Contoh Request Submit RIASEC:*
```json
POST /api/v1/riasec/submit
{
  "answers": [
    { "questionId": 1, "score": 5 },
    { "questionId": 2, "score": 4 },
    ...,
    { "questionId": 18, "score": 4 }
  ]
}
```

*Contoh Response Submit RIASEC:*
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Hasil asesmen RIASEC berhasil disimpan",
  "data": {
    "scores": { "R": 12, "I": 14, "A": 10, "S": 8, "E": 9, "C": 11 },
    "topHolland": "IRC",
    "completedAt": "2026-10-16T10:00:00.000Z"
  }
}
```

---

#### C. Data Akademik Mahasiswa (`/api/v1/academic`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/academic/subjects` | Student / Admin | Master daftar mata kuliah |
| `GET` | `/api/v1/academic/my-grades`| Student | Mengambil nilai akademik mahasiswa yang login |
| `PUT` | `/api/v1/academic/my-grades`| Student / Admin | Memperbarui nilai mata kuliah mahasiswa |

*Contoh Payload Update Nilai:*
```json
PUT /api/v1/academic/my-grades
{
  "grades": [
    { "subjectId": 1, "grade": 92 },
    { "subjectId": 2, "grade": 88 },
    { "subjectId": 3, "grade": 86 },
    { "subjectId": 4, "grade": 84 },
    { "subjectId": 5, "grade": 86 }
  ]
}
```

---

#### D. Rekomendasi Karir & SPK SAW (`/api/v1/recommendations`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/recommendations/calculate` | Student | Memproses algoritma SAW berdasarkan data mahasiswa |
| `GET` | `/api/v1/recommendations/latest` | Student | Mengambil hasil rekomendasi terakhir |
| `GET` | `/api/v1/recommendations/histories` | Student / Admin | Mengambil riwayat keputusan masa lalu |

*Contoh Response Rekomendasi:*
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Kalkulasi rekomendasi SAW selesai",
  "data": {
    "hollandCode": "IRC",
    "weightsApplied": { "c1": 40, "c2": 35, "c3": 25 },
    "rankings": [
      {
        "rank": 1,
        "careerId": "car-01",
        "name": "Software Engineer",
        "finalScore": 0.9124,
        "criteriaScores": {
          "c1": { "normalized": 0.9500, "percentage": 95, "feedback": "Hasil RIASEC sangat sesuai..." },
          "c2": { "normalized": 0.9200, "percentage": 92, "feedback": "Nilai akademik pada mata kuliah utama sangat mendukung." },
          "c3": { "normalized": 1.0000, "percentage": 100, "feedback": "Peluang lowongan dan tren sangat tinggi." }
        }
      },
      {
        "rank": 2,
        "careerId": "car-02",
        "name": "Data Analyst",
        "finalScore": 0.8842,
        "criteriaScores": { ... }
      }
    ]
  }
}
```

---

#### E. Administrasi & Konfigurasi SPK (`/api/v1/admin`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/saw-config` | Admin | Membaca bobot kriteria global C1, C2, C3 |
| `PUT` | `/api/v1/admin/saw-config` | Admin | Memperbarui bobot (harus total 100%) |
| `GET` | `/api/v1/admin/careers` | Admin | Manajemen master karir, bobot RIASEC & akademik |
| `POST`| `/api/v1/admin/careers` | Admin | Menambah jalur karir baru |
| `PUT` | `/api/v1/admin/careers/:id` | Admin | Memperbarui informasi karir & bobot |
| `PUT` | `/api/v1/admin/job-market/:careerId` | Admin | Update manual skor C3 & lowongan |
| `GET` | `/api/v1/admin/scheduler/logs` | Admin | Melihat histori aktivitas scheduler otomatis |
| `POST`| `/api/v1/admin/scheduler/trigger` | Admin | Menjalankan scheduler update data secara manual |

---

## 7. KEAMANAN & IMPLEMENTASI MIDDLEWARE

### 7.1 Autentikasi JWT Middleware
Memvalidasi header `Authorization: Bearer <token>` dan melampirkan objek user ke objek `req`.

```javascript
// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Akses ditolak. Token otentikasi tidak ditemukan.'
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { student: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Pengguna tidak ditemukan atau token tidak lagi valid.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Token otentikasi kedaluwarsa atau tidak valid.'
    });
  }
}
```

### 7.2 Otorisasi Role-Based Access Control (RBAC)
```javascript
// src/middlewares/roleMiddleware.js
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Akses terlarang: Anda tidak memiliki otoritas untuk aksi ini.'
      });
    }
    next();
  };
}
```

### 7.3 Centralized Error Handling Middleware
Menangani kegagalan tak terduga (*uncaught exceptions*) tanpa membuat proses Node.js crash:

```javascript
// src/middlewares/errorMiddleware.js
export function errorHandler(err, req, res, next) {
  console.error('[Error Occurred]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
```

---

## 8. PENJADWAL OTOMATIS (TASK SCHEDULER / CRON)

Modul ini bertanggung jawab menjalankan sinkronisasi data pasar kerja (Kriteria C3) secara berkala (misal: setiap jam 02.00 WIB) sesuai fitur di menu `SchedulerConfig.jsx`.

```javascript
// src/jobs/marketDataCron.js
import cron from 'node-cron';
import { prisma } from '../config/database.js';

export function initMarketDataScheduler() {
  // Jadwal default: Setiap hari pukul 02:00 WIB (0 2 * * *)
  const cronExpr = process.env.MARKET_CRON_EXPRESSION || '0 2 * * *';

  cron.schedule(cronExpr, async () => {
    console.log('[Scheduler] Menjalankan pembaruan otomatis data pasar kerja...');
    const startTime = new Date();

    try {
      const careers = await prisma.career.findMany({ include: { marketDetail: true } });
      let success = 0;
      let failed = 0;

      for (const career of careers) {
        try {
          // Logika simulasi / fetch ke Job Portal API (Jobstreet, LinkedIn, dll)
          // Menyesuaikan sedikit fluktuasi skor kebutuhan pasar & lowongan
          const delta = Math.floor(Math.random() * 5) - 2; // -2 s.d. +2
          const newScore = Math.min(100, Math.max(50, career.marketDemandScore + delta));

          await prisma.career.update({
            where: { id: career.id },
            data: { marketDemandScore: newScore }
          });
          success++;
        } catch (itemErr) {
          failed++;
        }
      }

      const finishTime = new Date();
      const durationSec = (finishTime - startTime) / 1000;

      await prisma.schedulerLog.create({
        data: {
          jobName: 'MARKET_DATA_REFRESH',
          executionType: 'Otomatis',
          status: failed === 0 ? 'Berhasil' : 'Sebagian Gagal',
          processed: careers.length,
          successCount: success,
          failedCount: failed,
          durationSec,
          message: failed === 0 
            ? 'Seluruh data pasar karir berhasil diperbarui secara otomatis.'
            : `${failed} dari ${careers.length} karir gagal disinkronisasi.`,
          startedAt: startTime,
          finishedAt: finishTime
        }
      });

      console.log(`[Scheduler Selesai]: ${success} berhasil, ${failed} gagal.`);
    } catch (error) {
      console.error('[Scheduler Error]:', error);
    }
  });
}
```

---

## 9. PANDUAN IMPLEMENTASI LANGKAH-DEMI-LANGKAH

### Langkah 1: Inisialisasi Proyek Backend
Buat direktori baru di luar atau berdampingan dengan frontend:
```bash
mkdir backend-dss
cd backend-dss
npm init -y
```

Perbarui `package.json` untuk mengaktifkan ES Modules:
```json
{
  "name": "backend-dss-ta",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "prisma:migrate": "npx prisma migrate dev",
    "prisma:seed": "node prisma/seed.js",
    "prisma:studio": "npx prisma studio"
  }
}
```

### Langkah 2: Instalasi Dependencies
```bash
# Core framework & database
npm install express dotenv cors helmet express-rate-limit @prisma/client

# Autentikasi & validasi
npm install jsonwebtoken bcryptjs zod

# Task scheduler
npm install node-cron

# Dev dependencies
npm install -D nodemon prisma
```

### Langkah 3: Konfigurasi Environment (`.env`)
```env
PORT=5000
NODE_ENV=development

# Database connection string
DATABASE_URL="postgresql://postgres:password123@localhost:5432/dss_career_db?schema=public"

# Keamanan JWT
JWT_SECRET="sangat_rahasia_dan_panjang_kunci_jwt_signature_key_2026"
JWT_EXPIRES_IN="7d"

# Cron Settings
MARKET_CRON_EXPRESSION="0 2 * * *"
```

### Langkah 4: Setup Inisialisasi Express (`src/app.js` & `src/server.js`)
```javascript
// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use('/api', limiter);

// Register API Routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
```

```javascript
// src/server.js
import app from './app.js';
import { initMarketDataScheduler } from './jobs/marketDataCron.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 DSS Backend Service berjalan pada port ${PORT}`);
  // Inisialisasi cron job
  initMarketDataScheduler();
});
```

---

## 10. PANDUAN MIGRASI INTEGRASI FRONTEND

Untuk menghubungkan antarmuka React yang telah ada (`src/context/AppContext.jsx`) ke Backend Node.js ini:

1. **Buat HTTP Client Helper** (menggunakan `fetch` atau `axios`):
   ```javascript
   // src/utils/apiClient.js
   const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

   export async function apiRequest(endpoint, { method = 'GET', body, token } = {}) {
     const headers = { 'Content-Type': 'application/json' };
     if (token) headers['Authorization'] = `Bearer ${token}`;

     const response = await fetch(`${BASE_URL}${endpoint}`, {
       method,
       headers,
       body: body ? JSON.stringify(body) : undefined
     });

     const data = await response.json();
     if (!response.ok) {
       throw new Error(data.message || 'Terjadi kesalahan pada request.');
     }
     return data;
   }
   ```

2. **Ganti `login` di `AppContext.jsx`**:
   Panggil `POST /api/v1/auth/login`, simpan token di state/cookies, dan set data user dari response backend.

3. **Ganti Perhitungan Lokal Rekomendasi**:
   Alih-alih memanggil `calculateSaw()` secara lokal di `useEffect`, kirim request:
   ```javascript
   const fetchRecommendations = async () => {
     const res = await apiRequest('/recommendations/calculate', { method: 'POST', token });
     setSawResults(res.data.rankings);
   };
   ```

---

## 11. CHECKLIST PENGUJIAN & VALIDASI (TESTING CHECKLIST)

| Kategori | Pengujian | Kriteria Keberhasilan |
| :--- | :--- | :--- |
| **Autentikasi** | Register Mahasiswa Baru | Password ter-hash dengan bcrypt, record User & Student terbentuk |
| **Autentikasi** | Login Valid & Invalid | Menghasilkan JWT saat kredensial benar; HTTP 401 saat salah |
| **RBAC** | Akses Menu Admin oleh Mahasiswa | Ditolak dengan pesan HTTP 403 Forbidden |
| **Kriteria C1** | Submit Kuesioner RIASEC | Terkumpul 18 jawaban, terhitung skor R,I,A,S,E,C dan 3 huruf kode Holland |
| **Kriteria C2** | Simpan Nilai Akademik | Nilai 0-100 tersimpan per mata kuliah |
| **DSS SAW** | Eksekusi SAW | Normalisasi matriks $R_{ij} \le 1.0$, hasil preferensi $V_i \le 1.0$, urutan rank dari nilai terbesar |
| **Scheduler** | Trigger Cron Job | Record baru muncul di tabel `SchedulerLog`, skor pasar terupdate |

---

Dokumentasi ini disiapkan secara komprehensif untuk mendukung implementasi backend berbasis **JavaScript (Node.js)** yang handal, aman, dan siap digunakan untuk kebutuhan Tugas Akhir maupun rilis produksi.
