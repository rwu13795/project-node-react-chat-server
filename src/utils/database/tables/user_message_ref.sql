create table user_private_messages_ref(
		sender_id INTEGER,
		recipient_id INTEGER,
		msg_id INTEGER,
		FOREIGN KEY(sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
   		FOREIGN KEY(recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
		FOREIGN KEY(msg_id) REFERENCES private_messages(msg_id) ON DELETE CASCADE,
		PRIMARY KEY(sender_id, recipient_id, msg_id) 
	);