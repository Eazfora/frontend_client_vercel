import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // TAMBAHKAN useNavigate
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, Mail, Lock, Eye, EyeOff, Moon, Sun, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // AMBIL FUNGSI login DARI CONTEXT
  const { login } = useAuth(); 
  const { theme, toggleTheme } = useTheme();
  
  // INISIALISASI navigate
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // PANGGIL FUNGSI LOGIN DARI AUTH CONTEXT
      await login(email, password); 
      
      // JIKA BERHASIL, ARAHKAN KE /app/dashboard
      navigate('/app/dashboard'); 
      
    } catch (err: any) {
      const message = err.response?.data?.message || "Login gagal, cek email atau password Anda.";
      setError(message);
      console.log("DEBUG ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-200">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
              OmniSight<span className="text-brand-500">BI</span>
            </span>
          </Link>
          <p className="mt-3 text-slate-500 dark:text-slate-400">Masuk ke akun Anda</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@omnisight.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Masuk <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Belum punya akun?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold">
              Daftar sekarang
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-slate-400 dark:text-slate-500">
          Powered by PJK-GM017 Engine • © 2026 OmniSight Analytics
        </p>
      </div>
    </div>
  );
}