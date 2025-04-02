import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose, onSignOut }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-[5px] shadow-lg py-1 z-50"
      onMouseLeave={onClose}
    >
      <Link
        to="/my-enrollments"
        className="w-full px-4 py-2 text-sm text-left text-secondary hover:bg-gray-50 flex items-center"
      >
        Programlarım
      </Link>
      <Link
        to="/account"
        className="w-full px-4 py-2 text-sm text-left text-secondary hover:bg-gray-50 flex items-center"
      >
        <Settings className="h-4 w-4 mr-2" strokeWidth={1} />
        Ayarlar
      </Link>
      <button
        onClick={onSignOut}
        className="w-full px-4 py-2 text-sm text-left text-secondary hover:bg-gray-50 flex items-center"
      >
        <LogOut className="h-4 w-4 mr-2" strokeWidth={1} />
        Sign out
      </button>
    </div>
  );
};

export default UserMenu;