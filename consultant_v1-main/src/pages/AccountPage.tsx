import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { User as UserType, userService } from '../services/userService';
import ProfilePictureSection from '../components/account/ProfilePictureSection';
import NameSection from '../components/account/NameSection';
import EmailSection from '../components/account/EmailSection';
import PasswordSection from '../components/account/PasswordSection';

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="animate-pulse space-y-6 md:space-y-8">
            <div className="h-6 md:h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 md:h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="bg-red-50 p-4 rounded-[5px] text-red-700 text-sm">
            User not found
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 md:mb-8 flex items-center">
            <Settings className="h-5 w-5 md:h-6 md:w-6 text-primary mr-2 md:mr-3" strokeWidth={1.5} />
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Account Settings</h1>
          </div>

          {error && (
            <div className="mb-4 md:mb-6 bg-red-50 p-3 md:p-4 rounded-[5px] text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 md:mb-6 bg-green-50 p-3 md:p-4 rounded-[5px] text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="bg-white rounded-[5px] shadow-sm p-4 md:p-6 space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              <div className="mb-6 md:mb-0 flex justify-center md:block">
                <ProfilePictureSection
                  user={user}
                  setUser={setUser}
                  setError={setError}
                  setSuccess={setSuccess}
                />
              </div>

              <div className="flex-1">
                <NameSection
                  user={user}
                  setUser={setUser}
                  setError={setError}
                  setSuccess={setSuccess}
                />
                <EmailSection
                  user={user}
                  setUser={setUser}
                  setError={setError}
                  setSuccess={setSuccess}
                />
                <PasswordSection
                  user={user}
                  setError={setError}
                  setSuccess={setSuccess}
                />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default AccountPage;