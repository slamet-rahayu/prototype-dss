import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppContext, AppProvider } from './context/AppContext';

// Reusable Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Student Pages
import Login from './pages/student/Login';
import Register from './pages/student/Register';
import Home from './pages/student/Home';
import Profile from './pages/student/Profile';
import Academic from './pages/student/Academic';
import RiasecQuiz from './pages/student/RiasecQuiz';
import Recommendations from './pages/student/Recommendations';
import CareerDetail from './pages/student/CareerDetail';
import CareerCatalog from './pages/student/CareerCatalog';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CareersConfig from './pages/admin/CareersConfig';
import SawConfig from './pages/admin/SawConfig';
import JobMarketConfig from './pages/admin/JobMarketConfig';
import StudentsConfig from './pages/admin/StudentsConfig';
import HistoryConfig from './pages/admin/HistoryConfig';
import SchedulerConfig from './pages/admin/SchedulerConfig';

// Authentication Guard Component
const AuthGuard = ({ children, allowedRoles }) => {
  const { user } = useContext(AppContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect role mismatch
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  return children;
};

// Student Portal Layout
const StudentLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar />
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
};

// Admin Panel Layout
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col overflow-y-auto">
        <header className="h-[72px] bg-white border-b border-slate-200/85 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-sm font-black text-slate-700 tracking-tight">Sistem Pendukung Keputusan Pemilihan Karir TI</h2>
          <span className="text-xs font-bold text-slate-400">Mode: Administrator</span>
        </header>
        <div className="flex-1 w-full bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Portal Routes */}
      <Route path="/" element={
        <AuthGuard allowedRoles={['student']}>
          <StudentLayout>
            <Home />
          </StudentLayout>
        </AuthGuard>
      } />
      <Route path="/profile" element={
        <AuthGuard allowedRoles={['student']}>
          <StudentLayout>
            <Profile />
          </StudentLayout>
        </AuthGuard>
      } />
      <Route path="/akademik" element={
        <AuthGuard allowedRoles={['student']}>
          <StudentLayout>
            <Academic />
          </StudentLayout>
        </AuthGuard>
      } />
      <Route path="/riasec" element={
        <AuthGuard allowedRoles={['student']}>
          <StudentLayout>
            <RiasecQuiz />
          </StudentLayout>
        </AuthGuard>
      } />
      <Route path="/rekomendasi" element={
        <AuthGuard allowedRoles={['student']}>
          <StudentLayout>
            <Recommendations />
          </StudentLayout>
        </AuthGuard>
      } />
      <Route path="/eksplorasi" element={
        <AuthGuard allowedRoles={['student']}>
          <StudentLayout>
            <CareerCatalog />
          </StudentLayout>
        </AuthGuard>
      } />
      <Route path="/eksplorasi/:careerName" element={
        <AuthGuard allowedRoles={['student']}>
          <StudentLayout>
            <CareerDetail />
          </StudentLayout>
        </AuthGuard>
      } />

      {/* Admin Panel Routes */}
      <Route path="/admin" element={
        <AuthGuard allowedRoles={['admin']}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AuthGuard>
      } />
      <Route path="/admin/alternatif" element={
        <AuthGuard allowedRoles={['admin']}>
          <AdminLayout>
            <CareersConfig />
          </AdminLayout>
        </AuthGuard>
      } />
      <Route path="/admin/konfigurasi" element={
        <AuthGuard allowedRoles={['admin']}>
          <AdminLayout>
            <SawConfig />
          </AdminLayout>
        </AuthGuard>
      } />
      <Route path="/admin/pasar-kerja" element={
        <AuthGuard allowedRoles={['admin']}>
          <AdminLayout>
            <JobMarketConfig />
          </AdminLayout>
        </AuthGuard>
      } />
      <Route path="/admin/mahasiswa" element={
        <AuthGuard allowedRoles={['admin']}>
          <AdminLayout>
            <StudentsConfig />
          </AdminLayout>
        </AuthGuard>
      } />
      <Route path="/admin/riwayat" element={
        <AuthGuard allowedRoles={['admin']}>
          <AdminLayout>
            <HistoryConfig />
          </AdminLayout>
        </AuthGuard>
      } />
      <Route path="/admin/scheduler" element={
        <AuthGuard allowedRoles={['admin']}>
          <AdminLayout>
            <SchedulerConfig />
          </AdminLayout>
        </AuthGuard>
      } />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
