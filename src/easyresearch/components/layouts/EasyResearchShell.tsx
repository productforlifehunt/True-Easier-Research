import React, { useCallback, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Settings } from 'lucide-react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Unified shell for ALL /easyresearch/* routes.
 * - Persistent AppHeader + bottom nav (never re-mount)
 * - Desktop sidebar for researcher routes
 * - CSS transitions for native-feel page switches
 */
const EasyResearchShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(location.pathname);

  // Subtle fade transition on route change (native feel)
  useEffect(() => {
    if (prevPath.current !== location.pathname && contentRef.current) {
      const el = contentRef.current;
      el.style.opacity = '0.6';
      el.style.transform = 'translateY(4px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 150ms ease-out, transform 150ms ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  // Researcher routes that show the sidebar on desktop
  const isResearcherRoute =
    location.pathname.startsWith('/easyresearch/project/') ||
    location.pathname === '/easyresearch/create-survey' ||
    location.pathname === '/easyresearch/responses' ||
    location.pathname === '/easyresearch/participants' ||
    location.pathname === '/easyresearch/settings' ||
    location.pathname === '/easyresearch/create' ||
    location.pathname.startsWith('/easyresearch/mobile/edit/');

  // Public routes (landing, auth, pricing) — no bottom nav, no sidebar
  const isPublicRoute =
    location.pathname === '/easyresearch' ||
    location.pathname === '/easyresearch/landing' ||
    location.pathname === '/easyresearch/auth' ||
    location.pathname === '/easyresearch/pricing' ||
    location.pathname === '/easyresearch/templates';

  // Bottom nav tabs
  const tabs = [
    { id: 'home', path: '/easyresearch/dashboard', icon: Home, label: 'My Studies' },
    { id: 'discover', path: '/easyresearch/participant/join', icon: Search, label: 'Discover' },
    { id: 'settings', path: '/easyresearch/user/settings', icon: Settings, label: 'Settings' },
  ];

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

      {/* Main content with smooth transitions */}
      <div
        ref={contentRef}
        className={`flex-1 pt-14 ${
          showSidebar ? 'md:pl-56' : ''
        } ${showBottomNav ? 'pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0' : ''}`}
        style={{ willChange: 'opacity, transform' }}
      >
        {showSidebar ? (
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </div>

      {/* Persistent bottom nav — ALWAYS visible on mobile for logged-in users */}
      {showBottomNav && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl"
          style={{
            borderTop: '1px solid rgba(0,0,0,0.06)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -1px 12px rgba(0,0,0,0.04)',
            zIndex: 50,
          }}
        >
          <div className="flex items-center justify-around" style={{ height: '64px' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isTabActive(tab.path);
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center justify-center flex-1 gap-0.5 active:scale-95 transition-transform"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.2 : 1.5}
                    style={{ color: active ? '#10b981' : '#a8a29e' }}
                  />
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: active ? '#10b981' : '#a8a29e' }}
                  >
                    {tab.label}
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

export default EasyResearchShell;
