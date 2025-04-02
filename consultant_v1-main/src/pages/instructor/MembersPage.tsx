import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { instructorService, StudentInfo } from '../../services/instructor/instructorService';
import InstructorSidebar from '../../components/instructor/InstructorSidebar';
import { SearchBar } from '../../components/instructor/SearchBar';
import { StudentsTable } from '../../components/instructor/StudentsTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FilterField } from '../../types/filters';

const MembersPage: React.FC = () => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<FilterField, string>>({
    name: '',
    course: '',
    progress: '',
    group: '',
    email: ''
  });

  // Available options for filters
  const [availableOptions, setAvailableOptions] = useState<{
    courses: string[];
    groups: string[];
  }>({
    courses: [],
    groups: []
  });

  // Data fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        const [hasAccess, studentData] = await Promise.all([
          instructorService.isInstructor(),
          instructorService.getInstructorStudents()
        ]);

        setIsInstructor(hasAccess);
        setStudents(studentData);

        // Extract unique courses and groups
        const courses = new Set<string>();
        const groups = new Set<string>();
        
        studentData.forEach(student => {
          student.enrolledCourses.forEach(course => courses.add(course.courseName));
          student.groups.forEach(group => groups.add(group.name));
        });

        setAvailableOptions({
          courses: Array.from(courses),
          groups: Array.from(groups)
        });
      } catch (error) {
        console.error('Error loading members data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Access control
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  // Filter handlers
  const handleFilterChange = (field: FilterField, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterClear = (field: FilterField) => {
    setFilters(prev => ({ ...prev, [field]: '' }));
  };

  // Apply filters and search
  const filteredStudents = students.filter(student => {
    // Search term filter
    if (searchTerm && !student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Column filters
    if (filters.name && !student.full_name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    
    if (filters.email && !student.email.toLowerCase().includes(filters.email.toLowerCase())) {
      return false;
    }

    if (filters.course) {
      const hasCourse = student.enrolledCourses.some(course => 
        course.courseName.toLowerCase().includes(filters.course.toLowerCase())
      );
      if (!hasCourse) return false;
    }

    if (filters.group) {
      const hasGroup = student.groups.some(group => 
        group.name.toLowerCase().includes(filters.group.toLowerCase())
      );
      if (!hasGroup) return false;
    }

    if (filters.progress) {
      const meetsProgress = student.enrolledCourses.some(course => 
        course.progress.progressPercentage >= Number(filters.progress)
      );
      if (!meetsProgress) return false;
    }

    return true;
  });

  return (
    <div className="flex min-h-screen gradient-bg">
      <InstructorSidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Members</h1>
            <SearchBar 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          {/* Table */}
          <div className="rounded-lg shadow overflow-hidden">
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