import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares";
import { chatType } from "../../../socket-io/event-listeners";
import { db_pool } from "../../../utils/db-connection";
import {
  get_group_notifications,
  get_private_notifications,
} from "../../../utils/queries/__index";

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
