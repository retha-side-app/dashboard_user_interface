import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const AuthButton: React.FC = () => {
  return (
    <Link
      to="/login"
      className="flex items-center space-x-2 px-4 py-2 rounded-[5px] bg-primary text-white hover:bg-opacity-90 transition-colors"
    >
      <LogIn strokeWidth={1} className="h-5 w-5" />
      <span>Sign In</span>
    </Link>
  );
};

export default AuthButton;