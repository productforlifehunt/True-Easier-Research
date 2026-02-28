import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonStyle?: React.CSSProperties;
  disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  className = '',
  buttonStyle = {},
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleClose = (e: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => updatePosition();
    document.addEventListener('mousedown', handleClose);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClose);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updatePosition]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => { if (!disabled) { updatePosition(); setIsOpen(!isOpen); } }}
        disabled={disabled}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium border border-stone-200 bg-white hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={buttonStyle}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={14} 
          className={`transition-transform text-stone-400 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="fixed rounded-xl border border-stone-100 bg-white shadow-lg shadow-stone-200/50 overflow-hidden"
          style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width, maxHeight: 280, overflowY: 'auto', zIndex: 9999 }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors ${
                value === option.value
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomDropdown;
