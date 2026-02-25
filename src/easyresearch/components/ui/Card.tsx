import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const baseClasses = [
    'bg-white',
    'rounded-2xl',
    paddingClasses[padding],
    shadowClasses[shadow],
    border ? 'border' : '',
    onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={baseClasses}
      style={{ 
        borderColor: border ? 'var(--border-light)' : undefined 
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
