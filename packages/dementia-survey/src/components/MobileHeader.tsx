import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, Mail, Menu, X, BookOpen } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

const MobileHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/about') return 'about';
    if (path === '/how-to') return 'howto';
    if (path === '/contact') return 'contact';
    if (path === '/join-survey') return 'join';
    if (path.includes('/survey') || path.includes('/timeline') || path.includes('/add-entry') || path.includes('/summary')) return 'survey';
    if (path === '/settings') return 'settings';
    return 'home';
  };

  const currentTab = getCurrentTab();

  const handleTabClick = (tab: string) => {
    setIsMenuOpen(false);
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'howto':
        navigate('/how-to');
        break;
      case 'contact':
        navigate('/contact');
        break;
      case 'join':
        navigate('/join-survey');
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      await logout();
      localStorage.clear();
      window.location.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      window.location.replace('/');
    }
  };

  return (
    <>
    <header className="md:hidden sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}>
      {/* Top Row: Logo + Auth + Language */}
      <div className="flex items-center justify-between px-3 py-2.5 gap-2">
        <button
          onClick={() => handleTabClick('home')}
          className="text-sm font-bold truncate min-w-0"
          style={{ color: 'var(--color-green)' }}
        >
          {language === 'zh' ? '痴呆症照护者研究' : 'Dementia Caregiver Study'}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {/* Language Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>EN</span>
            <button
              onClick={() => {
                const newLang = language === 'en' ? 'zh' : 'en';
                changeLanguage(newLang);
              }}
              className={`ios-toggle ${language === 'zh' ? 'active' : ''}`}
              style={{ width: 42, minWidth: 42, height: 26, minHeight: 26 }}
            >
              <span className="ios-toggle-thumb" style={{ width: 22, height: 22 }} />
            </button>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>中</span>
          </div>

          {/* Auth Widget */}
          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200"
              style={{ 
                borderColor: 'var(--border-light)',
                color: 'var(--text-secondary)'
              }}
            >
              {language === 'zh' ? '退出' : 'Logout'}
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--color-green)',
                color: 'white'
              }}
            >
              {language === 'zh' ? '登录' : 'Sign In'}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Row: Horizontal Scrollable */}
      <div className="overflow-x-auto px-4 pb-3">
        <nav className="flex gap-2" style={{ minWidth: 'max-content' }}>
          <button
            onClick={() => handleTabClick('about')}
            className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-1.5"
            style={{ 
              backgroundColor: currentTab === 'about' ? 'var(--color-green)' : 'var(--bg-secondary)',
              color: currentTab === 'about' ? 'white' : 'var(--text-primary)'
            }}
          >
            <Info className="w-3.5 h-3.5" />
            {language === 'zh' ? '关于' : 'About'}
          </button>

          <button
            onClick={() => handleTabClick('howto')}
            className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-1.5"
            style={{ 
              backgroundColor: currentTab === 'howto' ? 'var(--color-green)' : 'var(--bg-secondary)',
              color: currentTab === 'howto' ? 'white' : 'var(--text-primary)'
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {language === 'zh' ? '如何参与 / 帮助' : 'How-to / Help'}
          </button>

          <button
            onClick={() => handleTabClick('join')}
            className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200"
            style={{ 
              backgroundColor: currentTab === 'join' ? 'var(--color-green)' : 'var(--bg-secondary)',
              color: currentTab === 'join' ? 'white' : 'var(--text-primary)'
            }}
          >
            {language === 'zh' ? '加入 / 邀请' : 'Join / Invite'}
          </button>

          <button
            onClick={() => handleTabClick('contact')}
            className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-1.5"
            style={{ 
              backgroundColor: currentTab === 'contact' ? 'var(--color-green)' : 'var(--bg-secondary)',
              color: currentTab === 'contact' ? 'white' : 'var(--text-primary)'
            }}
          >
            <Mail className="w-3.5 h-3.5" />
            {language === 'zh' ? '联系' : 'Contact'}
          </button>
        </nav>
      </div>
    </header>
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default MobileHeader;
