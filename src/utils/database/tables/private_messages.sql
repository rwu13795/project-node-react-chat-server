create table private_messages(
		msg_id SERIAL PRIMARY KEY, 
		msg_body VARCHAR(255), 
		msg_type VARCHAR(10),
		file_name VARCHAR(100),
		file_url VARCHAR(40),
		file_type VARCHAR(10),
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);