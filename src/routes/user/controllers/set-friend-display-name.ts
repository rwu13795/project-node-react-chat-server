import { Request, Response, NextFunction } from "express";

import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import { db_pool } from "../../../utils/database/db-connection";
import { set_friend_display_name } from "../../../utils/database/queries/__index";

interface Request_body {
  friend_id: string;
  friend_display_name: string;
}

interface Response_body extends Request_body {}

export const setFriendDisplayName = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { friend_id, friend_display_name } = req.body as Request_body;
    const user_id = req.session.currentUser?.user_id;

    if (!user_id) {
      return next(new Bad_Request_Error("Not authorized"));
    }

    await db_pool.query(
      set_friend_display_name(user_id, friend_id, friend_display_name)
    );

    const res_body: Response_body = { friend_id, friend_display_name };

    res.status(200).send(res_body);
  }
);
