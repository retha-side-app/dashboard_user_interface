import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { User, userService } from '../../services/userService';

interface EmailSectionProps {
  user: User;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

const EmailSection: React.FC<EmailSectionProps> = ({
  user,
  setUser,
  setError,
  setSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await userService.updateEmail(newEmail);
      const updatedUser = await userService.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
      setIsEditing(false);
      setSuccess('Email updated successfully. Please check your inbox for verification.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-4 md:mb-6">
      <label className="block text-xs md:text-sm font-medium text-secondary mb-1">
        Email Address
      </label>
      {isEditing ? (
        <div className="flex space-x-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 rounded-[5px] border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="px-3 py-2 bg-primary text-white rounded-[5px] hover:bg-opacity-90 disabled:opacity-50 text-sm"
          >
            {isSaving ? 'Saving...' : 'Update'}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setNewEmail(user.email);
            }}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="h-4 w-4 md:h-5 md:w-5 text-secondary mr-2" strokeWidth={1.5} />
            <p className="text-primary text-sm md:text-base">{user.email}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary hover:text-opacity-80 text-sm"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailSection;