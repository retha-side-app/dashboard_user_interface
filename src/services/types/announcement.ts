export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface CourseGroup {
  id: string;
  course_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  created_at: string;
}