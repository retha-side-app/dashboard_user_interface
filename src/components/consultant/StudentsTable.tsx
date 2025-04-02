import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentInfo } from '../../services/instructor/instructorService';
import { TableColumnHeader } from './TableColumnHeader';
import { FilterField } from '../../types/filters';
import { getStorageUrl } from '../../utils/imageUtils';
import { MessageCircle } from 'lucide-react';
import { messagingService } from '../../services/messagingService';
import { supabase } from '../../lib/supabase';

//merhaba
interface StudentsTableProps {
  students: StudentInfo[];
  filters: Record<FilterField, string>;
  onFilterChange: (field: FilterField, value: string) => void;
  onFilterClear: (field: FilterField) => void;
  availableOptions: {
    courses: string[];
    groups: string[];
  };
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  filters,
  onFilterChange,
  onFilterClear,
  availableOptions
}) => {
  const navigate = useNavigate();

  const handleMessageClick = async (studentId: string) => {
    try {
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get or create a conversation with this student
      const conversation = await messagingService.getOrCreateConversation(
        studentId,
        user.id
      );
      
      // Navigate to the messaging page with this conversation
      navigate(`/consultant-dashboard/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No members found matching your criteria.</p>
      </div>
    );
  }

  return (
    <table className="min-w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <TableColumnHeader
            label="Name"
            field="name"
            filterValue={filters.name}
            onFilterChange={onFilterChange}
            onFilterClear={onFilterClear}
          />
          <TableColumnHeader
            label="Course"
            field="course"
            filterValue={filters.course}
            onFilterChange={onFilterChange}
            onFilterClear={onFilterClear}
            options={availableOptions.courses}
          />
          <TableColumnHeader
            label="Progress"
            field="progress"
            filterValue={filters.progress}
            onFilterChange={onFilterChange}
            onFilterClear={onFilterClear}
          />
          <TableColumnHeader
            label="Group"
            field="group"
            filterValue={filters.group}
            onFilterChange={onFilterChange}
            onFilterClear={onFilterClear}
            options={availableOptions.groups}
          />
          <TableColumnHeader
            label="Email"
            field="email"
            filterValue={filters.email}
            onFilterChange={onFilterChange}
            onFilterClear={onFilterClear}
          />
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {students.map((student) => (
          student.enrolledCourses.map((course, courseIndex) => (
            <tr 
              key={`${student.id}-${course.id}`}
              className="bg-white bg-opacity-60 hover:bg-gray-50"
            >
              {courseIndex === 0 && (
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  rowSpan={student.enrolledCourses.length}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-lg font-medium">
                          {student.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                    </div>
                  </div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {course.thumbnailUrl && (
                    <img
                      src={getStorageUrl(course.thumbnailUrl, 'course')}
                      alt={course.courseName}
                      className="h-8 w-8 rounded object-cover mr-3"
                    />
                  )}
                  <span className="text-sm text-gray-900">{course.courseName}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-24">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${course.progress.progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {course.progress.progressPercentage}%
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.groups
                  .filter(group => group.courseId === course.courseId)
                  .map(group => group.name)
                  .join(', ') || '-'}
              </td>
              {courseIndex === 0 && (
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  rowSpan={student.enrolledCourses.length}
                >
                  {student.email}
                </td>
              )}
              {courseIndex === 0 && (
                <td 
                  className="px-6 py-4 whitespace-nowrap text-center"
                  rowSpan={student.enrolledCourses.length}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessageClick(student.id);
                    }}
                    className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                    title="Message student"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </td>
              )}
            </tr>
          ))
        ))}
      </tbody>
    </table>
  );
};