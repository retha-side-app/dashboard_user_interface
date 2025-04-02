import React from 'react';
import { Link } from 'react-router-dom';
import { X, Settings, LogOut, LogIn, User } from 'lucide-react';
import { NavLink } from './types';
import Logo from './Logo';
import { userService } from '../../services/userService';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  isAuthenticated: boolean;
  userName: string | null;
  userRole: string | null;
  profilePicUrl: string | null;
  onSignOut: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navLinks,
  isAuthenticated,
  userName,
  userRole,
  profilePicUrl,
  onSignOut
}) => {
  return (
    <div 
      className={`mobile-menu ${isOpen ? 'open' : 'closed'}`}
      style={{ background: 'linear-gradient(to right, #fdfcfa, #f7f2ee)' }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Logo />
            <h2 className="text-xl font-semibold text-primary ml-2">Menu</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-[5px]"
          >
            <X className="h-6 w-6 text-primary" />
          </button>
        </div>

        <div className="space-y-4">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className="block px-4 py-2 rounded-[5px] text-primary hover:bg-white/50"
              onClick={onClose}
            >
              {label}
            </Link>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="space-y-4 mt-6">
            <div className="border-b pb-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                {profilePicUrl ? (
                  <img
                    src={userService.getProfilePictureUrl(profilePicUrl)}
                    alt={userName || 'Profile'}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <User strokeWidth={1} className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-primary">{userName || 'Loading...'}</p>
                <p className="text-xs text-secondary capitalize">{userRole || 'Loading...'}</p>
              </div>
            </div>
            <Link
              to="/my-enrollments"
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-left text-secondary hover:bg-white/50 rounded-[5px]"
              onClick={onClose}
            >
              <span>Programlarım</span>
            </Link>
            <Link
              to="/account"
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-left text-secondary hover:bg-white/50 rounded-[5px]"
              onClick={onClose}
            >
              <Settings className="h-4 w-4" strokeWidth={1} />
              <span>Ayarlar</span>
            </Link>
            <button
              onClick={onSignOut}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-left text-secondary hover:bg-white/50 rounded-[5px]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1} />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center space-x-2 w-full px-4 py-2 mt-6 rounded-[5px] bg-primary text-white hover:bg-opacity-90"
            onClick={onClose}
          >
            <LogIn strokeWidth={1} className="h-5 w-5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;