import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User, userService } from '../../services/userService';

interface NameSectionProps {
  user: User;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

const NameSection: React.FC<NameSectionProps> = ({
  user,
  setUser,
  setError,
  setSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedUser = await userService.updateUser(user.id, {
        full_name: fullName,
      });
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess('Name updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-4 md:mb-6">
      <label className="block text-xs md:text-sm font-medium text-secondary mb-1">
        Full Name
      </label>
      {isEditing ? (
        <div className="flex space-x-2">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="flex-1 rounded-[5px] border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-2 bg-primary text-white rounded-[5px] hover:bg-opacity-90 disabled:opacity-50 text-sm"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setFullName(user.full_name);
            }}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-base md:text-lg text-primary">{user.full_name}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary hover:text-opacity-80 text-sm"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default NameSection;