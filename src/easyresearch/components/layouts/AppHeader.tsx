import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, LayoutDashboard, BarChart3 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { authClient } from '../../../lib/supabase';
import { useI18n } from '../../hooks/useI18n';
import LanguageSelector from '../LanguageSelector';

const AppHeader: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authClient.auth.signOut();
    navigate('/easyresearch');
  };

  const desktopNavLinks = [
    { path: '/easyresearch/participant/join', label: t('nav.joinStudies') },
    { path: '/easyresearch/participant-library', label: t('nav.participants') },
    { path: '/easyresearch/features', label: t('nav.features') },
    { path: '/easyresearch/templates', label: t('nav.templates') },
  ];

  const mobileNavLinks = [
    { path: '/easyresearch/participant-library', label: t('nav.participants') },
  ];

  const isNavActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100/60">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-5">
            <Link
              to={user ? '/easyresearch/dashboard' : '/easyresearch'}
              className="flex items-center gap-2 group"
            >
              <div className="w-7 h-7 min-w-[28px] min-h-[28px] max-w-[28px] max-h-[28px] rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-200/40">
                <BarChart3 size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[14px] font-semibold tracking-tight text-stone-800">
                {t('brand.name')}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center">
              {desktopNavLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                    isNavActive(item.path)
                      ? 'text-emerald-700 bg-emerald-50/80'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile nav */}
            <nav className="md:hidden flex items-center">
              {mobileNavLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 py-1 rounded-md text-[12px] font-medium transition-colors ${
                    isNavActive(item.path)
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Language + Auth */}
          <div className="flex items-center gap-1.5">
            <LanguageSelector compact />

            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-full hover:bg-stone-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-stone-300" />
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-lg shadow-stone-200/50 border border-stone-100 py-1 overflow-hidden">
                    <div className="px-3 py-2 border-b border-stone-50">
                      <p className="text-[12px] font-medium text-stone-700 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/easyresearch/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-[13px] text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setShowUserMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('common.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/easyresearch/auth"
                  className="hidden sm:inline-block px-3 py-1.5 text-[13px] font-medium text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {t('common.signIn')}
                </Link>
                <Link
                  to="/easyresearch/auth"
                  className="px-4 py-1.5 text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full transition-all shadow-sm"
                >
                  {t('landing.getStarted')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
