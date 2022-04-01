import { db_pool } from "../../../../utils/database/db-connection";
import {
  get_friends_list,
  insert_friends_pair,
  insert_new_msg,
  insert_new_msg_users_ref,
  insert_private_notifications,
} from "../../../../utils/database/queries/__index";
import { msgType } from "../../../../utils/enums/message-type";

export async function addNewUserAsFriend(new_user_id: string) {
  const body = `thank you for visiting my web site!`;

  const [msg_id_result] = await Promise.all([
    db_pool.query(insert_new_msg(body, msgType.text)),
    db_pool.query(insert_friends_pair(new_user_id, "1")),
  ]);

  const msg_id = msg_id_result.rows[0].msg_id as string;
  const [friends_res] = await Promise.all([
    db_pool.query(get_friends_list(new_user_id)),
    db_pool.query(insert_new_msg_users_ref("1", new_user_id, msg_id)),
    db_pool.query(insert_private_notifications("1", new_user_id)),
  ]);

  return friends_res.rows;
}
