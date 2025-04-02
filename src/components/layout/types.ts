export interface NavLink {
  path: string;
  label: string;
}

export interface UserData {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  profile_pic_url: string | null;
}