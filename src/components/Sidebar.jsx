import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  Briefcase, 
  Users, 
  History, 
  Clock, 
  LogOut,
  UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, login } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleToggle = (e) => {
    const roleSelected = e.target.value;
    if (roleSelected === 'student') {
      login('mameriyadi6@gmail.com', 'password');
      navigate('/');
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Alternatif Karir', path: '/admin/alternatif', icon: BookOpen },
    { name: 'Konfigurasi Rekomendasi', path: '/admin/konfigurasi', icon: Settings },
    { name: 'Data Pasar Kerja', path: '/admin/pasar-kerja', icon: Briefcase },
    { name: 'Mahasiswa', path: '/admin/mahasiswa', icon: Users },
    { name: 'Riwayat Rekomendasi', path: '/admin/riwayat', icon: History },
    { name: 'Manajemen Scheduler', path: '/admin/scheduler', icon: Clock },
  ];

  const isActive = (path) => {
    return location.pathname === path 
      ? 'bg-white/20 text-white shadow-inner font-extrabold border-l-4 border-white' 
      : 'text-white/80 hover:text-white hover:bg-white/10 hover:translate-x-1';
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-primary-dark via-blue-600 to-primary text-white flex flex-col px-4 py-6 shadow-xl z-20">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2.5 px-2 mb-8 hover:opacity-95 transition-opacity">
        <span className="w-10 h-10 grid place-items-center rounded-xl bg-white/15 border border-white/20 font-bold text-lg">
          ✦
        </span>
        <span className="text-xl font-black tracking-tight">CareerPath</span>
      </Link>

      <div className="px-2 mb-6">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 block mb-3">
          Panel Administrator
        </span>
        
        {/* Prototype convenience role toggler */}
        <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs mb-4">
          <UserCheck className="w-3.5 h-3.5 text-white/70" />
          <select 
            value={user?.role || 'admin'} 
            onChange={handleRoleToggle}
            className="bg-transparent font-bold text-white outline-none cursor-pointer w-full text-xs"
          >
            <option value="admin" className="text-slate-800">Admin</option>
            <option value="student" className="text-slate-800">Mahasiswa</option>
          </select>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name}
              to={item.path} 
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${isActive(item.path)}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin User Profile Section */}
      <div className="mt-auto border-t border-white/15 pt-5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 grid place-items-center rounded-full bg-white/20 text-white font-extrabold text-xs">
            {user?.initials || 'AD'}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold truncate leading-tight">{user?.name || 'Administrator'}</h4>
            <span className="text-[10px] text-white/60 truncate block">{user?.email || 'admin@careerpath.id'}</span>
          </div>
        </div>
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors duration-150"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
