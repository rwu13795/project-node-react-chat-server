import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares";
import { chatType } from "../../../socket-io/event-listeners";
import { db_pool } from "../../../utils/db-connection";
import {
  clear_group_notification_count,
  clear_private_notification_count,
} from "../../../utils/queries/__index";

export const clearNotifications = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const target_id = req.body.target_id as string;
    const user_id = req.body.user_id as string;
    const type = req.body.type as string;

    if (type === chatType.private) {
      await db_pool.query(clear_private_notification_count(target_id, user_id));
    } else {
      await db_pool.query(clear_group_notification_count(target_id, user_id));
    }

    res.status(200).send("OK");
  }
);
