import { PrismaClient } from '@prisma/client';
import {
  INITIAL_USERS,
  INITIAL_ACADEMIC_SUBJECTS,
  INITIAL_STUDENT_GRADES,
  INITIAL_RIASEC_QUESTIONS,
  INITIAL_RIASEC_RESULT,
  INITIAL_CAREERS,
  INITIAL_SAW_CONFIG,
  INITIAL_RECOMMENDATION_HISTORIES,
  INITIAL_SCHEDULER_LOGS
} from '../data/initialData.js';

// Global singleton PrismaClient instance
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// In-Memory store for development / fallback when PostgreSQL is not connected
const inMemoryStore = {
  users: JSON.parse(JSON.stringify(INITIAL_USERS)),
  academicSubjects: JSON.parse(JSON.stringify(INITIAL_ACADEMIC_SUBJECTS)),
  studentGrades: JSON.parse(JSON.stringify(INITIAL_STUDENT_GRADES)),
  riasecQuestions: JSON.parse(JSON.stringify(INITIAL_RIASEC_QUESTIONS)),
  riasecResults: [JSON.parse(JSON.stringify(INITIAL_RIASEC_RESULT))],
  careers: JSON.parse(JSON.stringify(INITIAL_CAREERS)),
  sawConfig: JSON.parse(JSON.stringify(INITIAL_SAW_CONFIG)),
  recommendationHistories: JSON.parse(JSON.stringify(INITIAL_RECOMMENDATION_HISTORIES)),
  schedulerLogs: JSON.parse(JSON.stringify(INITIAL_SCHEDULER_LOGS))
};

export const dbRepository = {
  // --- USERS & AUTH ---
  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    const emailsToTry = [cleanEmail];
    if (cleanEmail === 'admin@careerpath.id') emailsToTry.push('admin@careerpath.ac.id');
    if (cleanEmail === 'admin@careerpath.ac.id') emailsToTry.push('admin@careerpath.id');

    for (const em of emailsToTry) {
      try {
        const user = await prisma.user.findFirst({
          where: { email: { equals: em, mode: 'insensitive' } },
          include: { student: true }
        });
        if (user) return user;
      } catch {
        // Fallback to in-memory
      }
      const inMem = inMemoryStore.users.find(u => u.email.toLowerCase() === em.toLowerCase());
      if (inMem) return inMem;
    }
    return null;
  },

  async findUserById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { student: true }
      });
      if (user) return user;
    } catch {
      // Fallback
    }
    return inMemoryStore.users.find(u => u.id === id) || null;
  },

  async createUser({ email, passwordHash, role = 'STUDENT', studentData = null }) {
    const cleanEmail = email.toLowerCase().trim();

    try {
      const created = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role,
          student: studentData ? {
            create: {
              nim: studentData.nim,
              fullName: studentData.fullName,
              university: studentData.university || "Universitas Esa Unggul",
              studyProgram: studentData.studyProgram || "Teknologi Informasi",
              semester: studentData.semester || "Semester 7",
              domicile: studentData.domicile || "Jakarta, Indonesia"
            }
          } : undefined
        },
        include: { student: true }
      });

      if (created) {
        inMemoryStore.users.push(created);
        return created;
      }
    } catch (err) {
      console.error('[dbRepository.createUser Error]:', err.message);
      // Fallback to in-memory
    }

    const userId = `usr-${Date.now()}`;
    const newUser = {
      id: userId,
      email: cleanEmail,
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      student: studentData ? {
        id: `std-${Date.now()}`,
        userId,
        nim: studentData.nim,
        fullName: studentData.fullName,
        university: studentData.university || "Universitas Esa Unggul",
        studyProgram: studentData.studyProgram || "Teknologi Informasi",
        semester: studentData.semester || "Semester 7",
        domicile: studentData.domicile || "Jakarta, Indonesia",
        avatarUrl: null
      } : null
    };

    inMemoryStore.users.push(newUser);
    return newUser;
  },

  async updateStudentProfile(userId, updateData) {
    const user = inMemoryStore.users.find(u => u.id === userId);
    if (user && user.student) {
      Object.assign(user.student, updateData);
    }

    try {
      await prisma.student.update({
        where: { userId },
        data: updateData
      });
    } catch {
      // Fallback
    }

    return user;
  },

  // --- ACADEMIC ---
  async getAcademicSubjects() {
    try {
      const subjects = await prisma.academicSubject.findMany({ orderBy: { id: 'asc' } });
      if (subjects && subjects.length > 0) return subjects;
    } catch {
      // Fallback
    }
    return inMemoryStore.academicSubjects;
  },

  async getStudentGrades(studentId) {
    try {
      const grades = await prisma.academicGrade.findMany({
        where: { studentId },
        include: { subject: true },
        orderBy: { subjectId: 'asc' }
      });
      if (grades && grades.length > 0) {
        return grades.map(g => ({
          id: g.id,
          subjectId: g.subjectId,
          name: g.subject?.name || '',
          desc: g.subject?.description || '',
          icon: g.subject?.icon || '⌘',
          grade: g.grade,
          status: g.status,
          semester: g.semester,
          academicYear: g.academicYear,
          updated: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(g.updatedAt)),
          subject: g.subject
        }));
      }

      // If no grades found in DB for this student, initialize from master subjects
      const subjects = await prisma.academicSubject.findMany({ orderBy: { id: 'asc' } });
      if (subjects && subjects.length > 0) {
        return subjects.map(s => ({
          id: `init-${s.id}`,
          subjectId: s.id,
          name: s.name,
          desc: s.description,
          icon: s.icon || '⌘',
          grade: 0,
          status: 'Cukup',
          semester: 'Semester 7',
          academicYear: '2025/2026',
          updated: 'Belum diisi',
          subject: s
        }));
      }
    } catch {
      // Fallback
    }

    const subjects = inMemoryStore.academicSubjects;
    return inMemoryStore.studentGrades
      .filter(g => g.studentId === studentId)
      .map(g => {
        const subject = subjects.find(s => s.id === g.subjectId);
        return {
          id: g.id,
          subjectId: g.subjectId,
          name: subject?.name || '',
          desc: subject?.description || '',
          icon: subject?.icon || '⌘',
          grade: g.grade,
          status: g.status,
          semester: g.semester,
          academicYear: g.academicYear,
          updated: 'Tersimpan',
          subject
        };
      });
  },

  async updateStudentGrades(studentId, gradesArray) {
    // Resolve subjectId if needed
    const subjects = await this.getAcademicSubjects();
    const resolvedGrades = gradesArray.map(item => {
      let subjectId = item.subjectId;
      if (!subjectId) {
        const found = subjects.find(s => s.name === item.name || s.name === item.subjectName);
        if (found) subjectId = found.id;
      }
      return {
        subjectId: subjectId || 1,
        grade: Number(item.grade),
        semester: item.semester || 'Semester 7',
        academicYear: item.academicYear || '2025/2026'
      };
    });

    resolvedGrades.forEach(item => {
      const existing = inMemoryStore.studentGrades.find(
        g => g.studentId === studentId && g.subjectId === item.subjectId
      );
      if (existing) {
        existing.grade = Number(item.grade);
        existing.status = item.grade >= 85 ? 'Sangat Baik' : item.grade >= 75 ? 'Baik' : 'Cukup';
        existing.updatedAt = new Date().toISOString();
      } else {
        inMemoryStore.studentGrades.push({
          id: `grd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          subjectId: item.subjectId,
          grade: Number(item.grade),
          status: item.grade >= 85 ? 'Sangat Baik' : item.grade >= 75 ? 'Baik' : 'Cukup',
          semester: item.semester,
          academicYear: item.academicYear,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    try {
      for (const item of resolvedGrades) {
        await prisma.academicGrade.upsert({
          where: {
            studentId_subjectId: {
              studentId,
              subjectId: item.subjectId
            }
          },
          update: {
            grade: Number(item.grade),
            status: item.grade >= 85 ? 'Sangat Baik' : item.grade >= 75 ? 'Baik' : 'Cukup'
          },
          create: {
            studentId,
            subjectId: item.subjectId,
            grade: Number(item.grade),
            status: item.grade >= 85 ? 'Sangat Baik' : item.grade >= 75 ? 'Baik' : 'Cukup',
            semester: item.semester,
            academicYear: item.academicYear
          }
        });
      }
    } catch {
      // Fallback
    }

    return this.getStudentGrades(studentId);
  },

  // --- RIASEC ---
  async getRiasecQuestions() {
    try {
      const q = await prisma.riasecQuestion.findMany({ where: { isActive: true }, orderBy: { id: 'asc' } });
      if (q && q.length > 0) return q;
    } catch {
      // Fallback
    }
    return inMemoryStore.riasecQuestions;
  },

  async getRiasecResult(studentId) {
    try {
      const res = await prisma.riasecResult.findUnique({ where: { studentId } });
      if (res) return res;
    } catch {
      // Fallback
    }
    return inMemoryStore.riasecResults.find(r => r.studentId === studentId) || null;
  },

  async saveRiasecResult(studentId, { scores, topHolland, answersJson }) {
    const resultObj = {
      id: `res-${Date.now()}`,
      studentId,
      scoreR: scores.R,
      scoreI: scores.I,
      scoreA: scores.A,
      scoreS: scores.S,
      scoreE: scores.E,
      scoreC: scores.C,
      topHolland,
      answersJson,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingIdx = inMemoryStore.riasecResults.findIndex(r => r.studentId === studentId);
    if (existingIdx >= 0) {
      inMemoryStore.riasecResults[existingIdx] = resultObj;
    } else {
      inMemoryStore.riasecResults.push(resultObj);
    }

    try {
      await prisma.riasecResult.upsert({
        where: { studentId },
        update: {
          scoreR: scores.R,
          scoreI: scores.I,
          scoreA: scores.A,
          scoreS: scores.S,
          scoreE: scores.E,
          scoreC: scores.C,
          topHolland,
          answersJson
        },
        create: {
          studentId,
          scoreR: scores.R,
          scoreI: scores.I,
          scoreA: scores.A,
          scoreS: scores.S,
          scoreE: scores.E,
          scoreC: scores.C,
          topHolland,
          answersJson
        }
      });
    } catch {
      // Fallback
    }

    return resultObj;
  },

  // --- CAREERS ---
  async getCareers() {
    try {
      const careers = await prisma.career.findMany({
        where: { isActive: true },
        include: {
          marketDetail: true,
          riasecWeights: true,
          academicWeights: { include: { subject: true } }
        }
      });
      if (careers && careers.length > 0) return careers;
    } catch {
      // Fallback
    }
    return inMemoryStore.careers;
  },

  async getCareerById(id) {
    const careers = await this.getCareers();
    return careers.find(c => c.id === id || c.slug === id) || null;
  },

  async updateCareer(id, updateData) {
    const career = inMemoryStore.careers.find(c => c.id === id || c.slug === id);
    if (career) {
      Object.assign(career, updateData);
    }

    try {
      await prisma.career.update({
        where: { id },
        data: updateData
      });
    } catch {
      // Fallback
    }

    return career;
  },

  async updateJobMarket(careerId, { marketDemandScore, vacancyCount, trendStatus, primaryLocation, requiredSkills, shortNote }) {
    const career = inMemoryStore.careers.find(c => c.id === careerId || c.slug === careerId);
    if (career) {
      if (marketDemandScore !== undefined) career.marketDemandScore = Number(marketDemandScore);
      if (career.marketDetail) {
        if (vacancyCount !== undefined) career.marketDetail.vacancyCount = Number(vacancyCount);
        if (trendStatus !== undefined) career.marketDetail.trendStatus = trendStatus;
        if (primaryLocation !== undefined) career.marketDetail.primaryLocation = primaryLocation;
        if (requiredSkills !== undefined) career.marketDetail.requiredSkills = requiredSkills;
        if (shortNote !== undefined) career.marketDetail.shortNote = shortNote;
      }
    }

    try {
      const foundCareer = await prisma.career.findFirst({
        where: { OR: [{ id: careerId }, { slug: careerId }] },
        include: { marketDetail: true }
      });
      if (foundCareer) {
        if (marketDemandScore !== undefined) {
          await prisma.career.update({
            where: { id: foundCareer.id },
            data: { marketDemandScore: Number(marketDemandScore) }
          });
        }
        await prisma.jobMarketDetail.upsert({
          where: { careerId: foundCareer.id },
          update: {
            ...(vacancyCount !== undefined ? { vacancyCount: Number(vacancyCount) } : {}),
            ...(trendStatus !== undefined ? { trendStatus } : {}),
            ...(primaryLocation !== undefined ? { primaryLocation } : {}),
            ...(requiredSkills !== undefined ? { requiredSkills } : {}),
            ...(shortNote !== undefined ? { shortNote } : {})
          },
          create: {
            careerId: foundCareer.id,
            vacancyCount: vacancyCount ? Number(vacancyCount) : 0,
            trendStatus: trendStatus || 'Tren meningkat',
            primaryLocation: primaryLocation || 'Jakarta, Bandung, dan Remote',
            requiredSkills: requiredSkills || [],
            shortNote: shortNote || ''
          }
        });
        return await prisma.career.findUnique({
          where: { id: foundCareer.id },
          include: { marketDetail: true, riasecWeights: true, academicWeights: true }
        });
      }
    } catch {
      // Fallback to in-memory career
    }

    return career;
  },

  // --- SAW CONFIG ---
  async getSawConfig() {
    try {
      const cfg = await prisma.sawConfig.findFirst({ where: { isActive: true } });
      if (cfg) return cfg;
    } catch {
      // Fallback
    }
    return inMemoryStore.sawConfig;
  },

  async updateSawConfig({ c1Weight, c2Weight, c3Weight, updatedBy = 'Admin' }) {
    inMemoryStore.sawConfig = {
      id: 1,
      c1Weight: Number(c1Weight),
      c2Weight: Number(c2Weight),
      c3Weight: Number(c3Weight),
      isActive: true,
      updatedBy,
      updatedAt: new Date().toISOString()
    };

    try {
      await prisma.sawConfig.upsert({
        where: { id: 1 },
        update: inMemoryStore.sawConfig,
        create: inMemoryStore.sawConfig
      });
    } catch {
      // Fallback
    }

    return inMemoryStore.sawConfig;
  },

  // --- RECOMMENDATION HISTORIES ---
  async getRecommendationHistories(userId) {
    try {
      const list = await prisma.recommendationHistory.findMany({
        where: userId ? { userId } : undefined,
        orderBy: { calculatedAt: 'desc' }
      });
      if (list && list.length > 0) return list;
    } catch {
      // Fallback
    }

    if (userId) {
      return inMemoryStore.recommendationHistories.filter(h => h.userId === userId);
    }
    return inMemoryStore.recommendationHistories;
  },

  async createRecommendationHistory({ userId, hollandCode, topCareerName, highestScore, status = 'Valid', fullResult }) {
    const record = {
      id: `hist-${Date.now()}`,
      userId,
      hollandCode,
      topCareerName,
      highestScore,
      status,
      fullResult,
      calculatedAt: new Date().toISOString()
    };

    inMemoryStore.recommendationHistories.unshift(record);

    try {
      await prisma.recommendationHistory.create({
        data: record
      });
    } catch {
      // Fallback
    }

    return record;
  },

  // --- SCHEDULER LOGS ---
  async getSchedulerLogs() {
    try {
      const logs = await prisma.schedulerLog.findMany({ orderBy: { startedAt: 'desc' }, take: 20 });
      if (logs && logs.length > 0) {
        return logs.map(l => {
          const inMem = inMemoryStore.schedulerLogs.find(
            m => m.id === l.id || (m.startedAt && new Date(m.startedAt).getTime() === new Date(l.startedAt).getTime())
          );
          return {
            ...l,
            careerSyncDetails: inMem?.careerSyncDetails || null
          };
        });
      }
    } catch {
      // Fallback
    }
    return inMemoryStore.schedulerLogs;
  },

  async createSchedulerLog(logData) {
    const newLog = {
      id: inMemoryStore.schedulerLogs.length + 1,
      ...logData,
      startedAt: logData.startedAt || new Date().toISOString(),
      finishedAt: logData.finishedAt || new Date().toISOString()
    };
    inMemoryStore.schedulerLogs.unshift(newLog);

    try {
      const { careerSyncDetails, ...prismaLogData } = logData;
      await prisma.schedulerLog.create({
        data: prismaLogData
      });
    } catch {
      // Fallback
    }

    return newLog;
  },

  // --- STUDENTS (ADMIN) ---
  async getAllStudents() {
    try {
      const students = await prisma.student.findMany({
        include: {
          user: { select: { email: true, role: true } },
          grades: true,
          riasecResult: true
        },
        orderBy: { nim: 'asc' }
      });
      if (students && students.length > 0) {
        return students.map(s => {
          const hasGrades = s.grades && s.grades.length >= 5;
          const hasRiasec = Boolean(s.riasecResult);
          return {
            id: s.id,
            nim: s.nim,
            name: s.fullName,
            email: s.user?.email || '',
            studyProgram: s.studyProgram || 'Teknologi Informasi',
            semester: s.semester || 'Semester 7',
            status: hasGrades && hasRiasec ? 'Lengkap' : 'Proses'
          };
        });
      }
    } catch {
      // Fallback
    }

    return inMemoryStore.users
      .filter(u => u.student)
      .map(u => ({
        id: u.student.id,
        nim: u.student.nim,
        name: u.student.fullName,
        email: u.email,
        studyProgram: u.student.studyProgram,
        semester: u.student.semester,
        status: 'Lengkap'
      }));
  },

  async createStudent({ fullName, email, nim, studyProgram, semester, domicile, password = 'PasswordRahasia123!' }) {
    const userId = `usr-std-${Date.now()}`;
    const studentId = `std-${Date.now()}`;
    const cleanEmail = email.toLowerCase().trim();

    try {
      const bcrypt = (await import('bcryptjs')).default;
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          id: userId,
          email: cleanEmail,
          passwordHash,
          role: 'STUDENT',
          student: {
            create: {
              id: studentId,
              nim,
              fullName,
              studyProgram: studyProgram || 'Teknologi Informasi',
              semester: semester || 'Semester 7',
              domicile: domicile || 'Jakarta, Indonesia'
            }
          }
        },
        include: { student: true }
      });

      return {
        id: user.student.id,
        nim: user.student.nim,
        name: user.student.fullName,
        email: user.email,
        studyProgram: user.student.studyProgram,
        semester: user.student.semester,
        status: 'Proses'
      };
    } catch (e) {
      console.warn('Prisma createStudent fallback:', e.message);
    }

    const mock = {
      id: studentId,
      nim,
      name: fullName,
      email: cleanEmail,
      studyProgram: studyProgram || 'Teknologi Informasi',
      semester: semester || 'Semester 7',
      status: 'Proses'
    };
    return mock;
  },

  async updateStudent(id, { fullName, nim, studyProgram, semester, domicile, email }) {
    try {
      const student = await prisma.student.update({
        where: { id },
        data: {
          fullName,
          nim,
          studyProgram,
          semester,
          domicile,
          user: email ? { update: { email: email.toLowerCase().trim() } } : undefined
        },
        include: { user: true }
      });
      return {
        id: student.id,
        nim: student.nim,
        name: student.fullName,
        email: student.user?.email,
        studyProgram: student.studyProgram,
        semester: student.semester
      };
    } catch (e) {
      console.warn('Prisma updateStudent fallback:', e.message);
    }
    return { id, name: fullName, nim, studyProgram, semester };
  },

  async deleteStudent(id) {
    try {
      const student = await prisma.student.findUnique({
        where: { id },
        select: { userId: true }
      });
      if (student) {
        await prisma.user.delete({
          where: { id: student.userId }
        });
      }
      return true;
    } catch (e) {
      console.warn('Prisma deleteStudent fallback:', e.message);
    }
    return true;
  },

  async deleteCareer(id) {
    const idx = inMemoryStore.careers.findIndex(c => c.id === id || c.slug === id);
    let deleted = null;
    if (idx !== -1) {
      deleted = inMemoryStore.careers.splice(idx, 1)[0];
    }
    try {
      await prisma.career.delete({
        where: { id }
      });
    } catch {
      try {
        await prisma.career.delete({
          where: { slug: id }
        });
      } catch {
        // Fallback
      }
    }
    return deleted || true;
  },

  async createCareer(data) {
    const id = data.id || `car-${Date.now()}`;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCareer = {
      id,
      slug,
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description || '',
      icon: data.icon || '⌘',
      marketDemandScore: Number(data.marketDemandScore) || 80,
      marketDetail: data.marketDetail || {
        vacancyCount: 100,
        trendStatus: 'Tren meningkat',
        primaryLocation: 'Jakarta & Remote',
        requiredSkills: []
      },
      riasecWeights: data.riasecWeights || [],
      academicWeights: data.academicWeights || []
    };

    inMemoryStore.careers.push(newCareer);

    try {
      const created = await prisma.career.create({
        data: {
          id,
          slug,
          title: newCareer.title,
          subtitle: newCareer.subtitle,
          description: newCareer.description,
          icon: newCareer.icon,
          marketDemandScore: newCareer.marketDemandScore,
          marketDetail: {
            create: {
              vacancyCount: newCareer.marketDetail.vacancyCount || 100,
              trendStatus: newCareer.marketDetail.trendStatus || 'Tren meningkat',
              primaryLocation: newCareer.marketDetail.primaryLocation || 'Jakarta & Remote',
              requiredSkills: newCareer.marketDetail.requiredSkills || [],
              shortNote: newCareer.marketDetail.shortNote || ''
            }
          }
        },
        include: {
          marketDetail: true,
          riasecWeights: true,
          academicWeights: true
        }
      });
      return created;
    } catch (e) {
      console.warn('Prisma createCareer fallback:', e.message);
    }
    return newCareer;
  },

  async getAllSubjects() {
    try {
      const list = await prisma.academicSubject.findMany({ orderBy: { id: 'asc' } });
      if (list && list.length > 0) return list;
    } catch {
      // Fallback
    }
    return inMemoryStore.academicSubjects;
  },

  async createSubject({ name, description, icon = '⌘' }) {
    try {
      const subj = await prisma.academicSubject.create({
        data: { name, description, icon }
      });
      return subj;
    } catch (e) {
      console.warn('Prisma createSubject fallback:', e.message);
      const fallback = { id: Date.now(), name, description, icon };
      inMemoryStore.academicSubjects.push(fallback);
      return fallback;
    }
  },

  async updateSubject(id, { name, description, icon }) {
    const numId = Number(id);
    try {
      const subj = await prisma.academicSubject.update({
        where: { id: numId },
        data: { name, description, icon }
      });
      return subj;
    } catch (e) {
      console.warn('Prisma updateSubject fallback:', e.message);
      const item = inMemoryStore.academicSubjects.find(s => s.id === numId);
      if (item) Object.assign(item, { name, description, icon });
      return item;
    }
  },

  async deleteSubject(id) {
    const numId = Number(id);
    try {
      await prisma.academicSubject.delete({
        where: { id: numId }
      });
      return true;
    } catch (e) {
      console.warn('Prisma deleteSubject fallback:', e.message);
      const idx = inMemoryStore.academicSubjects.findIndex(s => s.id === numId);
      if (idx !== -1) inMemoryStore.academicSubjects.splice(idx, 1);
      return true;
    }
  },

  async createRiasecQuestion({ type, question }) {
    try {
      const q = await prisma.riasecQuestion.create({
        data: { type, question }
      });
      return q;
    } catch (e) {
      console.warn('Prisma createRiasecQuestion fallback:', e.message);
      const fallback = { id: Date.now(), type, question, text: question };
      inMemoryStore.riasecQuestions.push(fallback);
      return fallback;
    }
  },

  async updateRiasecQuestion(id, { type, question }) {
    const numId = Number(id);
    try {
      const q = await prisma.riasecQuestion.update({
        where: { id: numId },
        data: { type, question }
      });
      return q;
    } catch (e) {
      console.warn('Prisma updateRiasecQuestion fallback:', e.message);
      const item = inMemoryStore.riasecQuestions.find(q => q.id === numId);
      if (item) Object.assign(item, { type, question, text: question });
      return item;
    }
  },

  async deleteRiasecQuestion(id) {
    const numId = Number(id);
    try {
      await prisma.riasecQuestion.delete({
        where: { id: numId }
      });
      return true;
    } catch (e) {
      console.warn('Prisma deleteRiasecQuestion fallback:', e.message);
      const idx = inMemoryStore.riasecQuestions.findIndex(q => q.id === numId);
      if (idx !== -1) inMemoryStore.riasecQuestions.splice(idx, 1);
      return true;
    }
  },

  async getAllRecommendationHistories() {
    try {
      const list = await prisma.recommendationHistory.findMany({
        include: {
          user: {
            include: { student: true }
          }
        },
        orderBy: { calculatedAt: 'desc' }
      });

      if (list && list.length > 0) {
        return list.map(item => ({
          id: item.id,
          nim: item.user?.student?.nim || 'N/A',
          name: item.user?.student?.fullName || item.user?.email || 'Mahasiswa',
          email: item.user?.email,
          code: item.hollandCode,
          career: item.topCareerName,
          score: String(item.highestScore),
          status: item.status,
          date: new Date(item.calculatedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          fullResult: item.fullResult,
          calculatedAt: item.calculatedAt
        }));
      }
    } catch (e) {
      console.warn('Prisma getAllRecommendationHistories fallback:', e.message);
    }
    return inMemoryStore.recommendationHistories;
  },

  async deleteRecommendationHistory(id) {
    try {
      await prisma.recommendationHistory.delete({
        where: { id }
      });
      return true;
    } catch (e) {
      console.warn('Prisma deleteRecommendationHistory fallback:', e.message);
      const idx = inMemoryStore.recommendationHistories.findIndex(h => h.id === id);
      if (idx !== -1) inMemoryStore.recommendationHistories.splice(idx, 1);
      return true;
    }
  },

  async getDashboardStats() {
    try {
      const [studentCount, careerCount, historyCount, sawConfig, schedulerLogs, recentHistories, recentStudents] = await Promise.all([
        prisma.student.count(),
        prisma.career.count(),
        prisma.recommendationHistory.count(),
        prisma.sawConfig.findFirst({ where: { isActive: true } }),
        prisma.schedulerLog.findMany({ orderBy: { startedAt: 'desc' }, take: 10 }),
        prisma.recommendationHistory.findMany({
          take: 5,
          orderBy: { calculatedAt: 'desc' },
          include: { user: { include: { student: true } } }
        }),
        prisma.student.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: true, grades: true, riasecResult: true }
        })
      ]);

      const formattedHistories = recentHistories.map(h => ({
        id: h.id,
        nim: h.user?.student?.nim || 'N/A',
        name: h.user?.student?.fullName || h.user?.email || 'Mahasiswa',
        career: h.topCareerName,
        code: h.hollandCode,
        score: String(h.highestScore),
        status: h.status,
        date: new Date(h.calculatedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }));

      const formattedStudents = recentStudents.map(s => ({
        id: s.id,
        nim: s.nim,
        name: s.fullName,
        email: s.user?.email,
        studyProgram: s.studyProgram,
        semester: s.semester,
        status: (s.grades?.length >= 5 && s.riasecResult) ? 'Lengkap' : 'Proses'
      }));

      return {
        studentCount,
        careerCount,
        historyCount,
        sawWeights: {
          c1: sawConfig?.c1Weight || 40,
          c2: sawConfig?.c2Weight || 35,
          c3: sawConfig?.c3Weight || 25
        },
        activeSchedulers: 2,
        recentHistories: formattedHistories,
        recentStudents: formattedStudents,
        schedulerLogs: schedulerLogs || []
      };
    } catch (e) {
      console.warn('Prisma getDashboardStats fallback:', e.message);
      return {
        studentCount: 8,
        careerCount: 9,
        historyCount: inMemoryStore.recommendationHistories.length,
        sawWeights: { c1: 40, c2: 35, c3: 25 },
        activeSchedulers: 2,
        recentHistories: inMemoryStore.recommendationHistories.slice(0, 5),
        recentStudents: inMemoryStore.users.filter(u => u.student).map(u => ({
          id: u.student.id,
          nim: u.student.nim,
          name: u.student.fullName,
          email: u.email,
          status: 'Lengkap'
        })),
        schedulerLogs: inMemoryStore.schedulerLogs
      };
    }
  }
};
