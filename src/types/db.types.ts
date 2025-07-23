export interface UserRow {
  id: number;
  google_id: string;
  email: string;
}

export interface RefreshTokenRow {
  id: number;
  user_id: number;
  token: string;
  expires: string;
  rotated_at: string;
}
