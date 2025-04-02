import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContentNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

const ContentNavigation: React.FC<ContentNavigationProps> = ({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) => {
  return (
    <div className="flex items-center justify-between pt-4 md:pt-8 border-t">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={`flex items-center text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2 rounded-[5px] ${
          hasPrevious
            ? 'bg-[#aeaeae] text-white hover:bg-opacity-90'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 mr-1" />
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`flex items-center text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2 rounded-[5px] ${
          hasNext
            ? 'bg-[#151523] text-white hover:bg-opacity-90'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Next
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-1" />
      </button>
    </div>
  );
};

export default ContentNavigation;