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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <BarChart3 size={14} className="text-white" />
            </div>
            <span className="text-[13px] font-semibold text-stone-700">Easier</span>
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
