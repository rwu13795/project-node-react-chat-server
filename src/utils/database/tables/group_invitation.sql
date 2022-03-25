create table group_invitation(
		group_id INTEGER, 
		invitee_id INTEGER,
		inviter_id INTEGER,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		was_responded BOOLEAN DEFAULT false,
		FOREIGN KEY(group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
   		FOREIGN KEY(invitee_id) REFERENCES users(user_id) ON DELETE CASCADE,
		FOREIGN KEY(inviter_id) REFERENCES users(user_id) ON DELETE CASCADE,
		PRIMARY KEY(group_id, invitee_id)
	);