import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { courseContentService } from '../services/courseContentService';
import type { CourseWeek, CourseDay, CourseStep } from '../services/types/course';
import ProgressBar from '../components/course/content/ProgressBar';
import ContentSidebar from '../components/course/content/ContentSidebar';
import ContentHeader from '../components/course/content/ContentHeader';
import ContentNavigation from '../components/course/content/ContentNavigation';
import StepContent from '../components/course/content/StepContent';
import AnnouncementsContent from '../components/course/content/AnnouncementsContent';
import NotesSidebar from '../components/course/content/notes/NotesSidebar';
import { ProgressProvider, useProgress } from '../context/ProgressContext';
import { CompletionProvider } from '../context/CompletionContext';
import { X, ChevronDown } from 'lucide-react';

// Wrapper component that uses the context
const CourseContentPageContent = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [currentWeek, setCurrentWeek] = useState<CourseWeek | null>(null);
  const [currentDay, setCurrentDay] = useState<CourseDay | null>(null);
  const [currentStep, setCurrentStep] = useState<CourseStep | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(true);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [isMobileNotesSidebarOpen, setIsMobileNotesSidebarOpen] = useState(false);
  const [isBottomMenuOpen, setIsBottomMenuOpen] = useState(false);
  const { progress, updateProgress } = useProgress();

  // Detect if we're on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Set initial sidebar states based on screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
      setIsNotesSidebarOpen(!mobile);
      
      // Close mobile sidebars when resizing to desktop
      if (!mobile) {
        setIsMobileNotesSidebarOpen(false);
        setIsBottomMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!courseId) return;
    loadCourseContent();
  }, [courseId]);

  const loadCourseContent = async () => {
    if (!courseId) return;
    
    try {
      const data = await courseContentService.getCourseContent(courseId);
      setCourseTitle(data.title);
      setWeeks(data.weeks);
      
      // Only set initial week/day/step if they haven't been set yet
      if (!currentWeek || !currentDay || !currentStep) {
        setCurrentWeek(data.weeks[0]);
        setCurrentDay(data.weeks[0].days[0]);
        setCurrentStep(data.weeks[0].days[0].steps[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (passed: boolean) => {
    // Update progress in real-time
    if (courseId) {
      await updateProgress(courseId);
    }
  };

  const handleStepSelect = (week: CourseWeek, day: CourseDay, step: CourseStep) => {
    setCurrentWeek(week);
    setCurrentDay(day);
    setCurrentStep(step);
    setShowAnnouncements(false);
    
    // Close mobile sidebar after selection on mobile
    if (isMobile) {
      setIsBottomMenuOpen(false);
    }
  };

  const handlePrevious = () => {
    if (!currentWeek || !currentDay || !currentStep || showAnnouncements) return;

    const prev = courseContentService.findPreviousStep(
      weeks,
      currentWeek,
      currentDay,
      currentStep
    );

    if (prev) {
      setCurrentWeek(prev.week);
      setCurrentDay(prev.day);
      setCurrentStep(prev.step);
    }
  };

  const handleNext = () => {
    if (!currentWeek || !currentDay || !currentStep || showAnnouncements) return;

    const next = courseContentService.findNextStep(
      weeks,
      currentWeek,
      currentDay,
      currentStep
    );

    if (next) {
      setCurrentWeek(next.week);
      setCurrentDay(next.day);
      setCurrentStep(next.step);
    }
  };

  const handleAnnouncementsClick = () => {
    setShowAnnouncements(true);
    // Close mobile sidebar after selection on mobile
    if (isMobile) {
      setIsBottomMenuOpen(false);
    }
  };

  const toggleMobileNotesSidebar = () => {
    setIsMobileNotesSidebarOpen(!isMobileNotesSidebarOpen);
  };

  const toggleBottomMenu = () => {
    setIsBottomMenuOpen(!isBottomMenuOpen);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 p-4 rounded-[5px] text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const hasPrevious = currentWeek && currentDay && currentStep && !showAnnouncements && courseContentService.findPreviousStep(
    weeks,
    currentWeek,
    currentDay,
    currentStep
  );

  const hasNext = currentWeek && currentDay && currentStep && !showAnnouncements && courseContentService.findNextStep(
    weeks,
    currentWeek,
    currentDay,
    currentStep
  );

  return (
    <div className="min-h-screen pb-16 md:pb-0" style={{ background: 'linear-gradient(to right, #fdfcfa, #f7f2ee)' }}>
      <ProgressBar progress={progress} />

      {/* Mobile Navigation Controls */}
      {isMobile && (
        <div className="flex justify-between items-center px-4 py-2 bg-white shadow-sm">
          <h2 className="text-sm font-medium text-primary truncate max-w-[200px]">
            {currentStep?.title || courseTitle}
          </h2>
          <button 
            onClick={toggleMobileNotesSidebar}
            className="p-2 rounded-full bg-primary/10 text-primary"
          >
            {isMobileNotesSidebarOpen ? <X size={20} /> : <span className="text-xs">Notes</span>}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Content Sidebar - Only visible on desktop */}
          <div className="hidden md:block">
            <ContentSidebar
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              weeks={weeks}
              currentWeek={currentWeek}
              currentDay={currentDay}
              currentStep={currentStep}
              onStepSelect={handleStepSelect}
              courseId={courseId || ''}
              onAnnouncementsClick={handleAnnouncementsClick}
              isMobile={isMobile}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 mt-4 md:mt-0">
            <div className="bg-[#fcfcfb] rounded-[5px] shadow-sm p-4 md:p-8">
              {!showAnnouncements ? (
                <>
                  <ContentHeader
                    courseTitle={courseTitle}
                    currentWeek={currentWeek}
                    currentDay={currentDay}
                    currentStep={currentStep}
                  />

                  {currentStep && (
                    <div className="mb-8">
                      <StepContent
                        step={currentStep}
                        onComplete={handleStepComplete}
                      />
                    </div>
                  )}

                  <ContentNavigation
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    hasPrevious={!!hasPrevious}
                    hasNext={!!hasNext}
                  />
                </>
              ) : (
                <AnnouncementsContent 
                  courseId={courseId || ''} 
                  onBack={() => setShowAnnouncements(false)} 
                />
              )}
            </div>
          </div>

          {/* Mobile Notes Sidebar Overlay */}
          {isMobileNotesSidebarOpen && isMobile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileNotesSidebarOpen(false)}></div>
          )}
          
          {/* Notes Sidebar - Fixed position on mobile when open */}
          <div className={`
            ${isMobileNotesSidebarOpen && isMobile ? 'fixed left-0 top-0 h-full z-50 w-full shadow-xl' : 'hidden'} 
            md:relative md:block md:z-auto md:shadow-none
          `}>
            <NotesSidebar 
              isOpen={isMobile ? true : isNotesSidebarOpen}
              onToggle={() => isMobile ? setIsMobileNotesSidebarOpen(false) : setIsNotesSidebarOpen(!isNotesSidebarOpen)}
              stepId={currentStep?.id || null}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>

      {/* Bottom Menu for Mobile */}
      {isMobile && (
        <ContentSidebar
          isOpen={isBottomMenuOpen}
          onToggle={toggleBottomMenu}
          weeks={weeks}
          currentWeek={currentWeek}
          currentDay={currentDay}
          currentStep={currentStep}
          onStepSelect={handleStepSelect}
          courseId={courseId || ''}
          onAnnouncementsClick={handleAnnouncementsClick}
          isMobile={true}
          isBottomMenu={true}
        />
      )}
    </div>
  );
};

// Main component that provides the context
const CourseContentPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  
  return (
    <MainLayout>
      <ProgressProvider courseId={courseId}>
        <CompletionProvider>
          <CourseContentPageContent />
        </CompletionProvider>
      </ProgressProvider>
    </MainLayout>
  );
};

export default CourseContentPage;