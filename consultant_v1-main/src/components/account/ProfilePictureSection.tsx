import React from 'react';
import { User, Upload, Trash2 } from 'lucide-react';
import { User as UserType, userService } from '../../services/userService';

interface ProfilePictureSectionProps {
  user: UserType;
  setUser: (user: UserType) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  user,
  setUser,
  setError,
  setSuccess,
}) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    
    try {
      if (user.profile_pic_url) {
        await userService.deleteProfilePicture(user.id, user.profile_pic_url);
      }
      
      const url = await userService.uploadProfilePicture(user.id, file);
      setUser({ ...user, profile_pic_url: url });
      setSuccess('Profile picture updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture');
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!user.profile_pic_url) return;

    setError(null);
    setSuccess(null);
    
    try {
      await userService.deleteProfilePicture(user.id, user.profile_pic_url);
      setUser({ ...user, profile_pic_url: null });
      setSuccess('Profile picture removed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove profile picture');
    }
  };

  return (
    <div className="relative">
      <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {user.profile_pic_url ? (
          <img
            src={userService.getProfilePictureUrl(user.profile_pic_url)}
            alt={user.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="h-10 w-10 md:h-12 md:w-12 text-gray-400" strokeWidth={1.5} />
        )}
      </div>
      <div className="absolute -bottom-2 -right-2 flex space-x-1">
        <label className="bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-opacity-90">
          <Upload className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </label>
        {user.profile_pic_url && (
          <button
            onClick={handleDeleteProfilePicture}
            className="bg-red-500 text-white p-1.5 rounded-full hover:bg-opacity-90"
          >
            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureSection;