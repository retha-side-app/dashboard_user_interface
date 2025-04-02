// src/components/messaging/NewConversationButton.tsx
import React, { useState, useEffect } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { useAuth } from '../layout/useAuth';
import { supabase } from '../../lib/supabase';
import { User } from '../../services/userService';
import { Search, Plus, X } from 'lucide-react';

interface NewConversationButtonProps {
  className?: string;
}

const NewConversationButton: React.FC<NewConversationButtonProps> = ({ className = '' }) => {
  const { startConversation } = useMessaging();
  const { userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Only fetch users when modal is opened
  const toggleModal = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      // Clear previous results and fetch new ones
      setSearchResults([]);
      setSearch('');
      setError(null);
      fetchContactableUsers();
    }
  };

  // This function fetches all users the current user can message
  const fetchContactableUsers = async () => {
    if (!userData) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Safeguard for userData
      if (!userData.id) {
        setError("User ID is missing");
        return;
      }

      // Determine user role with fallback to prevent errors
      const isInstructor = userData.role === 'instructor';
      
      try {
        if (isInstructor) {
          // Instructors: Get assigned students
          const { data, error: studentsError } = await supabase
            .from('instructor_students')
            .select(`
              student_id,
              student:users!instructor_students_student_id_fkey(
                id,
                full_name,
                email,
                role,
                profile_pic_url
              )
            `)
            .eq('instructor_id', userData.id);

          if (studentsError) throw studentsError;

          // Extract student data
          const students = data
            .map(item => item.student)
            .filter(Boolean);

          setSearchResults(students);
        } else {
          // Students: Get assigned instructors
          const { data, error: instructorsError } = await supabase
            .from('instructor_students')
            .select(`
              instructor_id,
              instructor:users!instructor_students_instructor_id_fkey(
                id,
                full_name,
                email,
                role,
                profile_pic_url
              )
            `)
            .eq('student_id', userData.id);

          if (instructorsError) throw instructorsError;

          // Extract instructor data
          const instructors = data
            .map(item => item.instructor)
            .filter(Boolean);

          setSearchResults(instructors);
        }
      } catch (queryError) {
        console.error("Query error:", queryError);
        
        // Fallback approach - try a simpler query
        try {
          if (isInstructor) {
            // Simple query for students
            const { data: relationships, error: relError } = await supabase
              .from('instructor_students')
              .select('student_id')
              .eq('instructor_id', userData.id);
              
            if (relError) throw relError;
            
            if (relationships.length > 0) {
              const studentIds = relationships.map(r => r.student_id);
              
              const { data: students, error: studentsError } = await supabase
                .from('users')
                .select('*')
                .in('id', studentIds);
                
              if (studentsError) throw studentsError;
              
              setSearchResults(students);
            }
          } else {
            // Simple query for instructors
            const { data: relationships, error: relError } = await supabase
              .from('instructor_students')
              .select('instructor_id')
              .eq('student_id', userData.id);
              
            if (relError) throw relError;
            
            if (relationships.length > 0) {
              const instructorIds = relationships.map(r => r.instructor_id);
              
              const { data: instructors, error: instructorsError } = await supabase
                .from('users')
                .select('*')
                .in('id', instructorIds);
                
              if (instructorsError) throw instructorsError;
              
              setSearchResults(instructors);
            }
          }
        } catch (fallbackError) {
          console.error("Fallback query error:", fallbackError);
          throw fallbackError;
        }
      }
    } catch (err) {
      console.error("Error in fetchContactableUsers:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter the results by search term
  const filteredResults = searchResults.filter(user => {
    if (!search.trim()) return true;
    
    const fullName = user?.full_name?.toLowerCase() || '';
    const email = user?.email?.toLowerCase() || '';
    const searchTerm = search.toLowerCase();
    
    return fullName.includes(searchTerm) || email.includes(searchTerm);
  });

  const handleStartConversation = async (otherUserId: string) => {
    if (!userData?.id || !otherUserId) return;
    
    try {
      setIsLoading(true);
      
      const isInstructor = userData.role === 'instructor';
      
      // Determine userId and instructorId based on roles
      const userId = isInstructor ? otherUserId : userData.id;
      const instructorId = isInstructor ? userData.id : otherUserId;
      
      await startConversation(userId, instructorId);
      setIsOpen(false);
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if component can render safely
  if (!userData) {
    return (
      <button 
        className={`flex items-center rounded-[5px] bg-gray-300 px-3 py-1.5 text-gray-600 text-sm cursor-not-allowed ${className}`}
        disabled
      >
        <Plus className="h-4 w-4 mr-1" />
        New
      </button>
    );
  }

  return (
    <>
      <button
        onClick={toggleModal}
        className={`flex items-center rounded-[5px] bg-primary px-3 py-1.5 text-white text-sm hover:bg-opacity-90 transition-colors ${className}`}
      >
        <Plus className="h-4 w-4 mr-1" />
        New
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[5px] w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">
                {userData?.role === 'instructor' ? 'Message a Student' : 'Message an Instructor'}
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="flex-1 border border-gray-200 rounded-[5px] px-4 py-2 focus:outline-none focus:border-primary"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
              </div>
              
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto mb-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-[5px]"></div>
                  ))}
                </div>
              ) : filteredResults.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  {searchResults.length === 0 
                    ? `You don't have any ${userData?.role === 'instructor' ? 'students' : 'instructors'} assigned yet.` 
                    : 'No matching results found'}
                </p>
              ) : (
                filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-[5px] flex items-center"
                    onClick={() => handleStartConversation(result.id)}
                  >
                    {result.profile_pic_url ? (
                      <img
                        src={userService.getProfilePictureUrl(result.profile_pic_url)}
                        alt={result.full_name || ''}
                        className="w-10 h-10 rounded-[5px] mr-3 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-[5px] bg-primary text-white flex items-center justify-center mr-3">
                        {result?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-primary">{result.full_name || 'Unknown'}</h3>
                      <p className="text-sm text-secondary">{result.email || ''}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewConversationButton;