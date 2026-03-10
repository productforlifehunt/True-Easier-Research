import React, { Suspense, useEffect, lazy, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { LoadingDisplay } from './components/ui'
import AppStateProvider from './store/AppStateProvider'
import BottomNav from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

// Dementia Survey Pages
const Homepage = lazy(() => import('./pages/Homepage'));
const Timeline = lazy(() => import('./pages/Timeline'));
const DementiaCaregiverSurvey = lazy(() => import('./pages/DementiaCaregiverSurvey'));
const AddEntry = lazy(() => import('./pages/AddEntry'));
const Summary = lazy(() => import('./pages/Summary'));
const About = lazy(() => import('./pages/About'));
const HowTo = lazy(() => import('./pages/HowTo'));
const Contact = lazy(() => import('./pages/Contact'));
const JoinSurvey = lazy(() => import('./pages/JoinSurvey'));
const Settings = lazy(() => import('./pages/Settings'));
const StudyIntroduction = lazy(() => import('./pages/StudyIntroduction'));
const EntryDetail = lazy(() => import('./pages/EntryDetail'));

// EasyResearch Platform Components
import EasyResearchAuth from './easyresearch/components/EasyResearchAuth';
import { EasyResearchShell } from './easyresearch/components/layouts';

// Eager-import factories for preloading (eliminates Suspense flash on tab switch)
const lazyImports = {
  LandingPage: () => import('./easyresearch/components/LandingPage'),
  ParticipantHome: () => import('./easyresearch/components/ParticipantHome'),
  ResearcherDashboard: () => import('./easyresearch/components/ResearcherDashboard'),
  SurveyBuilder: () => import('./easyresearch/components/SurveyBuilder'),
  MobileSurveyEditor: () => import('./easyresearch/components/MobileSurveyEditor'),
  ParticipantJoin: () => import('./easyresearch/components/ParticipantJoin'),
  ESMParticipantDashboard: () => import('./easyresearch/components/ESMParticipantDashboard'),
  AnalyticsPage: () => import('./easyresearch/components/AnalyticsDashboard'),
  ResearcherSettings: () => import('./easyresearch/components/SettingsPage'),
  ParticipantSettings: () => import('./easyresearch/components/ParticipantSettings'),
  UserSettings: () => import('./easyresearch/components/UserSettings'),
  SurveyResponses: () => import('./easyresearch/components/SurveyResponses'),
  ResponsesPage: () => import('./easyresearch/components/ResponsesPage'),
  TemplateLibrary: () => import('./easyresearch/components/TemplateLibrary'),
  PricingPage: () => import('./easyresearch/components/PricingPage'),
  ParticipantsPage: () => import('./easyresearch/components/ParticipantsPage'),
  ParticipantLibrary: () => import('./easyresearch/components/ParticipantLibrary'),
  SurveyViewRouter: () => import('./easyresearch/components/SurveyViewRouter'),
  InboxPage: () => import('./easyresearch/components/InboxPage'),
  ConversationView: () => import('./easyresearch/components/ConversationView'),
  FeaturesPage: () => import('./easyresearch/components/FeaturesPage'),
  PublicPageRenderer: () => import('./easyresearch/components/PublicPageRenderer'),
  DiscoverPage: () => import('./easyresearch/components/DiscoverPage'),
};

const LandingPage = React.lazy(lazyImports.LandingPage);
const ParticipantHome = React.lazy(lazyImports.ParticipantHome);
const ResearcherDashboard = React.lazy(lazyImports.ResearcherDashboard);
const SurveyBuilder = React.lazy(lazyImports.SurveyBuilder);
const MobileSurveyEditor = React.lazy(lazyImports.MobileSurveyEditor);
const ParticipantJoin = React.lazy(lazyImports.ParticipantJoin);
const ESMParticipantDashboard = React.lazy(lazyImports.ESMParticipantDashboard);
const AnalyticsPage = React.lazy(lazyImports.AnalyticsPage);
const ResearcherSettings = React.lazy(lazyImports.ResearcherSettings);
const ParticipantSettings = React.lazy(lazyImports.ParticipantSettings);
const UserSettings = React.lazy(lazyImports.UserSettings);
const SurveyResponses = React.lazy(lazyImports.SurveyResponses);
const ResponsesPage = React.lazy(lazyImports.ResponsesPage);
const TemplateLibrary = React.lazy(lazyImports.TemplateLibrary);
const PricingPage = React.lazy(lazyImports.PricingPage);
const ParticipantsPage = React.lazy(lazyImports.ParticipantsPage);
const ParticipantLibrary = React.lazy(lazyImports.ParticipantLibrary);
const SurveyViewRouter = React.lazy(lazyImports.SurveyViewRouter);
const InboxPage = React.lazy(lazyImports.InboxPage);
const ConversationView = React.lazy(lazyImports.ConversationView);
const FeaturesPage = React.lazy(lazyImports.FeaturesPage);
const PublicPageRenderer = React.lazy(lazyImports.PublicPageRenderer);
const DiscoverPage = React.lazy(lazyImports.DiscoverPage);

// Preload all EasyResearch chunks after initial paint
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Use requestIdleCallback to preload without blocking main thread
    const preload = () => {
      Object.values(lazyImports).forEach(fn => fn());
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload);
    } else {
      setTimeout(preload, 1500);
    }
  }, { once: true });
}
import { notificationService } from './utils/notifications'
import { mobileService } from './utils/mobile'

import './index.css'

// Component to conditionally show BottomNav only for Dementia Survey routes
const ConditionalBottomNav = () => {
  const location = useLocation();
  // Only show BottomNav for Dementia Survey platform, NOT for EasyResearch
  const isEasyResearch = location.pathname.startsWith('/easyresearch');
  
  if (isEasyResearch) {
    return null;
  }
  
  return <BottomNav />;
};

const RequireResearcher: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isResearcher, setIsResearcher] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      if (loading) return;
      if (!user) {
        if (mounted) setChecking(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('researcher')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (mounted) setIsResearcher(!!data);
      } catch {
        if (mounted) setIsResearcher(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-10 bg-stone-100 rounded-xl w-1/2" />
        <div className="h-14 bg-stone-100 rounded-xl" />
        <div className="h-14 bg-stone-100 rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/easyresearch/auth?redirect=researcher&redirectTo=${encodeURIComponent(location.pathname + location.search)}`}
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  if (!isResearcher) {
    return (
      <Navigate
        to={`/easyresearch/auth?become=researcher&redirectTo=${encodeURIComponent(location.pathname + location.search)}`}
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Initialize mobile services and notifications
    const initializeApp = async () => {
      try {
        await mobileService.initialize();
        await notificationService.initialize();
        notificationService.setupNotificationListeners();
        
        // Listen for care log reminders
        const handleCareLogReminder = () => {
          // This will trigger when user taps a notification
          // You can show an in-app modal or navigate to the form
        };
        
        window.addEventListener('care-log-reminder', handleCareLogReminder);
        
        return () => {
          window.removeEventListener('care-log-reminder', handleCareLogReminder);
        };
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
      <Router>
        <AppStateProvider>
          <Toaster position="top-center" />
          <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            <main>
              <Suspense fallback={
                <div style={{ minHeight: '100vh' }} />
              }>
                <Routes>
                  {/* Dementia Caregiver Survey Routes */}
                  <Route path="/" element={<Navigate to="/easyresearch" replace />} />
                  <Route path="/home" element={<Homepage />} />
                  <Route path="/survey" element={<Timeline />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/dementia-caregiver-survey" element={<DementiaCaregiverSurvey />} />
                  <Route path="/add-entry" element={<AddEntry />} />
                  <Route path="/entry/:id" element={<EntryDetail />} />
                  <Route path="/edit-entry/:id" element={<AddEntry />} />
                  <Route path="/summary" element={<Summary />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/how-to" element={<HowTo />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/join-survey" element={<JoinSurvey />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/study-introduction" element={<StudyIntroduction />} />
                  
                  {/* ============================================ */}
                  {/* EASYRESEARCH PLATFORM ROUTES                */}
                  {/* All wrapped in a single persistent shell    */}
                  {/* ============================================ */}
                  
                  <Route element={<EasyResearchShell />}>
                    {/* Public routes */}
                    <Route path="/easyresearch" element={<LandingPage />} />
                    <Route path="/easyresearch/landing" element={<Navigate to="/easyresearch" replace />} />
                    <Route path="/easyresearch/auth" element={<EasyResearchAuth />} />
                    <Route path="/easyresearch/templates" element={<TemplateLibrary />} />
                    <Route path="/easyresearch/pricing" element={<PricingPage />} />
                    <Route path="/easyresearch/features" element={<FeaturesPage />} />
                    <Route path="/easyresearch/page/:projectId/:slug" element={<PublicPageRenderer />} />
                    
                    {/* Unified dashboard - shows both owned & enrolled studies */}
                    <Route path="/easyresearch/dashboard" element={<ParticipantHome />} />
                    <Route path="/easyresearch/home" element={<Navigate to="/easyresearch/dashboard" replace />} />
                    
                    {/* Researcher routes (protected) */}
                    <Route path="/easyresearch/create-survey" element={<RequireResearcher><SurveyBuilder /></RequireResearcher>} />
                    <Route path="/easyresearch/project/:projectId" element={<RequireResearcher><SurveyBuilder /></RequireResearcher>} />
                    <Route path="/easyresearch/project/:projectId/responses" element={<RequireResearcher><SurveyResponses /></RequireResearcher>} />
                    <Route path="/easyresearch/mobile/edit/:projectId" element={<RequireResearcher><MobileSurveyEditor /></RequireResearcher>} />
                    <Route path="/easyresearch/create" element={<RequireResearcher><ResearcherDashboard /></RequireResearcher>} />
                    <Route path="/easyresearch/responses" element={<RequireResearcher><ResponsesPage /></RequireResearcher>} />
                    <Route path="/easyresearch/settings" element={<RequireResearcher><ResearcherSettings /></RequireResearcher>} />
                    <Route path="/easyresearch/participants" element={<RequireResearcher><ParticipantsPage /></RequireResearcher>} />
                    
                    {/* Participant Library */}
                    <Route path="/easyresearch/participant-library" element={<ParticipantLibrary />} />
                    
                    {/* Inbox & Messaging */}
                    <Route path="/easyresearch/inbox" element={<InboxPage />} />
                    <Route path="/easyresearch/inbox/:conversationId" element={<ConversationView />} />
                    
                    {/* Participant routes */}
                    <Route path="/easyresearch/user/settings" element={<UserSettings />} />
                    <Route path="/easyresearch/participant/join" element={<ParticipantJoin />} />
                    <Route path="/easyresearch/participant/home" element={<Navigate to="/easyresearch/dashboard" replace />} />
                    <Route path="/easyresearch/participant/:projectId" element={<SurveyViewRouter />} />
                    <Route path="/easyresearch/participant/:projectId/dashboard" element={<SurveyViewRouter />} />
                    <Route path="/easyresearch/participant/:projectId/timeline" element={<SurveyViewRouter />} />
                    <Route path="/easyresearch/participant/:projectId/settings" element={<ParticipantSettings />} />
                    <Route path="/easyresearch/survey/:projectId/complete" element={
                      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-primary)'}}>
                        <div className="text-center">
                          <h1 className="text-3xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>Thank You!</h1>
                          <p style={{color: 'var(--text-secondary)'}}>Your response has been recorded.</p>
                        </div>
                      </div>
                    } />
                  </Route>
                  
                  {/* EasyResearch catch-all — stay within platform */}
                  <Route path="/easyresearch/*" element={<Navigate to="/easyresearch" replace />} />
                  
                  {/* Dementia Survey catch-all */}
                  <Route path="*" element={<Homepage />} />
                </Routes>
              </Suspense>
            </main>
            <ConditionalBottomNav />
          </div>
        </AppStateProvider>
      </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
