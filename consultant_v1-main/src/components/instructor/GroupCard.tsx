import React from 'react';
import { Users } from 'lucide-react';
import { InstructorGroup } from '../../services/instructor/instructorService';

interface GroupCardProps {
  group: InstructorGroup;
  onClick: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
          {group.description && (
            <p className="mt-1 text-sm text-gray-500">{group.description}</p>
          )}
        </div>
        <div className="flex items-center text-gray-500">
          <Users className="w-5 h-5 mr-2" />
          <span>{group.members.length} members</span>
        </div>
      </div>
    </div>
  );
}; 