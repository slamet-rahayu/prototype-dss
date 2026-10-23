"use client";

import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import Card from '@/components/Card';
import { Skeleton, TableSkeleton } from '@/components/Skeleton';
import { 
  Check, 
  Settings, 
  BookOpen, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Info,
  Sliders,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const TYPE_INFO = {
  R: { name: "Realistic", description: "Aktivitas praktis, mekanis, teknis, dan infrastruktur sistem." },
  I: { name: "Investigative", description: "Analisis logis, pemecahan masalah kompleks, dan riset data." },
  A: { name: "Artistic", description: "Perancangan visual, pengalaman pengguna (UX), dan kreativitas antarmuka." },
  S: { name: "Social", description: "Kolaborasi tim, komunikasi klien, dan pendampingan pengguna." },
  E: { name: "Enterprising", description: "Kepemimpinan produk, manajemen proyek, dan negosiasi strategi bisnis." },
  C: { name: "Conventional", description: "Tata kelola data terstruktur, audit sistem, dan dokumentasi prosedur." }
};

export default function SawConfig() {
  const { 
    sawWeights, setSawWeights, 
    academicComponents, setAcademicComponents,
    careers, setCareers,
    riasecQuestions, setRiasecQuestions
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('criteria');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingWeights, setIsSavingWeights] = useState(false);
  const [isSavingMapping, setIsSavingMapping] = useState(false);
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Initial fetch from backend APIs
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([
      apiRequest('/admin/saw-config').catch(() => null),
      apiRequest('/admin/academic-subjects').catch(() => null),
      apiRequest('/admin/riasec-questions').catch(() => null),
      apiRequest('/careers').catch(() => null)
    ])
      .then(([sawRes, subRes, qRes, carRes]) => {
        if (!active) return;
        if (sawRes?.data) {
          const cfg = sawRes.data;
          const newW = { c1: cfg.c1Weight || 40, c2: cfg.c2Weight || 35, c3: cfg.c3Weight || 25 };
          setSawWeights(newW);
          setC1W(newW.c1);
          setC2W(newW.c2);
          setC3W(newW.c3);
        }
        if (subRes?.data && Array.isArray(subRes.data)) {
          setAcademicComponents(subRes.data.map(s => ({
            id: s.id,
            name: s.name,
            desc: s.description || '',
            icon: s.icon || '⌘'
          })));
        }
        if (qRes?.data && Array.isArray(qRes.data)) {
          setRiasecQuestions(qRes.data.map(q => ({
            id: q.id,
            type: q.type || q.dimension?.[0] || 'R',
            text: q.question || q.questionText || '',
            question: q.question || q.questionText || ''
          })));
        }
        if (carRes?.data && Array.isArray(carRes.data)) {
          const map = {};
          carRes.data.forEach(c => {
            map[c.title] = {
              id: c.id,
              slug: c.slug,
              icon: c.icon || '⌘',
              subtitle: c.subtitle || '',
              description: c.description || '',
              jobMarketKeyword: c.jobMarketKeyword || c.marketDetail?.jobMarketKeyword || c.title,
              marketDemandScore: c.marketDemandScore || 80,
              marketDemand: {
                title: `Gambaran kebutuhan pasar kerja untuk ${c.title}.`,
                vacancy: String(c.marketDetail?.vacancyCount || '100'),
                trend: c.marketDetail?.trendStatus || 'Tren meningkat',
                short: (c.marketDetail?.primaryLocation || 'Jakarta').split(',')[0],
                shortNote: c.marketDetail?.shortNote || 'dan peluang remote',
                location: c.marketDetail?.primaryLocation || 'Jakarta',
                skills: c.marketDetail?.requiredSkills || ['Java', 'SQL', 'Git'],
                note: `Data pasar kerja untuk ${c.title}.`
              },
              riasecMapped: (c.riasecWeights || []).filter(w => (Number(w.weight) || 0) > 0).map(w => w.dimension),
              riasecWeights: (c.riasecWeights || []).reduce((acc, w) => { acc[w.dimension] = Number(w.weight) || 0; return acc; }, {}),
              academicWeights: (c.academicWeights || []).reduce((acc, w) => {
                const subName = w.subjectName || w.subject?.name || `Mata Kuliah ${w.subjectId}`;
                acc[subName] = Number(w.weight) || 0;
                return acc;
              }, {})
            };
          });
          setCareers(map);

          const careerNames = Object.keys(map);
          const firstTitle = careerNames[0];
          if (firstTitle) {
            setSelectedMappingCareer(prev => (prev && map[prev] ? prev : firstTitle));
            const targetMap = selectedMappingCareer && map[selectedMappingCareer] ? map[selectedMappingCareer] : map[firstTitle];
            if (targetMap?.riasecWeights) {
              setRiasecWeightsState({ ...targetMap.riasecWeights });
            }

            setSelectedAcademicCareer(prev => (prev && map[prev] ? prev : firstTitle));
            const targetAcad = selectedAcademicCareer && map[selectedAcademicCareer] ? map[selectedAcademicCareer] : map[firstTitle];
            if (targetAcad?.academicWeights) {
              setAcademicWeightsMap({ ...targetAcad.academicWeights });
            }
          }
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [setSawWeights, setAcademicComponents, setRiasecQuestions, setCareers]);

  // Tab 1: Criteria weights state
  const [c1W, setC1W] = useState(sawWeights.c1);
  const [c2W, setC2W] = useState(sawWeights.c2);
  const [c3W, setC3W] = useState(sawWeights.c3);

  // Tab 2: Academic component states
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compEditId, setCompEditId] = useState(null);
  const [compName, setCompName] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compIcon, setCompIcon] = useState('⌘');

  // Tab 3: RIASEC mapping state
  const [selectedMappingCareer, setSelectedMappingCareer] = useState(Object.keys(careers)[0] || '');
  const [riasecWeightsState, setRiasecWeightsState] = useState({
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
  });

  // Tab 4: Academic weights per career state
  const [selectedAcademicCareer, setSelectedAcademicCareer] = useState(Object.keys(careers)[0] || '');
  const [academicWeightsMap, setAcademicWeightsMap] = useState({});
  const [componentToAdd, setComponentToAdd] = useState('');

  // Tab 5: RIASEC Questions CRUD state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionEditId, setQuestionEditId] = useState(null);
  const [questionType, setQuestionType] = useState('R');
  const [questionText, setQuestionText] = useState('');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState('ALL');
  const [questionCurrentPage, setQuestionCurrentPage] = useState(1);
  const [compErrors, setCompErrors] = useState({});
  const [questionErrors, setQuestionErrors] = useState({});
  const [weightErrors, setWeightErrors] = useState({});

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  // Switch tab effects
  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'riasec') {
      const target = selectedMappingCareer || Object.keys(careers)[0];
      if (target) handleLoadMapping(target);
    }
    if (tab === 'academic') {
      const target = selectedAcademicCareer || Object.keys(careers)[0];
      if (target) handleLoadAcademicWeights(target);
    }
  };

  // --- Tab 1: Save & Reset weights ---
  const criteriaTotal = Number(c1W) + Number(c2W) + Number(c3W);

  // --- Tab 3: RIASEC weights total ---
  const riasecWeightsTotal = Object.values(riasecWeightsState).reduce((sum, w) => sum + Number(w || 0), 0);

  const handleSaveWeights = async () => {
    const errs = {};
    const c1Num = Number(c1W);
    const c2Num = Number(c2W);
    const c3Num = Number(c3W);

    if (isNaN(c1Num) || c1Num < 0 || c1Num > 100) errs.c1 = "Bobot C1 harus berada di antara 0 - 100%.";
    if (isNaN(c2Num) || c2Num < 0 || c2Num > 100) errs.c2 = "Bobot C2 harus berada di antara 0 - 100%.";
    if (isNaN(c3Num) || c3Num < 0 || c3Num > 100) errs.c3 = "Bobot C3 harus berada di antara 0 - 100%.";

    if (Object.keys(errs).length > 0) {
      setWeightErrors(errs);
      triggerToast("Harap periksa isian persentase bobot kriteria.");
      return;
    }

    if (criteriaTotal !== 100) {
      setWeightErrors({ total: "Total bobot kriteria harus bernilai 100%." });
      triggerToast("Total bobot kriteria harus bernilai 100%.");
      return;
    }

    setWeightErrors({});
    setIsSavingWeights(true);
    try {
      const res = await apiRequest('/admin/saw-config', {
        method: 'PUT',
        body: {
          c1Weight: c1Num,
          c2Weight: c2Num,
          c3Weight: c3Num
        }
      });
      const savedConfig = res?.data || { c1Weight: c1Num, c2Weight: c2Num, c3Weight: c3Num };
      setSawWeights({
        c1: savedConfig.c1Weight,
        c2: savedConfig.c2Weight,
        c3: savedConfig.c3Weight
      });
      setC1W(savedConfig.c1Weight);
      setC2W(savedConfig.c2Weight);
      setC3W(savedConfig.c3Weight);
      triggerToast("Bobot kriteria SAW berhasil disimpan ke basis data.");
    } catch (e) {
      console.error('API update saw-config error:', e);
      triggerToast(`Gagal menyimpan ke basis data: ${e.message}`);
    } finally {
      setIsSavingWeights(false);
    }
  };

  const handleResetWeights = async () => {
    if (window.confirm("Kembalikan bobot kriteria SAW ke konfigurasi default (C1: 40%, C2: 35%, C3: 25%)?")) {
      setIsSavingWeights(true);
      try {
        const res = await apiRequest('/admin/saw-config', {
          method: 'PUT',
          body: { c1Weight: 40, c2Weight: 35, c3Weight: 25 }
        });
        const savedConfig = res?.data || { c1Weight: 40, c2Weight: 35, c3Weight: 25 };
        setSawWeights({
          c1: savedConfig.c1Weight,
          c2: savedConfig.c2Weight,
          c3: savedConfig.c3Weight
        });
        setC1W(savedConfig.c1Weight);
        setC2W(savedConfig.c2Weight);
        setC3W(savedConfig.c3Weight);
        setWeightErrors({});
        triggerToast("Bobot kriteria SAW berhasil direset ke nilai default.");
      } catch (e) {
        console.error('API reset saw-config error:', e);
        triggerToast(`Gagal mereset bobot kriteria: ${e.message}`);
      } finally {
        setIsSavingWeights(false);
      }
    }
  };

  // --- Tab 2: Academic components CRUD ---
  const handleOpenCompAdd = () => {
    setCompEditId(null);
    setCompErrors({});
    setCompName('');
    setCompDesc('');
    setCompIcon('⌘');
    setIsCompModalOpen(true);
  };

  const handleEditComponent = (comp) => {
    setCompEditId(comp.id);
    setCompErrors({});
    setCompName(comp.name);
    setCompDesc(comp.desc);
    setCompIcon(comp.icon || '⌘');
    setIsCompModalOpen(true);
  };

  const handleDeleteComponent = async (id) => {
    if (window.confirm("Hapus komponen akademik ini dari basis data?")) {
      try {
        await apiRequest(`/admin/academic-subjects/${id}`, { method: 'DELETE' });
        const updated = academicComponents.filter(c => c.id !== id);
        setAcademicComponents(updated);
        triggerToast("Komponen akademik berhasil dihapus dari basis data.");
      } catch (e) {
        console.error('API delete subject error:', e);
        triggerToast(`Gagal menghapus komponen: ${e.message}`);
      }
    }
  };

  const handleCompSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const nameTrimmed = compName.trim();
    const descTrimmed = compDesc.trim();

    if (!nameTrimmed) {
      errs.compName = "Nama komponen akademik wajib diisi.";
    } else if (nameTrimmed.length < 3) {
      errs.compName = "Nama komponen minimal 3 karakter.";
    }

    if (!descTrimmed) {
      errs.compDesc = "Deskripsi komponen wajib diisi.";
    } else if (descTrimmed.length < 5) {
      errs.compDesc = "Deskripsi komponen minimal 5 karakter.";
    }

    if (compEditId === null) {
      const duplicate = (academicComponents || []).find(c => 
        String(c?.name || c?.subjectName || '').toLowerCase() === nameTrimmed.toLowerCase()
      );
      if (duplicate) {
        errs.compName = "Komponen mata kuliah ini sudah terdaftar.";
      }
    }

    if (Object.keys(errs).length > 0) {
      setCompErrors(errs);
      triggerToast("Harap periksa isian formulir komponen akademik.");
      return;
    }

    setCompErrors({});
    setIsSubmittingComp(true);

    if (compEditId !== null) {
      try {
        const res = await apiRequest(`/admin/academic-subjects/${compEditId}`, {
          method: 'PUT',
          body: { name: compName, description: compDesc, icon: compIcon }
        });
        const updatedData = res.data || { name: compName, description: compDesc, icon: compIcon };
        const updated = academicComponents.map(c => {
          if (c.id === compEditId) {
            return {
              ...c,
              name: updatedData.name || compName,
              desc: updatedData.description || compDesc,
              icon: updatedData.icon || compIcon
            };
          }
          return c;
        });
        setAcademicComponents(updated);
        triggerToast("Komponen akademik berhasil diperbarui di basis data.");
        setIsCompModalOpen(false);
      } catch (err) {
        console.error('API update subject error:', err);
        triggerToast(`Gagal memperbarui komponen: ${err.message}`);
      } finally {
        setIsSubmittingComp(false);
      }
    } else {
      try {
        const res = await apiRequest('/admin/academic-subjects', {
          method: 'POST',
          body: { name: compName, description: compDesc, icon: compIcon }
        });
        const created = res.data || {};
        const newComp = {
          id: created.id || Date.now(),
          name: created.name || compName,
          desc: created.description || compDesc,
          grade: 80,
          status: "Baik",
          updated: "Hari ini",
          icon: created.icon || compIcon
        };
        setAcademicComponents([...academicComponents, newComp]);
        triggerToast("Komponen akademik berhasil ditambahkan ke basis data.");
        setIsCompModalOpen(false);
      } catch (err) {
        console.error('API create subject error:', err);
        triggerToast(`Gagal menambahkan komponen: ${err.message}`);
      } finally {
        setIsSubmittingComp(false);
      }
    }
  };

  // --- Tab 3: RIASEC mapping ---
  const handleLoadMapping = (careerName, overrideMap = null) => {
    setSelectedMappingCareer(careerName);
    const source = overrideMap || careers;
    const careerData = source[careerName];
    const weights = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    if (careerData) {
      if (careerData.riasecWeights) {
        Object.entries(careerData.riasecWeights).forEach(([code, val]) => {
          weights[code] = Number(val) || 0;
        });
      } else if (careerData.riasecMapped) {
        const count = careerData.riasecMapped.length;
        const equalWeight = count > 0 ? Math.round(100 / count) : 0;
        careerData.riasecMapped.forEach(code => {
          weights[code] = equalWeight;
        });
      }
    }
    setRiasecWeightsState(weights);
  };

  const handleRiasecWeightChange = (code, val) => {
    const numeric = Math.max(0, Math.min(100, Number(val) || 0));
    setRiasecWeightsState(prev => ({
      ...prev,
      [code]: numeric
    }));
  };

  const handleSaveMapping = async () => {
    const activeCodes = Object.entries(riasecWeightsState)
      .filter(([_, w]) => Number(w) > 0)
      .map(([code]) => code);

    if (activeCodes.length === 0) {
      triggerToast("Masukkan bobot untuk setidaknya satu tipe RIASEC.");
      return;
    }

    const careerId = careers[selectedMappingCareer]?.id || careers[selectedMappingCareer]?.slug || selectedMappingCareer.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const riasecArray = Object.entries(riasecWeightsState).map(([dim, weight]) => ({
      dimension: dim,
      weight: Number(weight) || 0
    }));

    setIsSavingMapping(true);
    try {
      await apiRequest(`/admin/careers/${careerId}`, {
        method: 'PUT',
        body: {
          riasecWeights: riasecArray
        }
      });
      const updated = { ...careers };
      updated[selectedMappingCareer] = {
        ...updated[selectedMappingCareer],
        riasecMapped: activeCodes,
        riasecWeights: { ...riasecWeightsState }
      };
      setCareers(updated);
      triggerToast(`Pemetaan RIASEC untuk "${selectedMappingCareer}" berhasil disimpan ke basis data.`);
    } catch (e) {
      console.error('API update riasec weights error:', e);
      triggerToast(`Gagal menyimpan pemetaan RIASEC: ${e.message}`);
    } finally {
      setIsSavingMapping(false);
    }
  };

  // --- Tab 4: Academic weights per career ---
  const handleLoadAcademicWeights = (careerName, overrideMap = null) => {
    setSelectedAcademicCareer(careerName);
    const source = overrideMap || careers;
    const careerData = source[careerName];
    
    const weights = {};
    if (careerData && careerData.academicWeights) {
      Object.entries(careerData.academicWeights).forEach(([compName, compWeight]) => {
        weights[compName] = Number(compWeight) || 0;
      });
    }
    setAcademicWeightsMap(weights);
  };

  const handleWeightChange = (compName, value) => {
    setAcademicWeightsMap(prev => ({
      ...prev,
      [compName]: Math.max(0, Math.min(100, Number(value) || 0))
    }));
  };

  const academicWeightsTotal = Object.values(academicWeightsMap).reduce((a, b) => a + Number(b || 0), 0);

  const unlinkedComponents = useMemo(() => {
    return (academicComponents || []).filter(comp => comp && academicWeightsMap[comp.name || comp.subjectName] === undefined);
  }, [academicComponents, academicWeightsMap]);

  const handleSaveAcademicWeights = async () => {
    if (academicWeightsTotal !== 100) {
      triggerToast("Total bobot kualifikasi akademik harus bernilai tepat 100%.");
      return;
    }

    const careerId = careers[selectedAcademicCareer]?.id || careers[selectedAcademicCareer]?.slug || selectedAcademicCareer.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const academicArray = Object.entries(academicWeightsMap).map(([compName, weight]) => ({
      subjectName: compName,
      weight: Number(weight) || 0
    }));

    setIsSavingAcademic(true);
    try {
      await apiRequest(`/admin/careers/${careerId}`, {
        method: 'PUT',
        body: {
          academicWeights: academicArray
        }
      });
      const updated = { ...careers };
      updated[selectedAcademicCareer] = {
        ...updated[selectedAcademicCareer],
        academicWeights: { ...academicWeightsMap }
      };
      setCareers(updated);
      triggerToast(`Bobot kualifikasi akademik untuk "${selectedAcademicCareer}" berhasil disimpan ke basis data.`);
    } catch (e) {
      console.error('API update academic weights error:', e);
      triggerToast(`Gagal menyimpan bobot akademik: ${e.message}`);
    } finally {
      setIsSavingAcademic(false);
    }
  };

  // --- Tab 5: RIASEC Questions CRUD handlers ---
  const [isSyncingOnet, setIsSyncingOnet] = useState(false);

  const handleSyncOnetQuestions = async () => {
    setIsSyncingOnet(true);
    triggerToast("Menyinkronkan butir pertanyaan resmi dari O*NET Web Services...");
    try {
      const res = await apiRequest('/admin/riasec-questions/sync', { method: 'POST' });
      if (res?.data?.questions) {
        setRiasecQuestions(res.data.questions);
        try {
          localStorage.setItem('careerpath-riasec-questions', JSON.stringify(res.data.questions));
        } catch {}
        triggerToast("30 butir soal baku O*NET berhasil disinkronkan ke basis data lokal (Metode Hybrid).");
      }
    } catch (err) {
      console.error('Sync O*NET error:', err);
      triggerToast(`Gagal menyinkronkan: ${err.message}`);
    } finally {
      setIsSyncingOnet(false);
    }
  };

  const handleOpenAddQuestion = () => {
    setQuestionEditId(null);
    setQuestionErrors({});
    setQuestionType('R');
    setQuestionText('');
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (item) => {
    setQuestionEditId(item.id);
    setQuestionErrors({});
    setQuestionType(item.type);
    setQuestionText(item.text || item.question || '');
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Hapus pernyataan soal tes RIASEC ini dari basis data?")) {
      try {
        await apiRequest(`/admin/riasec-questions/${id}`, { method: 'DELETE' });
        const updated = riasecQuestions.filter(q => q.id !== id);
        setRiasecQuestions(updated);
        triggerToast("Pernyataan soal berhasil dihapus dari basis data.");
      } catch (e) {
        console.error('API delete question error:', e);
        triggerToast(`Gagal menghapus soal: ${e.message}`);
      }
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const errs = {};
    const textTrimmed = questionText.trim();

    if (!textTrimmed) {
      errs.questionText = "Pernyataan butir soal wajib diisi.";
    } else if (textTrimmed.length < 10) {
      errs.questionText = "Pernyataan butir soal minimal 10 karakter.";
    }

    if (Object.keys(errs).length > 0) {
      setQuestionErrors(errs);
      triggerToast("Pernyataan butir soal harus diisi minimal 10 karakter.");
      return;
    }

    setQuestionErrors({});
    setIsSubmittingQuestion(true);

    if (questionEditId !== null) {
      try {
        const res = await apiRequest(`/admin/riasec-questions/${questionEditId}`, {
          method: 'PUT',
          body: { type: questionType, question: textTrimmed }
        });
        const updatedItem = res?.data || { type: questionType, question: textTrimmed };
        const updated = riasecQuestions.map(q => {
          if (q.id === questionEditId) {
            return {
              ...q,
              type: updatedItem.type || questionType,
              text: updatedItem.question || textTrimmed,
              question: updatedItem.question || textTrimmed
            };
          }
          return q;
        });
        setRiasecQuestions(updated);
        triggerToast("Pernyataan soal berhasil diperbarui di basis data.");
        setIsQuestionModalOpen(false);
      } catch (e) {
        console.error('API update question error:', e);
        triggerToast(`Gagal memperbarui soal: ${e.message}`);
      } finally {
        setIsSubmittingQuestion(false);
      }
    } else {
      try {
        const res = await apiRequest('/admin/riasec-questions', {
          method: 'POST',
          body: { type: questionType, question: textTrimmed }
        });
        const created = res?.data || {};
        const newQuestion = {
          id: created.id || Date.now(),
          type: created.type || questionType,
          text: created.question || textTrimmed,
          question: created.question || textTrimmed
        };
        setRiasecQuestions([...riasecQuestions, newQuestion]);
        triggerToast("Pernyataan soal berhasil ditambahkan ke basis data.");
        setIsQuestionModalOpen(false);
      } catch (e) {
        console.error('API create question error:', e);
        triggerToast(`Gagal menambahkan soal: ${e.message}`);
      } finally {
        setIsSubmittingQuestion(false);
      }
    }
  };

  useEffect(() => {
    setQuestionCurrentPage(1);
  }, [questionSearchQuery, questionCategoryFilter]);

  const filteredQuestions = useMemo(() => {
    const questionsList = riasecQuestions || [];
    return questionsList.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(questionSearchQuery.toLowerCase());
      const matchesCategory = questionCategoryFilter === 'ALL' || q.type === questionCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [riasecQuestions, questionSearchQuery, questionCategoryFilter]);

  const itemsPerPage = 5;
  const totalItems = filteredQuestions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedQuestions = useMemo(() => {
    const startIndex = (questionCurrentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, questionCurrentPage]);

  const tabs = [
    { id: 'criteria', label: 'Kriteria dan Bobot SAW' },
    { id: 'components', label: 'Komponen Akademik' },
    { id: 'riasec', label: 'Pemetaan RIASEC - Karir' },
    { id: 'academic', label: 'Bobot Akademik Karir' },
    { id: 'riasec-questions', label: 'Kelola Soal RIASEC' }
  ];

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4 font-medium">
        <span>Dashboard Admin</span>
        <span aria-hidden="true">/</span>
        <span className="text-content-primary">Konfigurasi Rekomendasi</span>
      </nav>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full border-b border-divider pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-divider text-[11px] font-semibold text-content-secondary uppercase tracking-wider mb-2">
            Parameter Multi-Kriteria SAW
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-content-primary tracking-tight">
            Konfigurasi Rekomendasi
          </h1>
          <p className="text-content-secondary text-sm mt-1.5 max-w-2xl leading-relaxed">
            Atur parameter kriteria metode SAW, komponen penilaian akademik, serta matriks kesesuaian RIASEC terhadap alternatif karir TI.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-md shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Konfigurasi aktif</span>
        </div>
      </section>

      {/* Tab Menu Header */}
      <div className="flex gap-1.5 p-1.5 border border-divider rounded-xl bg-surface mb-6 overflow-x-auto" role="tablist">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => switchTab(tab.id)} 
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-xs' 
                : 'text-content-secondary hover:text-content-primary hover:bg-subsurface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-divider">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <TableSkeleton rows={5} cols={5} hasHeader={false} />
        </Card>
      ) : (
        <>
          {/* --- TAB PANEL 1: Kriteria dan Bobot SAW --- */}
          {activeTab === 'criteria' && (
        <section className="grid gap-6 animate-fade-in" role="tabpanel">
          <div className="flex items-start gap-3 p-4 bg-primary-light/40 dark:bg-sky-950/30 border border-primary/20 dark:border-sky-800/40 rounded-xl text-content-primary text-xs leading-relaxed">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Ketiga kriteria menggunakan atribut <strong>benefit</strong>. Pastikan total bobot seluruh kriteria bernilai 100% sebelum menyimpan perubahan agar pembobotan SAW normal.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table */}
            <Card className="lg:col-span-8 p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-divider flex items-center justify-between flex-wrap gap-3 bg-subsurface/40">
                <div>
                  <h2 className="text-sm font-bold text-content-primary">Kriteria Metode SAW</h2>
                  <p className="text-content-muted text-xs mt-0.5">Parameter pembobotan nilai preferensi alternatif karir.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={handleResetWeights}
                    disabled={isSavingWeights}
                    className="px-3 py-2 border border-divider hover:bg-subsurface text-content-secondary hover:text-content-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Reset Default
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveWeights}
                    disabled={isSavingWeights}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSavingWeights ? "Menyimpan..." : "Simpan Bobot"}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                      <th className="px-6 py-3">Kode</th>
                      <th className="px-6 py-3">Kriteria</th>
                      <th className="px-6 py-3">Sumber Nilai</th>
                      <th className="px-6 py-3 text-center">Atribut</th>
                      <th className="px-6 py-3 text-right">Bobot (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider text-xs">
                    <tr className="hover:bg-subsurface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="w-8 h-8 rounded bg-primary-light dark:bg-primary/20 text-primary font-mono font-bold grid place-items-center text-xs">
                          C1
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <strong className="text-content-primary block font-semibold">Minat Karir</strong>
                        <span className="text-[11px] text-content-muted">Kesesuaian minat mahasiswa dari tes RIASEC.</span>
                      </td>
                      <td className="px-6 py-4 text-content-secondary">Hasil Tes RIASEC</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Benefit
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={c1W}
                          onChange={(e) => setC1W(e.target.value)}
                          className="w-16 px-2.5 py-1.5 border border-divider rounded-lg font-mono font-semibold text-center bg-surface text-content-primary focus:border-primary outline-none tabular-nums"
                          aria-label="Bobot Kriteria C1 Minat"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-subsurface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="w-8 h-8 rounded bg-primary-light dark:bg-primary/20 text-primary font-mono font-bold grid place-items-center text-xs">
                          C2
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <strong className="text-content-primary block font-semibold">Kemampuan Akademik</strong>
                        <span className="text-[11px] text-content-muted">Nilai akademik berbasis komponen relevan.</span>
                      </td>
                      <td className="px-6 py-4 text-content-secondary">Data Akademik Mahasiswa</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Benefit
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={c2W}
                          onChange={(e) => setC2W(e.target.value)}
                          className="w-16 px-2.5 py-1.5 border border-divider rounded-lg font-mono font-semibold text-center bg-surface text-content-primary focus:border-primary outline-none tabular-nums"
                          aria-label="Bobot Kriteria C2 Akademik"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-subsurface/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="w-8 h-8 rounded bg-primary-light dark:bg-primary/20 text-primary font-mono font-bold grid place-items-center text-xs">
                          C3
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <strong className="text-content-primary block font-semibold">Kebutuhan Pasar Kerja</strong>
                        <span className="text-[11px] text-content-muted">Jumlah lowongan kerja aktual per alternatif karir.</span>
                      </td>
                      <td className="px-6 py-4 text-content-secondary">Data Pasar Kerja</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Benefit
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={c3W}
                          onChange={(e) => setC3W(e.target.value)}
                          className="w-16 px-2.5 py-1.5 border border-divider rounded-lg font-mono font-semibold text-center bg-surface text-content-primary focus:border-primary outline-none tabular-nums"
                          aria-label="Bobot Kriteria C3 Pasar Kerja"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Weights summary preview */}
            <Card className="lg:col-span-4 p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-content-primary mb-1">Proporsi Bobot SAW</h3>
                <p className="text-content-muted text-xs leading-relaxed mb-6">Distribusi bobot kriteria yang digunakan sistem.</p>
                
                <div className="grid gap-4 text-xs font-medium">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-content-secondary w-20">C1 Minat</span>
                    <div className="flex-1 h-2 bg-subsurface rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, Number(c1W)))}%` }} />
                    </div>
                    <span className="text-content-primary font-mono font-semibold w-10 text-right tabular-nums">{c1W}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-content-secondary w-20">C2 Akademik</span>
                    <div className="flex-1 h-2 bg-subsurface rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, Number(c2W)))}%` }} />
                    </div>
                    <span className="text-content-primary font-mono font-semibold w-10 text-right tabular-nums">{c2W}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-content-secondary w-20">C3 Pasar</span>
                    <div className="flex-1 h-2 bg-subsurface rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, Number(c3W)))}%` }} />
                    </div>
                    <span className="text-content-primary font-mono font-semibold w-10 text-right tabular-nums">{c3W}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-divider bg-subsurface/60 rounded-xl mt-6">
                <div>
                  <span className="text-content-secondary text-xs font-semibold block">Total Bobot</span>
                  <span className="text-[10px] text-content-muted">Target: 100%</span>
                </div>
                <strong className={`text-xl font-mono font-black tabular-nums ${criteriaTotal === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-danger'}`}>
                  {criteriaTotal}%
                </strong>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* --- TAB PANEL 2: Komponen Akademik --- */}
      {activeTab === 'components' && (
        <section className="grid gap-6 animate-fade-in" role="tabpanel">
          <div className="flex items-start gap-3 p-4 bg-primary-light/40 dark:bg-sky-950/30 border border-primary/20 dark:border-sky-800/40 rounded-xl text-content-primary text-xs leading-relaxed">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Komponen akademik menjadi dasar penilaian kriteria C2. Perubahan nama atau komponen akan mempengaruhi perhitungan agregasi nilai mahasiswa.
            </span>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-divider flex items-center justify-between flex-wrap gap-4 bg-subsurface/40">
              <div>
                <h2 className="text-sm font-bold text-content-primary">Daftar Komponen Akademik</h2>
                <p className="text-content-muted text-xs mt-0.5">Kelola bidang mata kuliah yang digunakan pada kriteria C2.</p>
              </div>
              <button 
                onClick={handleOpenCompAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Komponen
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                    <th className="px-6 py-3 text-center w-16">No</th>
                    <th className="px-6 py-3 text-center w-20">Ikon</th>
                    <th className="px-6 py-3 w-56">Komponen Akademik</th>
                    <th className="px-6 py-3">Deskripsi</th>
                    <th className="px-6 py-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider text-xs">
                  {academicComponents.map((comp, idx) => (
                    <tr key={comp.id} className="hover:bg-subsurface/30 transition-colors">
                      <td className="px-6 py-4 text-center text-content-muted font-mono font-medium">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex w-8 h-8 rounded-lg bg-subsurface border border-divider text-content-primary font-bold text-sm items-center justify-center">
                          {comp.icon || '◫'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-content-primary font-semibold">
                        {comp.name}
                      </td>
                      <td className="px-6 py-4 text-content-secondary leading-relaxed">
                        {comp.desc}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditComponent(comp)}
                            className="p-1.5 rounded-md bg-subsurface hover:bg-divider text-content-primary transition-colors cursor-pointer"
                            title="Ubah komponen"
                            aria-label={`Ubah ${comp.name}`}
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteComponent(comp.id)}
                            className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Hapus komponen"
                            aria-label={`Hapus ${comp.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {academicComponents.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-content-muted">
                        Komponen akademik belum tersedia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3.5 bg-subsurface/40 border-t border-divider flex items-center justify-between text-content-muted text-xs">
              <span>Total <strong className="text-content-primary">{academicComponents.length}</strong> komponen akademik terdaftar.</span>
              <span>Terintegrasi langsung dengan kriteria C2.</span>
            </div>
          </Card>
        </section>
      )}

      {/* --- TAB PANEL 3: Pemetaan RIASEC --- */}
      {activeTab === 'riasec' && (
        <section className="grid gap-6 animate-fade-in" role="tabpanel">
          <div className="flex items-start gap-3 p-4 bg-primary-light/40 dark:bg-sky-950/30 border border-primary/20 dark:border-sky-800/40 rounded-xl text-content-primary text-xs leading-relaxed">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Pemetaan RIASEC menghubungkan tipe minat kepribadian dengan alternatif karir untuk perhitungan kriteria C1.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form */}
            <Card className="lg:col-span-8 p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-sm font-bold text-content-primary">Pemetaan Tipe RIASEC</h2>
                <p className="text-content-muted text-xs mt-0.5">Pilih alternatif karir dan tentukan bobot tipe RIASEC yang relevan.</p>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="mappingCareerSelect" className="text-xs font-semibold text-content-primary">
                  Alternatif Karir
                </label>
                <select 
                  id="mappingCareerSelect"
                  value={selectedMappingCareer} 
                  onChange={(e) => handleLoadMapping(e.target.value)}
                  className="px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-sm focus:border-primary outline-none cursor-pointer"
                >
                  {Object.keys(careers).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {selectedMappingCareer && (
                <div className="p-3.5 bg-subsurface border border-divider rounded-lg flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-surface border border-divider text-content-primary font-bold text-base grid place-items-center shrink-0">
                    {careers[selectedMappingCareer]?.icon || '⌘'}
                  </span>
                  <div>
                    <strong className="text-xs font-bold text-content-primary block">{selectedMappingCareer}</strong>
                    <span className="text-[11px] text-content-muted block">{careers[selectedMappingCareer]?.subtitle}</span>
                  </div>
                </div>
              )}

              {/* Weights Table */}
              <div className="overflow-x-auto w-full border border-divider rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                      <th className="px-4 py-2.5">Tipe RIASEC</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Bobot Kesesuaian (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider">
                    {Object.entries(TYPE_INFO).map(([code, info]) => {
                      const weight = riasecWeightsState[code] || 0;
                      const isLinked = weight > 0;
                      return (
                        <tr key={code} className="hover:bg-subsurface/30 transition-colors">
                          <td className="px-4 py-3">
                            <strong className="text-content-primary font-semibold block">{code} - {info.name}</strong>
                            <span className="text-[11px] text-content-muted block mt-0.5">{info.description}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              isLinked 
                                ? 'text-primary bg-primary-light/50 border border-primary/20'
                                : 'text-content-muted bg-subsurface border border-divider'
                            }`}>
                              {isLinked ? 'Terhubung' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input 
                              type="number"
                              min="0"
                              max="100"
                              value={weight}
                              onChange={(e) => handleRiasecWeightChange(code, e.target.value)}
                              className="w-16 px-2.5 py-1 text-right bg-surface border border-divider rounded-md font-mono font-semibold text-content-primary focus:border-primary outline-none text-xs tabular-nums"
                              aria-label={`Bobot tipe ${code}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-subsurface border border-divider rounded-lg text-xs">
                <span className="font-semibold text-content-secondary">
                  Total Persentase Bobot: <span className="text-content-muted font-normal">(Disarankan 100%)</span>
                </span>
                <span className={`font-mono font-bold text-sm tabular-nums ${riasecWeightsTotal === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                  {riasecWeightsTotal}%
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
                <button 
                  onClick={() => handleLoadMapping(selectedMappingCareer)}
                  className="px-4 py-2 border border-divider hover:bg-subsurface text-content-secondary text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveMapping}
                  disabled={isSavingMapping}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingMapping ? "Menyimpan..." : "Simpan Pemetaan"}
                </button>
              </div>
            </Card>

            {/* Preview Mapping */}
            <Card className="lg:col-span-4 p-5">
              <h3 className="text-sm font-bold text-content-primary mb-1">Pratinjau Pemetaan</h3>
              <p className="text-content-muted text-xs leading-relaxed mb-4">Ringkasan kode RIASEC per alternatif karir saat ini.</p>
              
              <div className="grid gap-2.5 text-xs">
                {Object.entries(careers).map(([name, data]) => (
                  <div key={name} className="flex items-start gap-3 py-2 border-b border-divider last:border-b-0">
                    <span className="w-7 h-7 rounded bg-subsurface border border-divider text-content-primary font-mono font-bold text-[10px] grid place-items-center shrink-0 mt-0.5">
                      {name.split(' ').map(w => w[0]).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="text-content-primary font-semibold block truncate leading-tight">{name}</strong>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {data.riasecWeights ? (
                          Object.entries(data.riasecWeights).filter(([_, w]) => w > 0).map(([code, w]) => (
                            <span key={code} className="text-[10px] bg-subsurface border border-divider text-content-secondary font-mono font-semibold px-1.5 py-0.5 rounded">
                              {code}: {w}%
                            </span>
                          ))
                        ) : (
                          data.riasecMapped && data.riasecMapped.map(code => (
                            <span key={code} className="text-[10px] bg-subsurface border border-divider text-content-secondary font-mono font-semibold px-1.5 py-0.5 rounded">
                              {code}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* --- TAB PANEL 4: Bobot Akademik Karir --- */}
      {activeTab === 'academic' && (
        <section className="grid gap-6 animate-fade-in" role="tabpanel">
          <div className="flex items-start gap-3 p-4 bg-primary-light/40 dark:bg-sky-950/30 border border-primary/20 dark:border-sky-800/40 rounded-xl text-content-primary text-xs leading-relaxed">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Tentukan kontribusi relevansi bobot (%) masing-masing komponen akademik terhadap alternatif karir. Total bobot per karir harus bernilai 100%.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input weights */}
            <Card className="lg:col-span-8 p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-sm font-bold text-content-primary">Bobot Akademik Berdasarkan Karir</h2>
                <p className="text-content-muted text-xs mt-0.5">Atur kontribusi masing-masing komponen akademik untuk menghitung nilai kriteria C2.</p>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="academicCareerSelect" className="text-xs font-semibold text-content-primary">
                  Alternatif Karir
                </label>
                <select 
                  id="academicCareerSelect"
                  value={selectedAcademicCareer} 
                  onChange={(e) => handleLoadAcademicWeights(e.target.value)}
                  className="px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-sm focus:border-primary outline-none cursor-pointer"
                >
                  {Object.keys(careers).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Table list weights inputs */}
              <div className="overflow-x-auto w-full border border-divider rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                      <th className="px-4 py-2.5">Komponen Akademik</th>
                      <th className="px-4 py-2.5 text-center">Bobot (%)</th>
                      <th className="px-4 py-2.5 text-center w-20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider text-xs">
                    {Object.entries(academicWeightsMap).map(([compName, weight]) => {
                      const compInfo = academicComponents.find(c => c.name === compName) || { name: compName, desc: 'Deskripsi komponen', icon: '◫' };
                      return (
                        <tr key={compName} className="hover:bg-subsurface/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded bg-subsurface border border-divider text-content-primary text-xs font-bold grid place-items-center shrink-0">
                                {compInfo.icon || '◫'}
                              </span>
                              <div>
                                <strong className="text-content-primary block font-semibold">{compName}</strong>
                                <span className="text-[11px] text-content-muted block">{compInfo.desc}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                value={weight}
                                onChange={(e) => handleWeightChange(compName, e.target.value)}
                                className="w-16 px-2.5 py-1 border border-divider rounded-md font-mono font-semibold text-center bg-surface text-content-primary focus:border-primary outline-none tabular-nums"
                                aria-label={`Bobot komponen ${compName}`}
                              />
                              <span className="text-content-muted font-semibold">%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button 
                              type="button"
                              onClick={() => {
                                const updated = { ...academicWeightsMap };
                                delete updated[compName];
                                setAcademicWeightsMap(updated);
                                triggerToast(`Komponen "${compName}" dilepas.`);
                              }}
                              className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Hapus hubungan"
                              aria-label={`Hapus hubungan ${compName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {Object.keys(academicWeightsMap).length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-content-muted">
                          Belum ada komponen akademik yang terhubung dengan alternatif karir ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add/Link component control */}
              {unlinkedComponents.length > 0 && (
                <div className="flex items-center gap-2 bg-subsurface border border-divider p-3 rounded-lg">
                  <select 
                    value={componentToAdd} 
                    onChange={(e) => setComponentToAdd(e.target.value)}
                    className="flex-1 px-3 py-2 bg-surface border border-divider rounded-md text-content-primary text-xs focus:border-primary outline-none cursor-pointer"
                    aria-label="Pilih komponen akademik untuk dihubungkan"
                  >
                    <option value="">Pilih Komponen Akademik untuk Dihubungkan</option>
                    {unlinkedComponents.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!componentToAdd) return;
                      setAcademicWeightsMap(prev => ({
                        ...prev,
                        [componentToAdd]: 0
                      }));
                      setComponentToAdd('');
                      triggerToast(`Komponen "${componentToAdd}" terhubung.`);
                    }}
                    className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                  >
                    Hubungkan
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 border border-divider bg-subsurface rounded-lg">
                <span className="text-content-secondary text-xs font-semibold">Total Bobot Akademik</span>
                <strong className={`text-base font-mono font-bold tabular-nums ${academicWeightsTotal === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-danger'}`}>
                  {academicWeightsTotal}%
                </strong>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
                <button 
                  onClick={() => handleLoadAcademicWeights(selectedAcademicCareer)}
                  className="px-4 py-2 border border-divider hover:bg-subsurface text-content-secondary font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveAcademicWeights}
                  disabled={isSavingAcademic}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingAcademic ? "Menyimpan..." : "Simpan Bobot"}
                </button>
              </div>
            </Card>

            {/* Sidebar list weights info */}
            <Card className="lg:col-span-4 p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-content-primary mb-1">Pratinjau Bobot</h3>
                <p className="text-content-muted text-xs leading-relaxed mb-4">Distribusi bobot komponen akademik terpilih.</p>
                
                <div className="grid gap-3 text-xs font-medium">
                  {Object.entries(academicWeightsMap).map(([compName, weight]) => (
                    <div key={compName} className="flex items-center justify-between gap-3">
                      <span className="text-content-secondary truncate w-28 block">{compName}</span>
                      <div className="flex-1 h-2 bg-subsurface rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, weight))}%` }} />
                      </div>
                      <span className="text-content-primary font-mono font-semibold w-10 text-right tabular-nums">{weight}%</span>
                    </div>
                  ))}
                  {Object.keys(academicWeightsMap).length === 0 && (
                    <span className="text-content-muted text-xs">Belum ada komponen terhubung.</span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* --- TAB PANEL 5: Kelola Soal RIASEC --- */}
      {activeTab === 'riasec-questions' && (
        <Card className="p-0 overflow-hidden animate-fade-in" role="tabpanel">
          <div className="px-6 py-4 border-b border-divider flex items-center justify-between flex-wrap gap-4 bg-subsurface/40">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-sm font-bold text-content-primary">Daftar Soal Tes Minat RIASEC</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Metode Hybrid
                </span>
              </div>
              <p className="text-content-muted text-xs">Instrumen kuesioner kriteria C1 (Sinkronisasi O*NET Web Services & Penyimpanan Basis Data Lokal).</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select 
                value={questionCategoryFilter}
                onChange={(e) => setQuestionCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none cursor-pointer"
                aria-label="Filter kategori RIASEC"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="R">R - Realistic</option>
                <option value="I">I - Investigative</option>
                <option value="A">A - Artistic</option>
                <option value="S">S - Social</option>
                <option value="E">E - Enterprising</option>
                <option value="C">C - Conventional</option>
              </select>

              <div className="relative">
                <input 
                  type="search"
                  placeholder="Cari pernyataan..."
                  value={questionSearchQuery}
                  onChange={(e) => setQuestionSearchQuery(e.target.value)}
                  className="w-48 sm:w-60 pl-8 pr-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-xs focus:border-primary outline-none transition-colors"
                />
                <HelpCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
              </div>

              <button 
                type="button"
                onClick={handleSyncOnetQuestions}
                disabled={isSyncingOnet}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-subsurface border border-divider text-content-primary text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                title="Tarik dan sinkronkan 30 butir soal baku dari O*NET Web Services ke basis data lokal"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-primary ${isSyncingOnet ? 'animate-spin' : ''}`} />
                <span>{isSyncingOnet ? 'Menyinkronkan...' : 'Tarik Soal O*NET'}</span>
              </button>
              
              <button 
                onClick={handleOpenAddQuestion}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Soal
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-subsurface border-b border-divider text-[11px] text-content-muted uppercase font-bold tracking-wider">
                  <th className="px-6 py-3 text-center w-16">No</th>
                  <th className="px-6 py-3 text-center w-24">Tipe</th>
                  <th className="px-6 py-3">Pernyataan Soal</th>
                  <th className="px-6 py-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider text-xs">
                {paginatedQuestions.map((item, idx) => {
                  const absoluteIdx = (questionCurrentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={item.id} className="hover:bg-subsurface/30 transition-colors">
                      <td className="px-6 py-4 text-center text-content-muted font-mono font-medium">
                        {absoluteIdx}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded bg-subsurface border border-divider text-primary font-mono font-bold text-xs">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-content-primary leading-relaxed font-normal">
                        {item.text}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditQuestion(item)}
                            className="p-1.5 rounded-md bg-subsurface hover:bg-divider text-content-primary transition-colors cursor-pointer"
                            title="Ubah soal"
                            aria-label={`Ubah soal ${absoluteIdx}`}
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(item.id)}
                            className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Hapus soal"
                            aria-label={`Hapus soal ${absoluteIdx}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedQuestions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-content-muted">
                      Pernyataan soal RIASEC tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3.5 bg-subsurface/40 border-t border-divider flex items-center justify-between flex-wrap gap-4 text-content-muted text-xs">
            <span>
              Menampilkan <strong className="text-content-primary font-mono">{totalItems > 0 ? (questionCurrentPage - 1) * itemsPerPage + 1 : 0}</strong> - <strong className="text-content-primary font-mono">{Math.min(totalItems, questionCurrentPage * itemsPerPage)}</strong> dari <strong className="text-content-primary font-mono">{totalItems}</strong> butir soal.
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setQuestionCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={questionCurrentPage === 1}
                  className="px-3 py-1.5 border border-divider bg-surface hover:bg-subsurface text-content-primary font-semibold rounded-md disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Sebelumnya
                </button>
                <span className="font-mono px-1 text-content-primary font-semibold">
                  {questionCurrentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => setQuestionCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={questionCurrentPage === totalPages}
                  className="px-3 py-1.5 border border-divider bg-surface hover:bg-subsurface text-content-primary font-semibold rounded-md disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </Card>
      )}
        </>
      )}

      {/* Reusable Component Modal */}
      <Modal 
        isOpen={isCompModalOpen} 
        title={compEditId !== null ? "Ubah Komponen Akademik" : "Tambah Komponen Akademik"} 
        onClose={() => setIsCompModalOpen(false)}
      >
        <form onSubmit={handleCompSubmit} className="grid gap-4 text-sm" noValidate>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3 grid gap-1.5">
              <label htmlFor="compIcon" className="font-semibold text-content-primary text-xs">Ikon</label>
              <select 
                id="compIcon"
                value={compIcon}
                onChange={(e) => setCompIcon(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-sm focus:border-primary outline-none"
              >
                <option>⌘</option>
                <option>▤</option>
                <option>◫</option>
                <option>⌁</option>
                <option>◌</option>
                <option>★</option>
              </select>
            </div>
            <div className="col-span-9 grid gap-1.5">
              <label htmlFor="compName" className="font-semibold text-content-primary text-xs">
                Komponen Akademik <span className="text-red-500">*</span>
              </label>
              <input 
                id="compName"
                type="text"
                value={compName}
                onChange={(e) => {
                  setCompName(e.target.value);
                  if (compErrors.compName) setCompErrors(prev => ({ ...prev, compName: undefined }));
                }}
                placeholder="Contoh: Pemrograman Web"
                className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none transition-colors ${
                  compErrors.compName 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-divider focus:border-primary'
                }`}
                aria-invalid={!!compErrors.compName}
                required
              />
              {compErrors.compName && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{compErrors.compName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="compDesc" className="font-semibold text-content-primary text-xs">
              Keterangan / Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea 
              id="compDesc"
              value={compDesc}
              onChange={(e) => {
                setCompDesc(e.target.value);
                if (compErrors.compDesc) setCompErrors(prev => ({ ...prev, compDesc: undefined }));
              }}
              placeholder="Contoh: Dasar pemrograman, OOP, perancangan web..."
              className={`w-full px-3 py-2 bg-surface border rounded-lg text-content-primary text-sm outline-none min-h-[70px] transition-colors ${
                compErrors.compDesc 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-divider focus:border-primary'
              }`}
              aria-invalid={!!compErrors.compDesc}
              required
            />
            {compErrors.compDesc && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{compErrors.compDesc}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
            <button 
              type="button" 
              onClick={() => setIsCompModalOpen(false)}
              className="px-4 py-2 border border-divider hover:bg-subsurface text-content-secondary font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isSubmittingComp}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmittingComp ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </Modal>

      {/* RIASEC Question Modal */}
      <Modal 
        isOpen={isQuestionModalOpen} 
        title={questionEditId !== null ? "Ubah Soal RIASEC" : "Tambah Soal RIASEC"} 
        onClose={() => setIsQuestionModalOpen(false)}
      >
        <form onSubmit={handleSaveQuestion} className="grid gap-4 text-sm" noValidate>
          <div className="grid gap-1.5">
            <label htmlFor="questionType" className="font-semibold text-content-primary text-xs">Tipe RIASEC</label>
            <select 
              id="questionType"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-divider rounded-lg text-content-primary text-sm focus:border-primary outline-none cursor-pointer"
              required
            >
              <option value="R">R - Realistic</option>
              <option value="I">I - Investigative</option>
              <option value="A">A - Artistic</option>
              <option value="S">S - Social</option>
              <option value="E">E - Enterprising</option>
              <option value="C">C - Conventional</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="questionText" className="font-semibold text-content-primary text-xs">
              Pernyataan Soal <span className="text-red-500">*</span>
            </label>
            <textarea 
              id="questionText"
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                if (questionErrors.questionText) setQuestionErrors(prev => ({ ...prev, questionText: undefined }));
              }}
              placeholder="Masukkan butir pernyataan minat..."
              className={`w-full px-3 py-2.5 bg-surface border rounded-lg text-content-primary text-sm outline-none min-h-[90px] leading-relaxed transition-colors ${
                questionErrors.questionText 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-divider focus:border-primary'
              }`}
              aria-invalid={!!questionErrors.questionText}
              required
            />
            {questionErrors.questionText && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{questionErrors.questionText}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
            <button 
              type="button" 
              onClick={() => setIsQuestionModalOpen(false)}
              className="px-4 py-2 border border-divider hover:bg-subsurface text-content-secondary font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isSubmittingQuestion}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmittingQuestion ? "Menyimpan..." : "Simpan Soal"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      <Toast 
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
      />
    </main>
  );
}
