import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BarChart3, LayoutDashboard, Plus, Users, Settings, LogOut, FileText, Menu, X } from 'lucide-react';

interface EasyResearchLayoutProps {
  children: React.ReactNode;
}

const EasierResearchLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/easyresearch');
  };

  const navItems = [
    { path: '/easyresearch/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/easyresearch/dashboard?create=true', label: 'Create Survey', icon: Plus },
    { path: '/easyresearch/participants', label: 'Participants', icon: Users },
    { path: '/easyresearch/responses', label: 'Responses', icon: FileText },
    { path: '/easyresearch/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/easyresearch/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen md:flex" style={{ backgroundColor: '#f9faf8' }}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white" style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
          <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="Easier Research" className="w-6 h-6" />
          <span className="font-bold text-stone-800">Easier Research</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive ? 'bg-emerald-50' : ''}`}
                    style={{ color: isActive ? '#059669' : '#78716c' }}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-8 pt-4 border-t border-stone-100">
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm px-4 py-2 text-stone-500">
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white shadow-sm flex-col" style={{ borderRight: '1px solid rgba(16,185,129,0.08)' }}>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-8">
            <img src="/favicon.svg" alt="Easier Research" className="w-8 h-8" />
            <div>
              <h2 className="font-bold text-lg text-stone-800">Easier Research</h2>
              <p className="text-xs text-stone-400">Research Platform</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/easyresearch/dashboard' && location.pathname.startsWith('/easyresearch/project/'));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : 'hover:bg-stone-50'
                  }`}
                  style={{
                    color: isActive ? '#059669' : '#78716c'
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-stone-100">
            {user && (
              <div className="mb-4">
                <p className="text-sm font-medium truncate text-stone-700">
                  {user.email}
                </p>
                <p className="text-xs text-stone-400">
                  Researcher Account
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm hover:opacity-80 w-full px-4 py-2 rounded-xl transition-colors hover:bg-stone-50 text-stone-500"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default EasierResearchLayout;