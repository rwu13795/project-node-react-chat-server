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
