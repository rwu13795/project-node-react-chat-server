create table notifications_group_chat(
		group_id INTEGER, 
		user_id INTEGER,
		count INTEGER,
        last_added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		user_left BOOLEAN DEFAULT false,
		FOREIGN KEY(group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
   		FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
		PRIMARY KEY(group_id, user_id) 
	);

