import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { 
  Check, 
  Settings, 
  BookOpen, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Info,
  Sliders,
  Award
} from 'lucide-react';

const TYPE_INFO = {
  R: { name: "Realistic" },
  I: { name: "Investigative" },
  A: { name: "Artistic" },
  S: { name: "Social" },
  E: { name: "Enterprising" },
  C: { name: "Conventional" }
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

  // Tab 5: RIASEC Questions CRUD state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionEditId, setQuestionEditId] = useState(null);
  const [questionType, setQuestionType] = useState('R');
  const [questionText, setQuestionText] = useState('');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState('ALL');
  const [questionCurrentPage, setQuestionCurrentPage] = useState(1);

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

  // --- Tab 1: Save weights ---
  const criteriaTotal = Number(c1W) + Number(c2W) + Number(c3W);

  // --- Tab 3: RIASEC weights total ---
  const riasecWeightsTotal = Object.values(riasecWeightsState).reduce((sum, w) => sum + Number(w || 0), 0);

  const handleSaveWeights = () => {
    if (criteriaTotal !== 100) {
      triggerToast("Total bobot kriteria harus bernilai 100%.");
      return;
    }
    setSawWeights({
      c1: Number(c1W),
      c2: Number(c2W),
      c3: Number(c3W)
    });
    triggerToast("Bobot kriteria SAW berhasil disimpan.");
  };

  // --- Tab 2: Academic components CRUD ---
  const handleOpenCompAdd = () => {
    setCompEditId(null);
    setCompName('');
    setCompDesc('');
    setCompIcon('⌘');
    setIsCompModalOpen(true);
  };

  const handleEditComponent = (comp) => {
    setCompEditId(comp.id);
    setCompName(comp.name);
    setCompDesc(comp.desc);
    setCompIcon(comp.icon || '⌘');
    setIsCompModalOpen(true);
  };

  const handleDeleteComponent = (id) => {
    if (window.confirm("Hapus komponen akademik ini?")) {
      const updated = academicComponents.filter(c => c.id !== id);
      setAcademicComponents(updated);
      triggerToast("Komponen akademik berhasil dihapus.");
    }
  };

  const handleCompSubmit = (e) => {
    e.preventDefault();
    if (!compName.trim()) return;

    if (compEditId !== null) {
      const updated = academicComponents.map(c => {
        if (c.id === compEditId) {
          return { ...c, name: compName, desc: compDesc, icon: compIcon };
        }
        return c;
      });
      setAcademicComponents(updated);
      triggerToast("Komponen akademik diperbarui.");
    } else {
      const duplicate = academicComponents.find(c => c.name.toLowerCase() === compName.toLowerCase());
      if (duplicate) {
        triggerToast("Komponen ini sudah tersedia.");
        return;
      }
      const newComp = {
        id: Date.now(),
        name: compName,
        desc: compDesc,
        grade: 80,
        status: "Baik",
        updated: "Hari ini",
        icon: compIcon
      };
      setAcademicComponents([...academicComponents, newComp]);
      triggerToast("Komponen akademik ditambahkan.");
    }
    setIsCompModalOpen(false);
  };

  // --- Tab 3: RIASEC mapping ---
  const handleLoadMapping = (careerName) => {
    setSelectedMappingCareer(careerName);
    const careerData = careers[careerName];
    const weights = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    if (careerData) {
      if (careerData.riasecWeights) {
        Object.entries(careerData.riasecWeights).forEach(([code, val]) => {
          weights[code] = val;
        });
      } else if (careerData.riasecMapped) {
        // Fallback to map existing arrays to equal weights summing to 100
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

  const handleSaveMapping = () => {
    const activeCodes = Object.entries(riasecWeightsState)
      .filter(([_, w]) => w > 0)
      .map(([code]) => code);

    if (activeCodes.length === 0) {
      triggerToast("Masukkan bobot untuk setidaknya satu tipe RIASEC.");
      return;
    }

    const updated = { ...careers };
    updated[selectedMappingCareer] = {
      ...updated[selectedMappingCareer],
      riasecMapped: activeCodes,
      riasecWeights: riasecWeightsState
    };
    setCareers(updated);
    triggerToast(`Pemetaan RIASEC untuk "${selectedMappingCareer}" berhasil disimpan.`);
  };

  // --- Tab 4: Academic weights per career ---
  const [componentToAdd, setComponentToAdd] = useState('');

  const handleLoadAcademicWeights = (careerName) => {
    setSelectedAcademicCareer(careerName);
    const careerData = careers[careerName];
    
    // Map current weights
    const weights = {};
    if (careerData && careerData.academicWeights) {
      Object.entries(careerData.academicWeights).forEach(([compName, compWeight]) => {
        weights[compName] = compWeight;
      });
    }
    setAcademicWeightsMap(weights);
  };

  const handleWeightChange = (compName, value) => {
    setAcademicWeightsMap(prev => ({
      ...prev,
      [compName]: Number(value) || 0
    }));
  };

  const academicWeightsTotal = Object.values(academicWeightsMap).reduce((a, b) => a + b, 0);

  const unlinkedComponents = useMemo(() => {
    return academicComponents.filter(comp => academicWeightsMap[comp.name] === undefined);
  }, [academicComponents, academicWeightsMap]);

  const handleSaveAcademicWeights = () => {
    if (academicWeightsTotal !== 100) {
      triggerToast("Total bobot harus bernilai 100%.");
      return;
    }

    const updated = { ...careers };
    updated[selectedAcademicCareer] = {
      ...updated[selectedAcademicCareer],
      academicWeights: { ...academicWeightsMap }
    };
    setCareers(updated);
    triggerToast(`Bobot kualifikasi akademik untuk "${selectedAcademicCareer}" berhasil disimpan.`);
  };

  // --- Tab 5: RIASEC Questions CRUD handlers ---
  const handleOpenAddQuestion = () => {
    setQuestionEditId(null);
    setQuestionType('R');
    setQuestionText('');
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (item) => {
    setQuestionEditId(item.id);
    setQuestionType(item.type);
    setQuestionText(item.text);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm("Hapus pernyataan soal tes RIASEC ini?")) {
      const updated = riasecQuestions.filter(q => q.id !== id);
      setRiasecQuestions(updated);
      triggerToast("Pernyataan soal berhasil dihapus.");
    }
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      triggerToast("Pernyataan soal tidak boleh kosong.");
      return;
    }

    if (questionEditId !== null) {
      // Edit
      const updated = riasecQuestions.map(q => {
        if (q.id === questionEditId) {
          return { ...q, type: questionType, text: questionText };
        }
        return q;
      });
      setRiasecQuestions(updated);
      triggerToast("Pernyataan soal berhasil diperbarui.");
    } else {
      // Add
      const newQuestion = {
        id: Date.now(),
        type: questionType,
        text: questionText
      };
      setRiasecQuestions([...riasecQuestions, newQuestion]);
      triggerToast("Pernyataan soal berhasil ditambahkan.");
    }
    setIsQuestionModalOpen(false);
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

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-slate-500">Konfigurasi Rekomendasi</span>
      </div>

      {/* Heading */}
      <section className="flex items-start md:items-end justify-between gap-4 flex-col md:flex-row mb-8 w-full">
        <div>
          <h1 className="text-2.5xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Konfigurasi Rekomendasi</h1>
          <p className="text-slate-500 text-sm mt-2">Atur data master yang digunakan sistem untuk menghitung rekomendasi karir, meliputi kriteria SAW, komponen akademik, pemetaan RIASEC, dan bobot akademik karir.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black rounded-full">
          ● Konfigurasi aktif
        </span>
      </section>

      {/* Tab Menu Header */}
      <div className="flex gap-2 p-1.5 border border-slate-200 rounded-2xl bg-white shadow-sm overflow-x-auto mb-6">
        <button 
          onClick={() => switchTab('criteria')} 
          className={`flex-1 min-w-[160px] py-2.5 rounded-xl text-xs font-black tracking-tight transition-all duration-200 ${
            activeTab === 'criteria' ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Kriteria dan Bobot SAW
        </button>
        <button 
          onClick={() => switchTab('components')} 
          className={`flex-1 min-w-[160px] py-2.5 rounded-xl text-xs font-black tracking-tight transition-all duration-200 ${
            activeTab === 'components' ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Komponen Akademik
        </button>
        <button 
          onClick={() => switchTab('riasec')} 
          className={`flex-1 min-w-[160px] py-2.5 rounded-xl text-xs font-black tracking-tight transition-all duration-200 ${
            activeTab === 'riasec' ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Pemetaan RIASEC–Karir
        </button>
        <button 
          onClick={() => switchTab('academic')} 
          className={`flex-1 min-w-[160px] py-2.5 rounded-xl text-xs font-black tracking-tight transition-all duration-200 ${
            activeTab === 'academic' ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Bobot Akademik Karir
        </button>
        <button 
          onClick={() => switchTab('riasec-questions')} 
          className={`flex-1 min-w-[160px] py-2.5 rounded-xl text-xs font-black tracking-tight transition-all duration-200 ${
            activeTab === 'riasec-questions' ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Kelola Soal RIASEC
        </button>
      </div>

      {/* --- TAB PANEL 1: Kriteria dan Bobot SAW --- */}
      {activeTab === 'criteria' && (
        <section className="grid gap-6 animate-fade-in">
          <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-xs leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Ketiga kriteria menggunakan atribut <strong>benefit</strong>. Pastikan total bobot seluruh kriteria bernilai 100% sebelum menyimpan perubahan.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table */}
            <article className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900">Kriteria Metode SAW</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Kriteria digunakan untuk menghitung nilai preferensi dan ranking alternatif karir.</p>
                </div>
                <button 
                  onClick={handleSaveWeights}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Simpan Bobot
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      <th className="px-6 py-3.5">Kode</th>
                      <th className="px-6 py-3.5">Kriteria</th>
                      <th className="px-6 py-3.5">Sumber Nilai</th>
                      <th className="px-6 py-3.5 text-center">Atribut</th>
                      <th className="px-6 py-3.5">Bobot (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    <tr>
                      <td className="px-6 py-4"><span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark font-extrabold grid place-items-center text-[11px]">C1</span></td>
                      <td className="px-6 py-4">
                        <strong className="text-slate-800 block font-bold">Minat Karir</strong>
                        <span className="text-[10px] text-slate-400 font-medium">Kesesuaian minat mahasiswa terhadap alternatif karir.</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">Hasil Tes RIASEC</td>
                      <td className="px-6 py-4 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-emerald-800 bg-emerald-50">Benefit</span></td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={c1W}
                          onChange={(e) => setC1W(e.target.value)}
                          className="w-16 px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-bold focus:border-primary text-center"
                        />
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4"><span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark font-extrabold grid place-items-center text-[11px]">C2</span></td>
                      <td className="px-6 py-4">
                        <strong className="text-slate-800 block font-bold">Kemampuan Akademik</strong>
                        <span className="text-[10px] text-slate-400 font-medium">Nilai akademik berdasarkan komponen relevan.</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">Data Akademik Mahasiswa</td>
                      <td className="px-6 py-4 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-emerald-800 bg-emerald-50">Benefit</span></td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={c2W}
                          onChange={(e) => setC2W(e.target.value)}
                          className="w-16 px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-bold focus:border-primary text-center"
                        />
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4"><span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark font-extrabold grid place-items-center text-[11px]">C3</span></td>
                      <td className="px-6 py-4">
                        <strong className="text-slate-800 block font-bold">Kebutuhan Pasar Kerja</strong>
                        <span className="text-[10px] text-slate-400 font-medium">Nilai kebutuhan pasar kerja berdasarkan jumlah lowongan terbaru pada setiap alternatif karir.</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">Data Pasar Kerja</td>
                      <td className="px-6 py-4 text-center"><span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-emerald-800 bg-emerald-50">Benefit</span></td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={c3W}
                          onChange={(e) => setC3W(e.target.value)}
                          className="w-16 px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-bold focus:border-primary text-center"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* Weights summary preview */}
            <aside className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 mb-1">Ringkasan Bobot</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed mb-6">Visualisasi proporsi bobot yang digunakan dalam perhitungan SAW.</p>
                
                <div className="grid gap-4 text-xs font-bold">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 w-16">C1 Minat</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Number(c1W)}%` }} />
                    </div>
                    <span className="text-primary-dark w-10 text-right">{c1W}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 w-16">C2 Akademik</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Number(c2W)}%` }} />
                    </div>
                    <span className="text-primary-dark w-10 text-right">{c2W}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 w-16">C3 Pasar</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Number(c3W)}%` }} />
                    </div>
                    <span className="text-primary-dark w-10 text-right">{c3W}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50/30 rounded-xl mt-6">
                <span className="text-slate-500 text-xs font-bold">Total bobot</span>
                <strong className={`text-xl font-black ${criteriaTotal === 100 ? 'text-primary-dark' : 'text-danger'}`}>{criteriaTotal}%</strong>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* --- TAB PANEL 2: Komponen Akademik --- */}
      {activeTab === 'components' && (
        <section className="grid gap-6 animate-fade-in">
          <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-xs leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Komponen akademik menjadi dasar kriteria C2. Anda dapat menambah, menghapus, atau mengubah komponen nilai di bawah ini.
            </span>
          </div>

          <article className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900">Daftar Komponen Akademik</h2>
                <p className="text-slate-500 text-xs mt-0.5">Kelola kelompok mata kuliah atau bidang penilaian akademik yang digunakan sistem.</p>
              </div>
              <button 
                onClick={handleOpenCompAdd}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Tambah Komponen
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                    <th className="px-6 py-3.5 text-center w-16">No</th>
                    <th className="px-6 py-3.5 text-center w-20">Ikon</th>
                    <th className="px-6 py-3.5 w-56">Komponen Akademik</th>
                    <th className="px-6 py-3.5">Deskripsi</th>
                    <th className="px-6 py-3.5 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {academicComponents.map((comp, idx) => (
                    <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-400 font-bold">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex w-8 h-8 rounded-lg bg-primary-light text-primary-dark font-black text-sm items-center justify-center">
                          {comp.icon || '◫'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-bold">
                        {comp.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 leading-relaxed">
                        {comp.desc}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditComponent(comp)}
                            className="p-1.5 rounded-lg bg-blue-50 text-primary-dark hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Ubah"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteComponent(comp.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {academicComponents.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        Komponen akademik belum tersedia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total <strong>{academicComponents.length}</strong> komponen akademik terdaftar.</span>
              <span>Data ini terintegrasi dengan kriteria C2.</span>
            </div>
          </article>
        </section>
      )}

      {/* --- TAB PANEL 3: Pemetaan RIASEC --- */}
      {activeTab === 'riasec' && (
        <section className="grid gap-6 animate-fade-in">
          <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-xs leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Pemetaan RIASEC menghubungkan tipe minat kepribadian dengan alternatif karir. Sistem mencocokkan hasil tes mahasiswa untuk kriteria C1.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Checks Map Form */}
            <article className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-base font-black text-slate-900">Pemetaan Tipe RIASEC</h2>
                <p className="text-slate-500 text-xs mt-0.5">Pilih alternatif karir, kemudian tentukan tipe RIASEC yang sesuai.</p>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-700">Alternatif karir</label>
                <select 
                  value={selectedMappingCareer} 
                  onChange={(e) => handleLoadMapping(e.target.value)}
                  className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm cursor-pointer"
                >
                  {Object.keys(careers).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {selectedMappingCareer && (
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-white text-primary font-black text-lg grid place-items-center shadow-md shadow-blue-500/5">
                    {careers[selectedMappingCareer]?.icon || '⌘'}
                  </span>
                  <div>
                    <strong className="text-xs font-black text-slate-900 block mb-0.5">{selectedMappingCareer}</strong>
                    <span className="text-[10px] text-slate-400 block font-medium leading-none">{careers[selectedMappingCareer]?.subtitle}</span>
                  </div>
                </div>
              )}

              {/* Weights Table list */}
              <div className="overflow-x-auto w-full border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      <th className="px-4 py-3">Tipe RIASEC</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Bobot Kesesuaian (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(TYPE_INFO).map(([code, info]) => {
                      const weight = riasecWeightsState[code] || 0;
                      const isLinked = weight > 0;
                      return (
                        <tr key={code} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <strong className="text-slate-800 font-bold block">{code} - {info.name}</strong>
                              <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">{info.description}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isLinked 
                                ? 'text-primary-dark bg-blue-50 border border-blue-100'
                                : 'text-slate-400 bg-slate-50 border border-slate-200'
                            }`}>
                              {isLinked ? 'Terhubung' : 'Terputus'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input 
                              type="number"
                              min="0"
                              max="100"
                              value={weight}
                              onChange={(e) => handleRiasecWeightChange(code, e.target.value)}
                              className="w-16 px-2 py-1 text-right bg-white border border-slate-200 rounded-lg outline-none focus:border-primary text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 text-xs font-bold mt-2">
                <span className="flex items-center gap-1.5">
                  Total Persentase Bobot:
                  <span className="text-[10px] text-slate-400 font-normal">(Sebaiknya berjumlah 100%)</span>
                </span>
                <span className={`text-sm font-black ${riasecWeightsTotal === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {riasecWeightsTotal}%
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  onClick={() => handleLoadMapping(selectedMappingCareer)}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-500 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveMapping}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Simpan Pemetaan
                </button>
              </div>
            </article>

            {/* Preview Mapping */}
            <aside className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-1">Preview Pemetaan</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed mb-4">Pemetaan RIASEC karir yang dikonfigurasi saat ini.</p>
              
              <div className="grid gap-3 text-xs">
                {Object.entries(careers).map(([name, data]) => (
                  <div key={name} className="flex items-center gap-3 py-2 border-b border-slate-100">
                    <span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark font-extrabold text-[11px] grid place-items-center shrink-0">
                      {name.split(' ').map(w => w[0]).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="text-slate-800 font-black block truncate leading-tight mb-0.5">{name}</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.riasecWeights ? (
                          Object.entries(data.riasecWeights).filter(([_, w]) => w > 0).map(([code, w]) => (
                            <span key={code} className="text-[9px] bg-slate-50 border border-slate-200 text-slate-550 font-extrabold px-1 rounded">
                              {code}: {w}%
                            </span>
                          ))
                        ) : (
                          data.riasecMapped && data.riasecMapped.map(code => (
                            <span key={code} className="text-[9px] bg-slate-50 border border-slate-200 text-slate-550 font-extrabold px-1 rounded">
                              {code}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* --- TAB PANEL 4: Bobot Akademik Karir --- */}
      {activeTab === 'academic' && (
        <section className="grid gap-6 animate-fade-in">
          <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-xs leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Tentukan kontribusi relevansi bobot (%) masing-masing mata kuliah untuk alternatif karir. Total bobot per karir harus bernilai 100%.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input weights */}
            <article className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-base font-black text-slate-900">Bobot Akademik Berdasarkan Karir</h2>
                <p className="text-slate-500 text-xs mt-0.5">Atur kontribusi masing-masing komponen akademik untuk menghitung C2.</p>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-700">Alternatif karir</label>
                <select 
                  value={selectedAcademicCareer} 
                  onChange={(e) => handleLoadAcademicWeights(e.target.value)}
                  className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm cursor-pointer"
                >
                  {Object.keys(careers).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Table list weights inputs */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      <th className="py-2.5">Komponen Akademik</th>
                      <th className="py-2.5 text-center">Bobot (%)</th>
                      <th className="py-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {Object.entries(academicWeightsMap).map(([compName, weight]) => {
                      const compInfo = academicComponents.find(c => c.name === compName) || { name: compName, desc: 'Deskripsi komponen', icon: '◫' };
                      return (
                        <tr key={compName}>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-primary-light text-primary-dark text-xs font-black grid place-items-center shrink-0">
                                {compInfo.icon || '◫'}
                              </span>
                              <div>
                                <strong className="text-slate-800 block font-bold">{compName}</strong>
                                <span className="text-[10px] text-slate-400 font-medium leading-none block mt-1">{compInfo.desc}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                value={weight}
                                onChange={(e) => handleWeightChange(compName, e.target.value)}
                                className="w-16 px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-bold text-center"
                              />
                              <span className="text-slate-400 font-bold">%</span>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <button 
                              type="button"
                              onClick={() => {
                                const updated = { ...academicWeightsMap };
                                delete updated[compName];
                                setAcademicWeightsMap(updated);
                                triggerToast(`Komponen "${compName}" dilepas dari alternatif.`);
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Hapus hubungan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {Object.keys(academicWeightsMap).length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-6 text-center text-slate-400 font-medium">
                          Belum ada komponen akademik yang terhubung dengan alternatif karir ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add/Link component control */}
              {unlinkedComponents.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl">
                  <select 
                    value={componentToAdd} 
                    onChange={(e) => setComponentToAdd(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">-- Pilih Komponen Akademik untuk Dihubungkan --</option>
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
                      triggerToast(`Komponen "${componentToAdd}" terhubung. Silakan tentukan bobot.`);
                    }}
                    className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-black shrink-0 transition-colors"
                  >
                    Hubungkan
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
                <span className="text-slate-500 text-xs font-bold">Total bobot</span>
                <strong className={`text-xl font-black ${academicWeightsTotal === 100 ? 'text-primary-dark' : 'text-danger'}`}>
                  {academicWeightsTotal}%
                </strong>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  onClick={() => handleLoadAcademicWeights(selectedAcademicCareer)}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-500 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveAcademicWeights}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Simpan Bobot
                </button>
              </div>
            </article>

            {/* Sidebar list weights info */}
            <aside className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between self-stretch">
              <div>
                <h3 className="text-sm font-black text-slate-900 mb-1">Pratinjau Bobot</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed mb-4">Pratinjau visual bobot akademik untuk karir terpilih.</p>
                
                <div className="grid gap-3.5 text-xs font-bold">
                  {Object.entries(academicWeightsMap).map(([compName, weight]) => (
                    <div key={compName} className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 truncate w-24 block leading-tight">{compName}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${weight}%` }} />
                      </div>
                      <span className="text-primary-dark w-10 text-right">{weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* --- TAB PANEL 5: Kelola Soal RIASEC --- */}
      {activeTab === 'riasec-questions' && (
        <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between animate-fade-in">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Daftar Soal/Pernyataan Tes RIASEC</h2>
              <p className="text-slate-500 text-xs mt-0.5">Kelola butir pernyataan kuesioner RIASEC yang digunakan untuk pemetaan minat karir mahasiswa.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Filter */}
              <select 
                value={questionCategoryFilter}
                onChange={(e) => setQuestionCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-xs cursor-pointer"
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
                  className="w-48 sm:w-60 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-xs transition-all"
                />
                <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </div>
              <button 
                onClick={handleOpenAddQuestion}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Soal
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                  <th className="px-6 py-3.5 text-center w-16">No</th>
                  <th className="px-6 py-3.5 text-center w-24">Tipe</th>
                  <th className="px-6 py-3.5">Pernyataan Soal</th>
                  <th className="px-6 py-3.5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedQuestions.map((item, idx) => {
                  const absoluteIdx = (questionCurrentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-400 font-bold">
                        {absoluteIdx}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-primary-dark font-black">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium leading-relaxed">
                        {item.text}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditQuestion(item)}
                            className="p-1.5 rounded-lg bg-blue-50 text-primary-dark hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Ubah"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Hapus"
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
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                      Pernyataan soal RIASEC tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 text-slate-400 text-xs font-medium">
            <span>
              Menampilkan <strong>{totalItems > 0 ? (questionCurrentPage - 1) * itemsPerPage + 1 : 0}</strong> - <strong>{Math.min(totalItems, questionCurrentPage * itemsPerPage)}</strong> dari <strong>{totalItems}</strong> pernyataan.
            </span>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setQuestionCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={questionCurrentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-white text-slate-550 font-black rounded-lg disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  Sebelumnya
                </button>
                <span className="font-bold px-1">
                  {questionCurrentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => setQuestionCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={questionCurrentPage === totalPages}
                  className="px-3 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-white text-slate-550 font-black rounded-lg disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reusable Component Modal */}
      <Modal 
        isOpen={isCompModalOpen} 
        title={compEditId !== null ? "Ubah Komponen Akademik" : "Tambah Komponen Akademik"} 
        onClose={() => setIsCompModalOpen(false)}
      >
        <form onSubmit={handleCompSubmit} className="grid gap-4 text-sm">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3 grid gap-2">
              <label htmlFor="compIcon" className="font-bold text-slate-700 text-xs">Ikon</label>
              <select 
                id="compIcon"
                value={compIcon}
                onChange={(e) => setCompIcon(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
              >
                <option>⌘</option>
                <option>▤</option>
                <option>◫</option>
                <option>⌁</option>
                <option>◌</option>
                <option>★</option>
              </select>
            </div>
            <div className="col-span-9 grid gap-2">
              <label htmlFor="compName" className="font-bold text-slate-700 text-xs">Komponen Akademik</label>
              <input 
                id="compName"
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="Contoh: Pemrograman"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="compDesc" className="font-bold text-slate-700 text-xs">Keterangan / Deskripsi</label>
            <textarea 
              id="compDesc"
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              placeholder="Contoh: Dasar pemrograman, OOP, pemrograman web..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm min-h-[70px]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsCompModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95"
            >
              Simpan Data
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
        <form onSubmit={handleSaveQuestion} className="grid gap-4 text-sm">
          <div className="grid gap-2">
            <label htmlFor="questionType" className="font-bold text-slate-700 text-xs">Tipe RIASEC</label>
            <select 
              id="questionType"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm cursor-pointer"
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

          <div className="grid gap-2">
            <label htmlFor="questionText" className="font-bold text-slate-700 text-xs">Pernyataan Soal</label>
            <textarea 
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Masukkan butir pernyataan minat..."
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary text-sm min-h-[90px] leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsQuestionModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95"
            >
              Simpan Soal
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

      <footer className="mt-16 text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        CareerPath · Sistem Rekomendasi Karir untuk Mahasiswa Tingkat Akhir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
