import React from 'react';

interface LoadingLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LoadingLogo: React.FC<LoadingLogoProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32'
  };

  const progressBarSizes = {
    sm: 'w-10',
    md: 'w-14',
    lg: 'w-16',
    xl: 'w-24'
  };

  const progressBarHeights = {
    sm: 'h-0.5',
    md: 'h-1',
    lg: 'h-1',
    xl: 'h-1.5'
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
        {/* Static inner ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/60" />
        {/* DCC Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="https://www.mdn.dz/site_principal/sommaire/presentation/images/insignes/dcc.png" 
            alt="DCC Logo" 
            className={`${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : size === 'lg' ? 'h-8 w-8' : 'h-16 w-16'} object-contain`}
          />
        </div>
      </div>
      
      {/* Loading progress bar */}
      <div className={`${progressBarSizes[size]} ${progressBarHeights[size]} bg-gray-300 rounded-full overflow-hidden`}>
        <div className="h-full bg-primary animate-progress" />
      </div>
    </div>
  );
};
