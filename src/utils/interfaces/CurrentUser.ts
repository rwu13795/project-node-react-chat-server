export interface CurrentUser {
  username: string;
  email: string;
  user_id: string;
  isLoggedIn: boolean;
  onlineStatus: string;
  avatar_url?: string;
  loggedInWithGoogle?: boolean;
}
