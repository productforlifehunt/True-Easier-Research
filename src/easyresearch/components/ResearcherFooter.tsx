import React from 'react';
import { useI18n } from '../hooks/useI18n';
import easierLogo from '../../assets/easier-logo-v2.png';

const ResearcherFooter: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-stone-100 mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 min-w-[28px] min-h-[28px] max-w-[28px] max-h-[28px] rounded-lg overflow-hidden">
              <img src={easierLogo} alt="Easier" className="w-full h-full object-cover" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-stone-800">{t('brand.name')}</span>
          </div>
          <p className="text-[12px] text-stone-400 font-light">
            {t('brand.copyright')}
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors font-light">Terms</a>
            <a href="#" className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors font-light">Privacy</a>
            <a href="#" className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors font-light">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ResearcherFooter;
