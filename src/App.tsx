import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/layout/Navbar';
import ErrorBoundary from './components/error/ErrorBoundary';

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Error fallback component with proper type definitions
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="bg-red-50 p-6 rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
      <p className="text-red-600 mb-4">{error.message || "Failed to load the application"}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90"
      >
        Try again
      </button>
    </div>
  </div>
);

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const UserPage = lazy(() => import('./pages/UserPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const DemoCoursesPage = lazy(() => import('./pages/DemoCoursesPage'));
const DemoDetailPage = lazy(() => import('./pages/DemoDetailPage'));
const DemoContentPage = lazy(() => import('./pages/DemoContentPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const CourseContentPage = lazy(() => import('./pages/CourseContentPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const MyEnrollmentsPage = lazy(() => import('./pages/MyEnrollmentsPage'));
const MessagingPage = lazy(() => import('./pages/MessagingPage'));

// Consultant pages
const ConsultantDashboard = lazy(() => import('./pages/consultant/ConsultantDashboard'));
const ConsultantMembersPage = lazy(() => import('./pages/consultant/MembersPage'));
const ConsultantGroupsPage = lazy(() => import('./pages/consultant/GroupsPage'));
const ConsultantMessagingPage = lazy(() => import('./pages/consultant/MessagingPage'));
const ConsultantSettingsPage = lazy(() => import('./pages/consultant/SettingsPage'));

function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Function to get user role from database
  const getUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  };

  // Function to reset auth error and retry auth
  const resetAuth = () => {
    setAuthError(null);
    setLoading(true);
    initializeAuth();
  };

  // Auth initialization function
  const initializeAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = await getUserRole(session.user.id);
        setUserRole(role);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      setAuthError(error instanceof Error ? error : new Error("Authentication failed"));
    } finally {
      setLoading(false);
      setAuthInitialized(true);
    }
  };

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const authTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setAuthInitialized(true);
        setAuthError(new Error("Authentication timed out. Please refresh the page."));
      }
    }, 20000); // 20 second timeout instead of 10
    
    // Initialize auth with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryInitAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error(`Auth initialization failed (attempt ${retryCount + 1}/${maxRetries})`, error);
        if (retryCount < maxRetries) {
          retryCount++;
          // Exponential backoff: 1s, 2s, 4s
          setTimeout(tryInitAuth, 1000 * Math.pow(2, retryCount - 1));
        } else {
          setLoading(false);
          setAuthInitialized(true);
          setAuthError(new Error("Authentication failed after multiple attempts. Please refresh the page."));
        }
      }
    };
    
    tryInitAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const role = await getUserRole(session.user.id);
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
      }
    });

    return () => {
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Show auth error message if there's an error
  if (authError) {
    return <ErrorFallback error={authError} resetErrorBoundary={resetAuth} />;
  }

  // Don't render anything until auth is initialized to prevent flashing
  if (loading) {
    return <Loading />;
  }

  // Check if user is an instructor
  const isInstructor = userRole === 'instructor' || userRole === 'admin';

  return (
    <ErrorBoundary>
      <Router>
        <Navbar />
        <main className="pt-16 min-h-[calc(100vh-4rem)]">
          <Suspense fallback={<Loading />}>
            {authInitialized && (
              <Routes>
                <Route path="/login" element={!user ? <LoginPage /> : (
                  isInstructor ? 
                    <Navigate to="/consultant-dashboard" replace /> : 
                    <Navigate to="/my-enrollments" replace />
                )} />
                <Route path="/signup" element={!user ? <SignupPage /> : (
                  isInstructor ? 
                    <Navigate to="/consultant-dashboard" replace /> : 
                    <Navigate to="/my-enrollments" replace />
                )} />
                
                {/* Student/user routes */}
                <Route path="/dashboard" element={user ? <Navigate to="/my-enrollments" replace /> : <Navigate to="/login" replace />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/businessclass-demo" element={<DemoCoursesPage />} />
                <Route path="/businessclass-demo/:id" element={<DemoDetailPage />} />
                <Route path="/businessclass-demo/:courseId/content" element={<DemoContentPage />} />
                <Route path="/businessclass-demo/:courseId/content/:stepId" element={<DemoContentPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/courses/:courseId/content" element={user ? <CourseContentPage /> : <Navigate to="/login" replace />} />
                <Route path="/account" element={user ? <AccountPage /> : <Navigate to="/login" replace />} />
                <Route path="/my-enrollments" element={user ? <MyEnrollmentsPage /> : <Navigate to="/login" replace />} />
                <Route path="/messages" element={user ? <MessagingPage /> : <Navigate to="/login" replace />} />
                
                {/* Consultant routes - only accessible by instructors and admins */}
                <Route path="/consultant-dashboard" element={user && isInstructor ? <ConsultantDashboard /> : <Navigate to="/" replace />} />
                <Route path="/consultant-dashboard/members" element={user && isInstructor ? <ConsultantMembersPage /> : <Navigate to="/" replace />} />
                <Route path="/consultant-dashboard/groups" element={user && isInstructor ? <ConsultantGroupsPage /> : <Navigate to="/" replace />} />
                <Route path="/consultant-dashboard/messages" element={user && isInstructor ? <ConsultantMessagingPage /> : <Navigate to="/" replace />} />
                <Route path="/consultant-dashboard/settings" element={user && isInstructor ? <ConsultantSettingsPage /> : <Navigate to="/" replace />} />
                
                {/* Home and fallback routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </Suspense>
        </main>
      </Router>
    </ErrorBoundary>
  );
}

export default App;