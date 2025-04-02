import { useState, useMemo } from 'react';
import { StudentInfo } from '../services/instructor/instructorService';
import { Filter, FilterState, FilterOption } from '../types/filters';

export const useStudentFilters = (students: StudentInfo[]) => {
  const [filterState, setFilterState] = useState<FilterState>({
    activeFilters: [],
    availableOptions: {
      courses: [],
      groups: []
    }
  });

  // Get unique courses and groups from students
  useMemo(() => {
    const courses = new Set<string>();
    const groups = new Set<string>();

    students.forEach(student => {
      student.enrolledCourses.forEach(course => courses.add(course.courseName));
      student.groups.forEach(group => groups.add(group.name));
    });

    setFilterState(prev => ({
      ...prev,
      availableOptions: {
        courses: Array.from(courses),
        groups: Array.from(groups)
      }
    }));
  }, [students]);

  const filterOptions: FilterOption[] = [
    { field: 'name', label: 'Name', type: 'text' },
    { 
      field: 'course', 
      label: 'Course', 
      type: 'select',
      options: filterState.availableOptions.courses 
    },
    { field: 'progress', label: 'Progress', type: 'range' },
    { 
      field: 'group', 
      label: 'Group', 
      type: 'select',
      options: filterState.availableOptions.groups 
    },
    { field: 'email', label: 'Email', type: 'text' }
  ];

  const addFilter = (filter: Filter) => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: [...prev.activeFilters.filter(f => f.field !== filter.field), filter]
    }));
  };

  const removeFilter = (field: Filter['field']) => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: prev.activeFilters.filter(f => f.field !== field)
    }));
  };

  const clearFilters = () => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: []
    }));
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      return filterState.activeFilters.every(filter => {
        switch (filter.field) {
          case 'name':
            return student.full_name.toLowerCase().includes(filter.value.toString().toLowerCase());
          case 'email':
            return student.email.toLowerCase().includes(filter.value.toString().toLowerCase());
          case 'course':
            return student.enrolledCourses.some(course => 
              course.courseName.toLowerCase().includes(filter.value.toString().toLowerCase())
            );
          case 'group':
            return student.groups.some(group => 
              group.name.toLowerCase().includes(filter.value.toString().toLowerCase())
            );
          case 'progress':
            return student.enrolledCourses.some(course => 
              course.progress.progressPercentage >= Number(filter.value)
            );
          default:
            return true;
        }
      });
    });
  }, [students, filterState.activeFilters]);

  return {
    filterOptions,
    activeFilters: filterState.activeFilters,
    filteredStudents,
    addFilter,
    removeFilter,
    clearFilters
  };
}; 