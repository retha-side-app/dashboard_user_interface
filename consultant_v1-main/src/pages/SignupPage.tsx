import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MainLayout from '../layouts/MainLayout';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (user) {
        // Successfully signed up
        setSuccess('Account created successfully! You can now sign in.');
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <MainLayout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-[5px] bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" strokeWidth={1} />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-primary">
                Create an account
              </h2>
              <p className="mt-2 text-sm text-secondary">
                Join us and start exploring
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-[5px] bg-red-50 p-4 text-sm text-red-500">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-[5px] bg-green-50 p-4 text-sm text-green-500">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-primary">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-[5px] border border-gray-200 px-3 py-2 text-primary focus:border-primary focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-[5px] border border-gray-200 px-3 py-2 text-primary focus:border-primary focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-[5px] border border-gray-200 px-3 py-2 text-primary focus:border-primary focus:outline-none"
                  placeholder="Create a password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[5px] bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default SignupPage;