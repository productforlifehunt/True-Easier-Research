import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Settings, Users } from 'lucide-react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import ResearcherFooter from '../ResearcherFooter';
import { useAuth } from '../../../hooks/useAuth';
import { I18nProvider, useI18n } from '../../hooks/useI18n';

/**
 * Unified shell for ALL /easyresearch/* routes.
 * - Persistent AppHeader + bottom nav (never re-mount)
 * - Desktop sidebar for researcher routes
 * - GPU-accelerated CSS transitions for native-feel page switches
 */
const EasyResearchShellInner: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(location.pathname);
  const transitionTimer = useRef<number>();

  // GPU-accelerated fade transition on route change (native feel)
  useEffect(() => {
    if (prevPath.current !== location.pathname && contentRef.current) {
      const el = contentRef.current;
      // Cancel any pending transition
      if (transitionTimer.current) cancelAnimationFrame(transitionTimer.current);
      
      // Instant opacity drop (no layout shift — only opacity for smoothness)
      el.style.transition = 'none';
      el.style.opacity = '0.7';
      
      transitionTimer.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = 'opacity 120ms ease-out';
          el.style.opacity = '1';
        });
      });
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  // Researcher routes that show the sidebar on desktop
  const isResearcherRoute = useMemo(() => {
    const p = location.pathname;
    return p.startsWith('/easyresearch/project/') ||
      p === '/easyresearch/create-survey' ||
      p === '/easyresearch/responses' ||
      p === '/easyresearch/participants' ||
      p === '/easyresearch/settings' ||
      p === '/easyresearch/create' ||
      p.startsWith('/easyresearch/mobile/edit/');
  }, [location.pathname]);

  // Public routes (landing, auth, pricing) — no bottom nav, no sidebar
  const isPublicRoute = useMemo(() => {
    const p = location.pathname;
    return p === '/easyresearch' ||
      p === '/easyresearch/landing' ||
      p === '/easyresearch/auth' ||
      p === '/easyresearch/pricing' ||
      p === '/easyresearch/templates';
  }, [location.pathname]);

  // Routes where the shell footer should NOT show (has own footer or is dashboard)
  const isDashboardRoute = useMemo(() => {
    const p = location.pathname;
    return p === '/easyresearch' ||
      p === '/easyresearch/landing' ||
      p === '/easyresearch/dashboard' ||
      p === '/easyresearch/home' ||
      p.startsWith('/easyresearch/project/') ||
      p === '/easyresearch/create-survey' ||
      p === '/easyresearch/create' ||
      p === '/easyresearch/responses' ||
      p === '/easyresearch/participants' ||
      p === '/easyresearch/settings' ||
      p.startsWith('/easyresearch/mobile/edit/');
  }, [location.pathname]);

  // Bottom nav tabs
  const tabs = useMemo(() => [
    { id: 'home', path: '/easyresearch/dashboard', icon: Home, labelKey: 'nav.myStudies' },
    { id: 'discover', path: '/easyresearch/participant/join', icon: Search, labelKey: 'nav.discover' },
    { id: 'participants', path: '/easyresearch/participant-library', icon: Users, labelKey: 'nav.participants' },
    { id: 'settings', path: '/easyresearch/user/settings', icon: Settings, labelKey: 'nav.settings' },
  ], []);

  const isTabActive = useCallback((tabPath: string) => {
    const p = location.pathname;
    if (tabPath === '/easyresearch/dashboard') {
      return p === '/easyresearch/dashboard' ||
        p === '/easyresearch/home' ||
        (p.startsWith('/easyresearch/participant/') && !p.includes('/join'));
    }
    return p === tabPath || p.startsWith(tabPath + '/');
  }, [location.pathname]);

  const showBottomNav = user && !isPublicRoute;
  const showSidebar = user && isResearcherRoute;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f9faf8' }}>
      <AppHeader />

      {showSidebar && <AppSidebar />}

      {/* Main content — GPU-accelerated opacity only (no translateY = no layout shift) */}
      <div
        ref={contentRef}
        className={`flex-1 pt-14 ${
          showSidebar ? 'md:pl-56' : ''
        } ${showBottomNav ? 'pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0' : ''}`}
        style={{ willChange: 'opacity' }}
      >
        {showSidebar ? (
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </div>

      {/* Desktop footer — shown on non-dashboard routes */}
      {!isDashboardRoute && (
        <div className={`hidden md:block ${showSidebar ? 'md:pl-56' : ''}`}>
          <ResearcherFooter />
        </div>
      )}

      {/* Persistent bottom nav — mobile only for logged-in users */}
      {showBottomNav && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl"
          style={{
            borderTop: '1px solid rgba(0,0,0,0.06)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -1px 8px rgba(0,0,0,0.03)',
            zIndex: 50,
          }}
        >
          <div className="flex items-center justify-around" style={{ height: '56px' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isTabActive(tab.path);
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center justify-center flex-1 gap-0.5 active:scale-95"
                  style={{ transition: 'transform 100ms ease' }}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.2 : 1.5}
                    style={{ color: active ? '#10b981' : '#a8a29e', transition: 'color 120ms ease' }}
                  />
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: active ? '#10b981' : '#a8a29e', transition: 'color 120ms ease' }}
                  >
                    {t(tab.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

const EasyResearchShell: React.FC = () => (
  <I18nProvider>
    <EasyResearchShellInner />
  </I18nProvider>
);

export default EasyResearchShell;
