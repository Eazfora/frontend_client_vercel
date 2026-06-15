import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Users,
  Search,
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  Globe,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import AIAssistant from './AIAssistant';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const navItems = [
  { name: 'dashboard.overview', path: '/app/dashboard', icon: LayoutDashboard },
  { name: 'dashboard.forecast', path: '/app/forecast', icon: TrendingUp },
  { name: 'dashboard.inventory', path: '/app/inventory', icon: AlertTriangle },
  { name: 'dashboard.customers', path: '/app/customers', icon: Users },
];

export default function MainLayout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentPage = navItems.find((item) => location.pathname.startsWith(item.path));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-200">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
    <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-20'}
        `}
      >
        {/* Logo */}
       <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/app/dashboard" className={`flex items-center gap-2.5 transition-all ${sidebarOpen ? '' : 'lg:justify-center lg:w-full lg:px-0'}`}>
            <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            {/* Teks Logo hanya muncul jika sidebar terbuka, atau di layar HP */}
            <span className={`font-bold text-xl text-slate-900 dark:text-white tracking-tight ${sidebarOpen ? 'block' : 'lg:hidden'}`}>
              OmniSight<span className="text-brand-500">BI</span>
            </span>
          </Link>
          {/* Tombol X untuk Mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t('dashboard.main_menu')}
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                // Di mobile tutup sidebar kalau di klik
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className={`group flex items-center ${sidebarOpen ? 'justify-between px-3' : 'justify-center lg:px-0'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                // Tooltip tambahan saat sidebar tertutup
                title={!sidebarOpen ? t(item.name) : ''} 
              >
                <div className={`flex items-center ${sidebarOpen ? 'gap-3' : ''}`}>
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-brand-100 dark:bg-brand-800/50'
                        : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                  </div>
                  {/* Teks Menu disembunyikan jika tertutup */}
                  <span className={`${sidebarOpen ? 'block' : 'hidden'}`}>
                    {t(item.name)}
                  </span>
                </div>
                {isActive && sidebarOpen && <ChevronRight className="w-4 h-4 text-brand-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer`} title={!sidebarOpen ? 'Logout' : ''}>
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            
            <div className={`flex-1 min-w-0 ${sidebarOpen ? 'block' : 'hidden'}`}>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || ''}</p>
            </div>
            
            {/* Tombol Logout (Jika tertutup, cukup klik foto profil saja untuk fitur logout/menu) */}
            {sidebarOpen && (
              <button onClick={logout}>
                <LogOut className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0" />
              </button>
            )}
          </div>
        </div>
      </aside>

      

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header / Topbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 transition-colors duration-200 flex-shrink-0">
          <div className="flex items-center gap-4">
           <button
              onClick={() => setSidebarOpen(!sidebarOpen)} // Ubah ini jadi toggle
              // Hapus class 'lg:hidden'
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white p-1 transition-transform"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-400 dark:text-slate-500">Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {currentPage ? t(currentPage.name) : 'Page'}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:block max-w-sm w-full mx-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder={t('dashboard.search_placeholder')}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900 transition-all outline-none"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Globe className="w-4.5 h-4.5" />
              <span className="text-xs font-bold uppercase hidden sm:inline">{i18n.language}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="relative text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>
            <button className="text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Settings className="w-5 h-5" />
            </button>

            {/* Profile Avatar */}
            <div className="relative ml-1">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-md hover:shadow-lg transition-shadow"
              >
                <User className="w-4 h-4 text-white" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500">{user?.email || ''}</p>
                  </div>
                  <button className="w-full px-4 py-2 text-sm text-left text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4" /> {t('dashboard.profile')}
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-left text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> {t('dashboard.settings')}
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                    <Link
                      to="/"
                      onClick={logout}
                      className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> {t('dashboard.sign_out')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 relative">
          <Outlet />
          <AIAssistant />
        </div>
      </main>
    </div>
  );
}
