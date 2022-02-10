import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { Bad_Request_Error } from "../../../middlewares/error-handler/bad-request-error";
import { db_pool } from "../../../utils/db-connection";
import {
  find_existing_user,
  get_add_friend_request,
  get_friends_list,
} from "../../../utils/db-queries";
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

    const existingUser = await db_pool.query(find_existing_user(req_email));

    if (existingUser.rowCount < 1) {
      return next(new Bad_Request_Error("This email does not exist", "email"));
    }
    const { username, email, password, user_id } = existingUser
      .rows[0] as Users_row;

    const checkPassword = await Password.compare(password, req_password);
    if (!checkPassword) {
      return next(new Bad_Request_Error("Password is incorrect", "password"));
    }

    const [friends, addFriendRequests] = await Promise.all([
      db_pool.query(get_friends_list(user_id)),
      db_pool.query(get_add_friend_request(user_id)),
    ]);

    req.session.currentUser = {
      username,
      email,
      user_id,
      isLoggedIn: true,
      targetRoomIdentifier: "",
    };

    res.status(201).send({
      friendsList: friends.rows,
      addFriendRequests: addFriendRequests.rows,
      currentUser: req.session.currentUser,
    });
  }
);
