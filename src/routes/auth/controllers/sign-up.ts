import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { Bad_Request_Error } from "../../../middlewares/error-handler/bad-request-error";
import { db_pool } from "../../../utils/db-connection";
import {
  find_existing_user_email,
  register_new_user,
} from "../../../utils/db-queries";
import { Password } from "../../../utils/hash-password";
import { Users_row } from "../../../utils/tables-rows-interfaces";

interface SignUpBody {
  req_email: string;
  req_username: string;
  req_password: string;
}

//////////////////////
// need a body check in signUp for max 40 char for email and username
//////////////////////

export const signUp = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { req_email, req_username, req_password }: SignUpBody = req.body;

    console.log({ req_email, req_username, req_password });

    const existingUser = await db_pool.query(
      find_existing_user_email(req_email)
    );

    if (existingUser.rowCount > 0) {
      return next(
        new Bad_Request_Error(
          "This email address is already used by other user",
          "email"
        )
      );
    }

    const hashedPassword = await Password.toHash(req_password);

    const newUser = await db_pool.query(
      register_new_user(req_email, req_username, hashedPassword)
    );

    const { username, email, user_id } = newUser.rows[0] as Users_row;

    req.session.currentUser = {
      username,
      email,
      user_id,
      isLoggedIn: true,
      targetRoomIdentifier: "",
    };

    res.status(201).send({
      currentUser: req.session.currentUser,
    });
  }
);
