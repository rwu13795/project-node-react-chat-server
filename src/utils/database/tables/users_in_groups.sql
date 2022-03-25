create table users_in_groups(
		group_id INTEGER,
		user_id INTEGER,
		joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		user_left BOOLEAN DEFAULT false,
		user_left_at TIMESTAMP WITH TIME ZONE,
		was_kicked BOOLEAN DEFAULT false,
		group_removed BOOLEAN DEFAULT false,
		FOREIGN KEY(group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
   		FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
		PRIMARY KEY(group_id, user_id) 
	);