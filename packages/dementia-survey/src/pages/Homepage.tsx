import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useStateManagement';
import { CheckCircle, Users, BarChart3, Shield, ArrowRight, Info, Settings, Calendar, HelpCircle, Pencil } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';
import { supabase } from '../lib/supabase';

const Homepage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, changeLanguage } = useLanguage();
  const [currentTab, setCurrentTab] = useState<'home' | 'survey' | 'about' | 'join' | 'settings'>('home');
  const [studyStartDate, setStudyStartDate] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isUpdatingStartDate, setIsUpdatingStartDate] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Don't auto-redirect authenticated users - let them see the homepage

  const translations = {
    en: {
      title: 'A Week in the Life of Dementia Caregivers',
      subtitle: 'Study of the daily experiences of dementia caregivers',
      heroDescription: 'A 7-day survey to understand daily caregiving activities, challenges, and support needs. We offer voice input and AI writing assistant to make recording easier.',
      cta: {
        primary: 'Start Survey',
        secondary: 'Sign In',
        existing: 'Already have an account?'
      },
      nav: {
        home: 'Home',
        survey: 'Survey',
        about: 'About',
        join: 'Join Study',
        settings: 'Settings'
      },
      signOut: 'Sign Out',
      languageLabels: {
        english: 'English',
        chinese: '中文'
      }
    },
    zh: {
      title: '痴呆症照护者的一周生活',
      subtitle: '关于痴呆症照护者日常经历的研究调查',
      heroDescription: '为期7天的调查问卷，了解日常照护活动、挑战和支持需求。我们提供语音输入和AI写作助手，让记录更轻松。',
      cta: {
        primary: '开始调查',
        secondary: '登录',
        existing: '已有账户？'
      },
      nav: {
        home: '首页',
        survey: '调查',
        about: '关于',
        join: '加入研究',
        settings: '设置'
      },
      signOut: '退出登录',
      languageLabels: {
        english: 'English',
        chinese: '中文'
      }
    }
  };

  const t = translations[language];

  // Fetch enrollment and profile data for logged-in users
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setStudyStartDate(null);
        setCurrentDay(null);
        setEnrollmentData(null);
        setProfileData(null);
        return;
      }

      try {
        // Fetch enrollment data
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollment')
          .select('study_start_date, consent_signed_at, interview_agreement')
          .eq('participant_id', user.id)
          .limit(1);

        if (enrollmentError) {
          console.error('Error fetching enrollment:', enrollmentError);
        } else if (enrollmentData?.[0]) {
          setEnrollmentData(enrollmentData[0]);
          
          if (enrollmentData[0].study_start_date) {
            setStudyStartDate(enrollmentData[0].study_start_date);
            
            // Calculate current day
            const startDate = new Date(enrollmentData[0].study_start_date);
            const today = new Date();
            const diffTime = today.getTime() - startDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            setCurrentDay(diffDays > 0 ? diffDays : null);
          }
        }
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, introduction, relationship_to_patient, is_primary_caregiver, participant_number')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfileData(profileData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, [user]);

  // Smart scroll to current incomplete step
  useEffect(() => {
    if (!scrollContainerRef.current || !enrollmentData || !profileData) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = 260; // Card width + gap
    
    let scrollPosition = 0;
    
    // Determine which card to scroll to
    if (!enrollmentData.consent_signed_at) {
      scrollPosition = 0; // Consent card
    } else {
      const fields = [
        profileData?.full_name,
        profileData?.introduction,
        profileData?.relationship_to_patient,
        profileData?.is_primary_caregiver !== null && profileData?.is_primary_caregiver !== undefined,
        profileData?.participant_number
      ];
      const completed = fields.filter(Boolean).length;
      
      if (completed < 5) {
        scrollPosition = cardWidth; // Onboarding card
      } else if (!studyStartDate) {
        scrollPosition = cardWidth * 2; // Start date card
      } else if (currentDay && currentDay <= 7) {
        scrollPosition = cardWidth * 3; // Survey status card
      } else {
        scrollPosition = cardWidth * 4; // Interview card
      }
    }
    
    setTimeout(() => {
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }, 300);
  }, [enrollmentData, profileData, studyStartDate, currentDay]);
  
  // Update current tab based on location
  useEffect(() => {
    const path = location.pathname;
    if (path === '/survey') {
      setCurrentTab('survey');
    } else if (path === '/about') {
      setCurrentTab('about');
    } else if (path === '/settings') {
      setCurrentTab('settings');
    } else {
      setCurrentTab('home');
    }
  }, [location.pathname]);

  const handleTabClick = (tab: 'home' | 'survey' | 'about' | 'join' | 'settings') => {
    setCurrentTab(tab);
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'survey') {
      navigate('/survey');
    } else if (tab === 'about') {
      // Stay on current page but show about content if we're on survey page
      if (location.pathname === '/survey') {
        // This will be handled by the survey page
        window.dispatchEvent(new CustomEvent('switchToAbout'));
      } else {
        navigate('/survey?tab=about');
      }
    } else if (tab === 'join') {
      navigate('/join-survey');
    } else if (tab === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />

      {/* Hero Section */}
      <section className="px-5 sm:px-8 py-8 md:py-16 text-center pb-20 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
            {t.title}
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t.heroDescription}
          </p>
          
          {/* Survey Progress Cards - Only for logged-in users */}
          {user && (
            <div className="mb-8">
              {/* Horizontally Scrollable Cards */}
              <div ref={scrollContainerRef} className="overflow-x-auto -mx-4 px-4 pb-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                  .overflow-x-auto::-webkit-scrollbar { display: none; }
                `}</style>
                <div className="flex gap-2.5" style={{ width: 'max-content', paddingLeft: '4px', paddingRight: '4px' }}>
                  {/* Card 1: Consent */}
                  <div 
                    className="rounded-xl p-4 shadow-sm transition-all"
                    style={{ 
                      backgroundColor: 'white', 
                      minWidth: '200px', 
                      maxWidth: '200px', 
                      border: enrollmentData?.consent_signed_at ? '2px solid var(--color-green)' : '2px solid var(--border-light)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {enrollmentData?.consent_signed_at ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green)' }}>
                          <span className="text-white text-lg font-bold">✓</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          1
                        </div>
                      )}
                      <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {language === 'zh' ? '同意书' : 'Consent'}
                      </h4>
                    </div>
                    <p className="text-base leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {enrollmentData?.consent_signed_at
                        ? (() => {
                            const date = new Date(enrollmentData.consent_signed_at);
                            return language === 'zh' 
                              ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日已签署`
                              : `Signed on ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
                          })()
                        : (language === 'zh' ? '未签署' : 'Not signed')
                      }
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate('/consent')}
                        className="flex-1 text-base font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2" 
                        style={{ 
                          color: enrollmentData?.consent_signed_at ? 'var(--color-green)' : 'white',
                          backgroundColor: enrollmentData?.consent_signed_at ? 'var(--bg-secondary)' : 'var(--color-green)'
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                        {enrollmentData?.consent_signed_at 
                          ? (language === 'zh' ? '查看' : 'Review')
                          : (language === 'zh' ? '去签署' : 'Sign')
                        }
                      </button>
                      <button 
                        onClick={() => navigate('/how-to?step=3')}
                        className="px-3 py-2 rounded-lg flex items-center gap-1.5" 
                        style={{ color: 'var(--color-green)', backgroundColor: 'var(--bg-secondary)' }}
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{language === 'zh' ? '如何帮助' : 'How to Help'}</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Card 2: Profile Setup */}
                  {(() => {
                    const fields = [
                      profileData?.full_name,
                      profileData?.introduction,
                      profileData?.relationship_to_patient,
                      profileData?.is_primary_caregiver !== null && profileData?.is_primary_caregiver !== undefined,
                      profileData?.participant_number
                    ];
                    const completed = fields.filter(Boolean).length;
                    const isComplete = completed === 5;
                    
                    return (
                      <div 
                        className="rounded-2xl p-5 shadow-md transition-all"
                        style={{ 
                          backgroundColor: 'white', 
                          minWidth: '240px', 
                          maxWidth: '240px', 
                          border: isComplete ? '2px solid var(--color-green)' : '2px solid var(--border-light)'
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {isComplete ? (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green)' }}>
                              <span className="text-white text-lg font-bold">✓</span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                              2
                            </div>
                          )}
                          <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {language === 'zh' ? '个人信息' : 'Profile'}
                          </h4>
                        </div>
                        <p className="text-base leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? `${completed}/5 项已完成` : `${completed}/5 completed`}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate('/settings')}
                            className="flex-1 text-base font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2" 
                            style={{ 
                              color: isComplete ? 'var(--color-green)' : 'white',
                              backgroundColor: isComplete ? 'var(--bg-secondary)' : 'var(--color-green)'
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                            {isComplete 
                              ? (language === 'zh' ? '编辑' : 'Edit')
                              : (language === 'zh' ? '去完成' : 'Complete')
                            }
                          </button>
                          <button 
                            onClick={() => navigate('/how-to?step=4')}
                            className="px-3 py-2 rounded-lg flex items-center gap-1.5" 
                            style={{ color: 'var(--color-green)', backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <HelpCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{language === 'zh' ? '如何帮助' : 'How to Help'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Card 3: Start Date */}
                  <div 
                    className="rounded-2xl p-5 shadow-md transition-all cursor-pointer"
                    style={{ 
                      backgroundColor: 'white', 
                      minWidth: '240px', 
                      maxWidth: '240px', 
                      border: studyStartDate ? '2px solid var(--color-green)' : '2px solid var(--border-light)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {studyStartDate ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green)' }}>
                          <span className="text-white text-lg font-bold">✓</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          3
                        </div>
                      )}
                      <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {language === 'zh' ? '开始日期' : 'Start Date'}
                      </h4>
                    </div>
                    {(studyStartDate && !isEditingStartDate) ? (
                      <div>
                        <p className="text-base leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(studyStartDate).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setIsEditingStartDate(true);
                              setSelectedStartDate(studyStartDate);
                            }}
                            className="flex-1 text-base font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2" 
                            style={{ color: 'var(--color-green)', backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <Pencil className="w-4 h-4" />
                            {language === 'zh' ? '修改' : 'Edit'}
                          </button>
                          <button 
                            onClick={() => navigate('/how-to?step=5')}
                            className="px-3 py-2 rounded-lg flex items-center gap-1.5" 
                            style={{ color: 'var(--color-green)', backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <HelpCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{language === 'zh' ? '如何帮助' : 'How to Help'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={selectedStartDate}
                          onChange={(e) => setSelectedStartDate(e.target.value)}
                          className="w-full px-3 py-3 rounded-lg border-2 transition-all focus:outline-none text-base"
                          style={{ 
                            borderColor: 'var(--border-light)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <button
                          onClick={async () => {
                            if (!selectedStartDate) return;
                            setIsUpdatingStartDate(true);
                            try {
                              await supabase
                                .from('enrollment')
                                .update({ study_start_date: selectedStartDate })
                                .eq('participant_id', user.id);
                              setStudyStartDate(selectedStartDate);
                              setIsEditingStartDate(false);
                              window.location.reload();
                            } catch (error) {
                              console.error('Error updating start date:', error);
                            } finally {
                              setIsUpdatingStartDate(false);
                            }
                          }}
                          disabled={isUpdatingStartDate}
                          className="w-full px-4 py-2 rounded-lg font-semibold text-white transition-all text-base"
                          style={{ backgroundColor: 'var(--color-green)' }}
                        >
                          {isUpdatingStartDate ? (language === 'zh' ? '保存中...' : 'Saving...') : (language === 'zh' ? '保存' : 'Save')}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Card 4: Survey Status */}
                  {studyStartDate && currentDay && (
                    <div 
                      onClick={() => navigate('/survey')}
                      className="rounded-2xl p-5 shadow-md transition-all cursor-pointer"
                      style={{ 
                        backgroundColor: 'white', 
                        minWidth: '240px', 
                        maxWidth: '240px', 
                        border: '2px solid var(--color-green)'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                          4
                        </div>
                        <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {language === 'zh' ? '问卷进度' : 'Survey'}
                        </h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {language === 'zh' ? `第 ${currentDay} 天` : `Day ${currentDay} of 7`}
                        </p>
                        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? `还剩 ${Math.max(0, 7 - currentDay)} 天` : `${Math.max(0, 7 - currentDay)} days left`}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/survey');
                          }}
                          className="flex-1 text-base font-semibold px-4 py-2 rounded-lg" 
                          style={{ color: 'white', backgroundColor: 'var(--color-green)' }}
                        >
                          {language === 'zh' ? '去填写' : 'Take Survey'}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/how-to?step=6');
                          }}
                          className="px-3 py-2 rounded-lg flex items-center gap-1.5" 
                          style={{ color: 'var(--color-green)', backgroundColor: 'var(--bg-secondary)' }}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">{language === 'zh' ? '如何帮助' : 'How to Help'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Card 5: Interview */}
                  <div 
                    className="rounded-xl p-4 shadow-sm transition-all"
                    style={{ 
                      backgroundColor: 'white', 
                      minWidth: '200px', 
                      maxWidth: '200px', 
                      border: enrollmentData?.interview_agreement ? '2px solid var(--color-green)' : '2px solid var(--border-light)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold"
                        style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
                      >
                        5
                      </div>
                      <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {language === 'zh' ? '访谈' : 'Interview'}
                      </h4>
                    </div>
                    <p className="text-base leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {enrollmentData?.interview_agreement
                        ? (language === 'zh' ? '已同意参加' : 'Agreed')
                        : (language === 'zh' ? '可选' : 'Optional')
                      }
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate('/settings')}
                        className="flex-1 text-base font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2" 
                        style={{ 
                          color: enrollmentData?.interview_agreement ? 'var(--color-green)' : 'white',
                          backgroundColor: enrollmentData?.interview_agreement ? 'var(--bg-secondary)' : 'var(--color-green)'
                        }}
                      >
                        {enrollmentData?.interview_agreement && <Pencil className="w-4 h-4" />}
                        {enrollmentData?.interview_agreement
                          ? (language === 'zh' ? '编辑' : 'Edit')
                          : (language === 'zh' ? '去设置' : 'Set Up')
                        }
                      </button>
                      <button 
                        onClick={() => navigate('/how-to?step=7')}
                        className="px-3 py-2 rounded-lg flex items-center gap-1.5" 
                        style={{ color: 'var(--color-green)', backgroundColor: 'var(--bg-secondary)' }}
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{language === 'zh' ? '如何帮助' : 'How to Help'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => navigate('/survey')}
            className="px-6 py-3 text-white text-base rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2 mx-auto"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            {t.cta.primary}
            <ArrowRight className="w-5 h-5" style={{ minWidth: '1.25rem', minHeight: '1.25rem' }} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
