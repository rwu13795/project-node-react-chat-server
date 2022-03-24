import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares";
import { chatType } from "../../../socket-io/event-listeners";
import { db_pool } from "../../../utils/database/db-connection";
import {
  clear_group_notification_count,
  clear_private_notification_count,
} from "../../../utils/database/queries/__index";

interface Req_body {
  target_id: string;
  user_id: string;
  type: string;
}

export const clearNotifications = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { target_id, user_id, type } = req.body as Req_body;

    if (type === chatType.private) {
      await db_pool.query(clear_private_notification_count(target_id, user_id));
    } else {
      await db_pool.query(clear_group_notification_count(target_id, user_id));
    }

    res.status(200).send("OK");
  }
);
