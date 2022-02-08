export function get_friends_id(user_id: string) {
  return {
    name: "get_friends_id",
    text: `SELECT users.user_id as "friend_id" FROM users 
           INNER JOIN friends_pair
              ON friends_pair.friend_id = $1
                  AND friends_pair.user_id = users.user_id`,
    values: [user_id],
  };
}

export function get_friends_list(user_id: string) {
  return {
    name: "get_friends_list",
    text: `SELECT 
                users.user_id as "friend_id", 
                users.username as "friend_username", 
                users.email as "friend_email" 
           FROM users 
           INNER JOIN friends_pair
                  ON friends_pair.friend_id = $1
                      AND friends_pair.user_id = users.user_id`,
    values: [user_id],
  };
}

export function insert_new_msg(body: string) {
  return {
    name: "new_msg",
    text: "INSERT INTO private_messages(body) VALUES($1) RETURNING msg_id",
    values: [body],
  };
}

export function new_msg_users_ref(values: string[]) {
  return {
    name: "new_msg_users",
    text: `INSERT INTO users_private_messages(sender_id, recipient_id, msg_id)
                VALUES($1, $2, $3)`,
    values: values,
  };
}
