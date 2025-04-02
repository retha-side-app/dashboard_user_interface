import React from 'react';

const LoadingProfile: React.FC = () => {
  return (
    <div className="animate-pulse flex items-center space-x-4">
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
    </div>
  );
};

export default LoadingProfile;