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
      
      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
        </div>

        {/* About Section */}
        <div className="mb-6 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" style={{ color: 'var(--color-green)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {text.about.title}
            </h2>
          </div>
        </div>

        {/* Contact */}
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            {text.contact.title}
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            {text.contact.content}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/join-survey')}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              {language === 'zh' ? '加入研究' : 'Join the Study'}
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 rounded-xl font-semibold border transition-all hover:shadow-sm"
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
