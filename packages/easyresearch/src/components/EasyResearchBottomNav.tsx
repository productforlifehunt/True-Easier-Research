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
          .from('survey_enrollments')
          .select('project_id')
          .eq('participant_id', participantId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
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
    
    {/* Desktop: Top Header */}
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white items-center justify-between px-8" style={{ height: '64px', borderBottom: '1px solid var(--border-light)', zIndex: 999 }}>
      <button
        onClick={() => navigate('/easyresearch/landing')}
        className="text-2xl font-bold hover:opacity-80 transition-opacity"
        style={{ color: 'var(--color-green)' }}
      >
        Easier-research
      </button>
      
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-2 flex-1 justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex items-center gap-2 px-8 py-2 rounded-lg transition-all flex-1"
                style={{
                  backgroundColor: active ? '#f0fdf4' : 'transparent',
                  color: active ? 'var(--color-green)' : 'var(--text-secondary)'
                }}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Auth Status */}
        <div className="flex items-center gap-3 pl-6" style={{ borderLeft: '1px solid var(--border-light)' }}>
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <User size={18} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/easyresearch/landing');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogOut size={18} />
                <span className="font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/easyresearch/auth')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ 
                backgroundColor: 'var(--color-green)',
                color: 'white'
              }}
            >
              <LogIn size={18} />
              <span className="font-medium">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>

    {/* Desktop: Footer */}
    <footer className="hidden md:block bg-white" style={{ borderTop: '1px solid var(--border-light)' }}>
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-col items-center text-center">
          <div className="text-lg font-bold mb-2" style={{ color: 'var(--color-green)' }}>Easier-research</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Modern research platform for seamless data collection
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8 mb-6">
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Platform
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li>
                <button onClick={() => navigate('/easyresearch')} className="hover:opacity-70">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/easyresearch/landing')} className="hover:opacity-70">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/easyresearch/auth')} className="hover:opacity-70">
                  Sign In
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Resources
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li>
                <button onClick={() => navigate('/easyresearch/user/settings')} className="hover:opacity-70">
                  Settings
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-6 text-center text-sm" style={{ borderTop: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
          © 2025 Easier-research. All rights reserved.
        </div>
      </div>
    </footer>
    </>
  );
};

export default EasyResearchBottomNav;
