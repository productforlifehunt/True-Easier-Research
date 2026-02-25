import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Plus, BarChart3, Settings } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();

  // Only show bottom nav if user is logged in
  if (!user) {
    return null;
  }
  
  const tabs = [
    { id: 'home', path: '/', icon: Home, label: t('home') },
    { id: 'survey', path: '/timeline', icon: FileText, label: t('survey') },
    { id: 'add', path: '/add-entry', icon: Plus, label: t('add'), special: true, action: 'add' },
    { id: 'summary', path: '/summary', icon: BarChart3, label: t('summary') },
    { id: 'settings', path: '/settings', icon: Settings, label: t('settings') }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white" style={{ 
      borderTop: '1px solid var(--border-light)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      <div className="flex items-center justify-around relative" style={{ height: '64px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          if (tab.special) {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  navigate(tab.path);
                  if (tab.action === 'add') {
                    setTimeout(() => {
                      const addBtn = document.querySelector('[data-add-new-entry]');
                      if (addBtn) (addBtn as HTMLElement).click();
                    }, 100);
                  }
                }}
                className="flex flex-col items-center justify-center flex-1"
              >
                <div className="rounded-full flex items-center justify-center relative"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    width: '60px',
                    height: '60px',
                    marginTop: '-30px',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3), 0 4px 10px rgba(0, 0, 0, 0.15)',
                    border: '3px solid #10b981',
                    opacity: 1,
                    position: 'relative',
                    zIndex: 10
                  }}
                >
                  <Plus style={{ width: '36px', height: '36px', color: '#10b981', stroke: '#10b981', strokeWidth: 4, fill: 'none' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--color-green)', marginTop: '6px' }}>{tab.label}</span>
              </button>
            );
          }
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                navigate(tab.path);
                if (tab.action === 'summary') {
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                  }, 100);
                }
              }}
              className="flex flex-col items-center justify-center flex-1"
              style={{
                color: active ? 'var(--color-green)' : 'var(--text-secondary)'
              }}
            >
              <Icon style={{ width: '24px', height: '24px', marginBottom: '4px' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.3px' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
