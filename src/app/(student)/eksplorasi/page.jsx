"use client";

import React, { useContext, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppContext } from '@/context/AppContext';
import { apiRequest } from '@/utils/apiClient';
import Card from '@/components/Card';
import { Skeleton, CardGridSkeleton } from '@/components/Skeleton';
import { Search, ChevronRight } from 'lucide-react';

const RIASEC_CATEGORIES = [
  { code: 'ALL', name: 'Semua Tipe' },
  { code: 'R', name: 'Realistic (R)' },
  { code: 'I', name: 'Investigative (I)' },
  { code: 'A', name: 'Artistic (A)' },
  { code: 'S', name: 'Social (S)' },
  { code: 'E', name: 'Enterprising (E)' },
  { code: 'C', name: 'Conventional (C)' }
];

const CAREER_SALARIES = {
  "Software Engineer": "Rp 8M - Rp 22M",
  "Data Analyst": "Rp 7M - Rp 18M",
  "Cybersecurity Analyst": "Rp 9M - Rp 25M",
  "Business Analyst": "Rp 8M - Rp 20M",
  "UI/UX Designer": "Rp 7M - Rp 18M",
  "DevOps Engineer": "Rp 9M - Rp 25M",
  "Quality Assurance Engineer": "Rp 7M - Rp 18M",
  "Database Administrator": "Rp 8M - Rp 20M",
  "Network Administrator": "Rp 7M - Rp 18M"
};

export default function CareerCatalog() {
  const { careers } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiasec, setSelectedRiasec] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCareers() {
      try {
        await apiRequest('/careers');
      } catch {
        // Fallback to contextual careers
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCareers();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCareers = useMemo(() => {
    return Object.entries(careers).filter(([name, data]) => {
      const matchesSearch = 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (data.marketDemand?.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRiasec = 
        selectedRiasec === 'ALL' || 
        data.riasecMapped.includes(selectedRiasec);

      return matchesSearch && matchesRiasec;
    });
  }, [careers, searchQuery, selectedRiasec]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-content-muted mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
        <span>/</span>
        <span className="text-content-primary font-medium">Katalog Karir TI</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-divider">
        <div>
          <h1 className="text-2xl sm:text-2.5xl font-bold text-content-primary tracking-tight">
            Katalog Alternatif Karir TI
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Daftar 9 alternatif profesi bidang teknologi informasi yang dievaluasi dalam sistem rekomendasi karir.
          </p>
        </div>
        <div className="text-xs font-mono text-content-muted">
          {isLoading ? (
            <Skeleton className="h-4 w-36" />
          ) : (
            `Menampilkan ${filteredCareers.length} dari ${Object.keys(careers).length} Alternatif`
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 sm:p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 relative">
            <input 
              type="search"
              placeholder="Cari karir atau keterampilan (misal: Python, SQL, Cloud)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-subsurface border border-divider rounded-lg outline-none focus:border-primary text-xs text-content-primary"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
          </div>

          <div className="md:col-span-6 flex flex-wrap gap-1.5 items-center justify-start md:justify-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted mr-1">
              Filter RIASEC:
            </span>
            {RIASEC_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setSelectedRiasec(cat.code)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedRiasec === cat.code
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-subsurface border border-divider text-content-secondary hover:text-content-primary'
                }`}
              >
                {cat.code === 'ALL' ? 'Semua' : cat.code}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Catalog Grid */}
      {isLoading ? (
        <CardGridSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCareers.map(([name, data]) => {
            const salaryStr = CAREER_SALARIES[name] || "Rp 7M - Rp 18M";
            return (
              <Card key={name} className="p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky-300 font-bold text-lg flex items-center justify-center shrink-0">
                      {data.icon || '⌘'}
                    </div>
                    <div className="flex gap-1">
                      {data.riasecMapped.slice(0, 3).map(code => (
                        <span 
                          key={code} 
                          className="px-2 py-0.5 bg-subsurface border border-divider text-content-muted font-mono font-semibold rounded text-[10px]"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-content-primary mb-0.5 leading-snug">
                    {name}
                  </h3>
                  <p className="text-[11px] text-content-muted font-medium mb-3">
                    {data.subtitle}
                  </p>
                  
                  <p className="text-xs text-content-secondary leading-relaxed line-clamp-3 mb-4">
                    {data.description}
                  </p>

                  <div className="pt-3 border-t border-divider grid grid-cols-2 gap-2 text-[11px] text-content-muted mb-4">
                    <div>
                      <span className="block text-[10px] text-content-muted">Estimasi Gaji</span>
                      <span className="font-semibold text-content-primary font-mono">{salaryStr}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-content-muted">Lowongan Industri</span>
                      <span className="font-semibold text-content-primary">{data.marketDemand?.vacancy || '200'}+ Posisi</span>
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/eksplorasi/${encodeURIComponent(name)}`}
                  className="w-full py-2 px-3 bg-subsurface hover:bg-primary hover:text-white border border-divider rounded-lg text-xs font-semibold text-content-primary text-center transition-colors flex items-center justify-center gap-1"
                >
                  <span>Pelajari Detail Karir</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            );
          })}

          {filteredCareers.length === 0 && (
            <div className="col-span-full py-16 text-center bg-surface border border-dashed border-divider rounded-xl">
              <h3 className="text-sm font-bold text-content-primary mb-1">Karir Tidak Ditemukan</h3>
              <p className="text-xs text-content-muted">Tidak ada alternatif karir yang sesuai dengan kriteria pencarian Anda.</p>
            </div>
          )}
        </div>
      )}

      <footer className="mt-16 text-center text-xs text-content-muted py-6 border-t border-divider">
        CareerPath TI: Sistem Pendukung Keputusan Rekomendasi Karir Bidang Teknologi Informasi
      </footer>
    </main>
  );
}
