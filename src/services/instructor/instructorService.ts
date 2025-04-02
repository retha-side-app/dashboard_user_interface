import { supabase } from '../../lib/supabase';

export interface InstructorUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface StudentGroup {
  id: string;
  name: string;
  courseId: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  courseName: string;
  thumbnailUrl: string | null;
  enrolledAt: string;
  progress: {
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
  };
}

export interface StudentInfo {
  id: string;
  full_name: string;
  email: string;
  enrolledCourses: CourseEnrollment[];
  groups: StudentGroup[];
}

export interface GroupMember {
  id: string;
  full_name: string;
  email: string;
  profile_pic_url: string | null;
  role: string;
}

export interface InstructorGroup {
  id: string;
  name: string;
  description: string | null;
  courseId: string;
  courseThumbnailUrl: string | null;
  members: GroupMember[];
}

export const instructorService = {
  /**
   * Check if the current user is an instructor
   */
  async isInstructor(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !userData) return false;

      return userData.role === 'instructor';
    } catch (error) {
      console.error('Error checking instructor status:', error);
      return false;
    }
  },

  /**
   * Get instructor profile data
   */
  async getInstructorProfile(): Promise<InstructorUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .single();

      if (error || !userData) return null;

      return userData as InstructorUser;
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      return null;
    }
  },

  /**
   * Get all groups that the instructor is a member of, along with other members
   */
  async getInstructorGroups(): Promise<InstructorGroup[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      console.log('Current user ID:', user.id); // Debug log

      // First, get all groups the instructor is a member of
      const { data: instructorGroups, error: groupsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (groupsError) {
        console.error('Error fetching instructor groups:', groupsError);
        return [];
      }

      console.log('Instructor group memberships:', instructorGroups); // Debug log

      if (!instructorGroups || instructorGroups.length === 0) {
        console.log('Instructor is not a member of any groups'); // Debug log
        return [];
      }

      // Get all group IDs the instructor is a member of
      const groupIds = instructorGroups.map(group => group.group_id);
      console.log('Group IDs:', groupIds); // Debug log

      // Fetch detailed information about these groups
      const { data: groupsData, error: groupDetailsError } = await supabase
        .from('course_groups')
        .select('id, name, description, course_id')
        .in('id', groupIds);

      if (groupDetailsError) {
        console.error('Error fetching group details:', groupDetailsError);
        return [];
      }

      console.log('Groups data:', groupsData); // Debug log

      if (!groupsData || groupsData.length === 0) {
        console.log('No group details found'); // Debug log
        return [];
      }

      // Get all course IDs from the groups
      const courseIds = [...new Set(groupsData.map(group => group.course_id))];
      
      // Fetch course details including thumbnails
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, thumbnail_url')
        .in('id', courseIds);
        
      if (coursesError) {
        console.error('Error fetching course details:', coursesError);
      }
      
      // Create a map of course IDs to their thumbnail URLs
      const courseThumbnailMap = new Map();
      if (coursesData) {
        coursesData.forEach(course => {
          courseThumbnailMap.set(course.id, course.thumbnail_url);
        });
      }

      // For each group, get all members
      const groupPromises = groupsData.map(async (group) => {
        // Get all members of this group
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', group.id);

        if (memberError) {
          console.error(`Error fetching members for group ${group.id}:`, memberError);
          return {
            ...group,
            courseThumbnailUrl: courseThumbnailMap.get(group.course_id) || null,
            members: []
          };
        }

        console.log(`Members of group ${group.id}:`, memberData); // Debug log

        if (!memberData || memberData.length === 0) {
          return {
            ...group,
            courseThumbnailUrl: courseThumbnailMap.get(group.course_id) || null,
            members: []
          };
        }

        // Get member user IDs
        const memberIds = memberData.map(member => member.user_id);

        // Fetch user details for all members
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, email, profile_pic_url, role')
          .in('id', memberIds);

        if (usersError) {
          console.error('Error fetching user details for members:', usersError);
          return {
            ...group,
            courseThumbnailUrl: courseThumbnailMap.get(group.course_id) || null,
            members: []
          };
        }

        console.log(`User details for members of group ${group.id}:`, usersData); // Debug log

        // Map the members to the expected format
        const members = usersData.map(user => ({
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          profile_pic_url: user.profile_pic_url,
          role: user.role
        }));

        // Return the group with its members
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          courseId: group.course_id,
          courseThumbnailUrl: courseThumbnailMap.get(group.course_id) || null,
          members: members
        };
      });

      // Wait for all group data to be processed
      const result = await Promise.all(groupPromises);
      console.log('Final instructor groups data:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Error in getInstructorGroups:', error);
      return [];
    }
  },

  /**
   * Get all students assigned to the instructor
   */
  async getInstructorStudents(): Promise<StudentInfo[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      console.log('Current user ID:', user.id); // Debug log

      // First, get all instructor-student relationships
      const { data: instructorStudentsData, error: instructorError } = await supabase
        .from('instructor_students')
        .select(`
          instructor_id,
          student_id,
          course_id
        `)
        .eq('instructor_id', user.id);

      if (instructorError) {
        console.error('Error fetching instructor students:', instructorError);
        return [];
      }

      console.log('Raw instructor-student relationships:', instructorStudentsData); // Debug log

      if (!instructorStudentsData || instructorStudentsData.length === 0) {
        console.log('No instructor-student relationships found'); // Debug log
        return [];
      }

      // Get unique student IDs
      const studentIds = [...new Set(instructorStudentsData.map(item => item.student_id))];
      console.log('Student IDs:', studentIds); // Debug log

      // Fetch student details
      const { data: studentsData, error: studentsError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (studentsError) {
        console.error('Error fetching student details:', studentsError);
        return [];
      }

      console.log('Students data:', studentsData); // Debug log

      // Create a map of student IDs to their details
      const studentMap = new Map();
      studentsData.forEach(student => {
        studentMap.set(student.id, {
          id: student.id,
          full_name: student.full_name,
          email: student.email,
          enrolledCourses: [],
          groups: []
        });
      });

      // Get all course enrollments for these students
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('id, user_id, course_id')
        .in('user_id', studentIds);

      if (enrollmentsError) {
        console.error('Error fetching course enrollments:', enrollmentsError);
      }

      console.log('Course enrollments:', enrollmentsData || []); // Debug log

      // Get all unique course IDs from instructor-student relationships and enrollments
      const courseIdsFromInstructor = instructorStudentsData.map(item => item.course_id);
      const courseIdsFromEnrollments = enrollmentsData ? enrollmentsData.map(item => item.course_id) : [];
      const courseIds = [...new Set([...courseIdsFromInstructor, ...courseIdsFromEnrollments])];
      
      console.log('All course IDs:', courseIds); // Debug log

      // Fetch course details with thumbnails
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, thumbnail_url')
        .in('id', courseIds);

      if (coursesError) {
        console.error('Error fetching course details:', coursesError);
        return [];
      }

      console.log('Courses data:', coursesData); // Debug log

      // Create a map of course IDs to their details
      const courseMap = new Map();
      coursesData.forEach(course => {
        courseMap.set(course.id, {
          id: course.id,
          courseName: course.title,
          thumbnailUrl: course.thumbnail_url
        });
      });

      // Fetch all progress data for these student-course pairs
      const { data: progressData, error: progressError } = await supabase
        .from('course_progress')
        .select('user_id, course_id, completed_steps, total_steps, progress_percentage')
        .in('user_id', studentIds)
        .in('course_id', courseIds);

      if (progressError) {
        console.error('Error fetching course progress:', progressError);
        // Continue without progress data
      }

      console.log('Progress data:', progressData || []); // Debug log

      // Create a map of student-course pairs to their progress
      const progressMap = new Map();
      if (progressData) {
        progressData.forEach(progress => {
          const key = `${progress.user_id}-${progress.course_id}`;
          progressMap.set(key, {
            completedSteps: progress.completed_steps || 0,
            totalSteps: progress.total_steps || 0,
            progressPercentage: progress.progress_percentage || 0
          });
        });
      }

      // Create a map to track which courses each student is enrolled in
      const studentEnrollments = new Map();
      if (enrollmentsData) {
        enrollmentsData.forEach(enrollment => {
          const studentId = enrollment.user_id;
          const courseId = enrollment.course_id;
          
          if (!studentEnrollments.has(studentId)) {
            studentEnrollments.set(studentId, new Set());
          }
          
          studentEnrollments.get(studentId).add(courseId);
        });
      }

      // Fetch group memberships for all students
      const { data: groupMembersData, error: groupMembersError } = await supabase
        .from('group_members')
        .select('group_id, user_id')
        .in('user_id', studentIds);

      if (groupMembersError) {
        console.error('Error fetching group members:', groupMembersError);
        // Continue without group data
      }

      console.log('Group members data:', groupMembersData || []); // Debug log

      // Get unique group IDs
      const groupIds = groupMembersData ? [...new Set(groupMembersData.map(item => item.group_id))] : [];
      
      // Fetch group details if we have any groups
      let groupsData = [];
      if (groupIds.length > 0) {
        const { data: fetchedGroupsData, error: groupsError } = await supabase
          .from('course_groups')
          .select('id, name, course_id')
          .in('id', groupIds);

        if (groupsError) {
          console.error('Error fetching course groups:', groupsError);
        } else {
          groupsData = fetchedGroupsData || [];
        }
      }
      
      console.log('Groups data:', groupsData); // Debug log

      // Create a map of group IDs to their details
      const groupMap = new Map();
      groupsData.forEach(group => {
        groupMap.set(group.id, {
          id: group.id,
          name: group.name,
          courseId: group.course_id
        });
      });

      // Create a map of student IDs to their groups
      const studentGroupsMap = new Map();
      if (groupMembersData) {
        groupMembersData.forEach(membership => {
          const studentId = membership.user_id;
          const groupId = membership.group_id;
          const group = groupMap.get(groupId);
          
          if (group) {
            if (!studentGroupsMap.has(studentId)) {
              studentGroupsMap.set(studentId, []);
            }
            studentGroupsMap.get(studentId).push(group);
          }
        });
      }

      // Build the final student info objects with their enrolled courses and groups
      instructorStudentsData.forEach(relationship => {
        const student = studentMap.get(relationship.student_id);
        const course = courseMap.get(relationship.course_id);
        
        if (student && course) {
          const progressKey = `${relationship.student_id}-${relationship.course_id}`;
          const progress = progressMap.get(progressKey) || {
            completedSteps: 0,
            totalSteps: 0,
            progressPercentage: 0
          };
          
          // Check if this course is already added to avoid duplicates
          const existingCourse = student.enrolledCourses.find(
            c => c.courseId === relationship.course_id
          );
          
          if (!existingCourse) {
            student.enrolledCourses.push({
              id: relationship.course_id,
              courseId: course.id,
              courseName: course.courseName,
              thumbnailUrl: course.thumbnailUrl,
              enrolledAt: new Date().toISOString(), // Default to current date
              progress: progress
            });
          }
          
          // Add groups for this student if any
          const studentGroups = studentGroupsMap.get(relationship.student_id) || [];
          student.groups = studentGroups;
        }
      });

      // Add additional courses from enrollments
      if (studentEnrollments) {
        studentEnrollments.forEach((courseIds, studentId) => {
          const student = studentMap.get(studentId);
          if (student) {
            courseIds.forEach(courseId => {
              const course = courseMap.get(courseId);
              if (course) {
                // Check if this course is already added to avoid duplicates
                const existingCourse = student.enrolledCourses.find(
                  c => c.courseId === courseId
                );
                
                if (!existingCourse) {
                  const progressKey = `${studentId}-${courseId}`;
                  const progress = progressMap.get(progressKey) || {
                    completedSteps: 0,
                    totalSteps: 0,
                    progressPercentage: 0
                  };
                  
                  student.enrolledCourses.push({
                    id: courseId,
                    courseId: course.id,
                    courseName: course.courseName,
                    thumbnailUrl: course.thumbnailUrl,
                    enrolledAt: new Date().toISOString(), // Default to current date
                    progress: progress
                  });
                }
              }
            });
          }
        });
      }

      const result = Array.from(studentMap.values());
      console.log('Final transformed students data with groups and all courses:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Error in getInstructorStudents:', error);
      return [];
    }
  }
};