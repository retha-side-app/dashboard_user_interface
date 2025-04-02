import React, { useEffect, useState } from 'react';
import { ChevronLeftCircle as CircleChevronLeft, ChevronRightCircle as CircleChevronRight, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import type { CourseWeek, CourseDay, CourseStep } from '../../../services/types/course';
import { useCompletion } from '../../../context/CompletionContext';
import AnnouncementsSection from './AnnouncementsSection';

interface ContentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  weeks: CourseWeek[];
  currentWeek: CourseWeek | null;
  currentDay: CourseDay | null;
  currentStep: CourseStep | null;
  onStepSelect: (week: CourseWeek, day: CourseDay, step: CourseStep) => void;
  courseId: string;
  onAnnouncementsClick: () => void;
  isMobile?: boolean;
  isBottomMenu?: boolean;
}

const ContentSidebar: React.FC<ContentSidebarProps> = ({
  isOpen,
  onToggle,
  weeks,
  currentWeek,
  currentDay,
  currentStep,
  onStepSelect,
  courseId,
  onAnnouncementsClick,
  isMobile = false,
  isBottomMenu = false
}) => {
  const { completedSteps, loadCompletionStatus } = useCompletion();
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize expanded state for all weeks
    const initialExpandedState: Record<string, boolean> = {};
    weeks.forEach(week => {
      // Expand the current week by default
      initialExpandedState[week.id] = currentWeek ? week.id === currentWeek.id : false;
    });
    setExpandedWeeks(initialExpandedState);
  }, [weeks, currentWeek]);

  useEffect(() => {
    // Collect all step IDs from the course structure
    const stepIds: string[] = [];
    weeks.forEach(week => {
      week.days.forEach(day => {
        day.steps.forEach(step => {
          stepIds.push(step.id);
        });
      });
    });
    
    // Load completion status for all steps
    loadCompletionStatus(stepIds);
  }, [weeks, loadCompletionStatus]);

  // Function to check if all steps in a day are completed
  const isDayCompleted = (day: CourseDay): boolean => {
    // If there are no steps, the day is not considered complete
    if (day.steps.length === 0) return false;
    
    // Check if all steps in the day are completed
    return day.steps.every(step => completedSteps[step.id] === true);
  };

  const toggleWeekExpansion = (weekId: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };

  // For bottom menu on mobile
  if (isBottomMenu && isMobile) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 transition-all duration-300 ${isOpen ? 'max-h-[70vh]' : 'max-h-12'}`}>
        <div 
          className="flex items-center justify-center py-2 border-b cursor-pointer"
          onClick={onToggle}
        >
          <ChevronDown className={`h-5 w-5 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          <span className="ml-2 text-sm font-medium text-primary">Course Content</span>
        </div>
        
        {isOpen && (
          <div className="overflow-y-auto p-4 max-h-[calc(70vh-40px)]">
            <AnnouncementsSection 
              courseId={courseId} 
              isOpen={true} 
              onAnnouncementsClick={onAnnouncementsClick} 
            />
            
            {weeks.map((week, weekIndex) => (
              <div key={week.id} className={weekIndex < weeks.length - 1 ? "pb-4 border-b border-[#cccccc] mb-4" : ""}>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleWeekExpansion(week.id)}
                >
                  <h3 className="font-medium text-primary">
                    {week.title}
                  </h3>
                  <button className="text-secondary hover:text-primary p-1">
                    {expandedWeeks[week.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {expandedWeeks[week.id] && (
                  <div className="pl-4 space-y-2 mt-2">
                    {week.days.map((day) => (
                      <div key={day.id}>
                        <p className="text-sm text-secondary flex items-center">
                          {isDayCompleted(day) && (
                            <CheckCircle className="h-4 w-4 mr-2 text-[#0dd152]" strokeWidth={1.5} />
                          )}
                          <span>Day {day.day_number}</span>
                        </p>
                        <div className="pl-4 border-l border-gray-200 mt-1">
                          {day.steps.map((step) => (
                            <button
                              key={step.id}
                              onClick={() => onStepSelect(week, day, step)}
                              className={`text-sm py-1 block w-full text-left flex items-center ${
                                currentStep?.id === step.id
                                  ? 'text-primary font-medium border border-primary rounded-[3px] px-2'
                                  : 'text-secondary hover:text-primary'
                              }`}
                            >
                              {completedSteps[step.id] && (
                                <CheckCircle className="h-4 w-4 mr-2 text-[#0dd152]" strokeWidth={1.5} />
                              )}
                              <span className={completedSteps[step.id] ? "ml-0" : "ml-6"}>
                                {step.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 ${isOpen ? (isMobile ? 'w-full' : 'w-80') : 'w-12'} h-full`}>
      <div className="bg-[#fcfcfb] rounded-[5px] shadow-sm p-4 sticky top-8 h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          {isOpen && (
            <h2 className="text-lg font-semibold text-primary">Course Content</h2>
          )}
          {!isMobile && (
            <button
              onClick={onToggle}
              className="text-secondary hover:text-primary transition-colors"
            >
              {isOpen ? (
                <CircleChevronLeft className="h-6 w-6" />
              ) : (
                <CircleChevronRight className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
        {isOpen && (
          <div className="space-y-4">
            {/* Announcements Section */}
            <AnnouncementsSection 
              courseId={courseId} 
              isOpen={isOpen} 
              onAnnouncementsClick={onAnnouncementsClick} 
            />
            
            {/* Course Content Section */}
            {weeks.map((week, weekIndex) => (
              <div key={week.id} className={weekIndex < weeks.length - 1 ? "pb-4 border-b border-[#cccccc]" : ""}>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleWeekExpansion(week.id)}
                >
                  <h3 className="font-medium text-primary">
                    {week.title}
                  </h3>
                  <button className="text-secondary hover:text-primary p-1">
                    {expandedWeeks[week.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {expandedWeeks[week.id] && (
                  <div className="pl-4 space-y-2 mt-2">
                    {week.days.map((day) => (
                      <div key={day.id}>
                        <p className="text-sm text-secondary flex items-center">
                          {isDayCompleted(day) && (
                            <CheckCircle className="h-4 w-4 mr-2 text-[#0dd152]" strokeWidth={1.5} />
                          )}
                          <span>Day {day.day_number}</span>
                        </p>
                        <div className="pl-4 border-l border-gray-200 mt-1">
                          {day.steps.map((step) => (
                            <button
                              key={step.id}
                              onClick={() => onStepSelect(week, day, step)}
                              className={`text-sm py-1 block w-full text-left flex items-center ${
                                currentStep?.id === step.id
                                  ? 'text-primary font-medium border border-primary rounded-[3px] px-2'
                                  : 'text-secondary hover:text-primary'
                              }`}
                            >
                              {completedSteps[step.id] && (
                                <CheckCircle className="h-4 w-4 mr-2 text-[#0dd152]" strokeWidth={1.5} />
                              )}
                              <span className={completedSteps[step.id] ? "ml-0" : "ml-6"}>
                                {step.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSidebar;