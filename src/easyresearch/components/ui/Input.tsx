import React from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: boolean;
  helperText?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = '',
  error = false,
  helperText,
  label,
  size = 'md',
  icon
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base'
  };

  const baseClasses = [
    'w-full',
    'rounded-lg',
    'border-2',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    sizeClasses[size],
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'focus:ring-emerald-200',
    icon ? 'pl-10' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div style={{ color: 'var(--text-secondary)' }}>
              {icon}
            </div>
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={baseClasses}
          style={{
            borderColor: error ? undefined : 'var(--border-light)',
            backgroundColor: disabled ? 'var(--bg-secondary)' : 'white'
          }}
        />
      </div>
      {helperText && (
        <p 
          className={`mt-1 text-xs ${error ? 'text-red-600' : ''}`}
          style={{ color: error ? undefined : 'var(--text-secondary)' }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: boolean;
  helperText?: string;
  label?: string;
  rows?: number;
  resize?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = '',
  error = false,
  helperText,
  label,
  rows = 4,
  resize = true
}) => {
  const baseClasses = [
    'w-full',
    'px-4',
    'py-3',
    'rounded-lg',
    'border-2',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'focus:ring-emerald-200',
    resize ? 'resize-y' : 'resize-none',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        className={baseClasses}
        style={{
          borderColor: error ? undefined : 'var(--border-light)',
          backgroundColor: disabled ? 'var(--bg-secondary)' : 'white'
        }}
      />
      {helperText && (
        <p 
          className={`mt-1 text-xs ${error ? 'text-red-600' : ''}`}
          style={{ color: error ? undefined : 'var(--text-secondary)' }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
