import { NextFunction, Request, Response } from "express";
import { asyncWrapper, Bad_Request_Error } from "../../../middlewares/__index";
import { db_pool } from "../../../utils/db-connection";
import { Password } from "../../../utils/hash-password";
import { check_token } from "../../../utils/queries/reset-pw-token";

export const forgotPassword_Reset = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, user_id, new_password } = req.body;

    const result = await db_pool.query(check_token(user_id, token));

    if (result.rowCount < 1) {
      return next(new Bad_Request_Error("Reset link expired", "expired_link"));
    }

    // const hashedPassword = await Password.toHash(new_password);

    // await db_pool.query(
    //   register_new_user(email, username, hashedPassword)
    // );

    console.log("new_password", new_password);

    res.status(201).send("OK");
  }
);
