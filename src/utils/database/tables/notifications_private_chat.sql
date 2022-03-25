create table notifications_private_chat(
		user_id INTEGER, 
		sender_id INTEGER,
		count INTEGER,
        last_added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
   		FOREIGN KEY(sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
		PRIMARY KEY(user_id, sender_id) 
	);