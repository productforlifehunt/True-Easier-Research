import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Users, BarChart3, Settings as SettingsIcon, Info } from 'lucide-react';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { dataService } from '../lib/dataService';
import DementiaCaregiverSurvey from './DementiaCaregiverSurvey';
import { authClient } from '../lib/supabase';

const SurveyPlatform: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Start with survey tab to show form immediately
  const [currentTab, setCurrentTab] = useState<'survey' | 'about' | 'settings'>('survey');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [caregiverRole, setCaregiverRole] = useState<'primary' | 'other' | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const { language, changeLanguage } = useLanguage();

  // Language changes are now handled by useLanguage hook
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('app-language');
      if (saved && (saved === 'en' || saved === 'zh')) {
        changeLanguage(saved as 'en' | 'zh');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const translations = {
    en: {
      title: 'A Week in the Life of Dementia Caregivers',
      survey: 'Survey',
      about: 'About',
      settings: 'Settings',
      nav: {
        home: 'Home',
        survey: 'Survey',
        about: 'About',
        settings: 'Settings'
      },
      aboutOurStudy: 'About This Study',
      understandingDaily: 'Understanding the daily experiences of dementia caregivers',
      whatIsStudyAbout: 'What is this study about?',
      studyDescription1: 'This study uses a 7-day online survey to collect information on daily caregiving activities, needs, and challenges among dementia caregivers.',
      studyDescription2: 'The information you provide will be used for research on dementia caregiving.',
      howDoesItWork: 'How does it work?',
      logDailyActivities: 'Log Daily Activities',
      logDailyDesc: 'Record care activities, personal needs, and challenges throughout your day.',
      trackPatterns: 'Track Patterns',
      trackPatternsDesc: 'View your weekly summaries.',
      contributeToResearch: 'Contribute to Research',
      contributeDesc: 'The data you provide will be used to describe and analyze dementia caregiving experiences.',
      dataUsage: 'Data Usage',
      dataUsageDesc1: 'Data is used only for research purposes. You can withdraw from the study at any time.',
      dataUsageDesc2: '',
      startParticipating: 'Start Participating',
      signOut: 'Sign Out',
      languageLabels: {
        english: 'English',
        chinese: '中文'
      }
    },
    zh: {
      title: '痴呆症照护者的一周生活',
      survey: '调查',
      about: '关于',
      settings: '设置',
      nav: {
        home: '首页',
        survey: '调查',
        about: '关于',
        settings: '设置'
      },
      aboutOurStudy: '关于本研究',
      understandingDaily: '了解痴呆症照护者的日常经历',
      whatIsStudyAbout: '这项研究是关于什么的？',
      studyDescription1: '本研究通过为期7天的线上问卷，收集痴呆症照护者在日常照护中的活动、需求和挑战信息。',
      studyDescription2: '您提供的信息仅用于痴呆症照护相关研究。',
      howDoesItWork: '如何参与？',
      logDailyActivities: '记录日常活动',
      logDailyDesc: '记录护理活动、个人需求和挑战。',
      trackPatterns: '查看总结',
      trackPatternsDesc: '查看您的每周总结。',
      contributeToResearch: '为研究做贡献',
      contributeDesc: '您提供的数据将用于描述和分析痴呆症照护体验。',
      dataUsage: '数据使用',
      dataUsageDesc1: '数据仅用于研究目的。您可以随时退出研究。',
      dataUsageDesc2: '',
      startParticipating: '开始参与',
      signOut: '退出登录',
      languageLabels: {
        english: 'English',
        chinese: '中文'
      }
    }
  };

  const t = translations[language];

  // Update current tab based on location and URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'about') {
      setCurrentTab('about');
    } else if (tabParam === 'settings') {
      setCurrentTab('settings');
    } else {
      setCurrentTab('survey');
    }
  }, [location.search]);

  // Listen for custom events from other components
  useEffect(() => {
    const handleSwitchToAbout = () => {
      setCurrentTab('about');
    };
    
    window.addEventListener('switchToAbout', handleSwitchToAbout);
    return () => window.removeEventListener('switchToAbout', handleSwitchToAbout);
  }, []);

  const handleTabClick = (tab: 'survey' | 'about' | 'settings') => {
    setCurrentTab(tab);
    if (tab === 'survey') {
      navigate('/survey');
    } else if (tab === 'about') {
      navigate('/survey?tab=about');
    } else if (tab === 'settings') {
      navigate('/settings');
    }
  };

  // Redirect unauthenticated users to homepage after showing auth modal
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  const handleEmailSignIn = async () => {
    try {
      setIsSigningIn(true);
      setSignInError('');
      
      const { data, error } = await authClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setSignInError(error.message || 'Invalid email or password');
      } else if (data.user) {
        setShowAuthModal(false);
        window.location.reload(); // Reload to update auth state
      }
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      setSignInError(err.message || 'Invalid email or password');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async () => {
    // First show role selection
    if (!caregiverRole) {
      setShowRoleSelection(true);
      return;
    }

    try {
      setIsSigningIn(true);
      setSignInError('');

      const { authClient } = await import('../lib/supabase');
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await authClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'caregiver'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Update profile with caregiver role
        await supabase
          .from('profiles')
          .update({ caregiver_role: caregiverRole })
          .eq('id', data.user.id);

        // Sign in with the new account
        const { error: signInError } = await authClient.auth.signInWithPassword({
          email,
          password
        });
        
        if (!signInError) {
          setShowAuthModal(false);
          setShowRoleSelection(false);
          window.location.reload(); // Reload to update auth state
        } else {
          setSignInError('Sign up succeeded but login failed');
        }
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setSignInError(err.message || 'Failed to create account');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Role Selection Modal
  // Show survey form directly, not info page
  const showSurveyForm = true;
  
  if (!user && showAuthModal && showRoleSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {language === 'zh' ? '您的照护角色' : 'Your Caregiving Role'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {language === 'zh' 
                ? '请选择最能描述您照护角色的选项。研究将区分不同类型照护者所面临的挑战。' 
                : 'Please select the option that best describes your caregiving role. The study distinguishes between challenges reported by different types of caregivers.'}
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Primary Caregiver Card */}
            <button
              onClick={() => setCaregiverRole('primary')}
              className="p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: caregiverRole === 'primary' ? 'var(--color-green)' : 'var(--border-light)',
                transform: caregiverRole === 'primary' ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="rounded-xl flex items-center justify-center" style={{ 
                  backgroundColor: caregiverRole === 'primary' ? 'var(--color-green)' : 'var(--bg-secondary)',
                  width: 'clamp(2.5rem, 6vw, 3rem)',
                  height: 'clamp(2.5rem, 6vw, 3rem)'
                }}>
                  <span className="text-2xl">{caregiverRole === 'primary' ? '✓' : '👤'}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                    {language === 'zh' ? '主要照护者' : 'Primary Caregiver'}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'zh'
                      ? '您是承担主要或日常照护责任的人'
                      : 'You are the main person with primary or daily care responsibility'}
                  </p>
                </div>
              </div>
              <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>• {language === 'zh' ? '每日照护协调' : 'Daily care coordination'}</li>
                <li>• {language === 'zh' ? '主要决策者' : 'Primary decision maker'}</li>
                <li>• {language === 'zh' ? '长期承诺' : 'Long-term commitment'}</li>
              </ul>
            </button>

            {/* Other Caregiver Card */}
            <button
              onClick={() => setCaregiverRole('other')}
              className="p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: caregiverRole === 'other' ? 'var(--color-green)' : 'var(--border-light)',
                transform: caregiverRole === 'other' ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="rounded-xl flex items-center justify-center" style={{ 
                  backgroundColor: caregiverRole === 'other' ? 'var(--color-green)' : 'var(--bg-secondary)',
                  width: 'clamp(2.5rem, 6vw, 3rem)',
                  height: 'clamp(2.5rem, 6vw, 3rem)'
                }}>
                  <span className="text-2xl">{caregiverRole === 'other' ? '✓' : '👥'}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                    {language === 'zh' ? '其他照护者' : 'Other Caregiver'}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'zh'
                      ? '您提供支持但不是主要照护者'
                      : 'You provide support but are not the primary caregiver'}
                  </p>
                </div>
              </div>
              <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>• {language === 'zh' ? '家人或朋友' : 'Family member or friend'}</li>
                <li>• {language === 'zh' ? '专业护理人员' : 'Paid care worker'}</li>
                <li>• {language === 'zh' ? '志愿者或陪伴者' : 'Volunteer or companion'}</li>
              </ul>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRoleSelection(false);
                setCaregiverRole(null);
              }}
              className="px-6 py-3 rounded-xl font-semibold transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              {language === 'zh' ? '返回' : 'Back'}
            </button>
            <button
              onClick={handleSignUp}
              disabled={!caregiverRole || isSigningIn}
              className="flex-1 py-3 px-4 text-white rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              {isSigningIn ? (language === 'zh' ? '创建中...' : 'Creating...') : (language === 'zh' ? '继续创建账户' : 'Continue & Create Account')}
            </button>
          </div>

          {signInError && (
            <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-error)' }}>
              {signInError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Auth Modal for non-authenticated users
  if (!user && showAuthModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {language === 'zh' ? '欢迎参加调查' : 'Welcome to the Survey'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {language === 'zh' ? '请登录以继续痴呆症照护研究' : 'Please sign in to continue with the dementia caregiving study'}
            </p>
          </div>

          {/* Auth Form */}
          <div className="p-8 rounded-2xl border" style={{ 
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-light)'
          }}>
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                onKeyPress={(e) => e.key === 'Enter' && handleEmailSignIn()}
                className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--border-medium)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                onKeyPress={(e) => e.key === 'Enter' && handleEmailSignIn()}
                className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--border-medium)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              />
              
              <div className="space-y-3">
                <button 
                  onClick={handleEmailSignIn} 
                  disabled={isSigningIn || !email || !password}
                  className="w-full py-3 px-4 text-white rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 min-h-[48px]"
                  style={{ backgroundColor: 'var(--color-green)' }}
                >
                  {isSigningIn ? 'Signing in...' : 'Sign In'}
                </button>
                
                <button
                  onClick={handleSignUp}
                  disabled={isSigningIn || !email || !password}
                  className="w-full py-3 px-4 rounded-xl font-semibold border-2 transition-all hover:opacity-90 disabled:opacity-50 min-h-[48px]"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--color-green)',
                    borderColor: 'var(--color-green)'
                  }}
                >
                  {isSigningIn ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </div>
            
            {signInError && (
              <div className="mt-4 p-3 rounded-lg" style={{ 
                backgroundColor: 'var(--bg-error)',
                color: 'var(--text-error)'
              }}>
                <p className="text-sm">{signInError}</p>
              </div>
            )}
          </div>

          {/* Back to Homepage */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Show survey form regardless of auth status
  // Users can start filling out immediately
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />

      {/* Main Content - Always show survey form by default */}
      <main className="pb-16 md:pb-0">
        {currentTab === 'about' ? (
          <div className="max-w-5xl mx-auto p-6 md:p-10">
            <div className="py-12 md:py-16">
              <div className="text-center mb-16">
                <Info className="mx-auto mb-8" style={{ color: 'var(--color-green)', width: 'clamp(4rem, 10vw, 6rem)', height: 'clamp(4rem, 10vw, 6rem)' }} />
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
{t.aboutOurStudy}
                </h2>
                <p className="text-xl md:text-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {t.understandingDaily}
                </p>
              </div>

              <div className="space-y-10">
                <div className="bg-white rounded-3xl p-6 md:p-12 border-2" style={{ borderColor: 'var(--border-light)' }}>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                    {t.whatIsStudyAbout}
                  </h3>
                  <p className="text-lg md:text-xl leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {t.studyDescription1}
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {t.studyDescription2}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-12 border-2" style={{ borderColor: 'var(--border-light)' }}>
                  <h3 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
                    {t.howDoesItWork}
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="bg-white rounded-full flex items-center justify-center flex-shrink-0" style={{ borderColor: 'var(--color-green)', borderWidth: '3px', width: 'clamp(3rem, 8vw, 3.5rem)', height: 'clamp(3rem, 8vw, 3.5rem)' }}>
                        <span className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-green)' }}>1</span>
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {t.logDailyActivities}
                        </h4>
                        <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {t.logDailyDesc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="bg-white rounded-full flex items-center justify-center flex-shrink-0" style={{ borderColor: 'var(--color-green)', borderWidth: '3px', width: 'clamp(3rem, 8vw, 3.5rem)', height: 'clamp(3rem, 8vw, 3.5rem)' }}>
                        <span className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-green)' }}>2</span>
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {t.trackPatterns}
                        </h4>
                        <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {t.trackPatternsDesc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="bg-white rounded-full flex items-center justify-center flex-shrink-0" style={{ borderColor: 'var(--color-green)', borderWidth: '3px', width: 'clamp(3rem, 8vw, 3.5rem)', height: 'clamp(3rem, 8vw, 3.5rem)' }}>
                        <span className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-green)' }}>3</span>
                      </div>
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {t.contributeToResearch}
                        </h4>
                        <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {t.contributeDesc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-12 border-2" style={{ borderColor: 'var(--border-light)' }}>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                    {t.dataUsage}
                  </h3>
                  <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {t.dataUsageDesc1}
                  </p>
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => setCurrentTab('survey')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl text-white transition-all hover:opacity-90 shadow-lg min-h-[64px]"
                    style={{ backgroundColor: 'var(--color-green)' }}
                  >
                    {t.startParticipating}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : currentTab === 'settings' ? (
          <div className="max-w-4xl mx-auto p-6">
            <div className="py-8">
              <div className="text-center mb-12">
                <SettingsIcon className="mx-auto mb-6" style={{ color: 'var(--color-green)', width: 'clamp(3rem, 8vw, 4rem)', height: 'clamp(3rem, 8vw, 4rem)' }} />
                <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  {language === 'zh' ? '设置' : 'Settings'}
                </h2>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'zh' ? '管理您的通知偏好和账户设置' : 'Manage your notification preferences and account settings'}
                </p>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-8 border" style={{ borderColor: 'var(--border-light)' }}>
                  <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                    {language === 'zh' ? '通知设置' : 'Notification Settings'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {language === 'zh' ? '每日提醒' : 'Daily Reminders'}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? '接收完成每日调查的提醒' : 'Receive reminders to complete your daily survey'}
                        </p>
                      </div>
                      <button
                        className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                        style={{ backgroundColor: 'var(--color-green)' }}
                      >
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out translate-x-6" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {language === 'zh' ? '研究更新' : 'Research Updates'}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? '接收有关研究进展的通知' : 'Receive notifications about research progress'}
                        </p>
                      </div>
                      <button
                        className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                        style={{ backgroundColor: 'var(--color-green)' }}
                      >
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out translate-x-6" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {language === 'zh' ? '推送通知' : 'Push Notifications'}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? '在移动设备上接收推送通知' : 'Receive push notifications on your mobile device'}
                        </p>
                      </div>
                      <button
                        className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                        style={{ backgroundColor: 'var(--color-green)' }}
                      >
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-8 border" style={{ borderColor: 'var(--border-light)' }}>
                  <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                    {language === 'zh' ? '账户设置' : 'Account Settings'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {language === 'zh' ? '电子邮件地址' : 'Email Address'}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {user.email}
                        </p>
                      </div>
                      <button
                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                        style={{ 
                          border: '1px solid var(--border-light)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {language === 'zh' ? '更改' : 'Change'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {language === 'zh' ? '数据导出' : 'Data Export'}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? '下载您的调查数据副本' : 'Download a copy of your survey data'}
                        </p>
                      </div>
                      <button
                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                        style={{ 
                          border: '1px solid var(--border-light)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {language === 'zh' ? '导出' : 'Export'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => handleTabClick('survey')}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-green)' }}
                  >
                    {language === 'zh' ? '返回调查' : 'Back to Survey'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : currentTab === 'survey' || !user ? (
          /* Show survey form for survey tab or when no user */
          <DementiaCaregiverSurvey language={language} />
        ) : null}
      </main>
    </div>
  );
};

export default SurveyPlatform;
