import React, { useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { 
  ArrowLeft, 
  MapPin, 
  TrendingUp, 
  Briefcase, 
  Award,
  BookOpen, 
  DollarSign, 
  Milestone,
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

// Static JSON database for career path progression & in-depth details
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
      "Merancang rencana pengujian, kasus uji (test case), dan skenario pengujian produk.",
      "Mengembangkan skrip otomatisasi pengujian (automation testing) menggunakan Cypress atau Selenium.",
      "Mengidentifikasi, mendokumentasikan, dan memantau siklus perbaikan bug perangkat lunak.",
      "Memvalidasi kompatibilitas fungsionalitas dan performa produk di berbagai browser dan sistem operasi."
    ],
    salaryRange: "Rp 7.000.000 - Rp 18.000.000 / bulan",
    progression: [
      { title: "Junior QA Engineer", exp: "0 - 2 Tahun", salary: "Rp 7M - Rp 10M", tasks: "Menjalankan uji manual fungsional, membuat laporan bug, dan mencatat langkah reproduksi error." },
      { title: "Senior QA Automation Engineer", exp: "3 - 5 Tahun", salary: "Rp 10M - Rp 16M", tasks: "Menulis skrip uji otomatis, mengintegrasikan pengujian ke CI/CD pipeline, dan merancang beban stres sistem." },
      { title: "QA Manager / Lead QA Architect", exp: "5+ Tahun", salary: "Rp 16M - Rp 28M", tasks: "Mengepalai tim pengujian, merumuskan standar kualitas rilis produk, dan mengkoordinasikan rilis mayor." }
    ]
  },
  "Database Administrator": {
    responsibilities: [
      "Menginstal, mengkonfigurasi, dan meningkatkan performa sistem manajemen database.",
      "Menyusun strategi backup data, pemulihan bencana (disaster recovery), dan integritas data.",
      "Melakukan database tuning untuk mengoptimalkan kinerja query dan meminimalkan lag.",
      "Mengelola kontrol hak akses database untuk mencegah kebocoran informasi sensitif."
    ],
    salaryRange: "Rp 8.000.000 - Rp 20.000.000 / bulan",
    progression: [
      { title: "Junior DBA", exp: "0 - 2 Tahun", salary: "Rp 8M - Rp 11M", tasks: "Memantau kesehatan database, menjalankan restore uji berkala, dan membuat user database baru." },
      { title: "Senior DBA", exp: "3 - 5 Tahun", salary: "Rp 11M - Rp 18M", tasks: "Melakukan query optimization tingkat lanjut, mengelola replikasi data, dan merancang arsitektur failover." },
      { title: "Database Architect / Head of Data Services", exp: "6+ Tahun", salary: "Rp 18M - Rp 30M+", tasks: "Merancang pemodelan data perusahaan besar, memimpin kebijakan tata kelola data (data governance), dan mengelola tim database." }
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
    { step: "Langkah 1", title: "Dasar Pemrograman & Logika", desc: "Kuasai logika dasar pemrograman, algoritma dasar, version control (Git), dan salah satu bahasa pemrograman (JavaScript, Python, atau Java)." },
    { step: "Langkah 2", title: "Pengembangan Aplikasi / Platform", desc: "Pelajari konsep pengembangan frontend (HTML, CSS, framework UI seperti React) atau backend (framework API, server hosting, dan query routing)." },
    { step: "Langkah 3", title: "Basis Data & Integrasi API", desc: "Pahami perancangan database relasional (SQL), manipulasi tabel data, dan integrasi web service RESTful API atau GraphQL." },
    { step: "Langkah 4", title: "Arsitektur Perangkat Lunak & Deployment", desc: "Pelajari Clean Code, prinsip SOLID, penulisan pengujian kode (unit testing), serta deployment otomatis sederhana ke cloud server." }
  ],
  "Data Analyst": [
    { step: "Langkah 1", title: "Penguasaan Query Data", desc: "Pelajari sintaks SQL untuk mengambil, menyaring, mengurutkan, dan menggabungkan data dari berbagai database relational." },
    { step: "Langkah 2", title: "Analisis Statistik & Visualisasi", desc: "Pahami statistik dasar, pembuatan visualisasi interaktif menggunakan Power BI, Tableau, dan analisis data spreadsheet (Excel lanjutan)." },
    { step: "Langkah 3", title: "Pemrograman untuk Analisis", desc: "Pelajari bahasa Python atau R, beserta pustaka analisis data utama seperti Pandas, NumPy, dan visualisasi grafik Matplotlib." },
    { step: "Langkah 4", title: "Storytelling Data & Metrik Bisnis", desc: "Latihlah cara mempresentasikan temuan data, mendeskripsikan wawasan bisnis (insights), dan memahami Key Performance Indicators (KPIs) perusahaan." }
  ],
  "Cybersecurity Analyst": [
    { step: "Langkah 1", title: "Dasar Jaringan & Sistem Operasi", desc: "Kuasai protokol jaringan TCP/IP, model OSI, administrasi terminal Linux, dan konsep server security dasar." },
    { step: "Langkah 2", title: "Konsep Keamanan & Kriptografi", desc: "Pahami dasar-dasar enkripsi, manajemen sertifikat, konfigurasi firewall, enkripsi data, dan tools pemantau jaringan (Wireshark)." },
    { step: "Langkah 3", title: "Analisis Kerentanan & Audit", desc: "Pelajari identifikasi kerentanan (vulnerability assessment), dasar penetrasi sistem (penetration testing), dan pemantauan ancaman (SIEM tools)." },
    { step: "Langkah 4", title: "Regulasi Kepatuhan & Respons Insiden", desc: "Pahami kepatuhan standar keamanan data (ISO 27001, GDPR), dokumentasi audit, dan langkah mitigasi pemulihan insiden keamanan." }
  ],
  "Business Analyst": [
    { step: "Langkah 1", title: "Requirement Elicitation", desc: "Pelajari teknik wawancara, survei kebutuhan pengguna bisnis, dan identifikasi pain points dari para stakeholders." },
    { step: "Langkah 2", title: "Pemodelan Proses & Diagram", desc: "Kuasai pembuatan diagram alur bisnis (BPMN), use case diagram, dan perancangan prototype interaksi awal sistem (mockups)." },
    { step: "Langkah 3", title: "Dasar Analisis Data & SQL", desc: "Pelajari cara membaca model database relasional dan menggunakan query SQL dasar untuk memvalidasi ketersediaan data bisnis." },
    { step: "Langkah 4", title: "Metodologi Agile & Dokumentasi", desc: "Pahami penulisan User Stories, dokumentasi kebutuhan sistem (BRD/PRD), dan manajemen pengerjaan proyek menggunakan Scrum/Kanban." }
  ],
  "UI/UX Designer": [
    { step: "Langkah 1", title: "Prinsip Desain Visual & Teori UX", desc: "Pelajari teori warna, tipografi, grid layout, dan prinsip kegunaan (usability) dalam pembuatan antarmuka digital." },
    { step: "Langkah 2", title: "Penguasaan Tools Desain", desc: "Kuasai penggunaan tools Figma tingkat lanjut, pembuatan wireframes, dan prototipe interaktif beresolusi tinggi (high-fidelity)." },
    { step: "Langkah 3", title: "Riset Pengguna & Pengujian", desc: "Pelajari teknik wawancara pengguna (user research), penyusunan user persona, mapping user journey, dan usability testing produk." },
    { step: "Langkah 4", title: "Sistem Desain & Kolaborasi Dev", desc: "Pahami pembuatan design system yang modular dan proses handover aset visual ke tim developer frontend." }
  ],
  "DevOps Engineer": [
    { step: "Langkah 1", title: "Administrasi Sistem & Linux Shell", desc: "Kuasai administrasi sistem Linux, shell scripting (Bash), manajemen proses, dan perintah utilitas server dasar." },
    { step: "Langkah 2", title: "Konsep CI/CD & Version Control", desc: "Pahami integrasi dan rilis berkelanjutan menggunakan Git, GitHub Actions, GitLab CI, atau Jenkins untuk otomatisasi build." },
    { step: "Langkah 3", title: "Kontainerisasi & Orkestrasi Cloud", desc: "Kuasai Docker untuk isolasi aplikasi, orkestrasi Kubernetes, konsep Cloud Infrastructure (AWS/GCP), dan Terraform (IaC)." },
    { step: "Langkah 4", title: "Monitoring, Logging & Keamanan", desc: "Pelajari setup monitoring platform (Prometheus, Grafana), logging terpusat (ELK stack), dan pengamanan infrastruktur (DevSecOps)." }
  ],
  "Quality Assurance Engineer": [
    { step: "Langkah 1", title: "Dasar Metodologi Pengujian", desc: "Pelajari cara menulis skenario pengujian, test cases, test plan, penulisan laporan bug terstruktur, dan siklus SDLC/STLC." },
    { step: "Langkah 2", title: "Pengujian API & Database Relasional", desc: "Kuasai pengujian API (REST) secara manual/otomatis menggunakan Postman, serta query SQL dasar untuk pengujian database." },
    { step: "Langkah 3", title: "Automation Testing Frameworks", desc: "Pelajari pemrograman web untuk automation (Javascript/Java) menggunakan pustaka Cypress, Selenium, Playwright, atau Appium." },
    { step: "Langkah 4", title: "Integrasi Pengujian di CI/CD", desc: "Pelajari cara menjalankan pengujian otomatis di pipeline rilis kode dan melakukan analisis beban (load/stress testing)." }
  ],
  "Database Administrator": [
    { step: "Langkah 1", title: "Sintaks SQL Lanjutan & DBMS", desc: "Kuasai stored procedure, trigger, optimalisasi query, indeks, dan administrasi dasar server RDBMS (PostgreSQL/Oracle)." },
    { step: "Langkah 2", title: "Backup, Restore & Disaster Recovery", desc: "Pahami pembuatan strategi cadangan data (backup schemes), restore berkala, replikasi master-slave, dan recovery log database." },
    { step: "Langkah 3", title: "Tuning Performa & Query Plan", desc: "Pelajari pembacaan query execution plan, optimasi memori database, indexing strategy, dan penyelesaian masalah deadlock." },
    { step: "Langkah 4", title: "Administrasi Skalabilitas & NoSQL", desc: "Kuasai teknik partisi tabel besar, sharding database, manajemen database NoSQL (MongoDB, Redis), dan arsitektur database clustering." }
  ],
  "Network Administrator": [
    { step: "Langkah 1", title: "Konsep Dasar Jaringan", desc: "Kuasai model OSI layer, protokol TCP/IP, IP addressing (IPv4/IPv6), pembagian subnetting, dan teknik routing dasar." },
    { step: "Langkah 2", title: "Konfigurasi Perangkat Keras Jaringan", desc: "Pelajari setup router dan switch (Cisco/Mikrotik), pembuatan VLAN, konfigurasi Dynamic Routing Protocols (OSPF/EIGRP), dan NAT." },
    { step: "Langkah 3", title: "Jaringan Wi-Fi & Keamanan Awal", desc: "Kuasai pengelolaan Wireless LAN, pembuatan VPN (IPSec, OpenVPN), penerapan Access Control Lists (ACLs), dan rule firewall dasar." },
    { step: "Langkah 4", title: "Pemantauan Jaringan & Penanganan Masalah", desc: "Pelajari SNMP monitoring (PRTG/Zabbix), analisis paket dengan Wireshark, dan mitigasi downtime infrastruktur jaringan." }
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
  const { careerName } = useParams();
  const { careers } = useContext(AppContext);
  const navigate = useNavigate();

  // Find career in master context list
  const careerData = useMemo(() => {
    return careers[careerName];
  }, [careers, careerName]);

  // Merge static details with master context data
  const mergedDetails = useMemo(() => {
    if (!careerData) return null;
    const staticInfo = CAREER_DETAILS_DB[careerName] || {
      responsibilities: ["Mengembangkan peran TI terkait.", "Melaksanakan tugas-tugas pendukung digital."],
      salaryRange: "Rp 6.000.000 - Rp 15.000.000 / bulan",
      progression: [
        { title: `Junior ${careerName}`, exp: "0-2 Tahun", salary: "Rp 6M - 9M", tasks: "Tugas entri level." },
        { title: `Senior ${careerName}`, exp: "5+ Tahun", salary: "Rp 12M - 20M", tasks: "Tugas senior level." }
      ]
    };
    return {
      ...careerData,
      ...staticInfo
    };
  }, [careerData, careerName]);

  if (!mergedDetails) {
    return (
      <main className="w-full max-w-md mx-auto py-16 px-4 text-center animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md">
          <span className="text-3xl">📭</span>
          <h2 className="text-lg font-black text-slate-800 mt-4 mb-2">Alternatif Karir Tidak Ditemukan</h2>
          <p className="text-slate-500 text-xs mb-6">Karir dengan nama "{careerName}" tidak terdaftar dalam database sistem.</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">
            Kembali ke Beranda
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <Link to="/" className="text-primary-dark hover:underline">Beranda</Link>
        <span>›</span>
        <span className="text-slate-500">Eksplorasi Karir</span>
        <span>›</span>
        <span className="text-slate-600">{careerName}</span>
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {/* Hero Brand Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-dark via-blue-600 to-primary text-white p-8 md:p-10 shadow-xl shadow-blue-500/10 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full border border-white/5 translate-x-12 -translate-y-12 bg-white/5" />
        
        <div className="flex-1 relative z-10 flex items-center gap-4.5 flex-col sm:flex-row text-center sm:text-left">
          <span className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 font-black text-3xl grid place-items-center shrink-0">
            {mergedDetails.icon || '⌘'}
          </span>
          <div>
            <span className="inline-flex px-2.5 py-0.5 bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2">
              Eksplorasi Karir TI
            </span>
            <h1 className="text-2.5xl md:text-3.5xl font-black tracking-tight leading-none mb-1.5">{careerName}</h1>
            <p className="text-white/80 text-xs md:text-sm">{mergedDetails.subtitle}</p>
          </div>
        </div>

        {/* Quick Stats side panel */}
        <aside className="relative z-10 w-full md:w-60 bg-white/10 border border-white/10 rounded-2xl p-4.5 text-white flex flex-col justify-between self-stretch gap-3">
          <div>
            <span className="text-white/60 text-[10px] font-bold block mb-1">Rerata Gaji</span>
            <strong className="text-sm font-black leading-tight flex items-center gap-0.5">
              <DollarSign className="w-4 h-4 text-emerald-300" />
              {mergedDetails.salaryRange.split('/')[0]}
            </strong>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="text-white/60 text-[9px] block">Lowongan Kerja</span>
              <strong className="font-bold text-xs">{mergedDetails.marketDemand?.vacancy || '50'}+ Posisi</strong>
            </div>
            <div>
              <span className="text-white/60 text-[9px] block">Tren Industri</span>
              <strong className="font-bold text-xs text-emerald-300">{mergedDetails.marketDemand?.trend?.split(' ')[1] || 'Meningkat'}</strong>
            </div>
          </div>
        </aside>
      </section>

      {/* Main Grid: Info columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
        {/* Left Column: Responsibilities & Progression (lg:col-span-7) */}
        <div className="lg:col-span-7 grid gap-6">
          {/* Responsibilities Card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-primary" />
              Tanggung Jawab Pekerjaan
            </h2>
            <p className="text-slate-500 text-xs mb-5">Tugas dan tanggung jawab sehari-hari dari seorang {careerName}.</p>

            <ul className="grid gap-3">
              {mergedDetails.responsibilities.map((resp, index) => (
                <li key={index} className="flex gap-3 text-xs leading-relaxed text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center text-[10px] font-extrabold shrink-0 mt-0.5">✓</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Career Path Timeline Card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <Milestone className="w-4.5 h-4.5 text-primary" />
              Jenjang Karir & Proyeksi Gaji
            </h2>
            <p className="text-slate-500 text-xs mb-6">Perkiraan perkembangan profesi dan rentang penghasilan berdasarkan masa pengalaman kerja.</p>

            <div className="relative border-l border-slate-200 pl-5 ml-2.5 grid gap-6">
              {mergedDetails.progression.map((prog, index) => (
                <div key={index} className="relative">
                  {/* Circle dot marker */}
                  <span className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow shadow-primary/20" />
                  
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{prog.title}</h4>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 bg-blue-50 text-primary-dark font-bold rounded">{prog.exp}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded">{prog.salary}</span>
                      </div>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{prog.tasks}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Learning Roadmap Card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              Peta Belajar / Roadmap Karir
            </h2>
            <p className="text-slate-500 text-xs mb-6">Langkah-langkah kompetensi yang perlu Anda pelajari untuk menguasai peran ini.</p>

            <div className="grid gap-4">
              {(STUDY_ROADMAP_DB[careerName] || []).map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 border border-slate-100 bg-slate-50/20 rounded-2xl hover:border-blue-150 transition-all">
                  <span className="w-8 h-8 rounded-full bg-primary-light text-primary-dark font-black text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Right Column: RIASEC Match & Academics Match (lg:col-span-5) */}
        <div className="lg:col-span-5 grid gap-6">
          {/* RIASEC Match Card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-primary" />
              Kecocokan Minat RIASEC
            </h2>
            <p className="text-slate-500 text-xs mb-5">Tipe minat kepribadian RIASEC yang paling mendominasi profesi {careerName}.</p>

            <div className="flex gap-2 mb-4">
              {mergedDetails.riasecMapped.map(code => (
                <div key={code} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <strong className="text-lg font-black text-primary-dark block leading-none mb-1">{code}</strong>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">{RIASEC_LABELS[code] || code}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-800 text-[10.5px] leading-relaxed">
              * Tipe minat di atas dicocokkan dengan hasil Tes RIASEC mahasiswa untuk menghitung nilai kriteria C1 (Bobot 40%).
            </div>
          </article>

          {/* Academic Requirements Card */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-primary" />
              Kualifikasi Akademik Utama
            </h2>
            <p className="text-slate-500 text-xs mb-5">Proporsi penilaian bobot mata kuliah yang relevan untuk mendukung karir {careerName}.</p>

            <div className="grid gap-3.5 mb-5">
              {Object.entries(mergedDetails.academicWeights).map(([compName, weight]) => (
                <div key={compName} className="text-xs">
                  <div className="flex items-center justify-between font-bold mb-1.5 text-slate-800">
                    <span className="truncate pr-4">{compName}</span>
                    <span>{weight}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-500 text-[10.5px] leading-relaxed">
              Porsi bobot di atas dikalikan dengan nilai akademik mahasiswa untuk menghasilkan nilai kriteria C2 (Bobot 35%).
            </div>
          </article>

          {/* Job Market Area */}
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-primary" />
              Kebutuhan Pasar Kerja (C3)
            </h2>
            <p className="text-slate-500 text-xs mb-5">Rincian data penyerapan tenaga kerja bidang teknologi informasi saat ini.</p>

            <div className="grid grid-cols-1 gap-3.5">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">Indeks Kebutuhan C3</span>
                <strong className="text-lg font-black text-primary-dark leading-none">{mergedDetails.marketDemandScore || 80} / 100</strong>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">Berdasarkan data penyerapan lowongan</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">Pusat Wilayah Penyerapan</span>
                <strong className="text-xs font-black text-slate-800 leading-tight block truncate mt-1">{mergedDetails.marketDemand?.location || 'Jakarta'}</strong>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">{mergedDetails.marketDemand?.shortNote || 'dan remote'}</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">Keterampilan Teknis Terkait</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mergedDetails.marketDemand?.skills?.slice(0, 3).map(skill => (
                    <span key={skill} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9.5px] font-bold text-slate-600">{skill}</span>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">Lowongan aktif: {mergedDetails.marketDemand?.vacancy} lowongan</span>
              </div>
            </div>
          </article>
        </div>
      </div>



      <footer className="mt-16 text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        CareerPath · Sistem Rekomendasi Karir untuk Mahasiswa Tingkat Akhir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
