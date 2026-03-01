import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Settings, BarChart3, HelpCircle, Layout as LayoutIcon } from 'lucide-react';
import AppHeader from './AppHeader';
import { supabase } from '../../../lib/supabase';

const ICON_MAP: Record<string, React.FC<any>> = {
  Home, FileText, Settings, BarChart3, HelpCircle, Layout: LayoutIcon,
};

// Simple in-memory cache to avoid re-fetching on every navigation
const layoutCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const ParticipantLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const projectId = location.pathname.match(/\/participant\/([^\/]+)/)?.[1];
  const isInProject = !!projectId;

  const [layoutTabs, setLayoutTabs] = useState<any[] | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const prevProjectId = useRef<string | null>(null);

  const loadLayout = useCallback(async (pid: string) => {
    // Check cache first
    const cached = layoutCache.get(pid);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      const appLayout = cached.data;
      if (appLayout?.bottom_nav?.length) {
        setLayoutTabs(appLayout.bottom_nav);
        if (appLayout.theme?.primary_color) setPrimaryColor(appLayout.theme.primary_color);
      } else {
        setLayoutTabs(null);
      }
      return;
    }

    const { data } = await supabase
      .from('research_project')
      .select('app_layout')
      .eq('id', pid)
      .maybeSingle();
    
    const appLayout = data?.app_layout as any;
    layoutCache.set(pid, { data: appLayout, ts: Date.now() });

    if (appLayout?.bottom_nav?.length) {
      setLayoutTabs(appLayout.bottom_nav);
      if (appLayout.theme?.primary_color) setPrimaryColor(appLayout.theme.primary_color);
    } else {
      setLayoutTabs(null);
    }
  }, []);

  useEffect(() => {
    if (!projectId) {
      setLayoutTabs(null);
      setPrimaryColor('#10b981');
      prevProjectId.current = null;
      return;
    }
    // Only fetch if project changed
    if (prevProjectId.current !== projectId) {
      prevProjectId.current = projectId;
      loadLayout(projectId);
    }
  }, [projectId, loadLayout]);

  // Default tabs for hub pages
  const defaultTabs = [
    { id: 'home', path: '/easyresearch/home', icon: Home, label: 'Home' },
    { id: 'survey', path: projectId ? `/easyresearch/participant/${projectId}` : '/easyresearch/home', icon: FileText, label: 'Survey' },
    { id: 'settings', path: '/easyresearch/user/settings', icon: Settings, label: 'Settings' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || (path.includes('/participant/') && location.pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AppHeader />
      
      {/* Main Content — fixed offsets for header + bottom nav */}
      <main className="flex-1 pt-14 pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation — always visible */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm"
        style={{ 
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -1px 8px rgba(0, 0, 0, 0.04)',
          zIndex: 50
        }}
      >
        <div className="flex items-center justify-around" style={{ height: '60px' }}>
          {isInProject && layoutTabs ? (
            layoutTabs.map((nav: any) => {
              const IconComp = ICON_MAP[nav.icon] || Home;
              const tabPath = `/easyresearch/participant/${projectId}?tab=${nav.tab_id}`;
              const isTabActive = location.search.includes(`tab=${nav.tab_id}`) || 
                (!location.search.includes('tab=') && layoutTabs.indexOf(nav) === 0);
              
              return (
                <button
                  key={nav.tab_id}
                  onClick={() => navigate(tabPath)}
                  className="flex flex-col items-center justify-center flex-1 gap-0.5"
                >
                  <IconComp size={20} style={{ color: isTabActive ? primaryColor : '#a8a29e' }} />
                  <span className="text-[10px] font-medium" style={{ color: isTabActive ? primaryColor : '#a8a29e' }}>
                    {nav.label}
                  </span>
                </button>
              );
            })
          ) : (
            defaultTabs.map((tab) => {
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
            })
          )}
        </div>
      </nav>
    </div>
  );
};

export default ParticipantLayout;
