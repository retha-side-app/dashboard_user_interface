import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
        <div className="flex items-center">
          <div className="h-2 w-24 md:w-48 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-primary rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="ml-2 md:ml-4 text-xs md:text-sm text-secondary">Progress: {progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;