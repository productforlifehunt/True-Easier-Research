import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  icon
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed'
  ];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: [
      'text-white',
      'shadow-sm',
      'hover:shadow-md',
      'focus:ring-emerald-500'
    ],
    secondary: [
      'text-white',
      'bg-gray-600',
      'hover:bg-gray-700',
      'shadow-sm',
      'hover:shadow-md',
      'focus:ring-gray-500'
    ],
    outline: [
      'bg-white',
      'border-2',
      'hover:bg-gray-50',
      'focus:ring-emerald-500'
    ],
    ghost: [
      'bg-transparent',
      'hover:bg-gray-100',
      'focus:ring-gray-500'
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'shadow-sm',
      'hover:shadow-md',
      'focus:ring-red-500'
    ]
  };

  const allClasses = [
    ...baseClasses,
    sizeClasses[size],
    ...variantClasses[variant],
    className
  ].join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={allClasses}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        backgroundColor: variant === 'primary' ? 'var(--color-green)' : undefined,
        borderColor: variant === 'outline' ? 'var(--border-light)' : undefined,
        color: variant === 'outline' || variant === 'ghost' ? 'var(--text-primary)' : undefined
      }}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {!loading && icon && icon}
      {children}
    </button>
  );
};

export default Button;
