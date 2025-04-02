// src/components/instructor/GroupMembersModal.tsx
import React from 'react';
import { X, MessageCircle } from 'lucide-react';
import { InstructorGroup } from '../../services/instructor/instructorService';
import { getStorageUrl } from '../../utils/imageUtils';
import MessageStudentButton from '../messaging/MessageStudentButton';
//selamınalyküm
interface GroupMembersModalProps {
  group: InstructorGroup;
  onClose: () => void;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({ group, onClose }) => {
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {group.description && (
            <p className="mt-2 text-sm text-gray-500">{group.description}</p>
          )}
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {group.members.map(member => (
              <div 
                key={member.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  {member.profile_pic_url ? (
                    <img
                      src={getStorageUrl(member.profile_pic_url, 'profile')}
                      alt={member.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-lg font-medium">
                        {member.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.full_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {member.email}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2
                    ${member.role === 'instructor' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-800'}
                  `}>
                    {member.role}
                  </span>
                  
                  {/* Only show message button for students */}
                  {member.role !== 'instructor' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Use the navigation approach from MessageStudentButton
                        window.location.href = `/consultant-dashboard/messages?conversation=${member.id}`;
                      }}
                      className="text-primary hover:text-primary/80"
                      title="Message student"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};