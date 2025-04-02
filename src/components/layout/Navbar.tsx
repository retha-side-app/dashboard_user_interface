import React, { useState, lazy, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlignJustify } from 'lucide-react';
import { useAuth } from './useAuth';
import NavLinks from './NavLinks';
import LoadingProfile from './LoadingProfile';
import AuthButton from './AuthButton';
import { NavLink } from './types';
import Logo from './Logo';

// Lazy load components that aren't needed immediately
const UserProfile = lazy(() => import('./UserProfile'));
const MobileMenu = lazy(() => import('./MobileMenu'));

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userData, isLoading, isAuthenticated, signOut } = useAuth();

  // Check if user is admin or instructor
  const isInstructorOrAdmin = userData?.role === 'instructor' || userData?.role === 'admin';

  const navLinks: NavLink[] = [
    { path: '/courses', label: 'Courses' },
  ];

  // Additional links for authenticated users
  const authenticatedLinks: NavLink[] = [
    { path: '/messages', label: 'Messages' },
  ];

  // Admin/instructor links
  const instructorLinks: NavLink[] = [
    { path: '/consultant-dashboard', label: 'Dashboard' },
  ];

  // Combine links based on authentication status and role
  const displayLinks = isAuthenticated 
    ? isInstructorOrAdmin 
      ? [...navLinks, ...authenticatedLinks, ...instructorLinks]
      : [...navLinks, ...authenticatedLinks]
    : navLinks;

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav style={{ background: 'linear-gradient(to right, #fdfcfa, #f7f2ee)' }} className="fixed top-0 left-0 right-0 border-b border-[#cccccc] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Logo />
              <span className="ml-2 text-xl font-semibold text-primary">Retha Platform</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-end flex-1">
            <NavLinks links={displayLinks} />

            {isLoading ? (
              <LoadingProfile />
            ) : isAuthenticated ? (
              <Suspense fallback={<LoadingProfile />}>
                <UserProfile
                  userName={userData?.full_name || null}
                  userRole={userData?.role || null}
                  profilePicUrl={userData?.profile_pic_url || null}
                  onSignOut={handleSignOut}
                />
              </Suspense>
            ) : (
              <AuthButton />
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-[5px] text-primary hover:bg-white/50"
            >
              <AlignJustify className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <Suspense fallback={null}>
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            navLinks={displayLinks}
            isAuthenticated={isAuthenticated}
            userName={userData?.full_name || null}
            userRole={userData?.role || null}
            profilePicUrl={userData?.profile_pic_url || null}
            onSignOut={handleSignOut}
          />
        </Suspense>
      )}
    </nav>
  );
};

export default React.memo(Navbar);