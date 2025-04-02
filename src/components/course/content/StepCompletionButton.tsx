import React, { useState, useEffect } from 'react';
import { Check, Minus, Loader2 } from 'lucide-react';
import { progressService } from '../../../services/progressService';
import { useCompletion } from '../../../context/CompletionContext';

interface StepCompletionButtonProps {
  stepId: string;
  onComplete?: (passed: boolean) => void;
}

const StepCompletionButton: React.FC<StepCompletionButtonProps> = ({
  stepId,
  onComplete
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateStepCompletion, completedSteps } = useCompletion();

  useEffect(() => {
    checkCompletionStatus();
  }, [stepId]);

  // Also update local state when the context changes
  useEffect(() => {
    if (completedSteps[stepId] !== undefined) {
      setIsCompleted(completedSteps[stepId]);
    }
  }, [completedSteps, stepId]);

  const checkCompletionStatus = async () => {
    try {
      const completion = await progressService.getStepCompletion(stepId);
      const isStepCompleted = !!completion;
      setIsCompleted(isStepCompleted);
      
      // Update the completion context
      updateStepCompletion(stepId, isStepCompleted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check completion status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isCompleted) {
        await progressService.markStepAsIncomplete(stepId);
        setIsCompleted(false);
        
        // Update the completion context
        updateStepCompletion(stepId, false);
        
        onComplete?.(false);
      } else {
        await progressService.markStepAsComplete(stepId);
        setIsCompleted(true);
        
        // Update the completion context
        updateStepCompletion(stepId, true);
        
        onComplete?.(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update completion status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="flex items-center justify-center px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 text-gray-400 rounded-[5px] cursor-not-allowed text-sm"
      >
        <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
      </button>
    );
  }

  if (error) {
    return (
      <div className="text-xs md:text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <button
      onClick={handleToggleCompletion}
      className={`
        flex items-center justify-center px-3 py-1.5 md:px-4 md:py-2 rounded-[5px] transition-colors text-sm
        ${isCompleted
          ? 'bg-green-50 text-green-700 hover:bg-green-100'
          : 'bg-primary text-white hover:bg-opacity-90'
        }
      `}
    >
      {isCompleted ? (
        <>
          <Check className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
          Completed
        </>
      ) : (
        <>
          <Minus className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
          Mark as Complete
        </>
      )}
    </button>
  );
};

export default StepCompletionButton;