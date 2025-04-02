import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { instructorService, InstructorUser } from '../../services/instructor/instructorService';
import InstructorSidebar from '../../components/consultant/InstructorSidebar';

const ConsultantDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [instructorData, setInstructorData] = useState<InstructorUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [hasAccess, profile] = await Promise.all([
        instructorService.isInstructor(),
        instructorService.getInstructorProfile()
      ]);

      setIsInstructor(hasAccess);
      setInstructorData(profile);
    } catch (error) {
      console.error('Error checking instructor access:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Loading timed out. Please try again.');
      }
    }, 15000); // 15 second timeout
    
    loadDashboardData();
    
    return () => clearTimeout(loadingTimeout);
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <InstructorSidebar onCollapse={(collapsed) => setIsSidebarCollapsed(collapsed)} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
          <div className="max-w-md mx-auto bg-white/80 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar onCollapse={(collapsed) => setIsSidebarCollapsed(collapsed)} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Consultant Dashboard</h1>
            {instructorData && (
              <div className="mb-6">
                <p className="text-gray-600">Welcome, {instructorData.full_name}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
                <p className="text-gray-600">Dashboard content coming soon...</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
                <p className="text-gray-600">Activity feed coming soon...</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Upcoming Tasks</h2>
                <p className="text-gray-600">Task list coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboard; 