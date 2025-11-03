import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  showText?: boolean;
  textClassName?: string;
  companyLogo?: string; // Base64 encoded image or URL
  companyName?: string; // Company name to display
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true, 
  textClassName = '',
  companyLogo,
  companyName = 'ALL INDIA LOGISTICS'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-32 h-32' // 128px
    // '3xl' handled with inline styles (240px)
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  // Handle 3xl size with inline styles since w-60 may not be available
  const logoSizeStyle = size === '3xl' ? { width: '240px', height: '240px' } : undefined;
  const logoSizeClass = size === '3xl' ? '' : (sizeClasses[size] || sizeClasses['md']);

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${logoSizeClass} relative`} style={logoSizeStyle}>
        {companyLogo ? (
          // Company logo
          <img
            src={companyLogo}
            alt={`${companyName} Logo`}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          // Default red star logo
          <>
            {/* Red star background */}
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 100 100" 
              className="absolute inset-0"
            >
              {/* Main red star shape */}
              <path
                d="M50 5 L61.8 38.2 L95 38.2 L69.1 61.8 L80.9 95 L50 71.4 L19.1 95 L30.9 61.8 L5 38.2 L38.2 38.2 Z"
                fill="#DC2626"
                stroke="#DC2626"
                strokeWidth="1"
              />
            </svg>
            
            {/* White A letter */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                width="60%" 
                height="60%" 
                viewBox="0 0 40 40" 
                className="text-white"
              >
                {/* A letter design */}
                <path
                  d="M20 5 L5 35 L12 35 L15 28 L25 28 L28 35 L35 35 L20 5 Z M18 22 L22 22 L20 16 L18 22 Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            {/* Registered trademark symbol */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">®</span>
            </div>
          </>
        )}
      </div>
      
      {showText && (
        <div className={`ml-3 ${textSizeClasses[size]} font-bold text-gray-800 ${textClassName}`}>
          {companyName}
        </div>
      )}
    </div>
  );
};

export default Logo;
