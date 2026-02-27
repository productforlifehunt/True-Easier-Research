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
import { PublicLayout, ResearcherLayout, ParticipantLayout } from './easyresearch/components/layouts';
const LandingPage = React.lazy(() => import('./easyresearch/components/LandingPage'));
const ParticipantHome = React.lazy(() => import('./easyresearch/components/ParticipantHome'));
const ResearcherDashboard = React.lazy(() => import('./easyresearch/components/ResearcherDashboard'));
const SurveyBuilder = React.lazy(() => import('./easyresearch/components/SurveyBuilder'));
const MobileSurveyEditor = React.lazy(() => import('./easyresearch/components/MobileSurveyEditor'));
const ParticipantJoin = React.lazy(() => import('./easyresearch/components/ParticipantJoin'));
const ESMParticipantDashboard = React.lazy(() => import('./easyresearch/components/ESMParticipantDashboard'));
const AnalyticsPage = React.lazy(() => import('./easyresearch/components/AnalyticsDashboard'));
const ResearcherSettings = React.lazy(() => import('./easyresearch/components/SettingsPage'));
const ParticipantSettings = React.lazy(() => import('./easyresearch/components/ParticipantSettings'));
const UserSettings = React.lazy(() => import('./easyresearch/components/UserSettings'));
const SurveyResponses = React.lazy(() => import('./easyresearch/components/SurveyResponses'));
const ResponsesPage = React.lazy(() => import('./easyresearch/components/ResponsesPage'));
const TemplateLibrary = React.lazy(() => import('./easyresearch/components/TemplateLibrary'));
const PricingPage = React.lazy(() => import('./easyresearch/components/PricingPage'));
const ParticipantsPage = React.lazy(() => import('./easyresearch/components/ParticipantsPage'));
const SurveyViewRouter = React.lazy(() => import('./easyresearch/components/SurveyViewRouter'));
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingDisplay loading={{ isLoading: true, loadingMessage: 'Loading page...' }} />
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
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '60vh'
                }}>
                  <LoadingDisplay loading={{ isLoading: true, loadingMessage: "Loading page..." }} />
                </div>
              }>
                <Routes>
                  {/* Dementia Caregiver Survey Routes */}
                  <Route path="/" element={<Homepage />} />
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
                  {/* ============================================ */}
                  
                  {/* PUBLIC ROUTES - Header Only (No Sidebar) */}
                  <Route element={<PublicLayout />}>
                    <Route path="/easyresearch" element={<LandingPage />} />
                    <Route path="/easyresearch/landing" element={<Navigate to="/easyresearch" replace />} />
                    <Route path="/easyresearch/auth" element={<EasyResearchAuth />} />
                    <Route path="/easyresearch/templates" element={<TemplateLibrary />} />
                    <Route path="/easyresearch/pricing" element={<PricingPage />} />
                  </Route>
                  
                  {/* RESEARCHER ROUTES - Header + Sidebar (Protected) */}
                  <Route element={<RequireResearcher><ResearcherLayout /></RequireResearcher>}>
                    <Route path="/easyresearch/dashboard" element={<ResearcherDashboard />} />
                    <Route path="/easyresearch/create-survey" element={<SurveyBuilder />} />
                    <Route path="/easyresearch/project/:projectId" element={<SurveyBuilder />} />
                    <Route path="/easyresearch/project/:projectId/responses" element={<SurveyResponses />} />
                    <Route path="/easyresearch/mobile/edit/:projectId" element={<MobileSurveyEditor />} />
                    <Route path="/easyresearch/create" element={<ResearcherDashboard />} />
                    <Route path="/easyresearch/responses" element={<ResponsesPage />} />
                    <Route path="/easyresearch/analytics" element={<AnalyticsPage />} />
                    <Route path="/easyresearch/settings" element={<ResearcherSettings />} />
                    <Route path="/easyresearch/participants" element={<ParticipantsPage />} />
                  </Route>
                  
                  {/* PARTICIPANT ROUTES - Header + Bottom Nav */}
                  <Route element={<ParticipantLayout />}>
                    <Route path="/easyresearch/home" element={<ParticipantHome />} />
                    <Route path="/easyresearch/participant/home" element={<Navigate to="/easyresearch/home" replace />} />
                    <Route path="/easyresearch/user/settings" element={<UserSettings />} />
                    <Route path="/easyresearch/participant/join" element={<ParticipantJoin />} />
                    <Route path="/easyresearch/participant/:projectId" element={<SurveyViewRouter />} />
                    <Route path="/easyresearch/participant/:projectId/dashboard" element={<ESMParticipantDashboard />} />
                    <Route path="/easyresearch/participant/:projectId/timeline" element={<ESMParticipantDashboard />} />
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
