import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { Bad_Request_Error } from "../../../middlewares/error-handler/bad-request-error";
import { db_pool } from "../../../utils/db-connection";
import { get_friends_list } from "../../../utils/db-queries";
import { Password } from "../../../utils/hash-password";
import { Users_row } from "../../../utils/tables-rows-interfaces";

interface SignInBody {
  req_email: string;
  req_password: string;
}

export const signIn = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { req_email, req_password }: SignInBody = req.body;

    console.log(req_email, req_password);

    const find_existing_user = {
      // give the query a unique name
      name: "find_existing_user",
      text: "SELECT * FROM users WHERE email = $1",
      values: [req_email],
    };
    const existingUser = await db_pool.query(find_existing_user);

    if (existingUser.rowCount < 1) {
      return next(new Bad_Request_Error("This email does not exist", "email"));
    }
    const { username, email, password, user_id } = existingUser
      .rows[0] as Users_row;

    const checkPassword = await Password.compare(password, req_password);
    if (!checkPassword) {
      return next(new Bad_Request_Error("Password is incorrect", "password"));
    }

    // get the friends list
    const friends = await db_pool.query(get_friends_list(user_id));

    req.session.currentUser = {
      username,
      email,
      user_id,
      isLoggedIn: true,
      targetRoomIdentifier: "",
    };

    res.status(201).send({
      friendsList: friends.rows,
      currentUser: req.session.currentUser,
    });
  }
);
