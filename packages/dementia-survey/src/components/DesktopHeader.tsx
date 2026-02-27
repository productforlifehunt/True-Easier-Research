import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, Mail, BookOpen, FileText } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

// Responsive header - v2
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

  const navItems = [
    { id: 'home', label: language === 'zh' ? '首页' : 'Home', icon: null },
    { id: 'survey', label: language === 'zh' ? '调查' : 'Survey', icon: null },
    { id: 'about', label: language === 'zh' ? '关于' : 'About', icon: Info },
    { id: 'howto', label: language === 'zh' ? '如何帮助' : 'How-to', icon: BookOpen },
    { id: 'join', label: language === 'zh' ? '加入' : 'Join', icon: null },
    { id: 'contact', label: language === 'zh' ? '联系' : 'Contact', icon: Mail },
    { id: 'study-intro', label: language === 'zh' ? '协议' : 'Protocol', icon: FileText },
  ];

  return (
    <>
      <header 
        className="hidden md:block sticky top-0 z-50"
        style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)', width: '100%', maxWidth: '100vw' }}
      >
        {/* Single row: logo | nav (scrollable) | controls — all within viewport */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0.625rem 1rem', boxSizing: 'border-box' }}>
          {/* Logo - fixed width, won't shrink */}
          <button
            onClick={() => navigate('/')}
            className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity cursor-pointer"
            style={{ color: 'var(--text-primary)', flexShrink: 0, marginRight: '0.75rem', whiteSpace: 'nowrap' }}
          >
            {language === 'zh' ? '照护者研究' : 'Caregiver Study'}
          </button>
          
          {/* Navigation - fills remaining space, scrolls internally if needed */}
          <nav 
            style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: '1 1 0%', minWidth: 0, overflowX: 'auto', marginRight: '0.75rem', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className="px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                  style={{ 
                    backgroundColor: isActive ? 'var(--color-green)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right controls - fixed, won't shrink */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Language Toggle */}
            <button
              onClick={() => changeLanguage(language === 'en' ? 'zh' : 'en')}
              className="px-2 py-1 rounded-md text-xs font-medium border"
              style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
            >
              {language === 'en' ? '中文' : 'EN'}
            </button>
            
            {user ? (
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
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                {language === 'zh' ? '退出' : 'Logout'}
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap"
                style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
              >
                {language === 'zh' ? '登录' : 'Sign In'}
              </button>
            )}
          </div>
        </div>
      </header>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default DesktopHeader;
