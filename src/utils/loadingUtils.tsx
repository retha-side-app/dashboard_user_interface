import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

// Standard loading spinner component
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg', fullScreen?: boolean }> = ({ 
  size = 'md', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-t-2 border-b-2'
  };

  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-primary`}></div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

// Reusable error component with retry button
export const ErrorDisplay: React.FC<{ 
  error: string | null; 
  onRetry: () => void;
  fullScreen?: boolean;
}> = ({ 
  error, 
  onRetry,
  fullScreen = false 
}) => {
  const errorContent = (
    <div className="bg-white/80 rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="text-center">
        <div className="mb-4 text-red-500 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error || "An unexpected error occurred."}</p>
        <button
          onClick={onRetry}
          className="w-full py-2 bg-primary text-white rounded-md flex items-center justify-center"
        >
          <RefreshCw size={18} className="mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {errorContent}
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      {errorContent}
    </div>
  );
};

// Hook for handling loading states with timeout
export const useLoadingWithTimeout = (
  initialLoading: boolean = false,
  timeoutMs: number = 15000
): [boolean, string | null, (loadingFn: () => Promise<void>) => Promise<void>] => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      timeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setError("Operation timed out. Please try again.");
        }
      }, timeoutMs);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, timeoutMs]);

  const executeWithLoading = async (loadingFn: () => Promise<void>) => {
    try {
      setIsLoading(true);
      setError(null);
      await loadingFn();
    } catch (err) {
      console.error('Error during operation:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return [isLoading, error, executeWithLoading];
};

// Add offline detection
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}; 