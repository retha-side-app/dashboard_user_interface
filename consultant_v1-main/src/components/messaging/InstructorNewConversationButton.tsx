// src/components/messaging/InstructorNewConversationButton.tsx
import React, { useState, useEffect } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { useAuth } from '../../components/layout/useAuth';
import { supabase } from '../../lib/supabase';
import { Search, Plus, X } from 'lucide-react';

interface InstructorNewConversationButtonProps {
  className?: string;
}

const InstructorNewConversationButton: React.FC<InstructorNewConversationButtonProps> = ({ className = '' }) => {
  const { startConversation } = useMessaging();
  const { userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load the appropriate users when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const toggleModal = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      // Clear results when opening
      setSearchResults([]);
      setSearch('');
      setError(null);
    }
  };

  // This function fetches all students assigned to the instructor
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!userData?.id) {
        console.error("User data is missing");
        setError("User data is missing. Please try refreshing the page.");
        return;
      }

      // Get all students assigned to this instructor
      const { data: assignedStudents, error: studentsError } = await supabase
        .from('instructor_students')
        .select(`
          student_id,
          student:student_id(*)
        `)
        .eq('instructor_id', userData.id);

      if (studentsError) {
        console.error("Error fetching students:", studentsError);
        throw studentsError;
      }

      // Extract student data
      const students = assignedStudents
        .map(item => item.student)
        .filter(Boolean);

      setSearchResults(students);
    } catch (err) {
      console.error("Error in fetchStudents:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter the already loaded results by search term
  const filteredResults = searchResults.filter(student => {
    if (!search.trim()) return true;
    
    const fullName = student?.full_name?.toLowerCase() || '';
    const email = student?.email?.toLowerCase() || '';
    const searchTerm = search.toLowerCase();
    
    return fullName.includes(searchTerm) || email.includes(searchTerm);
  });

  const handleStartConversation = async (studentId: string) => {
    try {
      setIsLoading(true);
      
      if (!userData?.id) {
        throw new Error('User data is missing');
      }
      
      // Instructor is always the instructor_id, student is always the user_id
      const userId = studentId;
      const instructorId = userData.id;
      
      if (!userId || !instructorId) {
        throw new Error('User IDs are required');
      }
      
      await startConversation(userId, instructorId);
      
      // Close modal
      setIsOpen(false);
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

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
                Message a Student
              </h2>
              <button 
                onClick={toggleModal}
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
                  placeholder="Search by name or email..."
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
                    ? 'You don\'t have any students assigned yet.' 
                    : 'No matching students found'}
                </p>
              ) : (
                filteredResults.map((student) => (
                  <div
                    key={student.id}
                    className="p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-[5px] flex items-center"
                    onClick={() => handleStartConversation(student.id)}
                  >
                    {student.profile_pic_url ? (
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/user-media/${student.profile_pic_url}`}
                        alt={student.full_name || ''}
                        className="w-10 h-10 rounded-[5px] mr-3 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-[5px] bg-primary text-white flex items-center justify-center mr-3">
                        {student?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-primary">{student.full_name}</h3>
                      <p className="text-sm text-secondary">{student.email}</p>
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

export default InstructorNewConversationButton;