import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { Bad_Request_Error } from "../../../middlewares/error-handler/bad-request-error";
import { db_pool } from "../../../utils/db-connection";
import { Password } from "../../../utils/hash-password";
import { Users_row } from "../../../utils/tables-rows-interfaces";

interface SignUpBody {
  req_email: string;
  req_username: string;
  req_password: string;
}

export const signUp = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { req_email, req_username, req_password }: SignUpBody = req.body;

    // cannot use query with variable like below
    // `select * from users WHERE email=${email}`
    // have to use "placeholder" $1, $2 and etc.
    const find_existing_user = {
      // give the query a unique name
      name: "find_existing_user",
      text: "SELECT email FROM users WHERE email = $1",
      values: [req_email],
    };
    const existingUser = await db_pool.query(find_existing_user);

    if (existingUser.rowCount > 0) {
      return next(
        new Bad_Request_Error(
          "This email address is already used by other user",
          "email"
        )
      );
    }

    const hashedPassword = await Password.toHash(req_password);

    const register_new_user = {
      name: "register_new_user",
      text: `INSERT INTO users(email, username, password) VALUES($1, $2, $3) RETURNING *`,
      values: [req_email, req_username, hashedPassword],
    };
    const newUser = await db_pool.query(register_new_user);

    const { username, email, user_id } = newUser.rows[0] as Users_row;

    req.session.currentUser = {
      username,
      email,
      user_id,
      isLoggedIn: true,
    };

    res.status(201).send({
      currentUser: req.session.currentUser,
    });
  }
);
