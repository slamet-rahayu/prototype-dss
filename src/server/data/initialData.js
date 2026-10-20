export const INITIAL_USERS = [
  {
    id: "usr-student-001",
    email: "mameriyadi6@gmail.com",
    // bcrypt hash of "PasswordRahasia123!"
    passwordHash: "$2a$10$vY3B/k0LcqJ4oZ9qT.qMquzK.79YtO6L0Qo6p88M7Z172Qj1d3Jce",
    role: "STUDENT",
    student: {
      id: "std-001",
      nim: "20220801001",
      fullName: "Mame Riyadi",
      university: "Universitas Esa Unggul",
      studyProgram: "Teknologi Informasi",
      semester: "Semester 7",
      domicile: "Jakarta, Indonesia",
      avatarUrl: null
    }
  },
  {
    id: "usr-admin-001",
    email: "admin@careerpath.ac.id",
    // bcrypt hash of "AdminSecret123!"
    passwordHash: "$2a$10$tZ2E7yT7K01d7eGkF/B.oeyMvLgB9eG8HskhG4i56fU4lQ64hCjF2",
    role: "ADMIN",
    student: null
  },
  {
    id: "usr-student-002",
    email: "andi.wijaya@student.id",
    passwordHash: "$2a$10$vY3B/k0LcqJ4oZ9qT.qMquzK.79YtO6L0Qo6p88M7Z172Qj1d3Jce",
    role: "STUDENT",
    student: {
      id: "std-002",
      nim: "20220801002",
      fullName: "Andi Wijaya",
      university: "Universitas Esa Unggul",
      studyProgram: "Teknik Informatika",
      semester: "Semester 7",
      domicile: "Tangerang, Indonesia",
      avatarUrl: null
    }
  },
  {
    id: "usr-student-003",
    email: "rina.k@student.id",
    passwordHash: "$2a$10$vY3B/k0LcqJ4oZ9qT.qMquzK.79YtO6L0Qo6p88M7Z172Qj1d3Jce",
    role: "STUDENT",
    student: {
      id: "std-003",
      nim: "20220801003",
      fullName: "Rina Kartika",
      university: "Universitas Esa Unggul",
      studyProgram: "Sistem Informasi",
      semester: "Semester 7",
      domicile: "Jakarta Barat, Indonesia",
      avatarUrl: null
    }
  },
  {
    id: "usr-student-004",
    email: "budi.s@student.id",
    passwordHash: "$2a$10$vY3B/k0LcqJ4oZ9qT.qMquzK.79YtO6L0Qo6p88M7Z172Qj1d3Jce",
    role: "STUDENT",
    student: {
      id: "std-004",
      nim: "20220801004",
      fullName: "Budi Santoso",
      university: "Universitas Esa Unggul",
      studyProgram: "Ilmu Komputer",
      semester: "Semester 8",
      domicile: "Bekasi, Indonesia",
      avatarUrl: null
    }
  },
  {
    id: "usr-student-005",
    email: "siti.nur@student.id",
    passwordHash: "$2a$10$vY3B/k0LcqJ4oZ9qT.qMquzK.79YtO6L0Qo6p88M7Z172Qj1d3Jce",
    role: "STUDENT",
    student: {
      id: "std-005",
      nim: "20220801005",
      fullName: "Siti Nurhaliza",
      university: "Universitas Esa Unggul",
      studyProgram: "Teknologi Informasi",
      semester: "Semester 7",
      domicile: "Jakarta Selatan, Indonesia",
      avatarUrl: null
    }
  },
  {
    id: "usr-student-006",
    email: "farhan.m@student.id",
    passwordHash: "$2a$10$vY3B/k0LcqJ4oZ9qT.qMquzK.79YtO6L0Qo6p88M7Z172Qj1d3Jce",
    role: "STUDENT",
    student: {
      id: "std-006",
      nim: "20220801006",
      fullName: "Farhan Maulana",
      university: "Universitas Esa Unggul",
      studyProgram: "Teknik Komputer",
      semester: "Semester 7",
      domicile: "Depok, Indonesia",
      avatarUrl: null
    }
  },
  {
    id: "usr-student-007",
    email: "dinda.p@student.id",
    passwordHash: "$2a$10$vY3B/k0LcqJ4oZ9qT.qMquzK.79YtO6L0Qo6p88M7Z172Qj1d3Jce",
    role: "STUDENT",
    student: {
      id: "std-007",
      nim: "20220801007",
      fullName: "Dinda Permata",
      university: "Universitas Esa Unggul",
      studyProgram: "Sistem Informasi",
      semester: "Semester 8",
      domicile: "Bogor, Indonesia",
      avatarUrl: null
    }
  },
  {
    id: "usr-student-008",
    email: "reza.p@student.id",
    passwordHash: "$2a$10$vY3B/k0LcqJ4oZ9qT.qMquzK.79YtO6L0Qo6p88M7Z172Qj1d3Jce",
    role: "STUDENT",
    student: {
      id: "std-008",
      nim: "20220801008",
      fullName: "Reza Pratama",
      university: "Universitas Esa Unggul",
      studyProgram: "Teknologi Informasi",
      semester: "Semester 7",
      domicile: "Jakarta Pusat, Indonesia",
      avatarUrl: null
    }
  }
];

export const INITIAL_ACADEMIC_SUBJECTS = [
  { id: 1, name: "Pemrograman", description: "Dasar pemrograman, pemrograman web, dan pengembangan aplikasi.", icon: "⌘" },
  { id: 2, name: "Basis Data", description: "Perancangan basis data, SQL, dan manajemen data.", icon: "▤" },
  { id: 3, name: "Analisis dan Perancangan Sistem", description: "Analisis kebutuhan, pemodelan sistem, dan perancangan solusi.", icon: "◫" },
  { id: 4, name: "Jaringan dan Keamanan", description: "Jaringan komputer, keamanan informasi, dan infrastruktur TI.", icon: "⌁" },
  { id: 5, name: "Data dan Kecerdasan Buatan", description: "Statistika, analitik data, dan konsep kecerdasan buatan.", icon: "◌" }
];

export const INITIAL_STUDENT_GRADES = [
  { id: "grd-1", studentId: "std-001", subjectId: 1, grade: 92, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-2", studentId: "std-001", subjectId: 2, grade: 88, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-3", studentId: "std-001", subjectId: 3, grade: 86, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-4", studentId: "std-001", subjectId: 4, grade: 84, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-5", studentId: "std-001", subjectId: 5, grade: 86, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },

  { id: "grd-6", studentId: "std-002", subjectId: 1, grade: 85, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-7", studentId: "std-002", subjectId: 2, grade: 80, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-8", studentId: "std-002", subjectId: 3, grade: 82, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-9", studentId: "std-002", subjectId: 4, grade: 90, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-10", studentId: "std-002", subjectId: 5, grade: 84, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },

  { id: "grd-11", studentId: "std-003", subjectId: 1, grade: 82, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-12", studentId: "std-003", subjectId: 2, grade: 90, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-13", studentId: "std-003", subjectId: 3, grade: 88, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-14", studentId: "std-003", subjectId: 4, grade: 78, status: "Cukup", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-15", studentId: "std-003", subjectId: 5, grade: 85, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },

  { id: "grd-16", studentId: "std-004", subjectId: 1, grade: 88, status: "Sangat Baik", semester: "Semester 8", academicYear: "2025/2026" },
  { id: "grd-17", studentId: "std-004", subjectId: 2, grade: 84, status: "Baik", semester: "Semester 8", academicYear: "2025/2026" },
  { id: "grd-18", studentId: "std-004", subjectId: 3, grade: 80, status: "Baik", semester: "Semester 8", academicYear: "2025/2026" },
  { id: "grd-19", studentId: "std-004", subjectId: 4, grade: 82, status: "Baik", semester: "Semester 8", academicYear: "2025/2026" },
  { id: "grd-20", studentId: "std-004", subjectId: 5, grade: 86, status: "Sangat Baik", semester: "Semester 8", academicYear: "2025/2026" },

  { id: "grd-21", studentId: "std-005", subjectId: 1, grade: 80, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-22", studentId: "std-005", subjectId: 2, grade: 76, status: "Cukup", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-23", studentId: "std-005", subjectId: 3, grade: 92, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-24", studentId: "std-005", subjectId: 4, grade: 75, status: "Cukup", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-25", studentId: "std-005", subjectId: 5, grade: 88, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },

  { id: "grd-26", studentId: "std-007", subjectId: 1, grade: 85, status: "Baik", semester: "Semester 8", academicYear: "2025/2026" },
  { id: "grd-27", studentId: "std-007", subjectId: 2, grade: 94, status: "Sangat Baik", semester: "Semester 8", academicYear: "2025/2026" },
  { id: "grd-28", studentId: "std-007", subjectId: 3, grade: 84, status: "Baik", semester: "Semester 8", academicYear: "2025/2026" },
  { id: "grd-29", studentId: "std-007", subjectId: 4, grade: 80, status: "Baik", semester: "Semester 8", academicYear: "2025/2026" },
  { id: "grd-30", studentId: "std-007", subjectId: 5, grade: 82, status: "Baik", semester: "Semester 8", academicYear: "2025/2026" },

  { id: "grd-31", studentId: "std-008", subjectId: 1, grade: 90, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-32", studentId: "std-008", subjectId: 2, grade: 85, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-33", studentId: "std-008", subjectId: 3, grade: 82, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-34", studentId: "std-008", subjectId: 4, grade: 92, status: "Sangat Baik", semester: "Semester 7", academicYear: "2025/2026" },
  { id: "grd-35", studentId: "std-008", subjectId: 5, grade: 80, status: "Baik", semester: "Semester 7", academicYear: "2025/2026" }
];

export const INITIAL_RIASEC_QUESTIONS = [
  { id: 1, type: "R", question: "Saya tertarik merakit, memperbaiki, atau menguji perangkat keras dan perangkat teknis." },
  { id: 2, type: "R", question: "Saya menikmati aktivitas yang menghasilkan sesuatu secara nyata melalui alat, sistem, atau teknologi." },
  { id: 3, type: "R", question: "Saya tertarik memahami cara kerja jaringan, perangkat komputer, atau infrastruktur teknologi." },
  { id: 4, type: "I", question: "Saya menikmati memecahkan masalah yang membutuhkan analisis dan penalaran yang mendalam." },
  { id: 5, type: "I", question: "Saya tertarik mencari pola dari data untuk memahami suatu permasalahan." },
  { id: 6, type: "I", question: "Saya senang mempelajari konsep baru dan menguji berbagai kemungkinan solusi." },
  { id: 7, type: "A", question: "Saya tertarik membuat desain visual, ide kreatif, atau pengalaman digital yang menarik." },
  { id: 8, type: "A", question: "Saya menikmati kebebasan untuk mengekspresikan gagasan melalui karya atau rancangan." },
  { id: 9, type: "A", question: "Saya tertarik mengembangkan tampilan aplikasi agar lebih mudah dan menyenangkan digunakan." },
  { id: 10, type: "S", question: "Saya menikmati membantu orang lain memahami masalah atau mempelajari hal baru." },
  { id: 11, type: "S", question: "Saya tertarik bekerja dalam tim dan mendengarkan kebutuhan orang lain." },
  { id: 12, type: "S", question: "Saya senang memberikan arahan atau dukungan ketika seseorang mengalami kesulitan." },
  { id: 13, type: "E", question: "Saya tertarik memimpin diskusi dan mengajak orang lain mencapai suatu tujuan." },
  { id: 14, type: "E", question: "Saya nyaman menyampaikan ide serta meyakinkan orang lain terhadap suatu solusi." },
  { id: 15, type: "E", question: "Saya tertarik pada perencanaan, pengambilan keputusan, dan pengembangan peluang." },
  { id: 16, type: "C", question: "Saya nyaman bekerja dengan data, aturan, dan prosedur yang terstruktur." },
  { id: 17, type: "C", question: "Saya teliti dalam mengatur informasi, dokumentasi, atau rincian pekerjaan." },
  { id: 18, type: "C", question: "Saya menikmati pekerjaan yang membutuhkan ketepatan, keteraturan, dan konsistensi." }
];

export const INITIAL_RIASEC_RESULTS = [
  {
    id: "res-001",
    studentId: "std-001",
    scoreR: 12,
    scoreI: 14,
    scoreA: 10,
    scoreS: 8,
    scoreE: 9,
    scoreC: 11,
    topHolland: "IRC",
    answersJson: [5, 4, 3, 5, 5, 4, 3, 4, 3, 3, 3, 2, 3, 3, 3, 4, 4, 3],
    completedAt: "2026-06-22T09:18:00.000Z"
  },
  {
    id: "res-002",
    studentId: "std-002",
    scoreR: 14,
    scoreI: 13,
    scoreA: 7,
    scoreS: 8,
    scoreE: 11,
    scoreC: 9,
    topHolland: "RIE",
    answersJson: [5, 5, 4, 5, 4, 4, 2, 3, 2, 3, 3, 2, 4, 4, 3, 3, 3, 3],
    completedAt: "2026-06-23T10:00:00.000Z"
  },
  {
    id: "res-003",
    studentId: "std-003",
    scoreR: 7,
    scoreI: 13,
    scoreA: 9,
    scoreS: 12,
    scoreE: 14,
    scoreC: 10,
    topHolland: "EIS",
    answersJson: [2, 3, 2, 4, 5, 4, 3, 3, 3, 4, 4, 4, 5, 5, 4, 3, 4, 3],
    completedAt: "2026-06-23T14:30:00.000Z"
  },
  {
    id: "res-005",
    studentId: "std-005",
    scoreR: 6,
    scoreI: 11,
    scoreA: 15,
    scoreS: 12,
    scoreE: 8,
    scoreC: 8,
    topHolland: "ASI",
    answersJson: [2, 2, 2, 4, 4, 3, 5, 5, 5, 4, 4, 4, 3, 3, 2, 3, 3, 2],
    completedAt: "2026-06-24T09:15:00.000Z"
  },
  {
    id: "res-006",
    studentId: "std-006",
    scoreR: 14,
    scoreI: 12,
    scoreA: 6,
    scoreS: 7,
    scoreE: 8,
    scoreC: 13,
    topHolland: "RCI",
    answersJson: [5, 5, 4, 4, 4, 4, 2, 2, 2, 2, 3, 2, 3, 3, 2, 5, 4, 4],
    completedAt: "2026-06-24T16:00:00.000Z"
  },
  {
    id: "res-007",
    studentId: "std-007",
    scoreR: 8,
    scoreI: 12,
    scoreA: 7,
    scoreS: 8,
    scoreE: 9,
    scoreC: 15,
    topHolland: "CIR",
    answersJson: [3, 3, 2, 4, 4, 4, 2, 3, 2, 3, 3, 2, 3, 3, 3, 5, 5, 5],
    completedAt: "2026-06-25T11:20:00.000Z"
  },
  {
    id: "res-008",
    studentId: "std-008",
    scoreR: 13,
    scoreI: 12,
    scoreA: 8,
    scoreS: 7,
    scoreE: 10,
    scoreC: 12,
    topHolland: "RCI",
    answersJson: [4, 5, 4, 4, 4, 4, 3, 3, 2, 2, 3, 2, 3, 4, 3, 4, 4, 4],
    completedAt: "2026-06-25T13:45:00.000Z"
  }
];

export const INITIAL_RIASEC_RESULT = INITIAL_RIASEC_RESULTS[0];

export const INITIAL_CAREERS = [
  {
    id: "car-001",
    slug: "software-engineer",
    title: "Software Engineer",
    icon: "⌘",
    description: "Mengembangkan, menguji, dan memelihara aplikasi atau sistem perangkat lunak.",
    subtitle: "Pengembangan perangkat lunak dan solusi digital",
    marketDemandScore: 90,
    riasecWeights: [
      { dimension: "R", weight: 30 },
      { dimension: "I", weight: 50 },
      { dimension: "A", weight: 0 },
      { dimension: "S", weight: 0 },
      { dimension: "E", weight: 0 },
      { dimension: "C", weight: 20 }
    ],
    academicWeights: [
      { subjectId: 1, subjectName: "Pemrograman", weight: 35 },
      { subjectId: 2, subjectName: "Basis Data", weight: 25 },
      { subjectId: 3, subjectName: "Analisis dan Perancangan Sistem", weight: 20 },
      { subjectId: 4, subjectName: "Jaringan dan Keamanan", weight: 10 },
      { subjectId: 5, subjectName: "Data dan Kecerdasan Buatan", weight: 10 }
    ],
    marketDetail: {
      vacancyCount: 520,
      trendStatus: "Tren meningkat",
      primaryLocation: "Jakarta, Bandung, dan Remote",
      requiredSkills: ["Java", "JavaScript", "SQL", "Git", "REST API"],
      shortNote: "dan peluang remote"
    }
  },
  {
    id: "car-002",
    slug: "data-analyst",
    title: "Data Analyst",
    icon: "▤",
    description: "Menganalisis data, menghasilkan wawasan, dan membuat laporan visual.",
    subtitle: "Analisis, pengolahan, dan visualisasi data",
    marketDemandScore: 88,
    riasecWeights: [
      { dimension: "R", weight: 20 },
      { dimension: "I", weight: 50 },
      { dimension: "A", weight: 0 },
      { dimension: "S", weight: 0 },
      { dimension: "E", weight: 0 },
      { dimension: "C", weight: 30 }
    ],
    academicWeights: [
      { subjectId: 1, subjectName: "Pemrograman", weight: 15 },
      { subjectId: 2, subjectName: "Basis Data", weight: 35 },
      { subjectId: 3, subjectName: "Analisis dan Perancangan Sistem", weight: 15 },
      { subjectId: 4, subjectName: "Jaringan dan Keamanan", weight: 5 },
      { subjectId: 5, subjectName: "Data dan Kecerdasan Buatan", weight: 30 }
    ],
    marketDetail: {
      vacancyCount: 340,
      trendStatus: "Tren meningkat",
      primaryLocation: "Jakarta, Tangerang, dan Surabaya",
      requiredSkills: ["SQL", "Excel", "Power BI", "Python", "Statistics"],
      shortNote: "dan kota besar lain"
    }
  },
  {
    id: "car-003",
    slug: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    icon: "⌁",
    description: "Melindungi infrastruktur jaringan, data, dan sistem dari ancaman keamanan siber.",
    subtitle: "Keamanan informasi dan perlindungan sistem",
    marketDemandScore: 84,
    riasecWeights: [
      { dimension: "R", weight: 50 },
      { dimension: "I", weight: 30 },
      { dimension: "A", weight: 0 },
      { dimension: "S", weight: 0 },
      { dimension: "E", weight: 20 },
      { dimension: "C", weight: 0 }
    ],
    academicWeights: [
      { subjectId: 1, subjectName: "Pemrograman", weight: 15 },
      { subjectId: 2, subjectName: "Basis Data", weight: 15 },
      { subjectId: 3, subjectName: "Analisis dan Perancangan Sistem", weight: 15 },
      { subjectId: 4, subjectName: "Jaringan dan Keamanan", weight: 45 },
      { subjectId: 5, subjectName: "Data dan Kecerdasan Buatan", weight: 10 }
    ],
    marketDetail: {
      vacancyCount: 210,
      trendStatus: "Tren meningkat",
      primaryLocation: "Jakarta, Bandung, dan Batam",
      requiredSkills: ["Network", "SIEM", "Security", "Linux", "Incident Response"],
      shortNote: "dan pusat industri"
    }
  },
  {
    id: "car-004",
    slug: "business-analyst",
    title: "Business Analyst",
    icon: "◫",
    description: "Menjembatani kebutuhan bisnis dengan solusi teknologi informasi yang tepat.",
    subtitle: "Analisis kebutuhan bisnis dan solusi teknologi",
    marketDemandScore: 86,
    riasecWeights: [
      { dimension: "R", weight: 0 },
      { dimension: "I", weight: 50 },
      { dimension: "A", weight: 0 },
      { dimension: "S", weight: 30 },
      { dimension: "E", weight: 20 },
      { dimension: "C", weight: 0 }
    ],
    academicWeights: [
      { subjectId: 1, subjectName: "Pemrograman", weight: 10 },
      { subjectId: 2, subjectName: "Basis Data", weight: 20 },
      { subjectId: 3, subjectName: "Analisis dan Perancangan Sistem", weight: 45 },
      { subjectId: 4, subjectName: "Jaringan dan Keamanan", weight: 15 },
      { subjectId: 5, subjectName: "Data dan Kecerdasan Buatan", weight: 10 }
    ],
    marketDetail: {
      vacancyCount: 310,
      trendStatus: "Tren stabil",
      primaryLocation: "Jakarta, Tangerang, dan Bekasi",
      requiredSkills: ["Requirement Analysis", "BPMN", "Communication", "Documentation", "SQL"],
      shortNote: "dan wilayah penyangga"
    }
  },
  {
    id: "car-005",
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    icon: "◌",
    description: "Merancang antarmuka pengguna (UI) dan alur pengalaman pengguna (UX) untuk produk digital.",
    subtitle: "Desain pengalaman pengguna dan produk digital",
    marketDemandScore: 80,
    riasecWeights: [
      { dimension: "R", weight: 0 },
      { dimension: "I", weight: 20 },
      { dimension: "A", weight: 50 },
      { dimension: "S", weight: 30 },
      { dimension: "E", weight: 0 },
      { dimension: "C", weight: 0 }
    ],
    academicWeights: [
      { subjectId: 1, subjectName: "Pemrograman", weight: 20 },
      { subjectId: 2, subjectName: "Basis Data", weight: 10 },
      { subjectId: 3, subjectName: "Analisis dan Perancangan Sistem", weight: 40 },
      { subjectId: 4, subjectName: "Jaringan dan Keamanan", weight: 10 },
      { subjectId: 5, subjectName: "Data dan Kecerdasan Buatan", weight: 20 }
    ],
    marketDetail: {
      vacancyCount: 260,
      trendStatus: "Tren stabil",
      primaryLocation: "Jakarta, Bandung, dan Yogyakarta",
      requiredSkills: ["Figma", "Wireframe", "User Research", "Prototype", "Design System"],
      shortNote: "dan kota kreatif"
    }
  },
  {
    id: "car-006",
    slug: "devops-engineer",
    title: "DevOps Engineer",
    icon: "⚙",
    description: "Mengintegrasikan tim developer (Dev) dengan operasional TI (Ops) untuk mengotomatisasi pengujian, perilisan, dan infrastruktur cloud.",
    subtitle: "Otomatisasi infrastruktur dan rilis kode",
    marketDemandScore: 87,
    riasecWeights: [
      { dimension: "R", weight: 40 },
      { dimension: "I", weight: 30 },
      { dimension: "A", weight: 0 },
      { dimension: "S", weight: 0 },
      { dimension: "E", weight: 0 },
      { dimension: "C", weight: 30 }
    ],
    academicWeights: [
      { subjectId: 1, subjectName: "Pemrograman", weight: 25 },
      { subjectId: 2, subjectName: "Basis Data", weight: 20 },
      { subjectId: 3, subjectName: "Analisis dan Perancangan Sistem", weight: 15 },
      { subjectId: 4, subjectName: "Jaringan dan Keamanan", weight: 30 },
      { subjectId: 5, subjectName: "Data dan Kecerdasan Buatan", weight: 10 }
    ],
    marketDetail: {
      vacancyCount: 220,
      trendStatus: "Tren meningkat",
      primaryLocation: "Jakarta, Tangerang, dan Remote",
      requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD Pipelines", "Linux Shell"],
      shortNote: "dan peluang remote"
    }
  },
  {
    id: "car-007",
    slug: "quality-assurance-engineer",
    title: "Quality Assurance Engineer",
    icon: "★",
    description: "Menguji keandalan perangkat lunak, merancang skenario pengujian automated/manual, mengidentifikasi bug, dan menjaga standar perilisan.",
    subtitle: "Pengujian kualitas dan keandalan sistem software",
    marketDemandScore: 82,
    riasecWeights: [
      { dimension: "R", weight: 20 },
      { dimension: "I", weight: 35 },
      { dimension: "A", weight: 0 },
      { dimension: "S", weight: 0 },
      { dimension: "E", weight: 0 },
      { dimension: "C", weight: 45 }
    ],
    academicWeights: [
      { subjectId: 1, subjectName: "Pemrograman", weight: 25 },
      { subjectId: 2, subjectName: "Basis Data", weight: 20 },
      { subjectId: 3, subjectName: "Analisis dan Perancangan Sistem", weight: 25 },
      { subjectId: 4, subjectName: "Jaringan dan Keamanan", weight: 15 },
      { subjectId: 5, subjectName: "Data dan Kecerdasan Buatan", weight: 15 }
    ],
    marketDetail: {
      vacancyCount: 190,
      trendStatus: "Tren stabil",
      primaryLocation: "Jakarta, Bandung, dan Surabaya",
      requiredSkills: ["Selenium", "Cypress", "Postman", "QA Sprints", "SQL Testing"],
      shortNote: "dan kota besar"
    }
  },
  {
    id: "car-008",
    slug: "database-administrator",
    title: "Database Administrator",
    icon: "▤",
    description: "Mengelola, mengamankan, mengoptimalkan, dan memelihara sistem database (DBMS) untuk kelancaran akses informasi organisasi.",
    subtitle: "Manajemen, performa, dan keamanan basis data",
    marketDemandScore: 78,
    riasecWeights: [
      { dimension: "R", weight: 20 },
      { dimension: "I", weight: 30 },
      { dimension: "A", weight: 0 },
      { dimension: "S", weight: 0 },
      { dimension: "E", weight: 0 },
      { dimension: "C", weight: 50 }
    ],
    academicWeights: [
      { subjectId: 1, subjectName: "Pemrograman", weight: 15 },
      { subjectId: 2, subjectName: "Basis Data", weight: 45 },
      { subjectId: 3, subjectName: "Analisis dan Perancangan Sistem", weight: 20 },
      { subjectId: 4, subjectName: "Jaringan dan Keamanan", weight: 15 },
      { subjectId: 5, subjectName: "Data dan Kecerdasan Buatan", weight: 5 }
    ],
    marketDetail: {
      vacancyCount: 110,
      trendStatus: "Tren stabil",
      primaryLocation: "Jakarta, Bekasi, dan Cikarang",
      requiredSkills: ["SQL Tuning", "Oracle Database", "PostgreSQL", "Backup & Recovery", "NoSQL"],
      shortNote: "dan wilayah perkantoran"
    }
  },
  {
    id: "car-009",
    slug: "network-administrator",
    title: "Network Administrator",
    icon: "⌁",
    description: "Mengkonfigurasi, memelihara, mengamankan, dan menganalisis infrastruktur jaringan komputer lokal (LAN) maupun luas (WAN).",
    subtitle: "Pengelolaan dan pemeliharaan jaringan organisasi",
    marketDemandScore: 76,
    riasecWeights: [
      { dimension: "R", weight: 50 },
      { dimension: "I", weight: 20 },
      { dimension: "A", weight: 0 },
      { dimension: "S", weight: 0 },
      { dimension: "E", weight: 0 },
      { dimension: "C", weight: 30 }
    ],
    academicWeights: [
      { subjectId: 1, subjectName: "Pemrograman", weight: 10 },
      { subjectId: 2, subjectName: "Basis Data", weight: 15 },
      { subjectId: 3, subjectName: "Analisis dan Perancangan Sistem", weight: 15 },
      { subjectId: 4, subjectName: "Jaringan dan Keamanan", weight: 50 },
      { subjectId: 5, subjectName: "Data dan Kecerdasan Buatan", weight: 10 }
    ],
    marketDetail: {
      vacancyCount: 135,
      trendStatus: "Tren stabil",
      primaryLocation: "Jakarta, Surabaya, dan Medan",
      requiredSkills: ["Cisco Routing", "Mikrotik RouterOS", "TCP/IP Protocol", "Firewalls", "Network Topology"],
      shortNote: "dan penyedia infrastruktur"
    }
  }
];

export const INITIAL_SAW_CONFIG = {
  id: 1,
  c1Weight: 40.0,
  c2Weight: 35.0,
  c3Weight: 25.0,
  isActive: true,
  updatedBy: "Admin",
  updatedAt: new Date().toISOString()
};

export const INITIAL_RECOMMENDATION_HISTORIES = [
  {
    id: "hist-001",
    userId: "usr-student-001",
    hollandCode: "IRC",
    topCareerName: "Software Engineer",
    highestScore: 0.9124,
    status: "Valid",
    fullResult: {
      calculatedAt: "2026-10-19T09:30:00.000Z",
      weightsApplied: { c1: 40, c2: 35, c3: 25 },
      topCareer: "Software Engineer"
    },
    calculatedAt: "2026-10-19T09:30:00.000Z"
  },
  {
    id: "hist-002",
    userId: "usr-student-001",
    hollandCode: "CIS",
    topCareerName: "Data Analyst",
    highestScore: 0.8842,
    status: "Valid",
    fullResult: {
      calculatedAt: "2026-10-18T11:15:00.000Z",
      weightsApplied: { c1: 40, c2: 35, c3: 25 },
      topCareer: "Data Analyst"
    },
    calculatedAt: "2026-10-18T11:15:00.000Z"
  },
  {
    id: "hist-003",
    userId: "usr-student-002",
    hollandCode: "RIE",
    topCareerName: "Cybersecurity Analyst",
    highestScore: 0.8950,
    status: "Valid",
    fullResult: {
      calculatedAt: "2026-10-17T14:20:00.000Z",
      weightsApplied: { c1: 40, c2: 35, c3: 25 },
      topCareer: "Cybersecurity Analyst"
    },
    calculatedAt: "2026-10-17T14:20:00.000Z"
  },
  {
    id: "hist-004",
    userId: "usr-student-003",
    hollandCode: "EIS",
    topCareerName: "Business Analyst",
    highestScore: 0.8790,
    status: "Valid",
    fullResult: {
      calculatedAt: "2026-10-16T10:45:00.000Z",
      weightsApplied: { c1: 40, c2: 35, c3: 25 },
      topCareer: "Business Analyst"
    },
    calculatedAt: "2026-10-16T10:45:00.000Z"
  },
  {
    id: "hist-005",
    userId: "usr-student-005",
    hollandCode: "ASI",
    topCareerName: "UI/UX Designer",
    highestScore: 0.9230,
    status: "Valid",
    fullResult: {
      calculatedAt: "2026-10-15T16:10:00.000Z",
      weightsApplied: { c1: 40, c2: 35, c3: 25 },
      topCareer: "UI/UX Designer"
    },
    calculatedAt: "2026-10-15T16:10:00.000Z"
  },
  {
    id: "hist-006",
    userId: "usr-student-007",
    hollandCode: "CIR",
    topCareerName: "Database Administrator",
    highestScore: 0.8640,
    status: "Valid",
    fullResult: {
      calculatedAt: "2026-10-14T13:25:00.000Z",
      weightsApplied: { c1: 40, c2: 35, c3: 25 },
      topCareer: "Database Administrator"
    },
    calculatedAt: "2026-10-14T13:25:00.000Z"
  },
  {
    id: "hist-007",
    userId: "usr-student-008",
    hollandCode: "RIC",
    topCareerName: "DevOps Engineer",
    highestScore: 0.9010,
    status: "Valid",
    fullResult: {
      calculatedAt: "2026-10-13T09:00:00.000Z",
      weightsApplied: { c1: 40, c2: 35, c3: 25 },
      topCareer: "DevOps Engineer"
    },
    calculatedAt: "2026-10-13T09:00:00.000Z"
  },
  {
    id: "hist-008",
    userId: "usr-student-002",
    hollandCode: "RCI",
    topCareerName: "Network Administrator",
    highestScore: 0.8420,
    status: "Perlu Review",
    fullResult: {
      calculatedAt: "2026-10-12T15:30:00.000Z",
      weightsApplied: { c1: 40, c2: 35, c3: 25 },
      topCareer: "Network Administrator"
    },
    calculatedAt: "2026-10-12T15:30:00.000Z"
  }
];

const BASE_CAREER_SYNC_DETAILS = [
  { careerId: "car-001", careerName: "Software Engineer", icon: "⌘", status: "Berhasil", vacancyCount: 520, score: 90, location: "Jakarta, Bandung, dan Remote", trend: "Tren meningkat" },
  { careerId: "car-002", careerName: "Data Analyst", icon: "▤", status: "Berhasil", vacancyCount: 340, score: 88, location: "Jakarta, Tangerang, dan Surabaya", trend: "Tren meningkat" },
  { careerId: "car-003", careerName: "Cybersecurity Analyst", icon: "⌁", status: "Berhasil", vacancyCount: 210, score: 84, location: "Jakarta, Bandung, dan Batam", trend: "Tren meningkat" },
  { careerId: "car-004", careerName: "Business Analyst", icon: "◫", status: "Berhasil", vacancyCount: 310, score: 86, location: "Jakarta, Tangerang, dan Bekasi", trend: "Tren stabil" },
  { careerId: "car-005", careerName: "UI/UX Designer", icon: "◌", status: "Berhasil", vacancyCount: 260, score: 80, location: "Jakarta, Bandung, dan Yogyakarta", trend: "Tren stabil" },
  { careerId: "car-006", careerName: "DevOps Engineer", icon: "⚙", status: "Berhasil", vacancyCount: 220, score: 87, location: "Jakarta, Tangerang, dan Remote", trend: "Tren meningkat" },
  { careerId: "car-007", careerName: "Quality Assurance Engineer", icon: "★", status: "Berhasil", vacancyCount: 190, score: 82, location: "Jakarta, Bandung, dan Surabaya", trend: "Tren stabil" },
  { careerId: "car-008", careerName: "Database Administrator", icon: "▤", status: "Berhasil", vacancyCount: 110, score: 78, location: "Jakarta, Bekasi, dan Cikarang", trend: "Tren stabil" },
  { careerId: "car-009", careerName: "Network Administrator", icon: "⌁", status: "Berhasil", vacancyCount: 135, score: 76, location: "Jakarta, Surabaya, dan Medan", trend: "Tren stabil" }
];

export const INITIAL_SCHEDULER_LOGS = [
  {
    id: 1,
    jobName: "MARKET_DATA_REFRESH",
    executionType: "Otomatis",
    status: "Berhasil",
    processed: 9,
    successCount: 9,
    failedCount: 0,
    durationSec: 1.45,
    message: "Seluruh data pasar karir berhasil diperbarui secara otomatis.",
    startedAt: "2026-10-20T02:00:00.000Z",
    finishedAt: "2026-10-20T02:00:01.450Z",
    careerSyncDetails: BASE_CAREER_SYNC_DETAILS
  },
  {
    id: 2,
    jobName: "MARKET_DATA_REFRESH",
    executionType: "Manual",
    status: "Berhasil",
    processed: 9,
    successCount: 9,
    failedCount: 0,
    durationSec: 0.92,
    message: "Pembaruan manual data pasar karir selesai.",
    startedAt: "2026-10-19T14:30:00.000Z",
    finishedAt: "2026-10-19T14:30:00.920Z",
    careerSyncDetails: BASE_CAREER_SYNC_DETAILS
  },
  {
    id: 3,
    jobName: "MARKET_DATA_REFRESH",
    executionType: "Otomatis",
    status: "Berhasil",
    processed: 9,
    successCount: 9,
    failedCount: 0,
    durationSec: 1.38,
    message: "Seluruh data pasar karir berhasil diperbarui secara otomatis.",
    startedAt: "2026-10-19T02:00:00.000Z",
    finishedAt: "2026-10-19T02:00:01.380Z",
    careerSyncDetails: BASE_CAREER_SYNC_DETAILS
  },
  {
    id: 4,
    jobName: "MARKET_DATA_REFRESH",
    executionType: "Otomatis",
    status: "Sebagian Gagal",
    processed: 9,
    successCount: 8,
    failedCount: 1,
    durationSec: 2.15,
    message: "Permintaan ke penyedia Adzuna API timeout pada karir Database Administrator.",
    startedAt: "2026-10-18T02:00:00.000Z",
    finishedAt: "2026-10-18T02:00:02.150Z",
    careerSyncDetails: BASE_CAREER_SYNC_DETAILS.map(c => 
      c.careerName === "Database Administrator"
        ? { ...c, status: "Gagal", error: "Permintaan ke penyedia Adzuna API timeout (ETIMEDOUT)" }
        : c
    )
  },
  {
    id: 5,
    jobName: "MARKET_DATA_REFRESH",
    executionType: "Otomatis",
    status: "Berhasil",
    processed: 9,
    successCount: 9,
    failedCount: 0,
    durationSec: 1.50,
    message: "Seluruh data pasar karir berhasil diperbarui secara otomatis.",
    startedAt: "2026-10-17T02:00:00.000Z",
    finishedAt: "2026-10-17T02:00:01.500Z",
    careerSyncDetails: BASE_CAREER_SYNC_DETAILS
  },
  {
    id: 6,
    jobName: "MARKET_DATA_REFRESH",
    executionType: "Manual",
    status: "Berhasil",
    processed: 9,
    successCount: 9,
    failedCount: 0,
    durationSec: 0.85,
    message: "Pembaruan manual data pasar karir selesai.",
    startedAt: "2026-10-16T16:15:00.000Z",
    finishedAt: "2026-10-16T16:15:00.850Z",
    careerSyncDetails: BASE_CAREER_SYNC_DETAILS
  }
];
