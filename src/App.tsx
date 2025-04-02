import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Don't render anything until auth is initialized to prevent flashing
  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        {authInitialized && (
          <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" replace />} />
            <Route path="/dashboard" element={user ? <UserPage /> : <Navigate to="/login" replace />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/businessclass-demo" element={<DemoCoursesPage />} />
            <Route path="/businessclass-demo/:id" element={<DemoDetailPage />} />
            <Route path="/businessclass-demo/:courseId/content" element={<DemoContentPage />} />
            <Route path="/businessclass-demo/:courseId/content/:stepId" element={<DemoContentPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/courses/:courseId/content" element={user ? <CourseContentPage /> : <Navigate to="/login" replace />} />
            <Route path="/account" element={user ? <AccountPage /> : <Navigate to="/login" replace />} />
            <Route path="/my-enrollments" element={user ? <MyEnrollmentsPage /> : <Navigate to="/login" replace />} />
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/messages" element={user ? <MessagingPage /> : <Navigate to="/login" replace />} />

          </Routes>
        )}
      </Suspense>
    </Router>
  );
}

export default App;