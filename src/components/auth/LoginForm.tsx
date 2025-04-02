import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    // Set up loading timeout to prevent infinite loading state
    let timeout: NodeJS.Timeout;
    
    if (loading) {
      timeout = setTimeout(() => {
        setLoading(false);
        setNetworkError(true);
        setError("Login request timed out. Please check your connection and try again.");
      }, 15000); // 15 second timeout
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [loading]);

  // Function to get user role from database
  const getUserRole = async (userId: string): Promise<string | null> => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNetworkError(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Get user role and redirect accordingly
      if (data.user) {
        const role = await getUserRole(data.user.id);
        
        if (role === 'instructor' || role === 'admin') {
          // Redirect instructors/admins to consultant dashboard
          navigate('/consultant-dashboard');
        } else {
          // Redirect regular users to user dashboard
          navigate('/dashboard');
        }
      } else {
        // Fallback to homepage if no user data
        navigate('/');
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
      setLoading(false);
    }
  };

  const retryLogin = () => {
    setNetworkError(false);
    setError(null);
    handleSubmit(new Event('submit') as any);
  };

  // Show network error UI
  if (networkError) {
    return (
      <div className="w-full max-w-md p-6 bg-white/80 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-4 text-red-500">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-xl font-bold text-center mb-4">Connection Issue</h2>
        <p className="text-gray-700 mb-6 text-center">{error || "Failed to connect to the server."}</p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={retryLogin}
            className="flex items-center justify-center w-full py-3 rounded-md bg-primary text-white font-medium"
          >
            <RefreshCw className="mr-2" size={18} />
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-md border border-gray-300 text-gray-700 font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      {error && (
        <div className="rounded-[5px] bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-primary">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" strokeWidth={1} size={20} />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[5px] border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-primary placeholder:text-secondary focus:border-primary focus:outline-none"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-primary">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" strokeWidth={1} size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[5px] border border-gray-200 bg-white py-3 pl-10 pr-12 text-sm text-primary placeholder:text-secondary focus:border-primary focus:outline-none"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary"
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff strokeWidth={1} size={20} />
            ) : (
              <Eye strokeWidth={1} size={20} />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded-[5px] border-gray-300 text-primary focus:ring-primary"
            disabled={loading}
          />
          <span className="text-sm text-secondary">Remember me</span>
        </label>
        <Link to="/forgot-password" className="text-sm text-secondary hover:text-primary">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[5px] bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50 relative"
      >
        {loading ? (
          <>
            <span className="opacity-0">Sign in</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            </div>
          </>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
};

export default LoginForm;