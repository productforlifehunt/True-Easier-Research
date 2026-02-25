import { useState, useEffect } from 'react';
import { translations, Language } from '../lib/translations';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved === 'zh' || saved === 'en') ? saved : 'en';
  });

  const changeLanguage = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang);
      localStorage.setItem('app-language', lang);
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
    }
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key];
  };

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<Language>) => {
      const newLang = e.detail;
      if (newLang !== language) {
        setLanguage(newLang);
        localStorage.setItem('app-language', newLang);
      }
    };
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, [language]);

  return { language, changeLanguage, t };
};
