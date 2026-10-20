"use client";

import React, { useContext, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Card from '@/components/Card';
import { DetailViewSkeleton } from '@/components/Skeleton';
import { 
  ArrowLeft, 
  TrendingUp, 
  Briefcase, 
  Award,
  BookOpen, 
  Milestone,
  CheckCircle2
} from 'lucide-react';

const CAREER_DETAILS_DB = {
  "Software Engineer": {
    responsibilities: [
      "Merancang, menulis, dan memelihara kode program yang efisien dan andal.",
      "Melakukan debugging, pengujian unit, dan integrasi sistem perangkat lunak.",
      "Berkolaborasi dengan product manager dan desainer untuk menentukan spesifikasi teknis.",
      "Melakukan code review dan membagikan praktik terbaik rekayasa perangkat lunak kepada anggota tim."
    ],
    salaryRange: "Rp 8.000.000 - Rp 22.000.000 / bulan",
    progression: [
      { title: "Junior Software Engineer", exp: "0 - 2 Tahun", salary: "Rp 8M - Rp 12M", tasks: "Menulis kode fitur kecil, memperbaiki bug sederhana, dan mempelajari codebase." },
      { title: "Mid-level Software Engineer", exp: "2 - 5 Tahun", salary: "Rp 12M - Rp 18M", tasks: "Merancang modul sistem, memimpin pengerjaan modul independen, dan mereview kode junior." },
      { title: "Senior Software Engineer / Tech Lead", exp: "5+ Tahun", salary: "Rp 18M - Rp 35M", tasks: "Menentukan arsitektur sistem, memimpin tim engineering, dan mengambil keputusan teknologi utama." }
    ]
  },
  "Data Analyst": {
    responsibilities: [
      "Mengumpulkan, membersihkan, dan memproses data mentah dari berbagai sumber data organisasi.",
      "Membangun dashboard visualisasi data interaktif menggunakan tools seperti Power BI atau Tableau.",
      "Mengidentifikasi tren, pola, dan wawasan bisnis yang dapat ditindaklanjuti dari kumpulan data besar.",
      "Menyusun laporan berkala untuk membantu jajaran manajemen mengambil keputusan berbasis data."
    ],
    salaryRange: "Rp 7.000.000 - Rp 18.000.000 / bulan",
    progression: [
      { title: "Junior Data Analyst", exp: "0 - 2 Tahun", salary: "Rp 7M - Rp 10M", tasks: "Melakukan query SQL dasar, membersihkan data, dan memperbarui laporan rutin." },
      { title: "Senior Data Analyst", exp: "3 - 5 Tahun", salary: "Rp 10M - Rp 16M", tasks: "Membangun dashboard analitik kompleks, memodelkan data, dan mempresentasikan insight ke bisnis." },
      { title: "Lead Data Analyst / Data Manager", exp: "5+ Tahun", salary: "Rp 16M - Rp 28M", tasks: "Mengelola infrastruktur data analitik, memimpin tim analis, dan merumuskan strategi analitis korporat." }
    ]
  },
  "Cybersecurity Analyst": {
    responsibilities: [
      "Memantau jaringan organisasi dari aktivitas mencurigakan atau ancaman keamanan siber.",
      "Melakukan vulnerability assessment dan penetration testing pada sistem internal.",
      "Menyusun protokol keamanan informasi, kebijakan penanganan insiden, dan kepatuhan data.",
      "Merespons, menyelidiki, dan memitigasi dampak dari pelanggaran keamanan jika terjadi."
    ],
    salaryRange: "Rp 9.000.000 - Rp 25.000.000 / bulan",
    progression: [
      { title: "SOC Analyst (L1/L2)", exp: "0 - 2 Tahun", salary: "Rp 9M - Rp 14M", tasks: "Memantau log alert keamanan, menganalisis ancaman awal, dan mendokumentasikan insiden." },
      { title: "Cybersecurity Engineer / Pentester", exp: "2 - 5 Tahun", salary: "Rp 14M - Rp 22M", tasks: "Menguji kerentanan jaringan, memelihara firewall, dan memimpin audit keamanan siber." },
      { title: "Chief Information Security Officer (CISO)", exp: "7+ Tahun", salary: "Rp 25M - Rp 50M+", tasks: "Menyusun strategi keamanan siber korporasi, memitigasi risiko keamanan digital global, dan memimpin tim security." }
    ]
  },
  "Business Analyst": {
    responsibilities: [
      "Menganalisis proses bisnis berjalan dan merekomendasikan efisiensi berbasis teknologi.",
      "Mengumpulkan, merumuskan, dan mendokumentasikan kebutuhan sistem dari pengguna bisnis.",
      "Membuat diagram alur kerja bisnis (BPMN) dan spesifikasi fungsional sistem perangkat lunak.",
      "Menjadi jembatan komunikasi antara tim bisnis non-teknis dengan tim developer."
    ],
    salaryRange: "Rp 8.000.000 - Rp 20.000.000 / bulan",
    progression: [
      { title: "Associate Business Analyst", exp: "0 - 2 Tahun", salary: "Rp 8M - Rp 11M", tasks: "Mendokumentasikan meeting, membuat bagan alur proses, dan membantu user acceptance testing (UAT)." },
      { title: "Senior Business Analyst", exp: "3 - 5 Tahun", salary: "Rp 11M - Rp 17M", tasks: "Merancang solusi bisnis sistemik, memimpin pemodelan sistem, dan mendefinisikan scope produk." },
      { title: "Business Consultant / Product Owner", exp: "5+ Tahun", salary: "Rp 17M - Rp 30M", tasks: "Menyelaraskan investasi teknologi dengan target jangka panjang, mengelola backlog produk besar, dan memimpin strategi digital." }
    ]
  },
  "UI/UX Designer": {
    responsibilities: [
      "Merancang alur pengguna (user flow), wireframe, dan prototipe interaktif.",
      "Melakukan user research, wawancara pengguna, dan usability testing.",
      "Membangun sistem desain (design system) dan komponen UI visual yang konsisten.",
      "Bekerja sama dengan front-end developer untuk memastikan implementasi desain yang akurat."
    ],
    salaryRange: "Rp 7.000.000 - Rp 18.000.000 / bulan",
    progression: [
      { title: "Junior UI/UX Designer", exp: "0 - 2 Tahun", salary: "Rp 7M - Rp 10M", tasks: "Membuat visual layout layar sederhana, wireframing, dan membuat perubahan kosmetik desain." },
      { title: "Senior UI/UX Designer", exp: "3 - 5 Tahun", salary: "Rp 10M - Rp 16M", tasks: "Memimpin riset pengguna end-to-end, merancang interaksi produk kompleks, dan memelihara design system." },
      { title: "UI/UX Art Director / Design Manager", exp: "5+ Tahun", salary: "Rp 16M - Rp 26M", tasks: "Menentukan arah estetika produk, mengelola tim desainer, dan menyelaraskan visual branding dengan bisnis." }
    ]
  },
  "DevOps Engineer": {
    responsibilities: [
      "Mengotomatisasi deployment dan pengujian kode menggunakan pipeline CI/CD.",
      "Mengelola infrastruktur cloud (AWS, GCP, atau Azure) menggunakan Infrastructure as Code (IaC).",
      "Memantau performa, keandalan, dan stabilitas server dan platform aplikasi.",
      "Bekerja sama dengan developer untuk meningkatkan siklus rilis dan meminimalkan error rilis."
    ],
    salaryRange: "Rp 9.000.000 - Rp 25.000.000 / bulan",
    progression: [
      { title: "Junior DevOps Engineer", exp: "0 - 2 Tahun", salary: "Rp 9M - Rp 14M", tasks: "Menulis skrip otomatisasi dasar, memantau log sistem, dan merespons alarm awal server." },
      { title: "Senior DevOps Engineer", exp: "3 - 5 Tahun", salary: "Rp 14M - Rp 22M", tasks: "Merancang arsitektur CI/CD, mengelola orkestrasi kontainer (Kubernetes), dan tuning keamanan cloud." },
      { title: "Infrastructure Architect / Head of Cloud", exp: "5+ Tahun", salary: "Rp 22M - Rp 40M+", tasks: "Menentukan visi strategi cloud perusahaan, memimpin tim DevOps, dan mengelola cost optimasi infrastruktur global." }
    ]
  },
  "Quality Assurance Engineer": {
    responsibilities: [
      "Merancang test case dan skenario pengujian manual maupun otomatis untuk aplikasi web & mobile.",
      "Mengidentifikasi, mendokumentasikan, dan memantau perbaikan cacat perangkat lunak (bug tracking).",
      "Melakukan regression testing dan performance testing untuk memvalidasi stabilitas sistem sebelum rilis.",
      "Bekerja sama secara aktif dengan developer dalam sprint agile untuk menjaga kualitas kode."
    ],
    salaryRange: "Rp 7.000.000 - Rp 18.000.000 / bulan",
    progression: [
      { title: "Junior QA Tester", exp: "0 - 2 Tahun", salary: "Rp 7M - Rp 10M", tasks: "Melakukan pengujian manual, mencatat bug di Jira, dan memverifikasi perbaikan bug." },
      { title: "Senior QA Automation Engineer", exp: "3 - 5 Tahun", salary: "Rp 10M - Rp 16M", tasks: "Membangun framework automated testing, mengintegrasikan testing ke CI/CD, dan performance testing." },
      { title: "QA Lead / Quality Manager", exp: "5+ Tahun", salary: "Rp 16M - Rp 26M", tasks: "Menetapkan standar kualitas software perusahaan, mengelola tim QA, dan mengaudit keandalan produk." }
    ]
  },
  "Database Administrator": {
    responsibilities: [
      "Mengkonfigurasi, memantau, dan mengoptimalkan performa DBMS (PostgreSQL, MySQL, Oracle).",
      "Merancang dan menerapkan strategi pencadangan data rutin (backup) dan pemulihan bencana (disaster recovery).",
      "Mengelola hak akses, izin pengguna, dan menerapkan enkripsi data untuk menjaga keamanan informasi.",
      "Melakukan analisis query lambat (slow query tuning) dan indexing untuk efisiensi transaksi database."
    ],
    salaryRange: "Rp 8.000.000 - Rp 20.000.000 / bulan",
    progression: [
      { title: "Junior DBA", exp: "0 - 2 Tahun", salary: "Rp 8M - Rp 11M", tasks: "Memantau storage disk, melakukan backup harian terjadwal, dan mengeksekusi query rutin." },
      { title: "Senior DBA", exp: "3 - 5 Tahun", salary: "Rp 11M - Rp 18M", tasks: "Merancang arsitektur replikasi, sharding data, tuning database tingkat lanjut, dan audit keamanan data." },
      { title: "Principal Database Architect", exp: "6+ Tahun", salary: "Rp 18M - Rp 30M+", tasks: "Menentukan arsitektur enterprise data management, memimpin migrasi cloud database, dan kebijakan privasi data global." }
    ]
  },
  "Network Administrator": {
    responsibilities: [
      "Mengkonfigurasi dan memelihara router, switch, firewall, dan sistem Wi-Fi.",
      "Mendiagnosis dan menyelesaikan masalah konektivitas jaringan komputer organisasi.",
      "Memantau lalu lintas jaringan (network traffic) untuk mengoptimalkan bandwidth.",
      "Mengimplementasikan protokol keamanan jaringan untuk menangkal serangan siber dari luar."
    ],
    salaryRange: "Rp 7.000.000 - Rp 18.000.000 / bulan",
    progression: [
      { title: "Junior Network Engineer", exp: "0 - 2 Tahun", salary: "Rp 7M - Rp 10M", tasks: "Memasang kabel jaringan fisik, konfigurasi router awal, dan troubleshooting koneksi meja pengguna." },
      { title: "Senior Network Engineer", exp: "3 - 5 Tahun", salary: "Rp 10M - Rp 16M", tasks: "Merancang topologi jaringan VPN kantor cabang, mengelola firewall enterprise, dan mengoptimalkan QoS VOIP." },
      { title: "Network Infrastructure Manager", exp: "6+ Tahun", salary: "Rp 16M - Rp 26M", tasks: "Mengelola anggaran pengadaan perangkat jaringan, memimpin tim network, dan menjamin uptime konektivitas global perusahaan." }
    ]
  }
};

const STUDY_ROADMAP_DB = {
  "Software Engineer": [
    { step: "Tahap 1", title: "Dasar Pemrograman dan Logika", desc: "Kuasai logika dasar pemrograman, algoritma dasar, version control (Git), dan salah satu bahasa pemrograman (JavaScript, Python, atau Java)." },
    { step: "Tahap 2", title: "Pengembangan Aplikasi dan Framework", desc: "Pelajari konsep pengembangan frontend (HTML, CSS, React) atau backend (API, routing, dan autentikasi)." },
    { step: "Tahap 3", title: "Basis Data dan Integrasi Sistem", desc: "Pahami perancangan database relasional (SQL), manipulasi query data, dan integrasi web service RESTful API." },
    { step: "Tahap 4", title: "Arsitektur Perangkat Lunak dan Pengujian", desc: "Pelajari Clean Architecture, prinsip SOLID, penulisan pengujian unit, serta deployment ke server cloud." }
  ],
  "Data Analyst": [
    { step: "Tahap 1", title: "Penguasaan Query Data", desc: "Pelajari sintaks SQL untuk mengambil, menyaring, mengurutkan, dan menggabungkan data dari berbagai database relational." },
    { step: "Tahap 2", title: "Analisis Statistik dan Visualisasi", desc: "Pahami statistik dasar, pembuatan visualisasi interaktif menggunakan Power BI, Tableau, dan analisis spreadsheet lanjutan." },
    { step: "Tahap 3", title: "Pemrograman Analisis Data", desc: "Pelajari bahasa Python atau R beserta pustaka analisis data utama seperti Pandas, NumPy, dan Matplotlib." },
    { step: "Tahap 4", title: "Penyampaian Wawasan Bisnis", desc: "Latihlah cara mempresentasikan temuan data, mendeskripsikan wawasan bisnis, dan memahami Key Performance Indicators (KPIs)." }
  ],
  "Cybersecurity Analyst": [
    { step: "Tahap 1", title: "Dasar Jaringan Komputer dan OS", desc: "Kuasai model referensi OSI, protokol TCP/IP, administrasi Linux CLI, dan arsitektur sistem operasi." },
    { step: "Tahap 2", title: "Keamanan Sistem dan Analisis Ancaman", desc: "Pelajari konfigurasi firewall, enkripsi data, deteksi malware, dan konsep kerentanan web (OWASP Top 10)." },
    { step: "Tahap 3", title: "Security Operations dan SIEM", desc: "Pelajari pemantauan log keamanan menggunakan tools SIEM (seperti Splunk/Wazuh) dan respons insiden keamanan awal." },
    { step: "Tahap 4", title: "Penetration Testing dan Sertifikasi", desc: "Pelajari teknik ethical hacking, analisis malware tingkat lanjut, dan persiapan sertifikasi seperti CompTIA Security+ atau CEH." }
  ],
  "Business Analyst": [
    { step: "Tahap 1", title: "Pemahaman Proses Bisnis", desc: "Pelajari cara memetakan alur bisnis berjalan, identifikasi bottleneck, dan membuat diagram alur proses dengan standar BPMN." },
    { step: "Tahap 2", title: "Elisitasi Kebutuhan dan Dokumentasi", desc: "Kuasai teknik wawancara stakeholder, penyusunan Software Requirements Specification (SRS), dan User Stories." },
    { step: "Tahap 3", title: "Analisis Data dan Prototipe", desc: "Gunakan basic SQL untuk memverifikasi data dan buat wireframe sederhana untuk mengkomunikasikan ide solusi ke developer." },
    { step: "Tahap 4", title: "User Acceptance Testing dan Evaluasi", desc: "Rancang skenario uji penerimaan pengguna (UAT) dan ukur dampak solusi terhadap pencapaian target bisnis." }
  ],
  "UI/UX Designer": [
    { step: "Tahap 1", title: "Dasar Desain Antarmuka (UI)", desc: "Kuasai prinsip visual hierarchy, tipografi digital, teori warna, dan penguasaan aplikasi Figma." },
    { step: "Tahap 2", title: "Riset dan Pengalaman Pengguna (UX)", desc: "Pelajari user interview, personas, customer journey map, information architecture, dan wireframing." },
    { step: "Tahap 3", title: "Interactive Prototyping dan Testing", desc: "Buat prototipe interaktif dengan animasi mikro dan lakukan usability testing dengan pengguna riil." },
    { step: "Tahap 4", title: "Design System dan Kolaborasi Developer", desc: "Pelajari pembuatan komponen atomik, tokens desain, handoff aset ke developer, dan standar aksesibilitas WCAG." }
  ],
  "DevOps Engineer": [
    { step: "Tahap 1", title: "Linux CLI dan Skrip Otomatisasi", desc: "Kuasai administrasi sistem operasi Linux, bash scripting, dan manajemen versi Git lanjutan." },
    { step: "Tahap 2", title: "Kontainerisasi dan Jaringan", desc: "Pelajari arsitektur Docker, pembuatan Dockerfile efisien, dan konfigurasi jaringan kontainer." },
    { step: "Tahap 3", title: "CI/CD dan Cloud Infrastructure", desc: "Rancang pipeline GitHub Actions/GitLab CI dan kelola cloud computing dasar (AWS/GCP)." },
    { step: "Tahap 4", title: "Orkestrasi dan Infrastructure as Code", desc: "Pelajari orkestrasi kontainer dengan Kubernetes dan otomatisasi provisioning server menggunakan Terraform/Ansible." }
  ],
  "Quality Assurance Engineer": [
    { step: "Tahap 1", title: "Prinsip Pengujian Software", desc: "Pelajari Software Development Life Cycle (SDLC), Software Testing Life Cycle (STLC), dan perancangan Test Case." },
    { step: "Tahap 2", title: "Pengujian API dan Basis Data", desc: "Kuasai pengujian RESTful API menggunakan Postman dan verifikasi data transaksi dengan SQL query." },
    { step: "Tahap 3", title: "Automated Testing Framework", desc: "Pelajari penulisan skrip pengujian otomatis UI menggunakan tools seperti Cypress, Playwright, atau Selenium." },
    { step: "Tahap 4", title: "Performance Testing dan Integrasi CI", desc: "Jalankan load testing menggunakan JMeter/K6 dan integrasikan rangkaian automated test ke dalam CI/CD pipeline." }
  ],
  "Database Administrator": [
    { step: "Tahap 1", title: "Relational Database Design", desc: "Kuasai normalisasi basis data (1NF-3NF), perancangan Entity Relationship Diagram (ERD), dan Advanced SQL." },
    { step: "Tahap 2", title: "Instalasi dan Konfigurasi RDBMS", desc: "Pelajari instalasi, alokasi memori, konfigurasi storage, dan konektivitas database engine PostgreSQL atau MySQL." },
    { step: "Tahap 3", title: "Backup, Recovery, dan Keamanan", desc: "Terapkan otomasi backup rutin, simulasi disaster recovery, manajemen peran pengguna, dan audit logging." },
    { step: "Tahap 4", title: "High Availability dan Query Tuning", desc: "Pelajari replikasi database (Master-Slave), clustering, connection pooling, dan query execution plan profiling." }
  ],
  "Network Administrator": [
    { step: "Tahap 1", title: "Dasar Jaringan Komputer", desc: "Pahami model TCP/IP, IP addressing (IPv4/IPv6), subnetting CIDR, dan protokol switching dasar (VLAN)." },
    { step: "Tahap 2", title: "Routing dan Konfigurasi Perangkat", desc: "Pelajari protokol routing statis dan dinamis (OSPF, BGP) pada perangkat router enterprise seperti MikroTik atau Cisco." },
    { step: "Tahap 3", title: "Keamanan Jaringan dan Firewall", desc: "Konfigurasikan Network Address Translation (NAT), Access Control List (ACL), VPN IPSec/WireGuard, dan filtering firewall." },
    { step: "Tahap 4", title: "Pemantauan Jaringan dan Troubleshooting", desc: "Pelajari monitoring jaringan, analisis paket dengan Wireshark, dan mitigasi downtime infrastruktur." }
  ]
};

const RIASEC_LABELS = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional"
};

export default function CareerDetail() {
  const params = useParams();
  const rawCareerName = params?.careerName;
  const careerName = rawCareerName ? decodeURIComponent(rawCareerName) : '';
  const { careers } = useContext(AppContext);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        await apiRequest('/careers');
      } catch {
        // Fallback to contextual careers
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [careerName]);

  const careerData = useMemo(() => {
    return careers[careerName];
  }, [careers, careerName]);

  const mergedDetails = useMemo(() => {
    if (!careerData) return null;
    const staticInfo = CAREER_DETAILS_DB[careerName] || {
      responsibilities: ["Mengembangkan solusi teknologi terkait.", "Mendukung proses digitalisasi sistem."],
      salaryRange: "Rp 7.000.000 - Rp 18.000.000 / bulan",
      progression: [
        { title: `Junior ${careerName}`, exp: "0 - 2 Tahun", salary: "Rp 7M - 10M", tasks: "Tugas pemula dan pendampingan." },
        { title: `Senior ${careerName}`, exp: "5+ Tahun", salary: "Rp 12M - 20M", tasks: "Tanggung jawab modul utama dan arsitektur." }
      ]
    };
    return {
      ...careerData,
      ...staticInfo
    };
  }, [careerData, careerName]);

  if (isLoading) {
    return (
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <DetailViewSkeleton />
      </main>
    );
  }

  if (!mergedDetails) {
    return (
      <main className="w-full max-w-md mx-auto py-16 px-4 text-center animate-fade-in">
        <Card className="p-8 shadow-xs">
          <h2 className="text-base font-bold text-content-primary mb-2">Alternatif Karir Tidak Ditemukan</h2>
          <p className="text-xs text-content-muted mb-6">Alternatif karir "{careerName}" tidak terdaftar dalam database sistem.</p>
          <button 
            onClick={() => router.push('/eksplorasi')} 
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
          >
            Kembali ke Katalog
          </button>
        </Card>
      </main>
    );
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/eksplorasi" className="hover:text-primary transition-colors">Katalog Karir</Link>
        <span>/</span>
        <span className="text-content-primary font-medium">{careerName}</span>
      </nav>

      <button 
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali</span>
      </button>

      {/* Career Profile Hero Card */}
      <Card className="p-6 sm:p-7 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 font-bold text-2xl flex items-center justify-center shrink-0">
              {mergedDetails.icon || '⌘'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                Profil Alternatif Karir TI
              </span>
              <h1 className="text-2xl sm:text-2.5xl font-bold text-content-primary leading-tight mb-1">
                {careerName}
              </h1>
              <p className="text-xs sm:text-sm text-content-muted leading-relaxed max-w-xl">
                {mergedDetails.description}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-56 bg-subsurface border border-divider rounded-xl p-4 shrink-0 space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-content-muted block">Estimasi Penghasilan</span>
              <strong className="font-mono text-content-primary text-xs">{mergedDetails.salaryRange}</strong>
            </div>
            <div className="pt-2 border-t border-divider flex items-center justify-between">
              <div>
                <span className="text-[10px] text-content-muted block">Lowongan Aktif</span>
                <span className="font-semibold text-content-primary">{mergedDetails.marketDemand?.vacancy || '50'}+ Posisi</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-content-muted block">Tren Kebutuhan</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Stabil / Naik</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left Column: Responsibilities & Roadmap (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Responsibilities Card */}
          <Card className="p-6">
            <div className="pb-3 mb-4 border-b border-divider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-content-primary">
                Tanggung Jawab Pekerjaan
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs">
              {mergedDetails.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2.5 leading-relaxed text-content-secondary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Progression Timeline Card */}
          <Card className="p-6">
            <div className="pb-3 mb-4 border-b border-divider flex items-center gap-2">
              <Milestone className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-content-primary">
                Jenjang Karir dan Rentang Pengalaman
              </h2>
            </div>
            <div className="space-y-4">
              {mergedDetails.progression.map((prog, index) => (
                <div key={index} className="p-3.5 rounded-lg border border-divider bg-subsurface text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <strong className="font-bold text-content-primary">{prog.title}</strong>
                    <div className="flex gap-1.5 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-surface border border-divider text-content-muted">{prog.exp}</span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 font-bold">{prog.salary}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-content-muted leading-relaxed">{prog.tasks}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Roadmap Card */}
          <Card className="p-6">
            <div className="pb-3 mb-4 border-b border-divider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-content-primary">
                Peta Pengembangan Kompetensi
              </h2>
            </div>
            <div className="space-y-3">
              {(STUDY_ROADMAP_DB[careerName] || []).map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-divider bg-subsurface flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-primary text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-content-primary mb-1">{step.title}</h3>
                    <p className="text-[11px] text-content-muted leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: DSS Criteria Mapping (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* RIASEC Mapping Card (C1) */}
          <Card className="p-6">
            <div className="pb-3 mb-4 border-b border-divider flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-content-primary">
                Profil Minat RIASEC (Kriteria C1)
              </h2>
            </div>
            <p className="text-xs text-content-muted mb-4 leading-relaxed">
              Tipe minat kepribadian John Holland yang menjadi rujukan penilaian kriteria C1 pada alternatif ini.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {mergedDetails.riasecMapped.map(code => (
                <div key={code} className="p-3 bg-subsurface border border-divider rounded-lg text-center">
                  <strong className="text-base font-mono font-bold text-primary block mb-0.5">{code}</strong>
                  <span className="text-[10px] text-content-muted block">{RIASEC_LABELS[code] || code}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Academic Weights Card (C2) */}
          <Card className="p-6">
            <div className="pb-3 mb-4 border-b border-divider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-content-primary">
                Bobot Nilai Akademik (Kriteria C2)
              </h2>
            </div>
            <p className="text-xs text-content-muted mb-4 leading-relaxed">
              Proporsi kontribusi nilai mata kuliah terhadap skor kriteria C2 untuk {careerName}.
            </p>
            <div className="space-y-3 mb-4">
              {Object.entries(mergedDetails.academicWeights).map(([compName, weight]) => (
                <div key={compName} className="text-xs">
                  <div className="flex items-center justify-between mb-1 text-content-primary font-medium">
                    <span className="truncate pr-2">{compName}</span>
                    <span className="font-mono font-bold">{weight}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-subsurface rounded-full overflow-hidden border border-divider">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Market Demand Card (C3) */}
          <Card className="p-6">
            <div className="pb-3 mb-4 border-b border-divider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-content-primary">
                Kebutuhan Pasar Kerja (Kriteria C3)
              </h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-subsurface rounded-lg border border-divider">
                <span className="text-[10px] text-content-muted block mb-0.5">Skor Kebutuhan Industri</span>
                <span className="text-base font-mono font-bold text-primary">{mergedDetails.marketDemandScore || 80} / 100</span>
              </div>
              <div className="p-3 bg-subsurface rounded-lg border border-divider">
                <span className="text-[10px] text-content-muted block mb-1">Keahlian Teknis Terkait</span>
                <div className="flex flex-wrap gap-1">
                  {mergedDetails.marketDemand?.skills?.map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded bg-surface border border-divider text-[10px] font-semibold text-content-secondary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <footer className="pt-8 pb-4 text-center text-xs text-content-muted border-t border-divider">
        CareerPath TI: Sistem Pendukung Keputusan Rekomendasi Karir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
