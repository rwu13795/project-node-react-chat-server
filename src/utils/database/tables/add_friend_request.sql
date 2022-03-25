create table add_friend_request(
		target_id INTEGER, 
		sender_id INTEGER,
		message VARCHAR(255),
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		rejected BOOLEAN DEFAULT false,
		rejected_at TIMESTAMP WITH TIME ZONE,
		FOREIGN KEY(target_id) REFERENCES users(user_id) ON DELETE CASCADE,
   		FOREIGN KEY(sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
		PRIMARY KEY(target_id, sender_id) 
	);