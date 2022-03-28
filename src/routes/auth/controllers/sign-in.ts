import { NextFunction, Request, Response } from "express";

import { db_pool } from "../../../utils/database/db-connection";
import { Password } from "../../../utils/hash-password";
import {
  AddFriendRequest_res,
  CurrentUser_res,
  Friend_res,
  GroupInvitation_res,
  Group_res,
} from "../../../utils/interfaces/response-interfaces";
import { Users } from "../../../utils/interfaces/tables-columns";
import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import {
  find_existing_user,
  get_add_friend_request,
  get_friends_list,
  get_groups_list,
  get_group_invitations,
} from "../../../utils/database/queries/__index";
import { onlineStatus_enum } from "../../../socket-io/socket-io-connection";

interface SignIn_body {
  req_email: string;
  req_password: string;
  appearOffline: boolean;
}

interface SignIn_res {
  currentUser: CurrentUser_res;
  friendsList: Friend_res[];
  addFriendRequests: AddFriendRequest_res[];
  groupsList: Group_res[];
  groupInvitations: GroupInvitation_res[];
}

export const signIn = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { req_email, req_password, appearOffline }: SignIn_body = req.body;

    const existingUser = await db_pool.query(find_existing_user(req_email));

    if (existingUser.rowCount < 1) {
      return next(
        new Bad_Request_Error(
          "The email you provided does not exist in our record",
          "email"
        )
      );
    }
    const { username, email, password, user_id, avatar_url } = existingUser
      .rows[0] as Users;

    const checkPassword = await Password.compare(password, req_password);
    if (!checkPassword) {
      return next(new Bad_Request_Error("Password is incorrect", "password"));
    }

    console.log("appearOffline", appearOffline);

    const onlineStatus = appearOffline
      ? onlineStatus_enum.offline
      : onlineStatus_enum.online;

    const [
      friends_res,
      addFriendRequests_res,
      groups_res,
      groupInvitaions_result,
    ] = await Promise.all([
      db_pool.query(get_friends_list(user_id)),
      db_pool.query(get_add_friend_request(user_id)),
      db_pool.query(get_groups_list(user_id)),
      db_pool.query(get_group_invitations(user_id)),
    ]);

    req.session.currentUser = {
      username,
      email,
      user_id: user_id.toString(),
      avatar_url,
      isLoggedIn: true,
      targetRoomIdentifier: "",
      onlineStatus,
    };

    let response: SignIn_res = {
      friendsList: friends_res.rows,
      addFriendRequests: addFriendRequests_res.rows,
      currentUser: req.session.currentUser,
      groupsList: groups_res.rows,
      groupInvitations: groupInvitaions_result.rows,
    };

    setTimeout(() => {
      res.status(201).send(response);
    }, 3000);
  }
);
