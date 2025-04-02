import React, { useState, memo } from 'react';
import { User, ChevronDown, Bell } from 'lucide-react';
import UserMenu from './UserMenu';
import { userService } from '../../services/userService';

interface UserProfileProps {
  userName: string | null;
  userRole: string | null;
  profilePicUrl: string | null;
  onSignOut: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userName,
  userRole,
  profilePicUrl,
  onSignOut
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="flex items-center space-x-4">
      <button className="relative p-2 text-secondary hover:text-primary transition-colors">
        <Bell strokeWidth={1} className="h-6 w-6" />
        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
      </button>

      <div className="flex items-center space-x-2 border-l pl-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-primary">
            {userName || 'Loading...'}
          </span>
          <span className="text-xs text-secondary capitalize">
            {userRole || 'Loading...'}
          </span>
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {profilePicUrl ? (
            <img
              src={userService.getProfilePictureUrl(profilePicUrl)}
              alt={userName || 'Profile'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <User strokeWidth={1} className="h-5 w-5 text-primary" />
          )}
        </div>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="focus:outline-none"
        >
          <ChevronDown strokeWidth={1} className="h-5 w-5 text-primary" />
        </button>
        
        <UserMenu 
          isOpen={isDropdownOpen} 
          onClose={() => setIsDropdownOpen(false)} 
          onSignOut={onSignOut} 
        />
      </div>
    </div>
  );
};

export default memo(UserProfile);