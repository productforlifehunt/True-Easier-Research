import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const AppHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

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
    await supabase.auth.signOut();
    navigate('/easyresearch');
  };

  const isActive = (path: string) => {
    if (path === '/easyresearch/dashboard') {
      return location.pathname === path || location.pathname.startsWith('/easyresearch/project/');
    }
    return location.pathname === path;
  };

  const navItems: Array<{ path: string; label: string }> = [
    { path: '/easyresearch/templates', label: 'Templates' },
  ];

  if (user) {
    navItems.unshift({ path: '/easyresearch/dashboard', label: 'Projects' });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-full mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            to={user ? '/easyresearch/dashboard' : '/easyresearch'} 
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold tracking-tight">E</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">
              Easier
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                    active
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-white">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block text-[13px] font-medium text-slate-500 max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                </button>
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <p className="text-[13px] font-medium text-slate-900 truncate">{user.email}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Researcher</p>
                    </div>
                    <Link
                      to="/easyresearch/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/easyresearch/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => { handleLogout(); setShowUserMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/easyresearch/auth"
                  className="px-3.5 py-1.5 text-[13px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/easyresearch/auth"
                  className="px-4 py-1.5 text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-slate-500" /> : <Menu className="w-5 h-5 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3.5 py-2.5 rounded-lg text-[14px] font-medium ${
                    active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-lg text-[14px] font-medium text-red-500"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <Link
                  to="/easyresearch/auth"
                  className="block px-3.5 py-2.5 text-center rounded-full text-[14px] font-medium text-white bg-slate-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
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
