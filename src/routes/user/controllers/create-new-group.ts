import { Request, Response, NextFunction } from "express";

import { db_pool } from "../../../utils/database/db-connection";
import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import {
  create_new_group,
  group_counts_for_each_user,
  insert_group_notifications,
  insert_new_group_member,
  insert_new_group_msg,
} from "../../../utils/database/queries/__index";
import { inputNames } from "../../../utils/enums/input-names";

interface Req_body {
  group_name: string;
  admin_user_id: string;
}

export interface NewGroup {
  group_id: string;
  group_name: string;
  admin_user_id: string;
  was_kicked: boolean;
  user_left_at: string | null;
  user_left: boolean;
}

export const createNewGroup = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { group_name, admin_user_id } = req.body as Req_body;

    // check how many groups this user has created. If more than 5 (for demo),
    // then throw error to the client
    const groupCounts_result = await db_pool.query(
      group_counts_for_each_user(admin_user_id)
    );
    if (groupCounts_result.rowCount >= 5) {
      console.log("create-new-group -------> limit reached !!!");

      return next(
        new Bad_Request_Error(
          "Groups limit reached, you cannot create more than 5 groups",
          inputNames.groups_limit
        )
      );
    }

    // create a new group
    const createNewGroup_result = await db_pool.query(
      create_new_group(group_name, admin_user_id)
    );
    const group_id = createNewGroup_result.rows[0].group_id;

    // add the creator as member and create a notification_group_chat row
    let msg_body = `${req.session.currentUser?.username} has created the a group "${group_name}"`;
    await Promise.all([
      db_pool.query(insert_new_group_member(group_id, admin_user_id)),
      db_pool.query(insert_group_notifications(group_id, admin_user_id)),
      db_pool.query(
        insert_new_group_msg(group_id, admin_user_id, msg_body, "admin")
      ),
    ]);

    let newGroup: NewGroup = {
      group_id,
      group_name,
      admin_user_id,
      was_kicked: false,
      user_left_at: "",
      user_left: false,
    };

    res.status(201).send(newGroup);
  }
);
