import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EasyResearchBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const shouldHide = location.pathname.includes('/easyresearch/dashboard') || 
      (location.pathname.includes('/easyresearch/project/') && !location.pathname.includes('/mobile/edit/') && !location.pathname.includes('/responses')) ||
      location.pathname === '/easyresearch/responses' ||
      location.pathname.includes('/easyresearch/analytics') ||
      (location.pathname === '/easyresearch/settings') ||
      (location.pathname === '/easyresearch/create') ||
      // Hide when ParticipantAppView renders its own layout-based nav
      !!location.pathname.match(/\/easyresearch\/participant\/[^\/]+$/);

  useEffect(() => {
    if (shouldHide) return;
    const getActiveProject = async () => {
      const urlProjectId = location.pathname.match(/\/participant\/([^\/]+)/)?.[1];
      if (urlProjectId) { setActiveProjectId(urlProjectId); return; }
      const participantId = localStorage.getItem('participantId');
      if (participantId) {
        const { data } = await supabase.from('enrollment').select('project_id').eq('participant_id', participantId).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (data) setActiveProjectId(data.project_id);
      }
    };
    getActiveProject();
  }, [location, shouldHide]);

  if (shouldHide) return null;

  const tabs = [
    { id: 'home', path: '/easyresearch', icon: Home, label: 'Home' },
    { id: 'survey', path: activeProjectId ? `/easyresearch/participant/${activeProjectId}` : '/easyresearch', icon: FileText, label: 'Survey' },
    { id: 'settings', path: '/easyresearch/user/settings', icon: Settings, label: 'Settings' }
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl md:hidden border-t border-stone-100" style={{ 
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50
    }}>
      <div className="flex items-center justify-around" style={{ height: '56px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 gap-0.5"
            >
              <Icon size={20} className={active ? 'text-emerald-500' : 'text-stone-400'} />
              <span className={`text-[10px] font-medium ${active ? 'text-emerald-500' : 'text-stone-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default EasyResearchBottomNav;
