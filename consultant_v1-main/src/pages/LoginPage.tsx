import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import MainLayout from '../layouts/MainLayout';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <MainLayout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-[5px] bg-primary/10 flex items-center justify-center">
                <LogIn className="h-6 w-6 text-primary" strokeWidth={1} />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-primary">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-secondary">
                Please sign in to your account
              </p>
            </div>
            <LoginForm />
            <p className="text-center text-sm text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default LoginPage;