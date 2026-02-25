import React, { Suspense, useEffect, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { LoadingDisplay } from './components/ui'
import AppStateProvider from './store/AppStateProvider'
import BottomNav from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'

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

import './index.css'

function App() {
  useEffect(() => {
    // Initialize mobile services and notifications
    const initializeApp = async () => {
      try {
        // Mobile initialization can be added here
        console.log('Dementia Caregiver Survey App initialized');
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
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
                  <Route path="/summary" element={<Summary />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/how-to" element={<HowTo />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/join-survey" element={<JoinSurvey />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/study-introduction" element={<StudyIntroduction />} />
                  
                  <Route path="*" element={<Homepage />} />
                </Routes>
              </Suspense>
            </main>
            <BottomNav />
          </div>
        </AppStateProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
