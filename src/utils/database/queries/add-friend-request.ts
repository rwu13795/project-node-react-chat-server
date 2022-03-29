export function insert_add_friend_request(
  target_id: string,
  sender_id: string,
  message: string
) {
  return {
    text: `INSERT INTO add_friend_request(target_id , sender_id, message)
           VALUES($1, $2, $3)`,
    values: [target_id, sender_id, message],
  };
}

export function get_add_friend_request(user_id: string) {
  return {
    text: `SELECT 
                user_id::TEXT as "sender_id",
                username as "sender_username", 
                email as "sender_email",
                message
            FROM users
            INNER JOIN add_friend_request
               ON target_id = $1
            WHERE user_id = sender_id AND rejected = $2`,
    values: [user_id, "no"],
  };
}

export function reject_add_friend_request(
  target_id: string,
  sender_id: string
) {
  return {
    text: `UPDATE add_friend_request
           SET rejected = $3,
               rejected_at = CURRENT_TIMESTAMP
           WHERE target_id = $1 and sender_id = $2`,
    values: [target_id, sender_id, "yes"],
  };
}

export function delete_add_friend_request(
  target_id: string,
  sender_id: string
) {
  return {
    text: `DELETE FROM add_friend_request
           WHERE target_id = $1 AND sender_id = $2 
                OR target_id = $2 AND sender_id = $1`,
    values: [target_id, sender_id],
  };
}

export function check_add_friend_request(target_id: string, sender_id: string) {
  return {
    text: `SELECT rejected, rejected_at FROM add_friend_request
           WHERE target_id = $1 and sender_id = $2`,
    values: [target_id, sender_id],
  };
}

export function update_add_friend_request(
  target_id: string,
  sender_id: string,
  message: string
) {
  return {
    text: `UPDATE add_friend_request
           SET rejected = $4,
               message = $3
           WHERE target_id = $1 and sender_id = $2`,
    values: [target_id, sender_id, message, "no"],
  };
}
