import React, { createContext, useState, useEffect } from 'react';
import { calculateSaw } from '../utils/sawCalculator';

export const AppContext = createContext();

const STORAGE_KEYS = {
  USER: 'careerpath-user',
  ACADEMIC: 'careerpath-academic',
  RIASEC_PROGRESS: 'careerpath-riasec-progress',
  RIASEC_RESULT: 'careerpath-riasec-result',
  SAW_WEIGHTS: 'careerpath-saw-weights',
  CAREERS: 'careerpath-careers',
  STUDENTS: 'careerpath-students',
  SCHEDULER: 'careerpath-scheduler',
  HISTORY: 'careerpath-history',
  RIASEC_QUESTIONS: 'careerpath-riasec-questions'
};

const DEFAULT_USER = {
  name: "Mame Riyadi",
  email: "mameriyadi6@gmail.com",
  role: "student",
  initials: "MR",
  university: "Universitas Esa Unggul",
  studyProgram: "Teknologi Informasi",
  semester: "Semester 7",
  domicile: "Jakarta, Indonesia"
};

const DEFAULT_ACADEMIC = [
  { id: 1, name: "Pemrograman", desc: "Dasar pemrograman, pemrograman web, dan pengembangan aplikasi.", grade: 92, status: "Sangat Baik", updated: "14 Juni 2026", icon: "⌘", semester: "Semester 7", academicYear: "2025/2026" },
  { id: 2, name: "Basis Data", desc: "Perancangan basis data, SQL, dan manajemen data.", grade: 88, status: "Sangat Baik", updated: "14 Juni 2026", icon: "▤", semester: "Semester 7", academicYear: "2025/2026" },
  { id: 3, name: "Analisis dan Perancangan Sistem", desc: "Analisis kebutuhan, pemodelan sistem, dan perancangan solusi.", grade: 86, status: "Sangat Baik", updated: "14 Juni 2026", icon: "◫", semester: "Semester 7", academicYear: "2025/2026" },
  { id: 4, name: "Jaringan dan Keamanan", desc: "Jaringan komputer, keamanan informasi, dan infrastruktur TI.", grade: 84, status: "Baik", updated: "14 Juni 2026", icon: "⌁", semester: "Semester 7", academicYear: "2025/2026" },
  { id: 5, name: "Data dan Kecerdasan Buatan", desc: "Statistika, analitik data, dan konsep kecerdasan buatan.", grade: 86, status: "Sangat Baik", updated: "14 Juni 2026", icon: "◌", semester: "Semester 7", academicYear: "2025/2026" }
];

const DEFAULT_RIASEC_QUESTIONS = [
  { id: 1, type: "R", text: "Saya tertarik merakit, memperbaiki, atau menguji perangkat keras dan perangkat teknis." },
  { id: 2, type: "R", text: "Saya menikmati aktivitas yang menghasilkan sesuatu secara nyata melalui alat, sistem, atau teknologi." },
  { id: 3, type: "R", text: "Saya tertarik memahami cara kerja jaringan, perangkat komputer, atau infrastruktur teknologi." },
  { id: 4, type: "I", text: "Saya menikmati memecahkan masalah yang membutuhkan analisis dan penalaran yang mendalam." },
  { id: 5, type: "I", text: "Saya tertarik mencari pola dari data untuk memahami suatu permasalahan." },
  { id: 6, type: "I", text: "Saya senang mempelajari konsep baru dan menguji berbagai kemungkinan solusi." },
  { id: 7, type: "A", text: "Saya tertarik membuat desain visual, ide kreatif, atau pengalaman digital yang menarik." },
  { id: 8, type: "A", text: "Saya menikmati kebebasan untuk mengekspresikan gagasan melalui karya atau rancangan." },
  { id: 9, type: "A", text: "Saya tertarik mengembangkan tampilan aplikasi agar lebih mudah dan menyenangkan digunakan." },
  { id: 10, type: "S", text: "Saya menikmati membantu orang lain memahami masalah atau mempelajari hal baru." },
  { id: 11, type: "S", text: "Saya tertarik bekerja dalam tim dan mendengarkan kebutuhan orang lain." },
  { id: 12, type: "S", text: "Saya senang memberikan arahan atau dukungan ketika seseorang mengalami kesulitan." },
  { id: 13, type: "E", text: "Saya tertarik memimpin diskusi dan mengajak orang lain mencapai suatu tujuan." },
  { id: 14, type: "E", text: "Saya nyaman menyampaikan ide serta meyakinkan orang lain terhadap suatu solusi." },
  { id: 15, type: "E", text: "Saya tertarik pada perencanaan, pengambilan keputusan, dan pengembangan peluang." },
  { id: 16, type: "C", text: "Saya nyaman bekerja dengan data, aturan, dan prosedur yang terstruktur." },
  { id: 17, type: "C", text: "Saya teliti dalam mengatur informasi, dokumentasi, atau rincian pekerjaan." },
  { id: 18, type: "C", text: "Saya menikmati pekerjaan yang membutuhkan ketepatan, keteraturan, dan konsistensi." }
];

const DEFAULT_RIASEC_RESULT = {
  scores: { R: 12, I: 14, A: 10, S: 8, E: 9, C: 11 },
  top: ["I", "R", "C"],
  completedAt: "2026-06-22T09:18:00.000Z"
};

const DEFAULT_SAW_WEIGHTS = { c1: 40, c2: 35, c3: 25 };

const DEFAULT_CAREERS = {
  "Software Engineer": {
    icon: "⌘",
    description: "Mengembangkan, menguji, dan memelihara aplikasi atau sistem perangkat lunak.",
    subtitle: "Pengembangan perangkat lunak dan solusi digital",
    riasecMapped: ["I", "R", "C"],
    riasecWeights: { R: 30, I: 50, A: 0, S: 0, E: 0, C: 20 },
    academicWeights: { "Pemrograman": 35, "Basis Data": 25, "Analisis dan Perancangan Sistem": 20, "Jaringan dan Keamanan": 10, "Data dan Kecerdasan Buatan": 10 },
    marketDemandScore: 90,
    marketDemand: { title: "Gambaran kebutuhan pasar kerja untuk Software Engineer.", vacancy: "520", trend: "↗ Tren meningkat", short: "Jakarta", shortNote: "dan peluang remote", location: "Jakarta, Bandung, dan Remote", skills: ["Java", "JavaScript", "SQL", "Git", "REST API"], note: "Data pasar kerja ini digunakan sebagai salah satu pertimbangan dalam kriteria kebutuhan pasar kerja (C3)." }
  },
  "Data Analyst": {
    icon: "▤",
    description: "Menganalisis data, menghasilkan wawasan, dan membuat laporan visual.",
    subtitle: "Analisis, pengolahan, dan visualisasi data",
    riasecMapped: ["I", "C", "R"],
    riasecWeights: { R: 20, I: 50, A: 0, S: 0, E: 0, C: 30 },
    academicWeights: { "Pemrograman": 15, "Basis Data": 35, "Analisis dan Perancangan Sistem": 15, "Jaringan dan Keamanan": 5, "Data dan Kecerdasan Buatan": 30 },
    marketDemandScore: 88,
    marketDemand: { title: "Gambaran kebutuhan pasar kerja untuk Data Analyst.", vacancy: "340", trend: "↗ Tren meningkat", short: "Jakarta", shortNote: "dan kota besar lain", location: "Jakarta, Tangerang, dan Surabaya", skills: ["SQL", "Excel", "Power BI", "Python", "Statistics"], note: "Peran Data Analyst banyak dibutuhkan untuk membantu organisasi mengambil keputusan berbasis data." }
  },
  "Cybersecurity Analyst": {
    icon: "⌁",
    description: "Melindungi infrastruktur jaringan, data, dan sistem dari ancaman keamanan siber.",
    subtitle: "Keamanan informasi dan perlindungan sistem",
    riasecMapped: ["R", "I", "E"],
    riasecWeights: { R: 50, I: 30, A: 0, S: 0, E: 20, C: 0 },
    academicWeights: { "Pemrograman": 15, "Basis Data": 15, "Analisis dan Perancangan Sistem": 15, "Jaringan dan Keamanan": 45, "Data dan Kecerdasan Buatan": 10 },
    marketDemandScore: 84,
    marketDemand: { title: "Gambaran kebutuhan pasar kerja untuk Cybersecurity Analyst.", vacancy: "210", trend: "↗ Tren meningkat", short: "Jakarta", shortNote: "dan pusat industri", location: "Jakarta, Bandung, dan Batam", skills: ["Network", "SIEM", "Security", "Linux", "Incident Response"], note: "Permintaan meningkat karena organisasi membutuhkan perlindungan sistem, data, dan infrastruktur digital." }
  },
  "Business Analyst": {
    icon: "◫",
    description: "Menjembatani kebutuhan bisnis dengan solusi teknologi informasi yang tepat.",
    subtitle: "Analisis kebutuhan bisnis dan solusi teknologi",
    riasecMapped: ["I", "S", "E"],
    riasecWeights: { R: 0, I: 50, A: 0, S: 30, E: 20, C: 0 },
    academicWeights: { "Pemrograman": 10, "Basis Data": 20, "Analisis dan Perancangan Sistem": 45, "Jaringan dan Keamanan": 15, "Data dan Kecerdasan Buatan": 10 },
    marketDemandScore: 86,
    marketDemand: { title: "Gambaran kebutuhan pasar kerja untuk Business Analyst.", vacancy: "310", trend: "→ Tren stabil", short: "Jakarta", shortNote: "dan wilayah penyangga", location: "Jakarta, Tangerang, dan Bekasi", skills: ["Requirement Analysis", "BPMN", "Communication", "Documentation", "SQL"], note: "Business Analyst diperlukan untuk menerjemahkan kebutuhan bisnis menjadi kebutuhan sistem yang terstruktur." }
  },
  "UI/UX Designer": {
    icon: "◌",
    description: "Merancang antarmuka pengguna (UI) dan alur pengalaman pengguna (UX) untuk produk digital.",
    subtitle: "Desain pengalaman pengguna dan produk digital",
    riasecMapped: ["A", "S", "I"],
    riasecWeights: { R: 0, I: 20, A: 50, S: 30, E: 0, C: 0 },
    academicWeights: { "Pemrograman": 20, "Basis Data": 10, "Analisis dan Perancangan Sistem": 40, "Jaringan dan Keamanan": 10, "Data dan Kecerdasan Buatan": 20 },
    marketDemandScore: 80,
    marketDemand: { title: "Gambaran kebutuhan pasar kerja untuk UI/UX Designer.", vacancy: "260", trend: "→ Tren stabil", short: "Bandung", shortNote: "dan kota kreatif", location: "Jakarta, Bandung, dan Yogyakarta", skills: ["Figma", "Wireframe", "User Research", "Prototype", "Design System"], note: "Posisi UI/UX Designer berfokus pada pengembangan pengalaman dan antarmuka produk digital." }
  },
  "DevOps Engineer": {
    icon: "⚙",
    description: "Mengintegrasikan tim developer (Dev) dengan operasional TI (Ops) untuk mengotomatisasi pengujian, perilisan, dan pemeliharaan infrastruktur cloud.",
    subtitle: "Otomatisasi infrastruktur dan rilis kode",
    riasecMapped: ["R", "I", "C"],
    riasecWeights: { R: 40, I: 30, A: 0, S: 0, E: 0, C: 30 },
    academicWeights: { "Pemrograman": 25, "Basis Data": 20, "Analisis dan Perancangan Sistem": 15, "Jaringan dan Keamanan": 30, "Data dan Kecerdasan Buatan": 10 },
    marketDemandScore: 87,
    marketDemand: { title: "Gambaran kebutuhan pasar kerja untuk DevOps Engineer.", vacancy: "220", trend: "↗ Tren meningkat", short: "Jakarta", shortNote: "dan peluang remote", location: "Jakarta, Tangerang, dan Remote", skills: ["Docker", "Kubernetes", "AWS", "CI/CD Pipelines", "Linux Shell"], note: "DevOps Engineer sangat diminati seiring adopsi cloud computing oleh startup dan korporasi." }
  },
  "Quality Assurance Engineer": {
    icon: "★",
    description: "Menguji keandalan perangkat lunak, merancang skenario pengujian automated/manual, mengidentifikasi bug, dan menjaga standar perilisan.",
    subtitle: "Pengujian kualitas dan keandalan sistem software",
    riasecMapped: ["C", "I", "R"],
    riasecWeights: { R: 20, I: 35, A: 0, S: 0, E: 0, C: 45 },
    academicWeights: { "Pemrograman": 25, "Basis Data": 20, "Analisis dan Perancangan Sistem": 25, "Jaringan dan Keamanan": 15, "Data dan Kecerdasan Buatan": 15 },
    marketDemandScore: 82,
    marketDemand: { title: "Gambaran kebutuhan pasar kerja untuk Quality Assurance Engineer.", vacancy: "190", trend: "→ Tren stabil", short: "Jakarta", shortNote: "dan kota besar", location: "Jakarta, Bandung, dan Surabaya", skills: ["Selenium", "Cypress", "Postman", "QA Sprints", "SQL Testing"], note: "QA Engineer bertugas menjamin perangkat lunak bebas dari kecacatan mayor sebelum dilepas ke publik." }
  },
  "Database Administrator": {
    icon: "▤",
    description: "Mengelola, mengamankan, mengoptimalkan, dan memelihara sistem database (DBMS) untuk kelancaran akses informasi organisasi.",
    subtitle: "Manajemen, performa, dan keamanan basis data",
    riasecMapped: ["C", "I", "R"],
    riasecWeights: { R: 20, I: 30, A: 0, S: 0, E: 0, C: 50 },
    academicWeights: { "Pemrograman": 15, "Basis Data": 45, "Analisis dan Perancangan Sistem": 20, "Jaringan dan Keamanan": 15, "Data dan Kecerdasan Buatan": 5 },
    marketDemandScore: 78,
    marketDemand: { title: "Gambaran kebutuhan pasar kerja untuk Database Administrator.", vacancy: "110", trend: "→ Tren stabil", short: "Jakarta", shortNote: "dan wilayah perkantoran", location: "Jakarta, Bekasi, dan Cikarang", skills: ["SQL Tuning", "Oracle Database", "PostgreSQL", "Backup & Recovery", "NoSQL"], note: "Database Administrator menjaga performa database agar tidak mengalami downtime." }
  },
  "Network Administrator": {
    icon: "⌁",
    description: "Mengkonfigurasi, memelihara, mengamankan, dan menganalisis infrastruktur jaringan komputer lokal (LAN) maupun luas (WAN).",
    subtitle: "Pengelolaan dan pemeliharaan jaringan organisasi",
    riasecMapped: ["R", "C", "I"],
    riasecWeights: { R: 50, I: 20, A: 0, S: 0, E: 0, C: 30 },
    academicWeights: { "Pemrograman": 10, "Basis Data": 15, "Analisis dan Perancangan Sistem": 15, "Jaringan dan Keamanan": 50, "Data dan Kecerdasan Buatan": 10 },
    marketDemandScore: 76,
    marketDemand: { title: "Gambaran kebutuhan pasar kerja untuk Network Administrator.", vacancy: "135", trend: "→ Tren stabil", short: "Jakarta", shortNote: "dan penyedia infrastruktur", location: "Jakarta, Surabaya, dan Medan", skills: ["Cisco Routing", "Mikrotik RouterOS", "TCP/IP Protocol", "Firewalls", "Network Topology"], note: "Network Administrator bertanggung jawab atas keandalan koneksi internal dan eksternal perusahaan." }
  }
};;

const DEFAULT_STUDENTS = [
  { id: 1, nim: "20220801001", name: "Mame Riyadi", email: "mameriyadi6@gmail.com", studyProgram: "Teknologi Informasi", semester: "Semester 7", status: "Lengkap" },
  { id: 2, nim: "20220801002", name: "Andi Wijaya", email: "andi.wijaya@student.id", studyProgram: "Teknik Informatika", semester: "Semester 7", status: "Proses" },
  { id: 3, nim: "20220801003", name: "Rina Kartika", email: "rina.k@student.id", studyProgram: "Sistem Informasi", semester: "Semester 7", status: "Lengkap" },
  { id: 4, nim: "20220801004", name: "Budi Santoso", email: "budi.s@student.id", studyProgram: "Ilmu Komputer", semester: "Semester 8", status: "Proses" }
];

const DEFAULT_SCHEDULER = [
  { id: 1, name: "Scraper Lowongan Jobstreet", target: "Peran TI (Software, Data, Security)", interval: "Setiap 24 Jam", status: "Aktif", lastRun: "27 Juni 2026, 06.00 WIB" },
  { id: 2, name: "Scraper LinkedIn Jobs", target: "Magang & Fresh Graduate TI", interval: "Setiap 12 Jam", status: "Aktif", lastRun: "27 Juni 2026, 08.30 WIB" },
  { id: 3, name: "Scraper Karir.com", target: "Entry-level IT Roles", interval: "Setiap 48 Jam", status: "Tidak Aktif", lastRun: "25 Juni 2026, 12.00 WIB" }
];

const DEFAULT_HISTORY = [
  { id: 1, nim: "20220801001", name: "Mame Riyadi", code: "IRC", career: "Software Engineer", score: "0.91", date: "22 Juni 2026", status: "Valid" },
  { id: 2, nim: "20220801003", name: "Rina Kartika", code: "CIS", career: "Data Analyst", score: "0.88", date: "23 Juni 2026", status: "Valid" },
  { id: 3, nim: "20220801002", name: "Andi Wijaya", code: "RSE", career: "Cybersecurity Analyst", score: "0.84", date: "24 Juni 2026", status: "Perlu Review" }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [academicComponents, setAcademicComponents] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACADEMIC);
    return saved ? JSON.parse(saved) : DEFAULT_ACADEMIC;
  });

  const [riasecProgress, setRiasecProgress] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RIASEC_PROGRESS);
    return saved ? JSON.parse(saved) : { currentIndex: 0, answers: Array(18).fill(null) };
  });

  const [riasecResult, setRiasecResult] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RIASEC_RESULT);
    return saved ? JSON.parse(saved) : DEFAULT_RIASEC_RESULT;
  });

  const [sawWeights, setSawWeights] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAW_WEIGHTS);
    return saved ? JSON.parse(saved) : DEFAULT_SAW_WEIGHTS;
  });

  const [careers, setCareers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAREERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = {};
      Object.keys(DEFAULT_CAREERS).forEach(key => {
        const defaultCareer = DEFAULT_CAREERS[key];
        const parsedCareer = parsed[key] || {};
        merged[key] = {
          ...defaultCareer,
          ...parsedCareer,
          riasecWeights: parsedCareer.riasecWeights || defaultCareer.riasecWeights
        };
      });
      return merged;
    }
    return DEFAULT_CAREERS;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
  });

  const [schedulerJobs, setSchedulerJobs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULER);
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULER;
  });

  const [recommendationHistory, setRecommendationHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
  });

  const [riasecQuestions, setRiasecQuestions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RIASEC_QUESTIONS);
    return saved ? JSON.parse(saved) : DEFAULT_RIASEC_QUESTIONS;
  });

  const [sawResults, setSawResults] = useState([]);

  // Calculate recommendations dynamically whenever inputs change
  useEffect(() => {
    if (riasecResult && academicComponents) {
      const results = calculateSaw({
        riasecScores: riasecResult.scores,
        studentGrades: academicComponents,
        careers,
        sawWeights
      });
      setSawResults(results);
    }
  }, [riasecResult, academicComponents, careers, sawWeights]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACADEMIC, JSON.stringify(academicComponents));
  }, [academicComponents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RIASEC_PROGRESS, JSON.stringify(riasecProgress));
  }, [riasecProgress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RIASEC_RESULT, JSON.stringify(riasecResult));
  }, [riasecResult]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAW_WEIGHTS, JSON.stringify(sawWeights));
  }, [sawWeights]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAREERS, JSON.stringify(careers));
  }, [careers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULER, JSON.stringify(schedulerJobs));
  }, [schedulerJobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(recommendationHistory));
  }, [recommendationHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RIASEC_QUESTIONS, JSON.stringify(riasecQuestions));
  }, [riasecQuestions]);

  const login = (email, password) => {
    if (email === 'admin@careerpath.id') {
      const adminUser = {
        name: "Administrator",
        email: "admin@careerpath.id",
        role: "admin",
        initials: "AD"
      };
      setUser(adminUser);
      return adminUser;
    } else {
      const studentUser = {
        ...DEFAULT_USER,
        email: email,
        name: email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        initials: email.charAt(0).toUpperCase() + (email.charAt(1) || '').toUpperCase()
      };
      setUser(studentUser);
      return studentUser;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data) => {
    setUser(prev => ({
      ...prev,
      ...data,
      initials: data.name
        ? data.name.trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('')
        : prev.initials
    }));
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      updateProfile,
      academicComponents,
      setAcademicComponents,
      riasecProgress,
      setRiasecProgress,
      riasecResult,
      setRiasecResult,
      sawWeights,
      setSawWeights,
      careers,
      setCareers,
      students,
      setStudents,
      schedulerJobs,
      setSchedulerJobs,
      recommendationHistory,
      setRecommendationHistory,
      riasecQuestions,
      setRiasecQuestions,
      sawResults
    }}>
      {children}
    </AppContext.Provider>
  );
};
