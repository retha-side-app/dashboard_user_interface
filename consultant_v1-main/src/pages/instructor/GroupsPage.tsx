import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { instructorService, InstructorGroup } from '../../services/instructor/instructorService';
import InstructorSidebar from '../../components/instructor/InstructorSidebar';
import { GroupCard } from '../../components/instructor/GroupCard';
import { GroupMembersModal } from '../../components/instructor/GroupMembersModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const GroupsPage: React.FC = () => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [groups, setGroups] = useState<InstructorGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<InstructorGroup | null>(null);

  // Data fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        const [hasAccess, groupsData] = await Promise.all([
          instructorService.isInstructor(),
          instructorService.getInstructorGroups()
        ]);

        setIsInstructor(hasAccess);
        setGroups(groupsData);
      } catch (error) {
        console.error('Error loading groups data:', error);
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

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(to right, #fdfcfa, #f7f2ee)' }}>
      <InstructorSidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => setSelectedGroup(group)}
              />
            ))}
          </div>

          {/* Empty State */}
          {groups.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No groups found.</p>
            </div>
          )}

          {/* Side Modal */}
          {selectedGroup && (
            <>
              <div 
                className="fixed inset-0 bg-black bg-opacity-25"
                onClick={() => setSelectedGroup(null)}
              />
              <GroupMembersModal
                group={selectedGroup}
                onClose={() => setSelectedGroup(null)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsPage; 