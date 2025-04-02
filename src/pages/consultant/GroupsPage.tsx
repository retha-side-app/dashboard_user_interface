import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { instructorService, InstructorGroup } from '../../services/instructor/instructorService';
import { GroupCard } from '../../components/consultant/GroupCard';
import { GroupMembersModal } from '../../components/consultant/GroupMembersModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import InstructorSidebar from '../../components/consultant/InstructorSidebar';

const GroupsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [groups, setGroups] = useState<InstructorGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<InstructorGroup | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const [hasAccess, groupData] = await Promise.all([
          instructorService.isInstructor(),
          instructorService.getInstructorGroups()
        ]);

        setIsInstructor(hasAccess);
        setGroups(groupData);
      } catch (error) {
        console.error('Error loading groups data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }

  const handleViewMembers = (group: InstructorGroup) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
  };

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar onCollapse={(collapsed) => setIsSidebarCollapsed(collapsed)} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Groups</h1>
            
            {groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(group => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    onViewMembers={() => handleViewMembers(group)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No groups found</p>
              </div>
            )}
            
            {selectedGroup && (
              <GroupMembersModal
                isOpen={showMembersModal}
                onClose={() => setShowMembersModal(false)}
                group={selectedGroup}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage; 