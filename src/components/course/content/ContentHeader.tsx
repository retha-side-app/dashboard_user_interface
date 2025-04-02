import React from 'react';
import type { CourseWeek, CourseDay, CourseStep } from '../../../services/types/course';

interface ContentHeaderProps {
  courseTitle: string;
  currentWeek: CourseWeek | null;
  currentDay: CourseDay | null;
  currentStep: CourseStep | null;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({
  courseTitle,
  currentWeek,
  currentDay,
  currentStep,
}) => {
  return (
    <>
      <h1 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">
        {courseTitle}
      </h1>
      <div className="mb-6 md:mb-8">
        <div className="text-xs md:text-sm text-secondary mb-2">
          Week {currentWeek?.week_number} Day {currentDay?.day_number} Step {currentStep?.step_number}
        </div>
        <h2 className="text-lg md:text-xl font-bold text-primary">
          {currentStep?.title}
        </h2>
      </div>
    </>
  );
};

export default ContentHeader;