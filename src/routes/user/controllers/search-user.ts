import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares";
import { db_pool } from "../../../utils/database/db-connection";
import { search_user } from "../../../utils/queries/__index";

interface Req_body {
  user_id: string;
  user_email: string;
}

export const searchUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user_id, user_email } = req.body as Req_body;

    const searchUser_result = await db_pool.query(
      search_user(user_id, user_email)
    );

    res.status(200).send(searchUser_result.rows);
  }
);
