import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { User, userService } from '../../services/userService';

interface PasswordSectionProps {
  user: User;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({
  user,
  setError,
  setSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await userService.updatePassword(newPassword);
      setIsEditing(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setSuccess('Password updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <label className="block text-xs md:text-sm font-medium text-secondary mb-1">
        Password
      </label>
      {isEditing ? (
        <div className="space-y-3 md:space-y-4">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-[5px] border border-gray-200 px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-[5px] border border-gray-200 px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-[5px] border border-gray-200 px-3 py-2 text-sm"
          />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="px-3 py-2 bg-primary text-white rounded-[5px] hover:bg-opacity-90 disabled:opacity-50 text-sm"
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="px-3 py-2 border border-gray-200 rounded-[5px] hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lock className="h-4 w-4 md:h-5 md:w-5 text-secondary mr-2" strokeWidth={1.5} />
            <p className="text-primary text-sm md:text-base">••••••••</p>
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

export default PasswordSection;