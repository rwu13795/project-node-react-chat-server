export interface CurrentUser_res {
  username: string;
  email: string;
  user_id: string;
  avatar_url?: string;
  isLoggedIn?: boolean;
  onlineStatus: string;
}
export interface Friend_res {
  friend_id: string;
  friend_username: string;
  friend_email: string;
  avatar_url?: string;
  user_blocked_friend: boolean;
  user_blocked_friend_at: string;
  friend_blocked_user: boolean;
  friend_blocked_user_at: string;
  friend_display_name?: string;
}
export interface AddFriendRequest_res {
  sender_id: string;
  sender_username: string;
  sender_email: string;
  message: string;
}

export interface Group_res {
  group_id: string;
  group_name: string;
  creator_user_id: string;
  user_kicked: boolean;
  user_kicked_at: string;
}
export interface GroupMember_res extends Friend_res {}

export interface MessageObject_res {
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  msg_body: string;
  msg_type: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
}

export interface ChatHistory_res {
  msg_body: string;
  msg_type: string;
  created_at: string;
  recipient_id: string;
  sender_id: string;
  file_type: string;
  file_name: string;
  file_url: string;
}

interface PrivateNotifications {
  sender_id: string;
  count: number;
}
interface GroupNotifications {
  sender_id: string;
  count: number;
}
export interface GetNotifications_res {
  private: PrivateNotifications[];
  group: GroupNotifications[];
}

export interface GroupInvitation_res {
  group_id: string;
  group_name: string;
  inviter_name: string;
}
