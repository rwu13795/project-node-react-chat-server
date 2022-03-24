export function update_group_notification_count(group_id: string) {
  return {
    text: `UPDATE notifications_group_chat
           SET count = count + 1,
               last_added_at = CURRENT_TIMESTAMP
           WHERE group_id = $1`,
    values: [group_id],
  };
}

export function clear_group_notification_count(
  target_id: string,
  user_id: string
) {
  return {
    text: `UPDATE notifications_group_chat
             SET count = 0
             WHERE group_id = $1 and user_id = $2`,
    values: [target_id, user_id],
  };
}

export function get_group_notifications(user_id: string) {
  return {
    text: `SELECT group_id, count, last_added_at FROM notifications_group_chat
           WHERE user_id = $1`,
    values: [user_id],
  };
}

export function insert_group_notifications(group_id: string, user_id: string) {
  return {
    text: `INSERT INTO notifications_group_chat(group_id, user_id, count)
           VALUES($1, $2, 0)`,
    values: [group_id, user_id],
  };
}

export function remove_group_notifications(group_id: string, user_id: string) {
  return {
    text: `DELETE FROM notifications_group_chat
           WHERE group_id = $1 and user_id = $2`,
    values: [group_id, user_id],
  };
}
