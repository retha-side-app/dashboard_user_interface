import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Settings, Bell, Shield, Eye, User, LogOut } from 'lucide-react';
import { instructorService, InstructorUser } from '../../services/instructor/instructorService';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';
import InstructorSidebar from '../../components/consultant/InstructorSidebar';
import ProfilePictureSection from '../../components/account/ProfilePictureSection';

const SettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [instructorData, setInstructorData] = useState<InstructorUser | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance'>('profile');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [assignmentNotifications, setAssignmentNotifications] = useState(true);
  
  // Appearance settings
  const [compactView, setCompactView] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  
  // Session info
  const [sessionInfo, setSessionInfo] = useState<{
    lastActive: string;
    browser: string;
    device: string;
  } | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const [hasAccess, profile] = await Promise.all([
          instructorService.isInstructor(),
          instructorService.getInstructorProfile()
        ]);

        setIsInstructor(hasAccess);
        setInstructorData(profile);
        
        if (profile) {
          setFullName(profile.full_name || '');
          setEmail(profile.email || '');
          
          // Load user preferences from localStorage
          const savedPreferences = localStorage.getItem('instructor_preferences');
          if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            setEmailNotifications(preferences.emailNotifications ?? true);
            setMessageNotifications(preferences.messageNotifications ?? true);
            setAssignmentNotifications(preferences.assignmentNotifications ?? true);
            setCompactView(preferences.compactView ?? false);
            setHighContrastMode(preferences.highContrastMode ?? false);
          }
          
          // Get session info
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            const browser = navigator.userAgent;
            // Fix: Use a safer approach for the timestamp
            let sessionCreatedAt = new Date().toLocaleString(); // Default to current time
            
            // Try to get actual session timestamp if available
            if ('created_at' in data.session) {
              // @ts-ignore - handle the property access safely
              const timestamp = data.session.created_at;
              if (timestamp && typeof timestamp === 'string') {
                sessionCreatedAt = new Date(timestamp).toLocaleString();
              }
            }
            
            setSessionInfo({
              lastActive: sessionCreatedAt,
              browser: browser.split(' ').slice(-1)[0],
              device: /Mobile|Android|iPhone/.test(browser) ? 'Mobile' : 'Desktop'
            });
          }
        }
      } catch (error) {
        console.error('Error checking instructor access:', error);
        setError('Failed to load your profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    // Apply high contrast mode if enabled
    if (highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Apply compact view if enabled
    if (compactView) {
      document.body.classList.add('compact-view');
    } else {
      document.body.classList.remove('compact-view');
    }
    
    return () => {
      // Clean up classes when component unmounts
      document.body.classList.remove('high-contrast', 'compact-view');
    };
  }, [highContrastMode, compactView]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!instructorData) return;
    
    try {
      // Update user profile information
      await userService.updateUser(instructorData.id, {
        full_name: fullName,
      });
      
      // Update instructor data state
      setInstructorData({
        ...instructorData,
        full_name: fullName,
      });
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      await userService.updatePassword(newPassword);
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };
  
  const handleNotificationPreferences = () => {
    // Save notification preferences to localStorage
    const preferences = {
      emailNotifications,
      messageNotifications,
      assignmentNotifications,
      compactView,
      highContrastMode
    };
    
    localStorage.setItem('instructor_preferences', JSON.stringify(preferences));
    setSuccess('Preferences saved successfully');
  };
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar onCollapse={(collapsed) => setIsSidebarCollapsed(collapsed)} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center">
            <Settings className="h-6 w-6 text-primary mr-3" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold text-primary">Instructor Settings</h1>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 p-4 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Tab Navigation */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-4 md:col-span-1">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" strokeWidth={1.5} />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-5 h-5 mr-3" strokeWidth={1.5} />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'security' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-5 h-5 mr-3" strokeWidth={1.5} />
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'appearance' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Eye className="w-5 h-5 mr-3" strokeWidth={1.5} />
                  Appearance
                </button>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" strokeWidth={1.5} />
                    Sign out
                  </button>
                </div>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-6 md:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && instructorData && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
                  <div className="flex flex-col md:flex-row md:space-x-6">
                    <div className="mb-6 md:mb-0">
                      {instructorData && (
                        <ProfilePictureSection
                          user={instructorData as any}
                          setUser={(updatedUser) => {
                            setInstructorData(updatedUser as any);
                          }}
                          setError={setError}
                          setSuccess={setSuccess}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                          />
                          <p className="mt-1 text-xs text-gray-500">Contact support to change your email address.</p>
                        </div>
                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                          </label>
                          <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            placeholder="Tell your students a bit about yourself..."
                          />
                        </div>
                        <div className="pt-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive email notifications for important updates</p>
                      </div>
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={emailNotifications}
                            onChange={() => setEmailNotifications(!emailNotifications)}
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <h3 className="font-medium">Message Notifications</h3>
                        <p className="text-sm text-gray-600">Get notified when students send you messages</p>
                      </div>
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={messageNotifications}
                            onChange={() => setMessageNotifications(!messageNotifications)}
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <h3 className="font-medium">Assignment Notifications</h3>
                        <p className="text-sm text-gray-600">Get notified when students complete assignments</p>
                      </div>
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={assignmentNotifications}
                            onChange={() => setAssignmentNotifications(!assignmentNotifications)}
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={handleNotificationPreferences}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                  
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {sessionInfo && (
                    <div className="mt-8">
                      <h3 className="font-medium mb-3">Active Session</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Last Active</p>
                            <p className="font-medium">{sessionInfo.lastActive}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Browser</p>
                            <p className="font-medium">{sessionInfo.browser}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Device</p>
                            <p className="font-medium">{sessionInfo.device}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <h3 className="font-medium">Compact View</h3>
                        <p className="text-sm text-gray-600">Reduce spacing in dashboard view</p>
                      </div>
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={compactView}
                            onChange={() => setCompactView(!compactView)}
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <h3 className="font-medium">High Contrast Mode</h3>
                        <p className="text-sm text-gray-600">Increase contrast for better readability</p>
                      </div>
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={highContrastMode}
                            onChange={() => setHighContrastMode(!highContrastMode)}
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={handleNotificationPreferences}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 