import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  BarChart3,
  Bell,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const AppHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-white"
      style={{ borderBottom: '1px solid var(--border-light)' }}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={user ? '/easyresearch/dashboard' : '/easyresearch'} 
            className="flex items-center space-x-3"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                EasierResearch
              </span>
              <span className="hidden sm:block text-xs" style={{ color: 'var(--text-secondary)' }}>
                Research Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {navItems.length > 0 && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-green-50' : ''
                    }`}
                    style={{ color: active ? 'var(--color-green)' : 'var(--text-secondary)' }}
                    onMouseEnter={(e) => !active && (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => !active && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <button
                  className="p-2 rounded-lg transition-colors hidden sm:block"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Notifications"
                >
                  <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
                </button>
                
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('user')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-green)' }}
                    >
                      <User size={16} className="text-white" />
                    </div>
                    <span className="hidden lg:block text-sm font-medium truncate max-w-[150px]" style={{ color: 'var(--text-primary)' }}>
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 hidden sm:block" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  {activeDropdown === 'user' && (
                    <div className="absolute top-full right-0 w-56 bg-white rounded-xl shadow-xl py-2 mt-1" style={{ border: '1px solid var(--border-light)' }}>
                      <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.email}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Account
                        </div>
                      </div>
                      <Link 
                        to="/easyresearch/dashboard" 
                        className="flex items-center px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/easyresearch/settings" 
                        className="flex items-center px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Settings className="w-4 h-4 mr-3" /> Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <LogOut className="w-4 h-4 mr-3" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link 
                  to="/easyresearch/auth"
                  className="px-4 py-2 text-sm font-medium hover:opacity-80 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Sign In
                </Link>
                <Link 
                  to="/easyresearch/auth"
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-sm"
                  style={{ backgroundColor: 'var(--color-green)' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg" style={{ borderTop: '1px solid var(--border-light)' }}>
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    active ? 'bg-green-50' : ''
                  }`}
                  style={{ color: active ? 'var(--color-green)' : 'var(--text-primary)' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
              {user ? (
                <button 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              ) : (
                <Link 
                  to="/easyresearch/auth" 
                  className="block px-4 py-3 text-center rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--color-green)' }}
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
