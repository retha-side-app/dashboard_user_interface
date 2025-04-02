import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/layout/Navbar';
import './styles/globals.css';

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
const AccountPage = lazy(() => import('./pages/AccountPage'));
const ConsultantDashboard = lazy(() => import('./pages/instructor/ConsultantDashboard'));
const MembersPage = lazy(() => import('./pages/instructor/MembersPage'));
const GroupsPage = lazy(() => import('./pages/instructor/GroupsPage'));
const MessagingPage = lazy(() => import('./pages/instructor/MessagingPage'));


function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16"> {/* Add padding top to account for fixed navbar */}
          <Suspense fallback={<Loading />}>
            {authInitialized && (
              <Routes>
                <Route
                  path="/login"
                  element={!user ? <LoginPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/signup"
                  element={!user ? <SignupPage /> : <Navigate to="/" replace />}
                />
                <Route
                  path="/dashboard"
                  element={user ? <UserPage /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/account"
                  element={user ? <AccountPage /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/consultant-dashboard"
                  element={user ? <ConsultantDashboard /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/consultant-dashboard/members"
                  element={user ? <MembersPage /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/consultant-dashboard/groups"
                  element={user ? <GroupsPage /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/consultant-dashboard/messages"
                  element={user ? <MessagingPage /> : <Navigate to="/login" replace />}
                />
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
