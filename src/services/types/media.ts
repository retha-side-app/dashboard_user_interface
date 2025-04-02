export interface MediaFile {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_url: string;
  media_type: 'image' | 'audio' | 'video' | 'document';
  uploader_id: string;
  created_at: string;
  updated_at: string;
}

export interface CourseMedia {
  id: string;
  media_id: string;
  resource_id: string;
  resource_type: string;
  display_order: number;
  created_at: string;
  media_file: MediaFile;
}

export interface StepMedia {
  step_id: string;
  media: CourseMedia[];
}