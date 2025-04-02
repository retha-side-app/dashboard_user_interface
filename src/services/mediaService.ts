import { supabase } from '../lib/supabase';
import type { MediaFile, CourseMedia, StepMedia } from './types/media';

export const mediaService = {
  async getStepMedia(stepId: string): Promise<StepMedia | null> {
    const { data, error } = await supabase
      .from('course_media')
      .select(`
        id,
        media_id,
        resource_id,
        resource_type,
        display_order,
        created_at,
        media_file:media_files (
          id,
          title,
          description,
          file_path,
          file_url,
          media_type,
          uploader_id,
          created_at,
          updated_at
        )
      `)
      .eq('resource_id', stepId)
      .eq('resource_type', 'step')
      .order('display_order');

    if (error) throw error;
    if (!data) return null;

    return {
      step_id: stepId,
      media: data as CourseMedia[]
    };
  },

  getMediaUrl(filePath: string): string {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/course-content/${filePath}`;
  },

  getFileExtension(filePath: string): string {
    return filePath.split('.').pop()?.toLowerCase() || '';
  },

  getFileIcon(filePath: string): string {
    const extension = this.getFileExtension(filePath);
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'ppt':
      case 'pptx':
        return 'powerpoint';
      case 'txt':
        return 'text';
      case 'zip':
      case 'rar':
        return 'archive';
      default:
        return 'document';
    }
  },

  getFileSize(url: string): Promise<string> {
    return new Promise((resolve) => {
      fetch(url, { method: 'HEAD' })
        .then(response => {
          const size = response.headers.get('content-length');
          if (size) {
            const fileSizeInKB = parseInt(size) / 1024;
            if (fileSizeInKB < 1024) {
              resolve(`${fileSizeInKB.toFixed(1)} KB`);
            } else {
              const fileSizeInMB = fileSizeInKB / 1024;
              resolve(`${fileSizeInMB.toFixed(1)} MB`);
            }
          } else {
            resolve('Unknown size');
          }
        })
        .catch(() => resolve('Unknown size'));
    });
  }
};