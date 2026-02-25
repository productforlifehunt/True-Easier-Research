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
    <div className="min-h-screen md:flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex items-center gap-2">
          <BarChart3 style={{ color: 'var(--color-green)' }} size={24} />
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>EasierResearch</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-green-50' : ''}`}
                    style={{ color: isActive ? 'var(--color-green)' : 'var(--text-secondary)' }}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-8 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm px-4 py-2" style={{ color: 'var(--text-secondary)' }}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Show at md+ instead of lg+ */}
      <div className="hidden md:flex w-64 bg-white shadow-sm flex-col" style={{ borderRight: '1px solid var(--border-light)' }}>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 style={{ color: 'var(--color-green)' }} size={32} />
            <div>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                EasierResearch
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Research Platform
              </p>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive ? 'bg-green-50' : ''
                  }`}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                  style={{
                    color: isActive ? 'var(--color-green)' : 'var(--text-secondary)'
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
            {user && (
              <div className="mb-4">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.email}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Researcher Account
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm hover:opacity-80 w-full px-4 py-2 rounded-lg transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              style={{ color: 'var(--text-secondary)' }}
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
