create table reset_password_token(
		user_id INTEGER,
		token VARCHAR(80),
		token_expiration TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '5 minutes',
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
		PRIMARY KEY(user_id)
	);
