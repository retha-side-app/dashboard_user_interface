import React from 'react';

interface CourseProgressBarProps {
  progress: number;
  className?: string;
}

const CourseProgressBar: React.FC<CourseProgressBarProps> = ({ progress, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-secondary mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-2 bg-primary rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CourseProgressBar;