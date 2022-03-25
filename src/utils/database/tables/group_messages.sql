create table group_messages(
		msg_id SERIAL PRIMARY KEY, 
		group_id INTEGER,
		user_id INTEGER,
		msg_body VARCHAR(255), 
		msg_type VARCHAR(10),
		file_name VARCHAR(100),
		file_url VARCHAR(40),
		file_type VARCHAR(10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
   		FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
	);


