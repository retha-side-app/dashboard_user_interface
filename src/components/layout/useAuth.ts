import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { userService } from '../../services/userService';
import { UserData } from './types';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Get user profile data
          const profileData = await userService.getCurrentUser();
          if (profileData) {
            setUserData(profileData);
          }
        } else {
          // Clear user data if no session
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // Get user profile data
        try {
          const profileData = await userService.getCurrentUser();
          if (profileData) {
            setUserData(profileData);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        // Clear user data on sign out
        setUser(null);
        setUserData(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    userData,
    isLoading,
    isAuthenticated: !!user,
    signOut
  };
};