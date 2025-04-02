import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, BookOpen, GraduationCap, Users, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from '../components/layout/Logo';
import MainLayout from '../layouts/MainLayout';

const HomePage = () => {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        
        // Get user role
        const { data: userData } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', data.session.user.id)
          .single();
        
        if (userData) {
          setUserRole(userData.role);
          setName(userData.full_name || '');
        }
      }
    };
    
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignIn) {
        // Sign in logic
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect based on user role
        if (data.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (userData?.role === 'instructor' || userData?.role === 'admin') {
            navigate('/consultant-dashboard');
          } else {
            navigate('/my-enrollments');
          }
        }
      } else {
        // Sign up logic
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        // Show success or redirect
        navigate('/my-enrollments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/my-enrollments`,
        },
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in with Google');
    }
  };

  // Render different view for authenticated users
  const renderAuthenticatedView = () => {
    const isInstructor = userRole === 'instructor' || userRole === 'admin';
    
    return (
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {name}
            </h1>
            <p className="text-xl text-gray-600">
              Continue your learning journey with Retha Platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to={isInstructor ? "/consultant-dashboard" : "/my-enrollments"}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <BookOpen className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {isInstructor ? "Dashboard" : "My Enrollments"}
                  </h2>
                  <p className="text-gray-600">
                    {isInstructor 
                      ? "Manage your students and classes" 
                      : "View your enrolled courses and progress"}
                  </p>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/courses" 
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <GraduationCap className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Explore Courses</h2>
                  <p className="text-gray-600">Discover new courses and learning paths</p>
                </div>
              </div>
            </Link>
            
            <Link 
              to={isInstructor ? "/consultant-dashboard/members" : "/messages"} 
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Users className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {isInstructor ? "Manage Members" : "Community"}
                  </h2>
                  <p className="text-gray-600">
                    {isInstructor 
                      ? "View and manage your students" 
                      : "Connect with other learners and instructors"}
                  </p>
                </div>
              </div>
            </Link>
            
            <Link 
              to={isInstructor ? "/consultant-dashboard/messages" : "/messages"} 
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <MessageSquare className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Messages</h2>
                  <p className="text-gray-600">
                    {isInstructor 
                      ? "Communicate with your students" 
                      : "Message your instructors and get help"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="mt-12 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                to="/account"
                className="text-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Account Settings</p>
              </Link>
              
              <Link 
                to={isInstructor ? "/consultant-dashboard/settings" : "/account"}
                className="text-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Preferences</p>
              </Link>
              
              <Link 
                to="/courses"
                className="text-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Browse Courses</p>
              </Link>
              
              <Link 
                to="/help"
                className="text-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Help Center</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      {user ? (
        renderAuthenticatedView()
      ) : (
        <div className="flex flex-col md:flex-row h-screen">
          {/* Form Section */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <Logo />
                  <span className="ml-2 text-xl font-semibold">Retha Platform</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {isSignIn ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {isSignIn 
                    ? 'Sign in to continue to your account' 
                    : "Let's get started with your 30 day free trial"}
                </p>
              </div>

              {error && (
                <div className="rounded bg-red-50 p-4 text-sm text-red-600 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isSignIn && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="Enter your name"
                      required={!isSignIn}
                      disabled={loading}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors relative"
                >
                  {loading ? (
                    <>
                      <span className="opacity-0">{isSignIn ? 'Sign in' : 'Create account'}</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                      </div>
                    </>
                  ) : (
                    isSignIn ? 'Sign in' : 'Create account'
                  )}
                </button>

                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                  </svg>
                  Sign {isSignIn ? 'in' : 'up'} with Google
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    onClick={() => setIsSignIn(!isSignIn)}
                    className="text-primary font-medium hover:underline"
                  >
                    {isSignIn ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial/Image Section */}
          <div 
            className="hidden md:block md:w-1/2 bg-cover bg-center relative" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=1470&auto=format&fit=crop")',
              backgroundColor: '#92817a' 
            }}
          >
            <div className="absolute top-10 right-10">
              <div className="text-white h-9 w-9">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0ZM22.845 11.53L22.845 17.616L33.08 17.616L33.08 22.329L22.845 22.329L22.845 28.414L17.101 28.414L17.101 22.329L6.866 22.329L6.866 17.616L17.101 17.616L17.101 11.53L22.845 11.53Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
            <div className="absolute bottom-16 left-0 right-0 px-12 text-white">
              <blockquote className="mb-4">
                <svg className="h-8 w-8 text-white opacity-25 mb-2" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-lg font-medium leading-relaxed">
                  Retha Platform were a breeze to work alongside, we can't recommend them enough. We launched 6 months earlier than expected and are growing 30% MoM.
                </p>
              </blockquote>
              <div className="flex items-center">
                <p className="font-medium">Amélie Laurent</p>
                <span className="mx-2">•</span>
                <p className="text-sm opacity-80">Founder, Sleepwise</p>
              </div>
              <div className="flex mt-6">
                <button className="mr-3 h-8 w-8 rounded-full border border-white/40 flex items-center justify-center text-white">
                  <ArrowRight size={16} className="rotate-180" />
                </button>
                <button className="h-8 w-8 rounded-full border border-white/40 flex items-center justify-center text-white">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default HomePage;