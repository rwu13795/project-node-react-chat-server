import { NextFunction, Request, Response } from "express";

import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import { db_pool } from "../../../utils/database/db-connection";

import { change_username } from "../../../utils/database/queries/__index";

interface Req_body {
  username: string;
}

export const changeUsername = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body as Req_body;
    const user_id = req.session.currentUser?.user_id;

    if (!user_id) {
      return next(new Bad_Request_Error("Not authorized"));
    }

    await db_pool.query(change_username(user_id, username));

    res.status(201).send({ username });
  }
);
