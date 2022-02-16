export interface CurrentUser_res {
  username: string;
  email: string;
  user_id: string;
  avatar_url?: string;
  isLoggedIn?: boolean;
}
export interface Friend_res {
  friend_id: string;
  friend_username: string;
  friend_email: string;
  avatar_url?: string;
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
}
export interface GroupMember_res extends Friend_res {}

export interface MessageObject_res {
  targetChatRoom_type: string;
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
