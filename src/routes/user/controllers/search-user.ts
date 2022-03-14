import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "../../../middlewares/__index";

import { db_pool } from "../../../utils/db-connection";
import { search_user } from "../../../utils/queries/users";

export const searchUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.body.user_id as string;
    const user_email = req.body.user_email as string;

    const searchUser_result = await db_pool.query(
      search_user(user_id, user_email)
    );

    res.status(200).send(searchUser_result.rows);
  }
);
