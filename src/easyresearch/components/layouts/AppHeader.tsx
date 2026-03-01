import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { authClient } from '../../../lib/supabase';

const AppHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      return location.pathname === path || location.pathname.startsWith('/easyresearch/project/');
    }
    return location.pathname === path;
  };

  const navItems: Array<{ path: string; label: string }> = [];
  if (user) {
    navItems.push({ path: '/easyresearch/home', label: 'My Studies' });
    navItems.push({ path: '/easyresearch/participant/join', label: 'Discover' });
    navItems.push({ path: '/easyresearch/templates', label: 'Templates' });
  } else {
    navItems.push({ path: '/easyresearch/templates', label: 'Templates' });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl" style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
      <div className="max-w-full mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to={user ? '/easyresearch/home' : '/easyresearch'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-200">
              <span className="text-white text-sm font-bold tracking-tight">E</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-stone-800">Easier</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive(item.path) ? 'text-emerald-700 bg-emerald-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                }`}>
                {item.label}
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
                    <Link to="/easyresearch/home" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors">
                      My Studies
                    </Link>
                    <Link to="/easyresearch/participant/join" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors">
                      Discover
                    </Link>
                    <Link to="/easyresearch/settings" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors">
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </Link>
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button onClick={() => { handleLogout(); setShowUserMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/easyresearch/auth" className="px-3.5 py-1.5 text-[13px] font-medium text-stone-400 hover:text-stone-600 transition-colors">Sign In</Link>
                <Link to="/easyresearch/auth" className="px-4 py-1.5 text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full transition-all shadow-sm shadow-emerald-200">
                  Get Started
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
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-stone-100">
              {user ? (
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-lg text-[14px] font-medium text-red-500">
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <Link to="/easyresearch/auth"
                  className="block px-3.5 py-2.5 text-center rounded-full text-[14px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500"
                  onClick={() => setIsMenuOpen(false)}>
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
