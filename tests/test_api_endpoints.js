const BASE_URL = 'http://localhost:3000';

async function runApiTests() {
  console.log('====================================================');
  console.log('   FULL END-TO-END API & INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  const testResults = [];
  let studentToken = '';
  let adminToken = '';

  async function testEndpoint({ id, name, method, path, headers = {}, body = null, expectedStatus }) {
    const start = Date.now();
    try {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      if (body) {
        opts.body = JSON.stringify(body);
      }

      const res = await fetch(`${BASE_URL}${path}`, opts);
      const duration = Date.now() - start;
      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      const passed = Array.isArray(expectedStatus)
        ? expectedStatus.includes(res.status)
        : res.status === expectedStatus;
      const statusIcon = passed ? 'PASS' : 'FAIL';
      console.log(`[${statusIcon}] [${id}] ${method} ${path} => Status ${res.status} (Expected ${expectedStatus}) [${duration}ms]`);

      testResults.push({
        id,
        name,
        method,
        path,
        expectedStatus,
        actualStatus: res.status,
        passed,
        duration,
        data
      });

      return { status: res.status, data, passed };
    } catch (err) {
      console.error(`[FAIL] [${id}] ${method} ${path} => Network/Fetch Error:`, err.message);
      testResults.push({
        id,
        name,
        method,
        path,
        expectedStatus,
        actualStatus: 'ERROR',
        passed: false,
        duration: Date.now() - start,
        error: err.message
      });
      return { status: 500, error: err.message, passed: false };
    }
  }

  // --- 1. AUTHENTICATION & SECURITY TESTS ---
  console.log('--- 1. Authentication & Security Endpoints ---');

  // Test 1.1: Invalid login
  await testEndpoint({
    id: 'AUTH-01',
    name: 'Login Invalid Credentials',
    method: 'POST',
    path: '/api/v1/auth/login',
    body: { email: 'wrong@example.com', password: 'wrongpassword' },
    expectedStatus: 401
  });

  // Test 1.2: Student Login
  const studentLogin = await testEndpoint({
    id: 'AUTH-02',
    name: 'Student Login Demo',
    method: 'POST',
    path: '/api/v1/auth/login',
    body: { email: 'mameriyadi6@gmail.com', password: 'PasswordRahasia123!' },
    expectedStatus: 200
  });
  if (studentLogin.passed && studentLogin.data?.data?.token) {
    studentToken = studentLogin.data.data.token;
    console.log(`       -> Student Token acquired: ${studentToken.slice(0, 15)}...`);
  }

  // Test 1.3: Admin Login
  const adminLogin = await testEndpoint({
    id: 'AUTH-03',
    name: 'Admin Login Demo',
    method: 'POST',
    path: '/api/v1/auth/login',
    body: { email: 'admin@careerpath.id', password: 'password' },
    expectedStatus: 200
  });
  if (adminLogin.passed && adminLogin.data?.data?.token) {
    adminToken = adminLogin.data.data.token;
    console.log(`       -> Admin Token acquired: ${adminToken.slice(0, 15)}...`);
  }

  // Test 1.4: Protected /auth/me without token (Should fail 401)
  await testEndpoint({
    id: 'AUTH-04',
    name: 'Access /auth/me Unauthenticated',
    method: 'GET',
    path: '/api/v1/auth/me',
    expectedStatus: 401
  });

  // Test 1.5: Protected /auth/me with valid student token
  await testEndpoint({
    id: 'AUTH-05',
    name: 'Access /auth/me with Student Token',
    method: 'GET',
    path: '/api/v1/auth/me',
    headers: { Authorization: `Bearer ${studentToken}` },
    expectedStatus: 200
  });

  // Test 1.6: Update Student Profile
  await testEndpoint({
    id: 'AUTH-06',
    name: 'Update Profile Endpoint',
    method: 'PUT',
    path: '/api/v1/auth/profile',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      fullName: 'Mame Riyadi (Updated)',
      studyProgram: 'Teknologi Informasi',
      semester: 'Semester 7',
      domicile: 'Jakarta Barat, Indonesia'
    },
    expectedStatus: 200
  });

  // Test 1.7: Logout Endpoint
  await testEndpoint({
    id: 'AUTH-07',
    name: 'Logout Endpoint',
    method: 'POST',
    path: '/api/v1/auth/logout',
    expectedStatus: 200
  });

  // --- 2. STUDENT RIASEC & ACADEMIC ENDPOINTS ---
  console.log('\n--- 2. Student RIASEC & Academic Endpoints ---');

  // Test 2.1: Get RIASEC Questions
  await testEndpoint({
    id: 'RIASEC-01',
    name: 'Get All RIASEC Questions',
    method: 'GET',
    path: '/api/v1/riasec/questions',
    headers: { Authorization: `Bearer ${studentToken}` },
    expectedStatus: 200
  });

  // Test 2.2: Submit RIASEC Answers
  const mockAnswers = [
    { questionId: 1, score: 4 }, { questionId: 2, score: 4 }, { questionId: 3, score: 4 },
    { questionId: 4, score: 5 }, { questionId: 5, score: 5 }, { questionId: 6, score: 5 },
    { questionId: 7, score: 4 }, { questionId: 8, score: 4 }, { questionId: 9, score: 3 },
    { questionId: 10, score: 2 }, { questionId: 11, score: 2 }, { questionId: 12, score: 2 },
    { questionId: 13, score: 3 }, { questionId: 14, score: 3 }, { questionId: 15, score: 2 },
    { questionId: 16, score: 3 }, { questionId: 17, score: 3 }, { questionId: 18, score: 3 }
  ];
  await testEndpoint({
    id: 'RIASEC-02',
    name: 'Submit RIASEC Answers',
    method: 'POST',
    path: '/api/v1/riasec/submit',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: { answers: mockAnswers },
    expectedStatus: [200, 201]
  });

  // Test 2.3: Get RIASEC Result
  await testEndpoint({
    id: 'RIASEC-03',
    name: 'Get RIASEC Result',
    method: 'GET',
    path: '/api/v1/riasec/my-result',
    headers: { Authorization: `Bearer ${studentToken}` },
    expectedStatus: 200
  });

  // Test 2.4: Get Academic Subjects
  await testEndpoint({
    id: 'ACAD-01',
    name: 'Get Academic Subjects',
    method: 'GET',
    path: '/api/v1/academic/subjects',
    headers: { Authorization: `Bearer ${studentToken}` },
    expectedStatus: 200
  });

  // Test 2.5: Get Student Grades
  await testEndpoint({
    id: 'ACAD-02',
    name: 'Get Student Grades',
    method: 'GET',
    path: '/api/v1/academic/my-grades',
    headers: { Authorization: `Bearer ${studentToken}` },
    expectedStatus: 200
  });

  // Test 2.6: Update Student Grades
  await testEndpoint({
    id: 'ACAD-03',
    name: 'Update Student Grades',
    method: 'PUT',
    path: '/api/v1/academic/my-grades',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      grades: [
        { subjectId: 1, grade: 92, semester: 'Semester 3', academicYear: '2023/2024' },
        { subjectId: 2, grade: 88, semester: 'Semester 4', academicYear: '2023/2024' },
        { subjectId: 3, grade: 85, semester: 'Semester 5', academicYear: '2024/2025' },
        { subjectId: 4, grade: 90, semester: 'Semester 5', academicYear: '2024/2025' },
        { subjectId: 5, grade: 86, semester: 'Semester 6', academicYear: '2024/2025' }
      ]
    },
    expectedStatus: 200
  });

  // --- 3. RECOMMENDATIONS & SAW CALCULATION ---
  console.log('\n--- 3. Recommendation & SAW Calculation ---');

  // Test 3.1: Calculate Recommendations
  const calcRes = await testEndpoint({
    id: 'REC-01',
    name: 'Calculate SAW Recommendations',
    method: 'POST',
    path: '/api/v1/recommendations/calculate',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {},
    expectedStatus: 200
  });
  if (calcRes.passed && calcRes.data?.data) {
    const topCareer = calcRes.data.data.rankings?.[0];
    console.log(`       -> Top Recommended Career: ${topCareer?.name} (Final Score: ${topCareer?.finalScore})`);
  }

  // Test 3.2: Get Latest Recommendation
  await testEndpoint({
    id: 'REC-02',
    name: 'Get Latest Recommendation',
    method: 'GET',
    path: '/api/v1/recommendations/latest',
    headers: { Authorization: `Bearer ${studentToken}` },
    expectedStatus: 200
  });

  // Test 3.3: Get Recommendation Histories
  await testEndpoint({
    id: 'REC-03',
    name: 'Get Recommendation Histories',
    method: 'GET',
    path: '/api/v1/recommendations/histories',
    headers: { Authorization: `Bearer ${studentToken}` },
    expectedStatus: 200
  });

  // --- 4. CAREERS EXPLORATION ENDPOINTS ---
  console.log('\n--- 4. Career Exploration Endpoints ---');

  // Test 4.1: List Careers
  await testEndpoint({
    id: 'CAR-01',
    name: 'Get All Careers',
    method: 'GET',
    path: '/api/v1/careers',
    expectedStatus: 200
  });

  // Test 4.2: Get Career Detail by ID / Slug
  await testEndpoint({
    id: 'CAR-02',
    name: 'Get Career Detail (Software Engineer)',
    method: 'GET',
    path: '/api/v1/careers/software-engineer',
    expectedStatus: 200
  });

  // --- 5. ADMIN PORTAL & ROLE-BASED ACCESS CONTROL (RBAC) ---
  console.log('\n--- 5. Admin Portal & RBAC Security Endpoints ---');

  // Test 5.1: Student trying to access Admin Students list (Must return 403)
  await testEndpoint({
    id: 'RBAC-01',
    name: 'RBAC Check: Student accessing Admin endpoint',
    method: 'GET',
    path: '/api/v1/admin/students',
    headers: { Authorization: `Bearer ${studentToken}` },
    expectedStatus: 403
  });

  // Test 5.2: Admin accessing Admin Students list (Must return 200)
  await testEndpoint({
    id: 'ADM-01',
    name: 'Admin Get Students List',
    method: 'GET',
    path: '/api/v1/admin/students',
    headers: { Authorization: `Bearer ${adminToken}` },
    expectedStatus: 200
  });

  // Test 5.3: Admin Get SAW Configuration
  await testEndpoint({
    id: 'ADM-02',
    name: 'Admin Get SAW Config',
    method: 'GET',
    path: '/api/v1/admin/saw-config',
    headers: { Authorization: `Bearer ${adminToken}` },
    expectedStatus: 200
  });

  // Test 5.4: Admin Update SAW Configuration
  await testEndpoint({
    id: 'ADM-03',
    name: 'Admin Update SAW Config (40, 35, 25)',
    method: 'PUT',
    path: '/api/v1/admin/saw-config',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { c1Weight: 40, c2Weight: 35, c3Weight: 25 },
    expectedStatus: 200
  });

  // Test 5.5: Admin Get Scheduler Logs
  await testEndpoint({
    id: 'ADM-04',
    name: 'Admin Get Scheduler Logs',
    method: 'GET',
    path: '/api/v1/admin/scheduler/logs',
    headers: { Authorization: `Bearer ${adminToken}` },
    expectedStatus: 200
  });

  // Test 5.6: Admin Trigger Job Market Sync
  await testEndpoint({
    id: 'ADM-05',
    name: 'Admin Trigger Scheduler Sync',
    method: 'POST',
    path: '/api/v1/admin/scheduler/trigger',
    headers: { Authorization: `Bearer ${adminToken}` },
    expectedStatus: 200
  });

  // Test 5.7: Admin Dashboard Stats
  await testEndpoint({
    id: 'ADM-06',
    name: 'Admin Dashboard Stats API',
    method: 'GET',
    path: '/api/v1/admin/dashboard',
    headers: { Authorization: `Bearer ${adminToken}` },
    expectedStatus: 200
  });

  // Test 5.8: Admin Academic Subjects (CRUD)
  const getSubjects = await testEndpoint({
    id: 'ADM-07',
    name: 'Admin Get Academic Subjects',
    method: 'GET',
    path: '/api/v1/admin/academic-subjects',
    headers: { Authorization: `Bearer ${adminToken}` },
    expectedStatus: 200
  });

  const createSubject = await testEndpoint({
    id: 'ADM-08',
    name: 'Admin Create Academic Subject',
    method: 'POST',
    path: '/api/v1/admin/academic-subjects',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      name: 'Rekayasa Perangkat Lunak Lanjut',
      description: 'Mata kuliah spesialisasi arsitektur sistem dan otomasi pengujian.',
      icon: '⚡'
    },
    expectedStatus: [200, 201]
  });

  const newSubjectId = createSubject.data?.data?.id;
  if (newSubjectId) {
    await testEndpoint({
      id: 'ADM-09',
      name: 'Admin Update Academic Subject',
      method: 'PUT',
      path: `/api/v1/admin/academic-subjects/${newSubjectId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Rekayasa Perangkat Lunak Terapan',
        description: 'Mata kuliah spesialisasi arsitektur sistem terdistribusi.'
      },
      expectedStatus: 200
    });

    await testEndpoint({
      id: 'ADM-10',
      name: 'Admin Delete Academic Subject',
      method: 'DELETE',
      path: `/api/v1/admin/academic-subjects/${newSubjectId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: 200
    });
  }

  // Test 5.9: Admin RIASEC Questions (CRUD)
  const getQuestions = await testEndpoint({
    id: 'ADM-11',
    name: 'Admin Get RIASEC Questions',
    method: 'GET',
    path: '/api/v1/admin/riasec-questions',
    headers: { Authorization: `Bearer ${adminToken}` },
    expectedStatus: 200
  });

  const createQuestion = await testEndpoint({
    id: 'ADM-12',
    name: 'Admin Create RIASEC Question',
    method: 'POST',
    path: '/api/v1/admin/riasec-questions',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      type: 'R',
      question: 'Apakah Anda menyukai kegiatan membongkar dan merakit perangkat komputer?'
    },
    expectedStatus: [200, 201]
  });

  const newQuestionId = createQuestion.data?.data?.id;
  if (newQuestionId) {
    await testEndpoint({
      id: 'ADM-13',
      name: 'Admin Update RIASEC Question',
      method: 'PUT',
      path: `/api/v1/admin/riasec-questions/${newQuestionId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        type: 'R',
        question: 'Apakah Anda tertarik mengonfigurasi jaringan router dan switch secara langsung?'
      },
      expectedStatus: 200
    });

    await testEndpoint({
      id: 'ADM-14',
      name: 'Admin Delete RIASEC Question',
      method: 'DELETE',
      path: `/api/v1/admin/riasec-questions/${newQuestionId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      expectedStatus: 200
    });
  }

  // Test 5.10: Admin Recommendation Histories
  await testEndpoint({
    id: 'ADM-15',
    name: 'Admin Get Recommendation Histories',
    method: 'GET',
    path: '/api/v1/admin/recommendation-histories',
    headers: { Authorization: `Bearer ${adminToken}` },
    expectedStatus: 200
  });

  // Test 5.11: Admin Scheduler Config (GET & PUT)
  await testEndpoint({
    id: 'ADM-16',
    name: 'Admin Get Scheduler Config',
    method: 'GET',
    path: '/api/v1/admin/scheduler/config',
    headers: { Authorization: `Bearer ${adminToken}` },
    expectedStatus: 200
  });

  await testEndpoint({
    id: 'ADM-17',
    name: 'Admin Update Scheduler Config',
    method: 'PUT',
    path: '/api/v1/admin/scheduler/config',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      schedulerName: 'Pembaruan Data Pasar Kerja',
      frequency: 'Setiap Hari',
      executionTime: '02.00',
      timezone: 'Asia/Jakarta (WIB)',
      cronExpression: '0 0 2 * * *',
      isAutoEnabled: true
    },
    expectedStatus: 200
  });

  // Test 5.12: Admin Update Job Market Detail
  await testEndpoint({
    id: 'ADM-18',
    name: 'Admin Update Job Market Data (Software Engineer)',
    method: 'PUT',
    path: '/api/v1/admin/job-market/software-engineer',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      marketDemandScore: 92,
      vacancyCount: 350,
      trendStatus: 'Tren sangat meningkat',
      primaryLocation: 'Jakarta, Bandung dan Remote'
    },
    expectedStatus: 200
  });

  // --- 6. FRONTEND ROUTE ACCESSIBILITY (HTML RESPONSE) ---
  console.log('\n--- 6. Frontend Route Health (HTTP 200) ---');
  const pages = [
    { id: 'PAGE-01', path: '/', name: 'Homepage / Beranda' },
    { id: 'PAGE-02', path: '/login', name: 'Login Page' },
    { id: 'PAGE-03', path: '/register', name: 'Register Page' },
    { id: 'PAGE-04', path: '/akademik', name: 'Student Akademik' },
    { id: 'PAGE-05', path: '/riasec', name: 'Student RIASEC Kuesioner' },
    { id: 'PAGE-06', path: '/riasec/hasil', name: 'Student RIASEC Hasil' },
    { id: 'PAGE-07', path: '/rekomendasi', name: 'Student Rekomendasi SAW' },
    { id: 'PAGE-08', path: '/eksplorasi', name: 'Student Eksplorasi Karir' },
    { id: 'PAGE-09', path: '/profile', name: 'Student Profil' },
    { id: 'PAGE-10', path: '/admin', name: 'Admin Dashboard' },
    { id: 'PAGE-11', path: '/admin/alternatif', name: 'Admin Kelola Alternatif' },
    { id: 'PAGE-12', path: '/admin/konfigurasi', name: 'Admin Konfigurasi Bobot' },
    { id: 'PAGE-13', path: '/admin/pasar-kerja', name: 'Admin Pasar Kerja' },
    { id: 'PAGE-14', path: '/admin/mahasiswa', name: 'Admin Monitoring Mahasiswa' },
    { id: 'PAGE-15', path: '/admin/riwayat', name: 'Admin Riwayat Rekomendasi' },
    { id: 'PAGE-16', path: '/admin/scheduler', name: 'Admin Scheduler Log' },
  ];

  for (const p of pages) {
    await testEndpoint({
      id: p.id,
      name: p.name,
      method: 'GET',
      path: p.path,
      expectedStatus: 200
    });
  }

  // Summary
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  const failed = total - passed;
  const avgLatency = Math.round(testResults.reduce((acc, t) => acc + (t.duration || 0), 0) / total);

  console.log('\n====================================================');
  console.log(`END-TO-END TEST SUITE RESULTS:`);
  console.log(`Total Endpoints & Pages Tested : ${total}`);
  console.log(`Passed                         : ${passed}`);
  console.log(`Failed                         : ${failed}`);
  console.log(`Success Rate                   : ${((passed / total) * 100).toFixed(1)}%`);
  console.log(`Average Latency                : ${avgLatency}ms`);
  console.log('====================================================');

  return { total, passed, failed, avgLatency, results: testResults };
}

runApiTests();
