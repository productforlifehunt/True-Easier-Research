import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, Clock } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';

const About: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const text = language === 'zh' ? {
    title: '关于本研究',
    about: {
      title: '研究内容'
    },
    contact: {
      title: '联系我们',
      content: '如有任何问题，请随时联系我们。'
    }
  } : {
    title: 'About This Study',
    about: {
      title: 'What This Study Does'
    },
    contact: {
      title: 'Contact Us',
      content: 'If you have any questions, please feel free to contact us.'
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
        </div>

        {/* About Section */}
        <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: 'var(--color-green)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {text.about.title}
            </h2>
          </div>
        </div>

        {/* Contact */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {text.contact.title}
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            {text.contact.content}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/join-survey')}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              {language === 'zh' ? '加入研究' : 'Join the Study'}
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm border transition-all hover:shadow-sm"
              style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)', backgroundColor: 'white' }}
            >
              {language === 'zh' ? '联系我们' : 'Contact Us'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
