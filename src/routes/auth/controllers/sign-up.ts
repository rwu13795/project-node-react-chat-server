import { NextFunction, Request, Response } from "express";

import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import { db_pool } from "../../../utils/db-connection";
import { Password } from "../../../utils/hash-password";
import { Users } from "../../../utils/interfaces/tables-columns";
import {
  find_existing_user_email,
  register_new_user,
} from "../../../utils/queries";

interface SignUpBody {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

//////////////////////
// need a body check in signUp for max 40 char for email and username
//////////////////////

export const signUp = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password, confirm_password }: SignUpBody =
      req.body;

    if (password !== confirm_password) {
      return next(
        new Bad_Request_Error(
          "This email address is already used by other user",
          "email"
        )
      );
    }

    const existingUser = await db_pool.query(find_existing_user_email(email));

    if (existingUser.rowCount > 0) {
      return next(
        new Bad_Request_Error(
          "This email address is already used by other user",
          "email"
        )
      );
    }

    const hashedPassword = await Password.toHash(password);

    const result = await db_pool.query(
      register_new_user(email, username, hashedPassword)
    );

    const newUser = result.rows[0] as Users;

    req.session.currentUser = {
      username,
      email,
      user_id: newUser.user_id,
      isLoggedIn: true,
      targetRoomIdentifier: "",
    };

    res.status(201).send(req.session.currentUser);
  }
);
