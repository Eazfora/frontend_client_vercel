import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Globe, ArrowRight, TrendingUp, AlertTriangle, Users, BarChart3, Shield, Zap, Mail } from 'lucide-react';

function DashboardMockup() {
  const bars = [40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95];
  return (
    <div className="relative mx-auto max-w-4xl mt-16">
      <div className="absolute -inset-4 bg-gradient-to-r from-brand-400/20 via-brand-500/10 to-purple-400/20 rounded-3xl blur-2xl"></div>
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 mx-8">
            <div className="bg-white dark:bg-slate-800 rounded-md px-3 py-1 text-xs text-slate-400 text-center border border-slate-200 dark:border-slate-700">app.omnisight.io/dashboard</div>
          </div>
        </div>
        <div className="flex">
          {/* Mini sidebar */}
          <div className="w-14 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700 py-4 flex flex-col items-center gap-4">
            <div className="w-7 h-7 bg-brand-500 rounded-md"></div>
            <div className="w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded"></div>
            <div className="w-5 h-5 bg-brand-200 dark:bg-brand-800 rounded"></div>
            <div className="w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded"></div>
            <div className="w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded"></div>
          </div>
          {/* Content area */}
          <div className="flex-1 p-5 space-y-4">
            {/* Stat cards row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Pendapatan', val: 'Rp 2,4M', color: 'bg-brand-500' },
                { label: 'Pertumbuhan', val: '18.2%', color: 'bg-emerald-500' },
                { label: 'Peringatan', val: '3', color: 'bg-rose-500' },
                { label: 'Churn', val: '4.1%', color: 'bg-amber-500' },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</span>
                    <div className={`w-2 h-2 rounded-full ${s.color}`}></div>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{s.val}</p>
                </div>
              ))}
            </div>
            {/* Chart area */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Prakiraan Pendapatan</span>
                <div className="flex gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-600"></span>Aktual</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-300"></span>Prediksi AI</span>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-28">
                {bars.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full bg-brand-500/80 rounded-t" style={{ height: `${h}%` }}></div>
                    <div className="w-full bg-brand-200 dark:bg-brand-800 rounded-t" style={{ height: `${h * 0.7}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const data = [30, 45, 35, 60, 50, 75, 65, 85, 70, 90, 80, 95];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Akurasi Prediktif</h4>
        <span className="text-xs font-semibold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded-full">Live</span>
      </div>
      <div className="flex items-end gap-2 h-40 mb-4">
        {data.map((h, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-md transition-all hover:from-brand-700 hover:to-brand-500" style={{ height: `${h}%` }}></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{ l: 'Precision', v: '96.4%' }, { l: 'Recall', v: '94.8%' }, { l: 'F1-Score', v: '95.6%' }].map((m) => (
          <div key={m.l} className="text-center p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{m.v}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{m.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'id' : 'en');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center"><TrendingUp className="text-white w-5 h-5" /></div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">OmniSight<span className="text-brand-500">BI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Globe className="w-4 h-4" /><span className="text-xs font-bold uppercase">{i18n.language}</span>
            </button>
            <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 flex items-center gap-2">
              {t('landing.login_btn')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-brand-100 dark:border-brand-800">
            <Zap className="w-3.5 h-3.5" /> {t('landing.powered_by')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">{t('landing.title')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">{t('landing.subtitle')}</p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all hover:scale-105 hover:shadow-xl hover:shadow-brand-500/25 flex items-center gap-2">
              {t('landing.login_btn')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <DashboardMockup />
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Intelijen Kelas Enterprise</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Tiga pilar analitik berbasis AI yang dirancang untuk operasi ritel modern.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('landing.features.forecast')}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t('landing.features.forecast_desc')}</p>
          </div>
          <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('landing.features.restock')}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t('landing.features.restock_desc')}</p>
          </div>
          <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('landing.features.churn')}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t('landing.features.churn_desc')}</p>
          </div>
        </div>
      </section>

      {/* Why OmniSight BI? */}
      <section className="bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Mengapa OmniSight BI?</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">Dibangun di atas pipeline machine learning berkualitas produksi, OmniSight memberikan kekuatan prediktif nyata — bukan sekadar dashboard.</p>
              <div className="space-y-6">
                {[
                  { icon: BarChart3, title: 'Prakiraan Real-Time', desc: 'Model dilatih pada data historis Anda, diperbarui secara kontinu.' },
                  { icon: Shield, title: 'Deteksi Anomali', desc: 'Deteksi outlier statistik mengidentifikasi gangguan rantai pasok secara instan.' },
                  { icon: Zap, title: 'Wawasan Aksi', desc: 'Setiap prediksi dilengkapi rekomendasi aksi dan skor kepercayaan.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <AnalyticsMockup />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center"><TrendingUp className="text-white w-4 h-4" /></div>
                <span className="font-bold text-lg text-white">OmniSight<span className="text-brand-400">BI</span></span>
              </div>
              <p className="text-sm leading-relaxed">Intelijen bisnis berbasis AI untuk perusahaan modern.</p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
              </div>
            </div>
            {[
              { title: 'Produk', links: ['Dashboard', 'Prakiraan AI', 'Pengisian Stok', 'Analisis Churn'] },
              { title: 'Sumber Daya', links: ['Dokumentasi', 'Referensi API', 'Model ML', 'Changelog'] },
              { title: 'Perusahaan', links: ['Tentang Kami', 'Blog', 'Karir', 'Kontak'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (<li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p>© 2026 OmniSight Analytics Studio — Powered by PJK-GM017 Engine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
