import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info
  };

  const colors = {
    success: 'var(--color-green)',
    error: '#ef4444',
    info: 'var(--color-primary)'
  };

  const Icon = icons[type];

  return (
    <div 
      className="fixed top-4 right-4 z-50 animate-slide-in"
      style={{ maxWidth: '400px' }}
    >
      <div 
        className="bg-white rounded-xl shadow-lg p-4 flex items-start gap-3"
        style={{ border: `2px solid ${colors[type]}` }}
      >
        <Icon 
          className="w-5 h-5 flex-shrink-0 mt-0.5" 
          style={{ color: colors[type] }} 
        />
        <p className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
