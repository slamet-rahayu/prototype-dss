import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback('Harap isi semua kolom.');
      return;
    }
    const loggedUser = login(email, password);
    setFeedback(`Login berhasil untuk ${loggedUser.email}. Membuka dashboard...`);
    
    setTimeout(() => {
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
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
            Sistem Rekomendasi Karir
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
            Kenali potensimu, tentukan arah karirmu.
          </h1>
          <p className="text-white/80 text-base leading-relaxed mb-8">
            CareerPath membantu mahasiswa tingkat akhir memperoleh rekomendasi karir berdasarkan minat RIASEC, kemampuan akademik, dan kebutuhan pasar kerja.
          </p>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2.5 text-white/90">
              <span className="w-6 h-6 rounded-full bg-white/15 text-xs grid place-items-center font-bold">✓</span>
              <span>Tes minat karir berbasis RIASEC</span>
            </div>
            <div className="flex items-center gap-2.5 text-white/90">
              <span className="w-6 h-6 rounded-full bg-white/15 text-xs grid place-items-center font-bold">✓</span>
              <span>Ranking rekomendasi menggunakan metode SAW</span>
            </div>
            <div className="flex items-center gap-2.5 text-white/90">
              <span className="w-6 h-6 rounded-full bg-white/15 text-xs grid place-items-center font-bold">✓</span>
              <span>Informasi kebutuhan pasar kerja bidang TI</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          © 2026 CareerPath. Sistem Rekomendasi Karir Mahasiswa.
        </div>
      </section>

      {/* Login Area */}
      <section className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-100 animate-pop-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-6 text-primary-dark font-black">
            <span className="w-9 h-9 grid place-items-center rounded-xl bg-primary text-white font-bold text-base">✦</span>
            <span>CareerPath</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Selamat datang</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Masuk untuk melanjutkan proses eksplorasi dan rekomendasi karir Anda.
          </p>

          <form onSubmit={handleSubmit} className="grid gap-5">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-slate-700">Kata Sandi</label>
                <a href="#" onClick={(e) => {e.preventDefault(); setFeedback("Fitur lupa kata sandi masih berupa contoh tampilan.")}} className="text-xs font-bold text-primary-dark hover:underline">
                  Lupa kata sandi?
                </a>
              </div>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
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

            <div className="flex items-center gap-2">
              <input id="remember" type="checkbox" className="w-4 h-4 rounded border-slate-200 text-primary focus:ring-primary/20 accent-primary cursor-pointer" />
              <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                Ingat saya di perangkat ini
              </label>
            </div>

            <button 
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-blue-500/10 active:scale-95"
            >
              Masuk ke CareerPath
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
              Belum memiliki akun?{' '}
              <Link to="/register" className="text-primary-dark font-extrabold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </form>

          {/* Tester note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            <span className="font-bold">Tips Demo:</span> Masuk dengan <span className="font-mono text-slate-600">admin@careerpath.id</span> untuk dashboard Admin.
          </div>
        </div>
      </section>
    </main>
  );
}
