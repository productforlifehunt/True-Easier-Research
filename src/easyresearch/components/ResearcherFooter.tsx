import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const ResearcherFooter: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-stone-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="30" r="12" fill="#34d399" opacity="0.85"/>
              <circle cx="40" cy="30" r="12" fill="#14b8a6" opacity="0.85"/>
              <ellipse cx="32" cy="22" rx="9" ry="12" fill="#10b981"/>
              <rect x="30.5" y="34" width="3" height="12" rx="1.5" fill="#10b981"/>
            </svg>
            <span className="text-[13px] font-semibold text-stone-700">Easier Research</span>
          </div>
          <p className="text-[12px] text-stone-400 font-light">
            &copy; {currentYear} Easier. All rights reserved.
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
