import React, { useState, lazy, Suspense, useEffect } from 'react';
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
  const [navLinks, setNavLinks] = useState<NavLink[]>([
    { path: '/courses', label: 'Courses' },
  ]);

  useEffect(() => {
    // Update navigation links when user data changes
    if (userData?.role === 'instructor') {
      setNavLinks(prev => {
        // Check if consultant dashboard link already exists
        if (!prev.some(link => link.path === '/consultant-dashboard')) {
          return [...prev, { path: '/consultant-dashboard', label: 'Consultant Dashboard' }];
        }
        return prev;
      });
    } else {
      setNavLinks(prev => prev.filter(link => link.path !== '/consultant-dashboard'));
    }
  }, [userData]);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav style={{ background: 'linear-gradient(to right, #fdfcfa, #f7f2ee)' }} className="border-b border-[#cccccc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Logo />
              <span className="ml-2 text-xl font-semibold text-primary">Retha Platform</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-end flex-1">
            <NavLinks links={navLinks} />

            {isLoading ? (
              <LoadingProfile />
            ) : isAuthenticated ? (
              <Suspense fallback={<LoadingProfile />}>
                <UserProfile
                  userName={userData?.full_name || ''}
                  userRole={userData?.role || ''}
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
            navLinks={navLinks}
            isAuthenticated={isAuthenticated}
            userName={userData?.full_name || ''}
            userRole={userData?.role || ''}
            profilePicUrl={userData?.profile_pic_url || null}
            onSignOut={handleSignOut}
          />
        </Suspense>
      )}
    </nav>
  );
};

export default React.memo(Navbar);