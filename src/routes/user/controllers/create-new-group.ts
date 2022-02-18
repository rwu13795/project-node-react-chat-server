import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { Bad_Request_Error } from "../../../middlewares/error-handler/bad-request-error";
import { db_pool } from "../../../utils/db-connection";
import {
  create_new_group,
  group_counts_for_each_user,
} from "../../../utils/queries/groups";
import { insert_group_notifications } from "../../../utils/queries/notifications-group-chat";
import { insert_new_group_member } from "../../../utils/queries/users-in-groups";

export interface NewGroup {
  group_id: string;
  group_name: string;
  creator_user_id: string;
  user_kicked: boolean;
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
    const [newMember_result] = await Promise.all([
      db_pool.query(insert_new_group_member(group_id, creator_user_id)),
      db_pool.query(insert_group_notifications(group_id, creator_user_id)),
    ]);

    const user_kicked = newMember_result.rows[0].user_kicked;

    let newGroup: NewGroup = {
      group_id,
      group_name,
      creator_user_id,
      user_kicked,
    };

    res.status(201).send(newGroup);
  }
);
