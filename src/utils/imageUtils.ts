const SUPABASE_URL = 'https://qcheujnnqocejocjyvpf.supabase.co';
const USER_MEDIA_BUCKET = 'user-media';
const COURSE_CONTENT_BUCKET = 'course-content';

export const getStorageUrl = (path: string | null, type: 'profile' | 'course' = 'profile'): string => {
  if (!path) return '';
  
  // Check if the URL is already complete
  if (path.startsWith('http')) {
    return path;
  }

  // Determine which bucket to use
  const bucket = type === 'course' ? COURSE_CONTENT_BUCKET : USER_MEDIA_BUCKET;

  // Construct the full URL
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}; 