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
  const body_1 = `Dear friend, thank you for visiting my web site! My name is Ray Wu, 
  and I am a senior student majoring in computer science in Brooklyn College CUNY.`;
  const body_2 = `If you have any question regarding this project, please don't hesitate to ask. 
  You could leave a message here or send an email to my email address - rwu13795@gmail.com. 
  I truly appreciate your time and consideration.`;

  const [msg_id_result_1, msg_id_result_2] = await Promise.all([
    db_pool.query(insert_new_msg(body_1, msgType.text)),
    db_pool.query(insert_new_msg(body_2, msgType.text)),
    db_pool.query(insert_friends_pair(new_user_id, "1")),
  ]);

  const msg_id_1 = msg_id_result_1.rows[0].msg_id as string;
  const msg_id_2 = msg_id_result_2.rows[0].msg_id as string;
  const [friends_res] = await Promise.all([
    db_pool.query(get_friends_list(new_user_id)),
    db_pool.query(insert_new_msg_users_ref("1", new_user_id, msg_id_1)),
    db_pool.query(insert_new_msg_users_ref("1", new_user_id, msg_id_2)),
    db_pool.query(insert_private_notifications("1", new_user_id)),
  ]);

  return friends_res.rows;
}
