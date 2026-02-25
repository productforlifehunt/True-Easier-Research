import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BarChart3, User, Settings, LogOut, Bell } from 'lucide-react';

const ResearcherHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/easyresearch/auth');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: 'var(--border-light)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/easyresearch/dashboard')}>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                EasierResearch
              </h1>
              <span className="text-xs font-normal text-gray-500">Research Platform</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/easyresearch/dashboard')}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/easyresearch/participants')}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              Participants
            </button>
            <button
              onClick={() => navigate('/easyresearch/analytics')}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              Analytics
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>
            
            <button
              onClick={() => navigate('/easyresearch/settings')}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>

            <div className="h-6 w-px bg-gray-300" />

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/easyresearch/settings')}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-green)' }}
                >
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium hidden lg:block" style={{ color: 'var(--text-primary)' }}>
                  {user?.email?.split('@')[0] || 'Researcher'}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ResearcherHeader;
