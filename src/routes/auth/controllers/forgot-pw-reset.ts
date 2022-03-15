import { NextFunction, Request, Response } from "express";

import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import { db_pool } from "../../../utils/db-connection";
import { Password } from "../../../utils/hash-password";
import {
  change_password,
  check_token,
  delete_reset_token,
} from "../../../utils/queries";

export const forgotPassword_Reset = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, user_id, new_password } = req.body;

    const result = await db_pool.query(check_token(user_id, token));

    if (result.rowCount < 1) {
      return next(new Bad_Request_Error("Reset link expired", "expired_link"));
    }

    const hashedPassword = await Password.toHash(new_password);

    await Promise.all([
      db_pool.query(change_password(user_id, hashedPassword)),
      db_pool.query(delete_reset_token(user_id)),
    ]);

    res.status(201).send("OK");
  }
);
