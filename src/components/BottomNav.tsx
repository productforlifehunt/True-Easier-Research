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

  if (!user) return null;
  
  const tabs = [
    { id: 'home', path: '/', icon: Home, label: t('home') },
    { id: 'survey', path: '/timeline', icon: FileText, label: t('survey') },
    { id: 'add', path: '/add-entry', icon: Plus, label: t('add'), special: true },
    { id: 'summary', path: '/summary', icon: BarChart3, label: t('summary') },
    { id: 'settings', path: '/settings', icon: Settings, label: t('settings') }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname === path;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 md:hidden"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderTop: '0.5px solid rgba(0, 0, 0, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000
      }}
    >
      <div className="flex items-end justify-around" style={{ height: '56px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          if (tab.special) {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center flex-1 -mt-3"
              >
                <div 
                  className="rounded-full flex items-center justify-center mb-0.5"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  <Plus style={{ width: '24px', height: '24px', color: 'white', strokeWidth: 2.5 }} />
                </div>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: '500', 
                  letterSpacing: '0.02em', 
                  color: 'var(--color-green)',
                }}>
                  {tab.label}
                </span>
              </button>
            );
          }
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 pb-1"
              style={{ opacity: active ? 1 : 0.45 }}
            >
              <Icon style={{ 
                width: '22px', 
                height: '22px', 
                marginBottom: '2px',
                color: active ? 'var(--color-green)' : 'var(--text-primary)',
                strokeWidth: active ? 2 : 1.5
              }} />
              <span style={{ 
                fontSize: '10px', 
                fontWeight: active ? '600' : '400', 
                letterSpacing: '0.02em',
                color: active ? 'var(--color-green)' : 'var(--text-primary)'
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;