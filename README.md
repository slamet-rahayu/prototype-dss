# CareerPath TI

Sistem Pendukung Keputusan (SPK) Rekomendasi Karir Bidang Teknologi Informasi berbasis model minat **Holland RIASEC** dan metode **Simple Additive Weighting (SAW)**.

---

## 🌟 Gambaran Sistem

CareerPath TI dirancang untuk membantu mahasiswa tingkat akhir dan program studi dalam mengevaluasi kesesuaian karir melalui tiga kriteria utama:
1. **Kriteria 1 (C1): Minat Vokasional RIASEC** (Bobot: 40%) - Mengukur kecocokan kepribadian dan minat berdasarkan 6 dimensi model John Holland: *Realistic, Investigative, Artistic, Social, Enterprising, Conventional*.
2. **Kriteria 2 (C2): Capaian Akademik** (Bobot: 35%) - Mengevaluasi nilai mata kuliah inti: Pemrograman, Basis Data, Analisis & Perancangan Sistem, Jaringan & Keamanan, serta Data & AI.
3. **Kriteria 3 (C3): Kebutuhan Pasar Kerja** (Bobot: 25%) - Mempertimbangkan volume lowongan kerja industri dan indeks serapan tenaga kerja TI.

Perhitungan nilai preferensi alternatif menggunakan formula SAW:
$$V_i = \sum_{j=1}^{n} w_j \cdot R_{ij}$$

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router & Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan `@tailwindcss/postcss`
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)
- **State & Penyimpanan**: React Context API & Browser Local Storage

---

## 📁 Struktur Rute (App Router)

```
src/
├── app/
│   ├── (student)/                 # Portal Mahasiswa (Layout dengan Navbar)
│   │   ├── page.jsx               # Beranda Mahasiswa & Ringkasan Kesiapan Kriteria
│   │   ├── profile/page.jsx       # Profil Mahasiswa & Institusi
│   │   ├── akademik/page.jsx      # Manajemen Nilai Mata Kuliah (C2)
│   │   ├── riasec/page.jsx        # Kuesioner Tes Minat RIASEC (C1)
│   │   ├── riasec/hasil/page.jsx  # Analisis Grafik & Distribusi Skor RIASEC
│   │   ├── rekomendasi/page.jsx   # Hasil Ranking Preferensi SAW & Matriks Normalisasi
│   │   └── eksplorasi/            # Katalog & Detail Karir
│   │       ├── page.jsx           # Katalog Karir TI
│   │       └── [careerName]/      # Detail Kompetensi, Roadmap, & Gaji
│   ├── admin/                     # Panel Administrator (Layout dengan Sidebar)
│   │   ├── page.jsx               # Dashboard Analitik Administrator
│   │   ├── alternatif/page.jsx    # Kelola Data Master Alternatif Karir
│   │   ├── konfigurasi/page.jsx   # Konfigurasi Bobot SAW, RIASEC, & Akademik
│   │   ├── pasar-kerja/page.jsx   # Manajemen Data Lowongan & Pasar Kerja
│   │   ├── mahasiswa/page.jsx     # Monitoring Kelengkapan Data Mahasiswa
│   │   ├── riwayat/page.jsx       # Log Riwayat Rekomendasi
│   │   └── scheduler/page.jsx     # Jadwal Sinkronisasi Pasar Kerja (Adzuna API)
│   ├── login/page.jsx             # Autentikasi Masuk Sistem
│   ├── register/page.jsx          # Registrasi Akun Mahasiswa
│   ├── layout.jsx                 # Root Layout & Theme Setup
│   └── globals.css                # Konfigurasi CSS Tailwind v4
├── components/                    # Komponen Reusable (Navbar, Sidebar, Modal, Card, Toast, ThemeToggle)
├── context/                       # AppContext (Penyimpanan State & Sinkronisasi LocalStorage)
└── utils/                         # Utilitas Kalkulasi SAW (sawCalculator.js)
```

---

## 💻 Panduan Menjalankan

### Prasyarat
- Node.js (v18.18+ atau v20+)
- npm

### Menjalankan Development Server
```bash
npm run dev
```
Aplikasi dapat diakses di `http://localhost:3000`.

### Membangun Versi Produksi (Production Build)
```bash
npm run build
```

### Menjalankan Versi Produksi
```bash
npm run start
```

### Menjalankan Linting
```bash
npm run lint
```

---

## 👥 Akun Demo untuk Pengujian

Pada halaman masuk (`/login`), terdapat tombol akses cepat:
- **Mahasiswa**: `mameriyadi6@gmail.com` (Kata sandi: bebas)
- **Administrator**: `admin@careerpath.id` (Kata sandi: bebas)
