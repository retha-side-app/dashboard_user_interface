// src/components/instructor/InstructorSidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  MessageSquare,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import MessageNotificationBadge from '../messaging/MessageNotificationBadge';

const sidebarLinks = [
  {
    path: '/consultant-dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" strokeWidth={1} />
  },
  {
    path: '/consultant-dashboard/members',
    label: 'Members',
    icon: <Users className="w-5 h-5" strokeWidth={1} />
  },
  {
    path: '/consultant-dashboard/groups',
    label: 'Groups',
    icon: <UsersRound className="w-5 h-5" strokeWidth={1} />
  },
  {
    path: '/consultant-dashboard/messages',
    label: 'Messages',
    icon: <MessageSquare className="w-5 h-5" strokeWidth={1} />,
    showBadge: true
  },
  {
    path: '/consultant-dashboard/assignments',
    label: 'Assignments',
    icon: <GraduationCap className="w-5 h-5" strokeWidth={1} />
  },
  {
    path: '/consultant-dashboard/settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" strokeWidth={1} />
  }
];

interface InstructorSidebarProps {
  onCollapse: (collapsed: boolean) => void;
}

const InstructorSidebar: React.FC<InstructorSidebarProps> = ({ onCollapse }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse(newCollapsed);
  };

  return (
    <div 
      className={`fixed inset-y-0 left-0 bg-white shadow-lg z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full relative">
        <button
          onClick={handleCollapse}
          className="absolute -right-3 top-6 bg-white rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        <div className="flex-1 py-6 overflow-y-auto">
          <nav className={`px-2 space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? link.label : ''}
                >
                  <div className="relative">
                    {React.cloneElement(link.icon, {
                      className: `w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-500'}`
                    })}
                    
                    {/* Show notification badge for messages */}
                    {link.showBadge && (
                      <MessageNotificationBadge className="absolute -top-1 -right-1" />
                    )}
                  </div>
                  <span className={`ml-3 transition-opacity duration-200 ${
                    isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                  }`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default InstructorSidebar;