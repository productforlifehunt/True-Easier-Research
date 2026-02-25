import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, Plus, LogOut, LogIn, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EasyResearchBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Don't render for researcher dashboard pages (but DO render for mobile/edit and responses)
  if (location.pathname.includes('/easyresearch/dashboard') || 
      (location.pathname.includes('/easyresearch/project/') && !location.pathname.includes('/mobile/edit/') && !location.pathname.includes('/responses')) ||
      location.pathname === '/easyresearch/responses' ||
      location.pathname.includes('/easyresearch/analytics') ||
      (location.pathname === '/easyresearch/settings') ||
      (location.pathname === '/easyresearch/create')) {
    return null;
  }
  
  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Get active enrollment to find project ID
    const getActiveProject = async () => {
      // First try to get from current URL
      const urlProjectId = location.pathname.match(/\/participant\/([^\/]+)/)?.[1];
      if (urlProjectId) {
        setActiveProjectId(urlProjectId);
        return;
      }
      
      // Otherwise check for active enrollments
      const participantId = localStorage.getItem('participantId');
      if (participantId) {
        const { data } = await supabase
          .from('enrollment')
          .select('project_id')
          .eq('participant_id', participantId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (data) {
          setActiveProjectId(data.project_id);
        }
      }
    };
    
    getActiveProject();
  }, [location]);
  
  const tabs = [
    { id: 'home', path: '/easyresearch', icon: Home, label: 'Home', special: false },
    { id: 'survey', path: activeProjectId ? `/easyresearch/participant/${activeProjectId}/timeline` : '/easyresearch', icon: FileText, label: 'Survey', special: false },
    { id: 'settings', path: '/easyresearch/user/settings', icon: Settings, label: 'Settings', special: false }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
    {/* Mobile: Bottom Navigation */}
    <nav className="fixed bottom-0 left-0 right-0 bg-white md:hidden" style={{ 
      borderTop: '1px solid var(--border-light)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)',
      zIndex: 50
    }}>
      <div className="flex items-center justify-around relative" style={{ height: '64px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          if (tab.special) {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
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
              onClick={() => navigate(tab.path)}
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
    </>
  );
};

export default EasyResearchBottomNav;
