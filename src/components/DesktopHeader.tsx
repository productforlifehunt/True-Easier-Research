import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, Mail, BookOpen, FileText } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

const DesktopHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/about') return 'about';
    if (path === '/how-to') return 'howto';
    if (path === '/contact') return 'contact';
    if (path === '/study-introduction') return 'study-intro';
    if (path === '/join-survey') return 'join';
    if (path.includes('/survey') || path.includes('/timeline') || path.includes('/add-entry') || path.includes('/summary')) return 'survey';
    if (path === '/settings') return 'settings';
    return 'home';
  };

  const currentTab = getCurrentTab();

  const handleTabClick = (tab: string) => {
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'survey') {
      navigate('/timeline');
    } else if (tab === 'about') {
      navigate('/about');
    } else if (tab === 'howto') {
      navigate('/how-to');
    } else if (tab === 'contact') {
      navigate('/contact');
    } else if (tab === 'study-intro') {
      navigate('/study-introduction');
    } else if (tab === 'join') {
      navigate('/join-survey');
    } else if (tab === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <>
      <header className="hidden md:flex sticky top-0 z-50 py-4" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={() => navigate('/')}
            className="text-sm sm:text-base md:text-lg font-semibold tracking-tight truncate max-w-[200px] sm:max-w-[300px] md:max-w-none hover:opacity-80 transition-opacity cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
          >
            {language === 'zh' ? '痴呆症照护者的一周生活' : 'A Week in the Life of Dementia Caregivers'}
          </button>
          
          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleTabClick('home')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                currentTab === 'home' ? 'text-white shadow-md' : 'hover:bg-white/50'
              }`}
              style={{ 
                backgroundColor: currentTab === 'home' ? 'var(--color-green)' : 'transparent',
                color: currentTab === 'home' ? 'white' : 'var(--text-secondary)'
              }}
            >
              {language === 'zh' ? '首页' : 'Home'}
            </button>
            <button
              onClick={() => handleTabClick('survey')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                currentTab === 'survey' ? 'text-white shadow-md' : 'hover:bg-white/50'
              }`}
              style={{ 
                backgroundColor: currentTab === 'survey' ? 'var(--color-green)' : 'transparent',
                color: currentTab === 'survey' ? 'white' : 'var(--text-secondary)'
              }}
            >
              {language === 'zh' ? '调查' : 'Survey'}
            </button>
            <button
              onClick={() => handleTabClick('about')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1 ${
                currentTab === 'about' ? 'text-white shadow-md' : 'hover:bg-white/50'
              }`}
              style={{ 
                backgroundColor: currentTab === 'about' ? 'var(--color-green)' : 'transparent',
                color: currentTab === 'about' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Info className="w-4 h-4" />
              {language === 'zh' ? '关于' : 'About'}
            </button>
            <button
              onClick={() => handleTabClick('howto')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                currentTab === 'howto' ? 'text-white shadow-md' : 'hover:bg-white/50'
              }`}
              style={{ 
                backgroundColor: currentTab === 'howto' ? 'var(--color-green)' : 'transparent',
                color: currentTab === 'howto' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <BookOpen className="w-4 h-4" />
              {language === 'zh' ? '如何参与 / 帮助' : 'How-to / Help'}
            </button>
            <button
              onClick={() => handleTabClick('join')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                currentTab === 'join' ? 'text-white shadow-md' : 'hover:bg-white/50'
              }`}
              style={{ 
                backgroundColor: currentTab === 'join' ? 'var(--color-green)' : 'transparent',
                color: currentTab === 'join' ? 'white' : 'var(--text-secondary)'
              }}
            >
              {language === 'zh' ? '加入 / 邀请' : 'Join / Invite'}
            </button>
            <button
              onClick={() => handleTabClick('contact')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1 ${
                currentTab === 'contact' ? 'text-white shadow-md' : 'hover:bg-white/50'
              }`}
              style={{ 
                backgroundColor: currentTab === 'contact' ? 'var(--color-green)' : 'transparent',
                color: currentTab === 'contact' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Mail className="w-4 h-4" />
              {language === 'zh' ? '联系我们' : 'Contact'}
            </button>
            <button
              onClick={() => handleTabClick('study-intro')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1 ${
                currentTab === 'study-intro' ? 'text-white shadow-md' : 'hover:bg-white/50'
              }`}
              style={{ 
                backgroundColor: currentTab === 'study-intro' ? 'var(--color-green)' : 'transparent',
                color: currentTab === 'study-intro' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <FileText className="w-4 h-4" />
              {language === 'zh' ? '研究介绍' : 'Protocol'}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>EN</span>
            <button
              onClick={() => {
                const newLang = language === 'en' ? 'zh' : 'en';
                changeLanguage(newLang);
              }}
              className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200"
              style={{ backgroundColor: language === 'zh' ? 'var(--color-green)' : 'var(--toggle-inactive)' }}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  language === 'zh' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="hidden sm:inline text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>中</span>
          </div>
          
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-medium truncate max-w-[150px]" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </span>
              <button
                onClick={async () => {
                  try {
                    await logout();
                    localStorage.clear();
                    window.location.replace('/');
                  } catch (error) {
                    console.error('Logout error:', error);
                    localStorage.clear();
                    window.location.replace('/');
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 hover:bg-gray-50"
                style={{ 
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-secondary)'
                }}
              >
                {language === 'zh' ? '退出' : 'Logout'}
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{ 
                  backgroundColor: 'var(--color-green)',
                  color: 'white'
                }}
              >
                {language === 'zh' ? '登录 / 注册' : 'Sign In / Sign Up'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default DesktopHeader;
