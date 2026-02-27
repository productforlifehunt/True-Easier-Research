import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Plus, BarChart3, Settings, MessageSquare } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Only show bottom nav if user is logged in
  if (!user) {
    return null;
  }
  
  const tabs = [
    { id: 'home', path: '/', icon: Home, label: t('home') },
    { id: 'survey', path: '/timeline', icon: FileText, label: t('survey') },
    { id: 'summary', path: '/summary', icon: BarChart3, label: language === 'zh' ? '汇总' : 'Summary' },
    { id: 'interview', path: '/interview', icon: MessageSquare, label: language === 'zh' ? '访谈' : 'Interview' },
    { id: 'settings', path: '/settings', icon: Settings, label: t('settings') }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Floating Add Button - bottom right above bottom bar */}
      <button
        onClick={() => navigate('/add-entry')}
        className="fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          bottom: 'calc(76px + env(safe-area-inset-bottom))',
          right: '20px',
          width: '56px',
          height: '56px',
          backgroundColor: '#10b981',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Plus style={{ width: '28px', height: '28px', color: 'white', strokeWidth: 3 }} />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white" style={{ 
        borderTop: '1px solid var(--border-light)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)',
        zIndex: 40
      }}>
        <div className="flex items-center justify-around relative" style={{ height: '64px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  navigate(tab.path);
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                  }, 100);
                }}
                className="flex flex-col items-center justify-center flex-1"
                style={{
                  color: active ? 'var(--color-green)' : 'var(--text-secondary)'
                }}
              >
                <Icon style={{ width: '22px', height: '22px', marginBottom: '3px' }} />
                <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.3px' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
