import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { chatType } from "../../../socket-io/event-listeners/messageToServer-listener";
import { db_pool } from "../../../utils/db-connection";
import { clear_private_notification_count } from "../../../utils/queries/notifications-private-chat";

export const clearNotifications = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const target_id = req.body.target_id as string;
    const user_id = req.body.user_id as string;
    const type = req.body.type as string;

    console.log("target_id", target_id);
    console.log("user_id", user_id);
    console.log("type", type);

    if (type === chatType.private) {
      await db_pool.query(clear_private_notification_count(target_id, user_id));
    } else {
    }

    res.status(200).send("OK");
  }
);
