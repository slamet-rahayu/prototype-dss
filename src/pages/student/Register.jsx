import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setFeedback('Harap isi semua kolom.');
      return;
    }
    setFeedback(`Pendaftaran berhasil untuk ${email}. Silakan masuk...`);
    
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      {/* Side Brand Illustration */}
      <section className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-primary-dark via-blue-600 to-primary text-white p-16 flex-col justify-between">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full border border-white/10 translate-x-32 -translate-y-32 bg-white/5" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full border border-white/10 -translate-x-20 translate-y-20 bg-white/5" />

        <div className="flex items-center gap-3 relative z-10 font-bold text-lg">
          <span className="w-10 h-10 grid place-items-center rounded-xl bg-white/15 border border-white/20">✦</span>
          <span className="text-xl font-black">CareerPath</span>
        </div>

        <div className="relative z-10 max-w-lg my-12">
          <span className="inline-flex px-3 py-1 border border-white/20 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            Pendaftaran Mahasiswa
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
            Langkah awal menuju karir TI impianmu.
          </h1>
          <p className="text-white/80 text-base leading-relaxed mb-8">
            Daftarkan diri Anda untuk menganalisis kecocokan minat, mengelola data akademik, dan mengakses informasi pasar kerja terkini.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          © 2026 CareerPath. Sistem Rekomendasi Karir Mahasiswa.
        </div>
      </section>

      {/* Register Area */}
      <section className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-100 animate-pop-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-6 text-primary-dark font-black">
            <span className="w-9 h-9 grid place-items-center rounded-xl bg-primary text-white font-bold text-base">✦</span>
            <span>CareerPath</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Daftar Akun</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Lengkapi data di bawah ini untuk membuat akun mahasiswa baru.
          </p>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-xs font-bold text-slate-700">Nama Lengkap</label>
              <div className="relative">
                <input 
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  required
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-700">Email</label>
              <div className="relative">
                <input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  required
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-700">Kata Sandi</label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Buat kata sandi minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  required
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-blue-500/10 active:scale-95"
            >
              Daftar Akun Baru
            </button>

            {feedback && (
              <div className="p-3 border border-emerald-200 bg-emerald-50 rounded-xl text-emerald-800 text-xs leading-relaxed">
                {feedback}
              </div>
            )}

            <div className="flex items-center gap-3 my-1">
              <span className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Atau</span>
              <span className="flex-1 h-px bg-slate-200" />
            </div>

            <p className="text-center text-xs text-slate-500">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-primary-dark font-extrabold hover:underline">
                Masuk
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
