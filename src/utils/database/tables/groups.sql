create table groups(
		group_id SERIAL PRIMARY KEY,
		group_name VARCHAR(40),
		admin_user_id INTEGER,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		disbanded_at TIMESTAMP WITH TIME ZONE,
        FOREIGN KEY(admin_user_id) REFERENCES users(user_id)
	);