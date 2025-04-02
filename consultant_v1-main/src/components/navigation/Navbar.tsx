import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Logo</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/courses" className="text-gray-600 hover:text-gray-900">
              Courses
            </Link>
            
            {user?.role === 'instructor' && (
              <Link to="/consultant-dashboard" className="text-gray-600 hover:text-gray-900">
                Consultant Dashboard
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                  <div className="text-xs text-gray-500">
                    {user.role === 'instructor' ? 'Consultant' : user.role}
                  </div>
                </div>
                <img
                  src={user.profile_pic_url || '/default-avatar.png'}
                  alt={user.full_name}
                  className="h-8 w-8 rounded-full"
                />
              </div>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 