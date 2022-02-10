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
                user_id as "sender_id",
                username as "sender_username", 
                email as "sender_email",
                message
            FROM users
            INNER JOIN add_friend_request
               ON target_id = $1
            WHERE user_id = sender_id AND was_responded = $2`,
    values: [user_id, "no"],
  };
}
export function check_add_friend_request(target_id: string, sender_id: string) {
  return {
    text: `SELECT target_id FROM add_friend_request
           WHERE target_id = $1 AND sender_id = $2`,
    values: [target_id, sender_id],
  };
}

export function update_add_friend_request(
  target_id: string,
  sender_id: string
) {
  return {
    text: `UPDATE add_friend_request
           SET was_responded = $3
           WHERE target_id = $1 and sender_id = $2`,
    values: [target_id, sender_id, "yes"],
  };
}
