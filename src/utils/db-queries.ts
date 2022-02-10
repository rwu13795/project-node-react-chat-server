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

export function get_private_chat_history(
  id_1: string,
  id_2: string,
  MSG_PER_PAGE: number,
  offset: number
) {
  return {
    // name: "get_private_chat_history",
    text: `SELECT 
                users_private_messages.sender_id,
                users_private_messages.recipient_id,
                private_messages.body,
                private_messages.created_at
           FROM private_messages     
           INNER JOIN users_private_messages
              ON private_messages.msg_id = users_private_messages.msg_id
           WHERE (users_private_messages.sender_id = $1 and users_private_messages.recipient_id = $2)
                  or (users_private_messages.sender_id = $2 and users_private_messages.recipient_id = $1)
           ORDER BY 4 DESC      
           Limit ${MSG_PER_PAGE} OFFSET ${offset}`,
    values: [id_1, id_2],
  };
}

export function insert_new_msg(body: string) {
  return {
    name: "new_msg",
    text: "INSERT INTO private_messages(body) VALUES($1) RETURNING msg_id",
    values: [body],
  };
}

export function insert_new_msg_users_ref(
  sender_id: string,
  recipient_id: string,
  msg_id: string
) {
  return {
    name: "new_msg_users",
    text: `INSERT INTO users_private_messages(sender_id, recipient_id, msg_id)
                VALUES($1, $2, $3)`,
    values: [sender_id, recipient_id, msg_id],
  };
}

export function update_private_notification_count(
  sender_id: string,
  recipient_id: string
) {
  return {
    name: "update_private_notification_count",
    text: `UPDATE notifications_private_chat
           SET count = count + 1
           WHERE sender_id = $1 and user_id = $2`,
    values: [sender_id, recipient_id],
  };
}
export function update_group_notification_count(
  sender_id: string,
  recipient_id: string
) {
  // return {
  //   name: "update_group_notification_count",
  //   text: `UPDATE notifications_private_chat
  //          SET count = count + 1,
  //          WHERE sender_id = $1 and user_id = $2`,
  //   values: [sender_id, recipient_id],
  // };
}

export function clear_private_notification_count(
  target_id: string,
  user_id: string
) {
  return {
    name: "clear_private_notification_count",
    text: `UPDATE notifications_private_chat
           SET count = 0
           WHERE sender_id = $1 and user_id = $2`,
    values: [target_id, user_id],
  };
}
export function clear_group_notification_count(
  sender_id: string,
  recipient_id: string
) {
  // return {
  //   name: "clear_group_notification_count",
  //   text: `UPDATE notifications_private_chat
  //          SET count = count + 1,
  //          WHERE sender_id = $1 and user_id = $2`,
  //   values: [sender_id, recipient_id],
  // };
}

export function get_private_notifications(user_id: string) {
  return {
    name: "get_private_notifications",
    text: `SELECT sender_id, count FROM notifications_private_chat 
           WHERE user_id = $1`,
    values: [user_id],
  };
}
export function get_group_notifications(user_id: string) {
  // return {
  //   name: "get_group_notifications",
  //   text: `SELECT sender_id FROM notifications_private_chat
  //          INNER JOIN friends_pair
  //             ON friends_pair.friend_id = $1
  //                 AND friends_pair.user_id = users.user_id`,
  //   values: [user_id],
  // }
}

export function search_user(user_id: string, user_email: string) {
  let text: string;
  let value: string;
  if (user_id === "") {
    text = "email";
    value = user_email;
  } else {
    text = "user_id";
    value = user_id;
  }
  return {
    text: `SELECT user_id, username FROM users 
           WHERE ${text} = $1`,
    values: [value],
  };
}

export function insert_add_friend_request(
  target_id: string,
  sender_id: string
) {
  return {
    text: `INSERT INTO add_friend_request(target_id , sender_id)
                VALUES($1, $2)`,
    values: [target_id, sender_id],
  };
}
export function get_add_friend_request(user_id: string) {
  return {
    text: `SELECT 
              user_id as "sender_id",
               username as "sender_username", 
               email as "sender_email"
           FROM users
           INNER JOIN add_friend_request
             ON target_id = $1
           WHERE user_id = sender_id;`,
    values: [user_id],
  };
}
export function check_add_friend_request(target_id: string, sender_id: string) {
  return {
    text: `SELECT * FROM add_friend_request
           WHERE target_id = $1 AND sender_id = $2`,
    values: [target_id, sender_id],
  };
}

export function find_existing_user(req_email: string) {
  return {
    text: "SELECT user_id, username, password, email FROM users WHERE email = $1",
    values: [req_email],
  };
}
export function find_existing_user_email(req_email: string) {
  return {
    text: "SELECT email FROM users WHERE email = $1",
    values: [req_email],
  };
}

export function register_new_user(
  req_email: string,
  req_username: string,
  hashedPassword: string
) {
  return {
    name: "register_new_user",
    text: `INSERT INTO users(email, username, password) VALUES($1, $2, $3) RETURNING *`,
    values: [req_email, req_username, hashedPassword],
  };
}
