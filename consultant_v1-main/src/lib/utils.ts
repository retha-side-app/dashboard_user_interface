export const getStorageUrl = (path: string) => {
  if (!path) return '';
  
  // If the URL is already complete, return it as is
  if (path.startsWith('http')) {
    return path;
  }

  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/course-content/${path}`;
};