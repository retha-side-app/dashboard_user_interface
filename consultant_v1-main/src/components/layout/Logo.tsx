import React from 'react';

const Logo: React.FC = () => {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 400 400" 
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id="strokeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2D3436' }} />
          <stop offset="100%" style={{ stopColor: '#636E72' }} />
        </linearGradient>
        <linearGradient id="strokeGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#636E72' }} />
          <stop offset="100%" style={{ stopColor: '#2D3436' }} />
        </linearGradient>
      </defs>
      {/* Left triangle */}
      <path
        d="M100,120 L220,200 L100,280 Z"
        fill="none"
        stroke="url(#strokeGrad1)"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      {/* Right triangle */}
      <path
        d="M300,120 L180,200 L300,280 Z"
        fill="none"
        stroke="url(#strokeGrad2)"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      {/* Center connector */}
      <line
        x1="180"
        y1="200"
        x2="220"
        y2="200"
        stroke="url(#strokeGrad1)"
        strokeWidth="8"
      />
    </svg>
  );
};

export default Logo;