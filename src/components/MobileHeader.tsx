import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, Mail, BookOpen } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

const MobileHeader: React.FC = () => {
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
    if (path === '/join-survey') return 'join';
    if (path.includes('/survey') || path.includes('/timeline') || path.includes('/add-entry') || path.includes('/summary')) return 'survey';
    if (path === '/settings') return 'settings';
    return 'home';
  };

  const currentTab = getCurrentTab();

  const handleTabClick = (tab: string) => {
    switch (tab) {
      case 'home': navigate('/'); break;
      case 'about': navigate('/about'); break;
      case 'howto': navigate('/how-to'); break;
      case 'contact': navigate('/contact'); break;
      case 'join': navigate('/join-survey'); break;
    }
  };

  const handleLogout = async () => {
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

  const navItems = [
    { id: 'about', icon: Info, label: language === 'zh' ? '关于' : 'About' },
    { id: 'howto', icon: BookOpen, label: language === 'zh' ? '指南' : 'Guide' },
    { id: 'join', icon: null, label: language === 'zh' ? '加入' : 'Join' },
    { id: 'contact', icon: Mail, label: language === 'zh' ? '联系' : 'Contact' },
  ];

  return (
    <>
    <header 
      className="md:hidden sticky top-0 z-50"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          onClick={() => handleTabClick('home')}
          className="text-[15px] font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
        >
          {language === 'zh' ? '照护者研究' : 'Caregiver Study'}
        </button>

        <div className="flex items-center gap-2">
          {/* Language Toggle - Minimal */}
          <button
            onClick={() => changeLanguage(language === 'en' ? 'zh' : 'en')}
            className="px-2 py-1 rounded-md text-[11px] font-medium"
            style={{ 
              backgroundColor: 'rgba(120, 120, 128, 0.08)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.02em'
            }}
          >
            {language === 'en' ? '中文' : 'EN'}
          </button>

          {/* Auth */}
          {user ? (
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md"
              style={{ 
                backgroundColor: 'rgba(120, 120, 128, 0.08)',
                color: 'var(--text-secondary)'
              }}
            >
              {language === 'zh' ? '退出' : 'Logout'}
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1 text-[11px] font-semibold rounded-full"
              style={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white'
              }}
            >
              {language === 'zh' ? '登录' : 'Sign In'}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Row */}
      <div className="overflow-x-auto px-4 pb-2.5">
        <nav className="flex gap-1.5" style={{ minWidth: 'max-content' }}>
          {navItems.map(item => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="px-3 py-1.5 rounded-full font-medium text-[12px] whitespace-nowrap transition-all duration-200 flex items-center gap-1"
                style={{ 
                  backgroundColor: active ? 'var(--color-green)' : 'rgba(120, 120, 128, 0.08)',
                  color: active ? 'white' : 'var(--text-secondary)',
                  letterSpacing: '-0.01em'
                }}
              >
                {item.icon && <item.icon className="w-3 h-3" />}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default MobileHeader;