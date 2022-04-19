import { NextFunction, Request, Response } from "express";

import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import { onlineStatus_enum } from "../../../socket-io/socket-io-connection";
import { db_pool } from "../../../utils/database/db-connection";
import { Password } from "../../../utils/hash-password";
import { Users } from "../../../utils/interfaces/tables-columns";
import {
  find_existing_user_email,
  initialize_socket_id,
  register_new_user,
} from "../../../utils/database/queries/__index";
import {
  CurrentUser_res,
  Friend_res,
} from "../../../utils/interfaces/response-interfaces";

import { addNewUserAsFriend } from "./helpers/add-new-user-as-friend";
import createPrivateFolder_S3 from "../../../utils/aws-s3/create-private-folder";

interface Request_body {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface Response_body_signUp {
  currentUser: CurrentUser_res;
  friendsList: Friend_res[];
}

export const signUp = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password, confirm_password }: Request_body =
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
    // the returning userId is a integer since it is from " returning * ", the user_id
    // is not converted to string when returning
    const new_user_id = newUser.user_id.toString();

    await Promise.all([
      db_pool.query(initialize_socket_id(new_user_id)),
      createPrivateFolder_S3(new_user_id),
    ]);

    // add the new user as my friend (rwu13795@gmail.com) automatically
    const friendsList: Friend_res[] = await addNewUserAsFriend(new_user_id);

    req.session.currentUser = {
      username,
      email,
      user_id: new_user_id,
      isLoggedIn: true,
      targetRoomIdentifier: "",
      onlineStatus: onlineStatus_enum.online,
    };
    let response: Response_body_signUp = {
      friendsList,
      currentUser: req.session.currentUser,
    };

    res.status(201).send(response);
  }
);
