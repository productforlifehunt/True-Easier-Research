import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, Settings, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { authClient } from '../../../lib/supabase';
import { useI18n } from '../../hooks/useI18n';

const AppHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const isActive = (path: string) => {
    if (path === '/easyresearch/dashboard') {
      return location.pathname === path || 
        location.pathname === '/easyresearch/home' ||
        location.pathname.startsWith('/easyresearch/project/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems: Array<{ path: string; labelKey: string }> = [];
  if (user) {
    navItems.push({ path: '/easyresearch/dashboard', labelKey: 'nav.myStudies' });
    navItems.push({ path: '/easyresearch/participant/join', labelKey: 'nav.discover' });
    navItems.push({ path: '/easyresearch/participant-library', labelKey: 'nav.participants' });
    navItems.push({ path: '/easyresearch/templates', labelKey: 'nav.templates' });
  } else {
    navItems.push({ path: '/easyresearch/templates', labelKey: 'nav.templates' });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl" style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
      <div className="max-w-full mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to={user ? '/easyresearch/dashboard' : '/easyresearch'} className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <BarChart3 size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-stone-800">{t('brand.name')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive(item.path) ? 'text-emerald-700 bg-emerald-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                }`}>
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                    <span className="text-[11px] font-semibold text-white">{(user.email?.[0] || 'U').toUpperCase()}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-300" />
                </button>
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg shadow-stone-200/60 border border-stone-100 py-1.5">
                    <div className="px-3.5 py-2.5 border-b border-stone-100">
                      <p className="text-[13px] font-medium text-stone-800 truncate">{user.email}</p>
                    </div>
                    <Link to="/easyresearch/dashboard" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors">
                      {t('nav.myStudies')}
                    </Link>
                    <Link to="/easyresearch/participant/join" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors">
                      {t('nav.discover')}
                    </Link>
                    <Link to="/easyresearch/participant-library" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors">
                      <Users className="w-3.5 h-3.5" /> {t('nav.participants')}
                    </Link>
                    <Link to="/easyresearch/settings" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors">
                      <Settings className="w-3.5 h-3.5" /> {t('common.settings')}
                    </Link>
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button onClick={() => { handleLogout(); setShowUserMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> {t('common.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/easyresearch/auth" className="px-3.5 py-1.5 text-[13px] font-medium text-stone-400 hover:text-stone-600 transition-colors">{t('common.signIn')}</Link>
                <Link to="/easyresearch/auth" className="px-4 py-1.5 text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full transition-all shadow-sm shadow-emerald-200">
                  {t('landing.getStarted')}
                </Link>
              </div>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-stone-50 transition-colors">
              {isMenuOpen ? <X className="w-5 h-5 text-stone-500" /> : <Menu className="w-5 h-5 text-stone-500" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}
                className={`block px-3.5 py-2.5 rounded-lg text-[14px] font-medium ${isActive(item.path) ? 'text-emerald-700 bg-emerald-50' : 'text-stone-500'}`}
                onClick={() => setIsMenuOpen(false)}>
                {t(item.labelKey)}
              </Link>
            ))}
            <div className="pt-3 border-t border-stone-100">
              {user ? (
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-lg text-[14px] font-medium text-red-500">
                  <LogOut size={16} /> {t('common.signOut')}
                </button>
              ) : (
                <Link to="/easyresearch/auth"
                  className="block px-3.5 py-2.5 text-center rounded-full text-[14px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500"
                  onClick={() => setIsMenuOpen(false)}>
                  {t('landing.getStarted')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
