import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BarChart3, LayoutDashboard, Plus, Users, Settings, LogOut } from 'lucide-react';

interface EasyResearchLayoutProps {
  children: React.ReactNode;
}

const EasierResearchLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/easyresearch');
  };

  const navItems = [
    { path: '/easyresearch/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/easyresearch/create-survey', label: 'Create Survey', icon: Plus },
    { path: '/easyresearch/participants', label: 'Participants', icon: Users },
    { path: '/easyresearch/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/easyresearch/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm" style={{ borderRight: '1px solid var(--border-light)' }}>
        <div className="p-6">
           <div className="flex items-center gap-3 mb-8">
            <img src="/favicon.svg" alt="Easier Research" className="w-8 h-8" />
            <div>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Easier Research
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Research Platform
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
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

          <div className="mt-auto pt-8 border-t" style={{ borderColor: 'var(--border-light)' }}>
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
              className="flex items-center gap-2 text-sm hover:opacity-80"
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
