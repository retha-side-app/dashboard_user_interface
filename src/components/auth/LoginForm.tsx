import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Successfully logged in - use React Router navigation instead of window.location
      navigate('/');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
      setLoading(false);
    }
  };

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
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary"
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
        className="w-full rounded-[5px] bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
};

export default LoginForm;