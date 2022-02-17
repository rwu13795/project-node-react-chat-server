import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { chatType } from "../../../socket-io/event-listeners/messageToServer-listener";
import { db_pool } from "../../../utils/db-connection";
import { get_group_notifications } from "../../../utils/queries/notifications-group-chat";
import { get_private_notifications } from "../../../utils/queries/notifications-private-chat";

export const getNotifications = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.query.user_id as string;

    const [private_notifications, group_notifications] = await Promise.all([
      db_pool.query(get_private_notifications(user_id)),
      db_pool.query(get_group_notifications(user_id)),
    ]);

    const notifications = {
      [chatType.private]: private_notifications.rows,
      [chatType.group]: group_notifications.rows,
    };

    res.status(200).send(notifications);
  }
);
