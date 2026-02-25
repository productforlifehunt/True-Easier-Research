import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Settings } from 'lucide-react';
import AppHeader from './AppHeader';

interface ParticipantLayoutProps {
  children?: React.ReactNode;
}

const ParticipantLayout: React.FC<ParticipantLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract projectId from URL if present
  const projectId = location.pathname.match(/\/participant\/([^\/]+)/)?.[1];

  const tabs = [
    { id: 'home', path: '/easyresearch/home', icon: Home, label: 'Home' },
    { id: 'survey', path: projectId ? `/easyresearch/participant/${projectId}/timeline` : '/easyresearch/home', icon: FileText, label: 'Survey' },
    { id: 'settings', path: '/easyresearch/user/settings', icon: Settings, label: 'Settings' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path.split('/timeline')[0] + '/');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AppHeader />
      
      {/* Main Content */}
      <main className="flex-1 pt-16 pb-20 md:pb-0">
        {children || <Outlet />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white"
        style={{ 
          borderTop: '1px solid var(--border-light)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)',
          zIndex: 50
        }}
      >
        <div className="flex items-center justify-around" style={{ height: '64px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center flex-1 py-2"
                style={{ color: active ? 'var(--color-green)' : 'var(--text-secondary)' }}
              >
                <Icon size={24} style={{ marginBottom: '4px' }} />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ParticipantLayout;
