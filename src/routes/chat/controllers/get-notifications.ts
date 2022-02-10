import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { chatType } from "../../../socket-io/event-listeners/messageToServer-listener";
import { db_pool } from "../../../utils/db-connection";
import { get_private_notifications } from "../../../utils/queries/notifications-private-chat";

export const getNotifications = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.query.user_id as string;

    const chat_history_result = await db_pool.query(
      get_private_notifications(user_id)
    );

    // get_group_notifications(user_id: string)

    const notifications = {
      [chatType.private]: chat_history_result.rows,
      [chatType.group]: [],
    };

    res.status(200).send(notifications);
  }
);
