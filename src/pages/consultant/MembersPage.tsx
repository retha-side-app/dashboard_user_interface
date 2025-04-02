import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { instructorService, StudentInfo } from '../../services/instructor/instructorService';
import { SearchBar } from '../../components/consultant/SearchBar';
import { StudentsTable } from '../../components/consultant/StudentsTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FilterField } from '../../types/filters';
import InstructorSidebar from '../../components/consultant/InstructorSidebar';

const MembersPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<FilterField, string>>({
    name: '',
    course: '',
    progress: '',
    group: '',
    email: ''
  });
  const [availableOptions, setAvailableOptions] = useState<{
    courses: string[];
    groups: string[];
  }>({
    courses: [],
    groups: [],
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const hasAccess = await instructorService.isInstructor();
        setIsInstructor(hasAccess);

        if (hasAccess) {
          const studentsData = await instructorService.getInstructorStudents();
          setStudents(studentsData);
          setFilteredStudents(studentsData);

          // Extract all unique course and group names
          const courseNames: string[] = [];
          const groupNames: string[] = [];
          
          studentsData.forEach(student => {
            student.enrolledCourses.forEach(course => {
              if (course.courseName && !courseNames.includes(course.courseName)) {
                courseNames.push(course.courseName);
              }
            });
            
            student.groups.forEach(group => {
              if (group.name && !groupNames.includes(group.name)) {
                groupNames.push(group.name);
              }
            });
          });
          
          setAvailableOptions({
            courses: courseNames,
            groups: groupNames,
          });
        }
      } catch (error) {
        console.error('Error fetching instructor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...students];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        student =>
          student.full_name.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.course) {
      result = result.filter(student =>
        student.enrolledCourses.some(course => 
          course.courseName === filters.course
        )
      );
    }

    if (filters.group) {
      result = result.filter(student =>
        student.groups.some(group => 
          group.name === filters.group
        )
      );
    }

    if (filters.name) {
      const term = filters.name.toLowerCase();
      result = result.filter(student =>
        student.full_name.toLowerCase().includes(term)
      );
    }

    if (filters.email) {
      const term = filters.email.toLowerCase();
      result = result.filter(student =>
        student.email.toLowerCase().includes(term)
      );
    }

    setFilteredStudents(result);
  }, [students, searchTerm, filters]);

  const handleFilterChange = (field: FilterField, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterClear = (field: FilterField) => {
    setFilters(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar onCollapse={(collapsed) => setIsSidebarCollapsed(collapsed)} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Members</h1>
            
            <div className="mb-6">
              <SearchBar 
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name or email"
              />
            </div>

            <StudentsTable 
              students={filteredStudents} 
              filters={filters}
              onFilterChange={handleFilterChange}
              onFilterClear={handleFilterClear}
              availableOptions={availableOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersPage; 