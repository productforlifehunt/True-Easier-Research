import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FlaskConical, Search, MessageSquare, Settings } from 'lucide-react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import ResearcherFooter from '../ResearcherFooter';
import { useAuth } from '../../../hooks/useAuth';
import { I18nProvider, useI18n } from '../../hooks/useI18n';

/**
 * Unified shell for ALL /easyresearch/* routes.
 *
 * LAYOUT RULES (per PRD):
 * ─────────────────────────────────────────────────
 * DESKTOP (lg+):
 *   • Header — always visible on every page
 *   • Footer — always visible on every page (basic company info)
 *   • Sidebar — visible on all dashboard/app pages (logged in)
 *
 * MOBILE (<lg):
 *   • Header — always visible on every page
 *   • Footer (bottom nav) — 4 tabs on all pages when logged in:
 *     Research, Discover, Inbox, Settings
 *   • Desktop footer hidden on mobile
 */
const EasyResearchShellInner: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(location.pathname);
  const transitionTimer = useRef<number>();

  // GPU-accelerated fade transition on route change
  useEffect(() => {
    if (prevPath.current !== location.pathname && contentRef.current) {
      const el = contentRef.current;
      if (transitionTimer.current) cancelAnimationFrame(transitionTimer.current);
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

  // Public routes — no sidebar, no bottom nav
  const isPublicRoute = useMemo(() => {
    const p = location.pathname;
    return (
      p === '/easyresearch' ||
      p === '/easyresearch/landing' ||
      p === '/easyresearch/auth' ||
      p === '/easyresearch/pricing' ||
      p === '/easyresearch/templates' ||
      p === '/easyresearch/participant-library' ||
      p === '/easyresearch/features' ||
      p === '/easyresearch/participant/join'
    );
  }, [location.pathname]);

  // Sidebar + bottom nav only on non-public (dashboard) routes for logged-in users
  const showSidebar = !!user && !isPublicRoute;
  const showBottomNav = !!user && !isPublicRoute;

  // Bottom nav tabs — same 4 as sidebar
  const tabs = useMemo(
    () => [
      { id: 'research', path: '/easyresearch/dashboard', icon: FlaskConical, labelKey: 'nav.research' },
      { id: 'discover', path: '/easyresearch/participant/join', icon: Search, labelKey: 'nav.discover' },
      { id: 'inbox', path: '/easyresearch/inbox', icon: MessageSquare, labelKey: 'nav.inbox' },
      { id: 'settings', path: '/easyresearch/user/settings', icon: Settings, labelKey: 'nav.settings' },
    ],
    []
  );

  const isTabActive = useCallback(
    (tabPath: string) => {
      const p = location.pathname;
      if (tabPath === '/easyresearch/dashboard') {
        return (
          p === '/easyresearch/dashboard' ||
          p === '/easyresearch/home' ||
          p.startsWith('/easyresearch/project/') ||
          p === '/easyresearch/create-survey' ||
          p === '/easyresearch/create' ||
          p === '/easyresearch/responses' ||
          p === '/easyresearch/participants' ||
          p.startsWith('/easyresearch/mobile/edit/') ||
          (p.startsWith('/easyresearch/participant/') && !p.includes('/join'))
        );
      }
      return p === tabPath || p.startsWith(tabPath + '/');
    },
    [location.pathname]
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f9faf8' }}>
      {/* Header — ALWAYS visible */}
      <AppHeader />

      {/* Desktop sidebar — logged-in, non-public routes */}
      {showSidebar && <AppSidebar />}

      {/* Main content */}
      <div
        ref={contentRef}
        className={`flex-1 pt-14 ${showSidebar ? 'lg:pl-56' : ''} ${
          showBottomNav ? 'pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0' : ''
        }`}
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

      {/* Footer — ALWAYS visible on ALL pages, ALL screen sizes (not fixed, just at bottom) */}
      <div className={`${showSidebar ? 'lg:pl-56' : ''} ${showBottomNav ? 'mb-[calc(64px+env(safe-area-inset-bottom))] lg:mb-0' : ''}`}>
        <ResearcherFooter />
      </div>

      {/* Mobile bottom nav — 4 tabs, logged-in only, non-public */}
      {showBottomNav && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl"
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
                    style={{
                      color: active ? '#10b981' : '#a8a29e',
                      transition: 'color 120ms ease',
                    }}
                  />
                  <span
                    className="text-[10px] font-semibold"
                    style={{
                      color: active ? '#10b981' : '#a8a29e',
                      transition: 'color 120ms ease',
                    }}
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
