import React from 'react';
import { ChevronRightCircle as CircleChevronRight, ChevronLeftCircle as CircleChevronLeft, StickyNote, X } from 'lucide-react';
import NotesList from './NotesList';

interface NotesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  stepId: string | null;
  isMobile?: boolean;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({
  isOpen,
  onToggle,
  stepId,
  isMobile = false
}) => {
  return (
    <div className={`transition-all duration-300 ${isOpen ? (isMobile ? 'w-full' : 'w-80') : 'w-12'} h-full`}>
      <div className="bg-[#fcfcfb] rounded-[5px] shadow-sm p-4 sticky top-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          {isOpen && (
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <StickyNote className="h-5 w-5 mr-2" strokeWidth={1.5} />
              Notes
            </h2>
          )}
          {isMobile ? (
            isOpen && (
              <button
                onClick={onToggle}
                className="text-secondary hover:text-primary transition-colors"
                aria-label="Close notes"
              >
                <X className="h-6 w-6" />
              </button>
            )
          ) : (
            <button
              onClick={onToggle}
              className="text-secondary hover:text-primary transition-colors"
              aria-label={isOpen ? "Close notes sidebar" : "Open notes sidebar"}
            >
              {isOpen ? (
                <CircleChevronRight className="h-6 w-6" />
              ) : (
                <CircleChevronLeft className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
        
        {isOpen && stepId && (
          <div className="overflow-y-auto">
            <NotesList stepId={stepId} />
          </div>
        )}
        
        {isOpen && !stepId && (
          <div className="text-center py-6 text-secondary text-sm">
            Select a step to view or add notes.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSidebar;