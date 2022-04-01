import { NextFunction, Request, Response } from "express";

import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import { onlineStatus_enum } from "../../../socket-io/socket-io-connection";
import { db_pool } from "../../../utils/database/db-connection";
import { Password } from "../../../utils/hash-password";
import { Users } from "../../../utils/interfaces/tables-columns";
import {
  find_existing_user_email,
  get_friends_list,
  insert_friends_pair,
  insert_new_msg,
  insert_new_msg_users_ref,
  insert_private_notifications,
  register_new_user,
} from "../../../utils/database/queries/__index";
import {
  CurrentUser_res,
  Friend_res,
} from "../../../utils/interfaces/response-interfaces";
import { msgType } from "../../../utils/enums/message-type";
import { addNewUserAsFriend } from "./helpers/add-new-user-as-friend";

interface SignUp_body {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface SignUp_res {
  currentUser: CurrentUser_res;
  friendsList: Friend_res[];
}

export const signUp = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password, confirm_password }: SignUp_body =
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
          "This email address has already been used by another user",
          "email"
        )
      );
    }

    const hashedPassword = await Password.toHash(password);

    const result = await db_pool.query(
      register_new_user(email, username, hashedPassword)
    );

    const newUser = result.rows[0] as Users;

    // add the new user as my friend (rwu13795@gmail.com) automatically
    const friendsList: Friend_res[] = await addNewUserAsFriend(newUser.user_id);

    req.session.currentUser = {
      username,
      email,
      user_id: newUser.user_id,
      isLoggedIn: true,
      targetRoomIdentifier: "",
      onlineStatus: onlineStatus_enum.online,
    };
    let response: SignUp_res = {
      friendsList,
      currentUser: req.session.currentUser,
    };

    // req.session.currentUser = {
    //   username,
    //   email,
    //   user_id: newUser.user_id,
    //   isLoggedIn: true,
    //   targetRoomIdentifier: "",

    // };

    res.status(201).send(response);
  }
);
