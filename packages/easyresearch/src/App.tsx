import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// EasyResearch Platform Components
import EasyResearchAuth from './components/EasyResearchAuth';
import ParticipantLayout from './components/ParticipantLayout';

const LandingPage = lazy(() => import('./components/LandingPage'));
const ParticipantHome = lazy(() => import('./components/ParticipantHome'));
const ResearcherDashboard = lazy(() => import('./components/ResearcherDashboard'));
const SurveyBuilder = lazy(() => import('./components/SurveyBuilder'));
const MobileSurveyEditor = lazy(() => import('./components/MobileSurveyEditor'));
const ParticipantSurveyView = lazy(() => import('./components/ParticipantSurveyView'));
const SurveyPreview = lazy(() => import('./components/SurveyPreview'));
const ESMParticipantDashboard = lazy(() => import('./components/ESMParticipantDashboard'));
const AnalyticsPage = lazy(() => import('./components/AnalyticsDashboard'));
const ResearcherSettings = lazy(() => import('./components/SettingsPage'));
const ParticipantSettings = lazy(() => import('./components/ParticipantSettings'));
const UserSettings = lazy(() => import('./components/UserSettings'));
const SurveyResponses = lazy(() => import('./components/SurveyResponses'));
const SurveyViewRouter = lazy(() => import('./components/SurveyViewRouter'));

import './index.css'

function App() {
  return (
    <Router>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
            </div>
          }>
            <Routes>
              {/* Landing & Auth */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={<EasyResearchAuth />} />
              
              {/* Researcher Routes */}
              <Route path="/dashboard" element={<ResearcherDashboard />} />
              <Route path="/project/:projectId" element={<SurveyBuilder />} />
              <Route path="/mobile/edit/:projectId" element={<MobileSurveyEditor />} />
              <Route path="/create" element={<ResearcherDashboard />} />
              <Route path="/responses" element={<ResearcherDashboard />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<ResearcherSettings />} />
              
              {/* Participant Home with Layout */}
              <Route path="/home" element={<ParticipantLayout />}>
                <Route index element={<ParticipantHome />} />
              </Route>
              
              {/* User Routes */}
              <Route path="/user" element={<ParticipantLayout />}>
                <Route path="settings" element={<UserSettings />} />
              </Route>
              
              {/* Project Routes with Layout */}
              <Route path="/project/:projectId" element={<ParticipantLayout />}>
                <Route path="responses" element={<SurveyResponses />} />
              </Route>
              
              {/* Participant Routes with Persistent Bottom Nav */}
              <Route path="/participant/:projectId" element={<ParticipantLayout />}>
                <Route index element={<SurveyViewRouter />} />
                <Route path="dashboard" element={<ESMParticipantDashboard />} />
                <Route path="timeline" element={<ESMParticipantDashboard />} />
                <Route path="settings" element={<ParticipantSettings />} />
              </Route>
              
              {/* Survey Complete */}
              <Route path="/survey/:projectId/complete" element={
                <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-primary)'}}>
                  <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>Thank You!</h1>
                    <p style={{color: 'var(--text-secondary)'}}>Your response has been recorded.</p>
                  </div>
                </div>
              } />
              
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  )
}

export default App
