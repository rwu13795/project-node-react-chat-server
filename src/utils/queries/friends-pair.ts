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
                  users.email as "friend_email",
                  friends_pair.block_friend,
                  friends_pair.is_blocked
             FROM users 
             INNER JOIN friends_pair
                    ON friends_pair.friend_id = $1
                        AND friends_pair.user_id = users.user_id`,
    values: [user_id],
  };
}

export function insert_friends_pair(id_1: string, id_2: string) {
  return {
    text: `INSERT INTO friends_pair(user_id, friend_id)
           VALUES($1, $2), ($2, $1)`,
    values: [id_1, id_2],
  };
}
