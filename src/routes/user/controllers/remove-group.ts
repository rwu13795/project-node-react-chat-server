import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares";
import { db_pool } from "../../../utils/db-connection";
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
      await db_pool.query(mark_group_as_removed(group_id, user_id));
    } else {
      await db_pool.query(delete_group_member(group_id, user_id));
    }

    res.status(201).send("OK");
  }
);
