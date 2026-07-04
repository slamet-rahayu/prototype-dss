import React, { useContext, useState, useMemo } from 'react';
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
    careers, setCareers
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
  const [riasecChecks, setRiasecChecks] = useState({
    R: false, I: false, A: false, S: false, E: false, C: false
  });

  // Tab 4: Academic weights per career state
  const [selectedAcademicCareer, setSelectedAcademicCareer] = useState(Object.keys(careers)[0] || '');
  const [academicWeightsMap, setAcademicWeightsMap] = useState({});

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
    if (careerData && careerData.riasecMapped) {
      const checks = { R: false, I: false, A: false, S: false, E: false, C: false };
      careerData.riasecMapped.forEach(code => {
        checks[code] = true;
      });
      setRiasecChecks(checks);
    }
  };

  const handleRiasecCheckChange = (code) => {
    setRiasecChecks(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const handleSaveMapping = () => {
    const selectedCodes = Object.entries(riasecChecks)
      .filter(([code, checked]) => checked)
      .map(([code]) => code);

    if (selectedCodes.length === 0) {
      triggerToast("Pilih setidaknya satu tipe RIASEC.");
      return;
    }

    const updated = { ...careers };
    updated[selectedMappingCareer] = {
      ...updated[selectedMappingCareer],
      riasecMapped: selectedCodes
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
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Daftar Komponen Akademik</h2>
                <p className="text-slate-500 text-xs mt-0.5">Kelola kelompok mata kuliah atau bidang penilaian akademik yang digunakan sistem.</p>
              </div>
              <button 
                onClick={handleOpenCompAdd}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-extrabold rounded-xl shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4.5 h-4.5" />
                Tambah Komponen
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {academicComponents.map((comp) => (
                <div key={comp.id} className="relative border border-slate-100 rounded-xl p-4 bg-slate-50/30 hover:border-blue-200 transition-all flex items-start gap-3.5 group">
                  <span className="w-10 h-10 rounded-xl bg-primary-light text-primary-dark text-lg font-black grid place-items-center shrink-0">
                    {comp.icon || '◫'}
                  </span>
                  <div className="min-w-0 pr-16">
                    <h4 className="text-sm font-black text-slate-800 mb-1">{comp.name}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{comp.desc}</p>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-1.5">
                    <button 
                      onClick={() => handleEditComponent(comp)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-primary-dark font-black text-[10px] transition-colors"
                    >
                      Ubah
                    </button>
                    <button 
                      onClick={() => handleDeleteComponent(comp.id)}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 font-black text-[10px] transition-colors"
                    >
                      Nonaktifkan
                    </button>
                  </div>
                </div>
              ))}
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

              {/* Checks grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(TYPE_INFO).map((code) => (
                  <div key={code} className="relative">
                    <input 
                      type="checkbox" 
                      id={`chk-${code}`} 
                      checked={riasecChecks[code] || false}
                      onChange={() => handleRiasecCheckChange(code)}
                      className="absolute opacity-0 pointer-events-none"
                    />
                    <label 
                      htmlFor={`chk-${code}`}
                      className={`flex flex-col justify-center gap-1.5 p-3.5 border rounded-xl cursor-pointer select-none transition-all duration-150 min-h-[74px] ${
                        riasecChecks[code] 
                          ? 'border-primary bg-blue-50/50 text-primary-dark font-bold' 
                          : 'border-slate-200 bg-white hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <strong className="text-base font-black leading-none block">{code}</strong>
                      <span className={`text-[9.5px] leading-tight font-medium ${riasecChecks[code] ? 'text-primary-dark' : 'text-slate-400'}`}>
                        {TYPE_INFO[code].name}
                      </span>
                    </label>
                  </div>
                ))}
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
                  <div key={name} className="flex items-center gap-3 py-2 border-b border-slate-50">
                    <span className="w-8 h-8 rounded-lg bg-primary-light text-primary-dark font-extrabold text-[11px] grid place-items-center shrink-0">
                      {name.split(' ').map(w => w[0]).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="text-slate-800 font-black block truncate leading-tight mb-0.5">{name}</strong>
                      <span className="text-[10px] text-slate-400 block truncate leading-none">RIASEC: {data.riasecMapped.join(', ')}</span>
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
