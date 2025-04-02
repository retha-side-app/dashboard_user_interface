import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { progressService } from '../services/progressService';

interface ProgressContextType {
  progress: number;
  updateProgress: (courseId: string) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
  courseId?: string;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children, courseId }) => {
  const [progress, setProgress] = useState<number>(0);

  // Load initial progress
  useEffect(() => {
    if (courseId) {
      updateProgress(courseId);
    }
  }, [courseId]);

  const updateProgress = async (id: string) => {
    if (!id) return;
    
    try {
      const progressData = await progressService.getCourseProgress(id);
      if (progressData) {
        setProgress(progressData.progress_percentage);
      } else {
        setProgress(0);
      }
    } catch (err) {
      console.error('Failed to load course progress:', err);
    }
  };

  return (
    <ProgressContext.Provider value={{ progress, updateProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};