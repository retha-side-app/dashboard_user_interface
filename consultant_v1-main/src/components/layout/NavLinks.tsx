import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavLink } from './types';

interface NavLinksProps {
  links: NavLink[];
}

const NavLinks: React.FC<NavLinksProps> = ({ links }) => {
  const location = useLocation();
  
  return (
    <div className="flex space-x-8 mr-8">
      {links.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          className={`px-3 py-2 text-primary hover:text-opacity-80 transition-colors ${
            location.pathname === path ? 'font-semibold' : ''
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;