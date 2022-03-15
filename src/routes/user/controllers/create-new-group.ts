import { Request, Response, NextFunction } from "express";

import { db_pool } from "../../../utils/db-connection";
import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import {
  create_new_group,
  group_counts_for_each_user,
  insert_group_notifications,
  insert_new_group_member,
  insert_new_group_msg,
} from "../../../utils/queries";

export interface NewGroup {
  group_id: string;
  group_name: string;
  creator_user_id: string;
  was_kicked: boolean;
  user_left_at: string | null;
  user_left: boolean;
}

export const createNewGroup = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const group_name = req.body.group_name as string;
    const creator_user_id = req.body.creator_user_id as string;

    // check how many groups this user has created. If more than 5 (for demo),
    // then throw error to the client
    const groupCounts_result = await db_pool.query(
      group_counts_for_each_user(creator_user_id)
    );
    if (groupCounts_result.rowCount >= 5) {
      return next(
        new Bad_Request_Error(
          "Group limit reached, You cannot create more than 5 groups",
          "group_counts"
        )
      );
    }

    // create a new group
    const createNewGroup_result = await db_pool.query(
      create_new_group(group_name, creator_user_id)
    );
    const group_id = createNewGroup_result.rows[0].group_id;

    // add the creator as member and create a notification_group_chat row
    let msg_body = `${req.session.currentUser?.username} has created the a group "${group_name}"`;
    await Promise.all([
      db_pool.query(insert_new_group_member(group_id, creator_user_id)),
      db_pool.query(insert_group_notifications(group_id, creator_user_id)),
      db_pool.query(
        insert_new_group_msg(group_id, creator_user_id, msg_body, "admin")
      ),
    ]);

    let newGroup: NewGroup = {
      group_id,
      group_name,
      creator_user_id,
      was_kicked: false,
      user_left_at: "",
      user_left: false,
    };

    res.status(201).send(newGroup);
  }
);
