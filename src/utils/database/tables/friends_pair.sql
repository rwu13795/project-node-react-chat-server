create table friends_pair(
		user_id INTEGER ,
		friend_id INTEGER ,
		paired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        friend_blocked_user BOOLEAN DEFAULT false,
        friend_blocked_user_at TIMESTAMP WITH TIME ZONE,
        user_blocked_friend BOOLEAN DEFAULT false,
        user_blocked_friend_at TIMESTAMP WITH TIME ZONE,
		FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
   		FOREIGN KEY(friend_id) REFERENCES users(user_id) ON DELETE CASCADE,
		PRIMARY KEY(user_id, friend_id) 
	);