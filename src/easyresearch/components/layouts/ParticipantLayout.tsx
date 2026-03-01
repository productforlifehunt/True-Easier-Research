import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Settings } from 'lucide-react';
import AppHeader from './AppHeader';

const ParticipantLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', path: '/easyresearch/home', icon: Home, label: 'Home' },
    { id: 'join', path: '/easyresearch/participant/join', icon: FileText, label: 'Join Study' },
    { id: 'settings', path: '/easyresearch/user/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/easyresearch/home' && location.pathname.startsWith('/easyresearch/participant/') && !location.pathname.includes('/join'));

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30">
      <AppHeader />

      {/* Main content — fixed offsets for header (56px) + bottom nav (60px + safe-area) */}
      <main className="flex-1 pt-14 pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
        <Outlet />
      </main>

      {/* Persistent bottom nav — ALWAYS the same 3 tabs */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm"
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -1px 8px rgba(0,0,0,0.04)',
          zIndex: 50,
        }}
      >
        <div className="flex items-center justify-around" style={{ height: '60px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center flex-1 gap-0.5"
              >
                <Icon size={20} style={{ color: active ? '#10b981' : '#a8a29e' }} />
                <span className="text-[10px] font-medium" style={{ color: active ? '#10b981' : '#a8a29e' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ParticipantLayout;
