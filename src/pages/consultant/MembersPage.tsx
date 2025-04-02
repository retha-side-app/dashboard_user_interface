import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { instructorService, StudentInfo } from '../../services/instructor/instructorService';
import { SearchBar } from '../../components/consultant/SearchBar';
import { StudentsTable } from '../../components/consultant/StudentsTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FilterField } from '../../types/filters';

const MembersPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({
    course: [],
    group: [],
  });
  const [availableOptions, setAvailableOptions] = useState<{
    courses: string[];
    groups: string[];
  }>({
    courses: [],
    groups: [],
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const hasAccess = await instructorService.isInstructor();
        setIsInstructor(hasAccess);

        if (hasAccess) {
          const studentsData = await instructorService.getAllStudents();
          setStudents(studentsData);
          setFilteredStudents(studentsData);

          // Extract all unique course and group names
          const courses = [...new Set(studentsData.flatMap(s => s.courses || []))];
          const groups = [...new Set(studentsData.flatMap(s => s.groups || []))];
          
          setAvailableOptions({
            courses,
            groups,
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
    if (filters.course.length > 0) {
      result = result.filter(student =>
        student.courses?.some(course => filters.course.includes(course))
      );
    }

    if (filters.group.length > 0) {
      result = result.filter(student =>
        student.groups?.some(group => filters.group.includes(group))
      );
    }

    setFilteredStudents(result);
  }, [students, searchTerm, filters]);

  const handleFilterChange = (field: FilterField, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field.id]: prev[field.id].includes(value)
        ? prev[field.id].filter(v => v !== value)
        : [...prev[field.id], value],
    }));
  };

  const handleFilterClear = (field: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: [],
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Students</h1>
          
          <div className="flex justify-between items-center mb-6">
            <SearchBar 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          
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