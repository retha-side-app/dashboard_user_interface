export interface UserNote {
  id: string;
  user_id: string;
  step_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteParams {
  step_id: string;
  content: string;
}

export interface UpdateNoteParams {
  content: string;
}