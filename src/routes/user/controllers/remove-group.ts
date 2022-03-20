import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares";
import { db_pool } from "../../../utils/database/db-connection";
import {
  delete_group_member,
  mark_group_as_removed,
} from "../../../utils/queries/__index";

interface Req_body {
  group_id: string;
  user_id: string;
  was_kicked: boolean;
}

export const removeGroup = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { group_id, user_id, was_kicked } = req.body as Req_body;

    if (was_kicked) {
      // if the user was kicked, DO NOT delete this user from users_in_groups,
      // otherwise this user can be invited back by any member.
      // mark the "group_removed" as true for this kicked user, so that this
      // user won't get this group in groupList and remained as "kicked" in the record
      await db_pool.query(mark_group_as_removed(group_id, user_id));
    } else {
      await db_pool.query(delete_group_member(group_id, user_id));
    }

    res.status(201).send("OK");
  }
);
