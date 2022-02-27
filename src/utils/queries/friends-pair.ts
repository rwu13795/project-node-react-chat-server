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
                  users.avatar_url,
                  friends_pair.user_blocked_friend,
                  friends_pair.user_blocked_friend_at,
                  friends_pair.friend_blocked_user,
                  friends_pair.friend_blocked_user_at
             FROM users 
             INNER JOIN friends_pair
                    ON friends_pair.user_id = $1
                        AND friends_pair.friend_id = users.user_id`,
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

export function block_unblock_friend(
  user_id: string,
  user_id_blocked: string,
  block: boolean
) {
  return {
    text: `UPDATE friends_pair
           SET user_blocked_friend = $3,
           user_blocked_friend_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 and friend_id = $2`,
    values: [user_id, user_id_blocked, block],
  };
}
export function being_blocked_unblocked(
  user_id: string,
  user_id_blocked: string,
  block: boolean
) {
  return {
    text: `UPDATE friends_pair
           SET friend_blocked_user = $3,
               friend_blocked_user_at = CURRENT_TIMESTAMP
           WHERE user_id = $2 and friend_id = $1`,
    values: [user_id, user_id_blocked, block],
  };
}
