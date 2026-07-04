import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Navbar() {
  const { user, logout, login } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleToggle = (e) => {
    const roleSelected = e.target.value;
    if (roleSelected === 'admin') {
      login('admin@careerpath.id', 'password');
      navigate('/admin');
    } else {
      login('mameriyadi6@gmail.com', 'password');
      navigate('/');
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-dark bg-blue-50/70' : 'text-slate-500 hover:text-primary-dark hover:bg-slate-50';
  };

  return (
    <header className="sticky top-0 z-40 h-[72px] flex items-center justify-between gap-6 px-6 md:px-12 bg-white/90 border-b border-slate-200/80 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2.5 text-lg font-black text-primary-dark tracking-tight hover:opacity-95 transition-opacity">
        <span className="w-10 h-10 grid place-items-center rounded-xl text-white font-bold bg-gradient-to-br from-primary-dark to-primary shadow-lg shadow-blue-500/20 text-lg">
          ✦
        </span>
        <span>CareerPath</span>
      </Link>

      {user && user.role === 'student' && (
        <nav className="hidden md:flex items-center gap-1.5">
          <Link to="/" className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isActive('/')}`}>
            Beranda
          </Link>
          <Link to="/akademik" className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isActive('/akademik')}`}>
            Data Akademik
          </Link>
          <Link to="/riasec" className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isActive('/riasec')}`}>
            Tes RIASEC
          </Link>
          <Link to="/rekomendasi" className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isActive('/rekomendasi')}`}>
            Hasil Rekomendasi
          </Link>
          <Link to="/profile" className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isActive('/profile')}`}>
            Profil
          </Link>
        </nav>
      )}

      <div className="flex items-center gap-3">
        {/* Role Toggle for Prototype Convenience */}
        {user && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <span className="text-slate-400 font-bold">Role:</span>
            <select 
              value={user.role} 
              onChange={handleRoleToggle}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="student">Mahasiswa</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            <Link 
              to={user.role === 'admin' ? '/admin' : '/profile'} 
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200/80 hover:border-blue-300 bg-white hover:bg-blue-50/30 text-slate-800 text-sm font-bold transition-all duration-200"
            >
              <span className="w-7 h-7 grid place-items-center rounded-full bg-primary-light text-primary-dark font-extrabold text-[11px]">
                {user.initials || 'US'}
              </span>
              <span className="hidden sm:inline pr-1 font-bold text-slate-700">{user.name}</span>
            </Link>
            <button 
              onClick={() => { logout(); navigate('/login'); }} 
              className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-danger hover:border-danger transition-all duration-200"
            >
              Keluar
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all duration-200 shadow-md shadow-blue-500/10"
          >
            Masuk
          </Link>
        )}
      </div>
    </header>
  );
}
