import { NextFunction, Request, Response } from "express";

import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import { db_pool } from "../../../utils/database/db-connection";
import { Password } from "../../../utils/hash-password";
import { Users } from "../../../utils/interfaces/tables-columns";
import {
  change_password,
  find_existing_user,
} from "../../../utils/queries/__index";

interface Req_body {
  old_password: string;
  new_password: string;
}

export const changePassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { old_password, new_password } = req.body as Req_body;
    const email = req.session.currentUser?.email;

    if (!email) {
      return next(new Bad_Request_Error("Not authorized"));
    }

    const existingUser = await db_pool.query(find_existing_user(email));

    if (existingUser.rowCount < 1) {
      return next(
        new Bad_Request_Error(
          "The email you provided does not exist in our record",
          "email"
        )
      );
    }
    const { password, user_id } = existingUser.rows[0] as Users;

    const checkPassword = await Password.compare(password, old_password);
    if (!checkPassword) {
      return next(
        new Bad_Request_Error("The old password is incorrect", "old_password")
      );
    }

    const hashedPassword = await Password.toHash(new_password);

    await db_pool.query(change_password(user_id, hashedPassword));

    console.log("pw changed");

    res.status(201).send("OK");
  }
);
