import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n, LANGUAGES, type Language } from '../hooks/useI18n';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false, className = '' }) => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLang = LANGUAGES.find(l => l.code === lang);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-full border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all ${
          compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]'
        } font-medium text-stone-600`}
      >
        <Globe size={compact ? 12 : 14} className="text-stone-400" />
        <span>{currentLang?.nativeName || 'English'}</span>
        <ChevronDown size={compact ? 10 : 12} className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden z-50" style={{ maxHeight: '300px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-[12px] hover:bg-emerald-50 transition-colors ${
                lang === l.code ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-stone-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px]">{l.nativeName}</span>
                {l.nativeName !== l.name && <span className="text-[10px] text-stone-400">({l.name})</span>}
              </div>
              {lang === l.code && <Check size={12} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
