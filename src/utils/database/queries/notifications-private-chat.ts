export function update_private_notification_count(
  sender_id: string,
  recipient_id: string
) {
  // both sender and recipient should update the last_added_at time
  // so that each user will be on top position in each other's list
  return {
    name: "update_private_notification_count",
    text: `UPDATE notifications_private_chat
             SET count = count + 1,
                  last_added_at = CURRENT_TIMESTAMP
             WHERE sender_id = $1 and user_id = $2
                OR sender_id = $2 and user_id = $1`,
    values: [sender_id, recipient_id],
  };
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

export function get_private_notifications(user_id: string) {
  return {
    name: "get_private_notifications",
    text: `SELECT sender_id, count, last_added_at FROM notifications_private_chat 
             WHERE user_id = $1`,
    values: [user_id],
  };
}

export function insert_private_notifications(
  recipient_id: string,
  sender_id: string
) {
  return {
    text: `INSERT INTO notifications_private_chat(user_id, sender_id, count)
           VALUES($1, $2, 1), ($2, $1, 1)`,
    values: [recipient_id, sender_id],
  };
}
