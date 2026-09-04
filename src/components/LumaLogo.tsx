import React from 'react';

interface LumaLogoProps {
  variant?: 'full' | 'emblem';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LumaLogo: React.FC<LumaLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
}) => {
  // Size presets
  const sizeClasses = {
    xs: 'h-8',
    sm: 'h-11',
    md: 'h-16',
    lg: 'h-24 sm:h-28',
    xl: 'h-32 sm:h-40',
  };

  return (
    <div className={`inline-flex items-center justify-center relative select-none ${className}`}>
      <img
        src="/luma-logo.png"
        alt="LUMA"
        className={`${sizeClasses[size]} w-auto object-contain drop-shadow-sm`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
