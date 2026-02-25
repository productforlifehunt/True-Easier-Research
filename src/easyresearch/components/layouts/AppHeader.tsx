import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, Settings, Bell } from 'lucide-react';
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
    { path: '/easyresearch/pricing', label: 'Pricing' },
  ];

  if (user) {
    navItems.unshift({ path: '/easyresearch/dashboard', label: 'Projects' });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
      <div className="max-w-full mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            to={user ? '/easyresearch/dashboard' : '/easyresearch'} 
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold tracking-tight">Er</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
              EasierResearch
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
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
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
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-emerald-700">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block text-[13px] font-medium text-neutral-600 max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-black/[0.06] py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3.5 py-2.5 border-b border-black/[0.04]">
                      <p className="text-[13px] font-medium text-neutral-900 truncate">{user.email}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Researcher</p>
                    </div>
                    <Link
                      to="/easyresearch/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/easyresearch/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </Link>
                    <div className="border-t border-black/[0.04] mt-1 pt-1">
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
                  className="px-3.5 py-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/easyresearch/auth"
                  className="px-4 py-1.5 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-neutral-600" /> : <Menu className="w-5 h-5 text-neutral-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-black/[0.04]">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3.5 py-2.5 rounded-lg text-[14px] font-medium ${
                    active ? 'text-emerald-700 bg-emerald-50' : 'text-neutral-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-black/[0.04]">
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
                  className="block px-3.5 py-2.5 text-center rounded-lg text-[14px] font-medium text-white bg-emerald-600"
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
