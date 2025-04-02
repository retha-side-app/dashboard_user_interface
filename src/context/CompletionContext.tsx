import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { progressService } from '../services/progressService';

interface CompletionContextType {
  completedSteps: Record<string, boolean>;
  updateStepCompletion: (stepId: string, isCompleted: boolean) => void;
  loadCompletionStatus: (stepIds: string[]) => Promise<void>;
}

const CompletionContext = createContext<CompletionContextType | undefined>(undefined);

export const useCompletion = () => {
  const context = useContext(CompletionContext);
  if (context === undefined) {
    throw new Error('useCompletion must be used within a CompletionProvider');
  }
  return context;
};

interface CompletionProviderProps {
  children: ReactNode;
}

export const CompletionProvider: React.FC<CompletionProviderProps> = ({ children }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Update a single step's completion status
  const updateStepCompletion = useCallback((stepId: string, isCompleted: boolean) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepId]: isCompleted
    }));
  }, []);

  // Load completion status for multiple steps
  const loadCompletionStatus = useCallback(async (stepIds: string[]) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Batch fetch all completions for this user
      const { data: completions, error } = await supabase
        .from('step_completions')
        .select('step_id')
        .eq('user_id', user.id)
        .in('step_id', stepIds);

      if (error) {
        console.error('Error fetching step completions:', error);
        return;
      }

      // Create a map of step_id to completion status
      const completionMap: Record<string, boolean> = {};
      
      // Initialize all steps as not completed
      stepIds.forEach(id => {
        completionMap[id] = false;
      });
      
      // Mark completed steps
      completions.forEach(completion => {
        completionMap[completion.step_id] = true;
      });

      // Update state with all completions at once
      setCompletedSteps(prev => ({
        ...prev,
        ...completionMap
      }));
    } catch (error) {
      console.error('Error loading completion status:', error);
    }
  }, []);

  return (
    <CompletionContext.Provider value={{ 
      completedSteps, 
      updateStepCompletion,
      loadCompletionStatus
    }}>
      {children}
    </CompletionContext.Provider>
  );
};

// Import supabase at the top of the file
import { supabase } from '../lib/supabase';