import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { Bad_Request_Error } from "../../../middlewares/error-handler/bad-request-error";
import { db_pool } from "../../../utils/db-connection";

import { Password } from "../../../utils/hash-password";
import { get_add_friend_request } from "../../../utils/queries/add-friend-request";
import { get_friends_list } from "../../../utils/queries/friends-pair";
import { get_groups_list } from "../../../utils/queries/groups";
import { find_existing_user } from "../../../utils/queries/users";
import {
  AddFriendRequest_res,
  CurrentUser_res,
  Friend_res,
  GroupInvitation_res,
  Group_res,
} from "../../../utils/interfaces/response-interfaces";
import { Users } from "../../../utils/interfaces/tables-columns";
import { get_group_invitations } from "../../../utils/queries/group-invitation";

interface SignInBody {
  req_email: string;
  req_password: string;
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
    const { req_email, req_password }: SignInBody = req.body;

    console.log(req_email, req_password);

    const existingUser = await db_pool.query(find_existing_user(req_email));

    if (existingUser.rowCount < 1) {
      return next(new Bad_Request_Error("This email does not exist", "email"));
    }
    const { username, email, password, user_id, avatar_url } = existingUser
      .rows[0] as Users;

    const checkPassword = await Password.compare(password, req_password);
    if (!checkPassword) {
      return next(new Bad_Request_Error("Password is incorrect", "password"));
    }

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
      user_id,
      avatar_url,
      isLoggedIn: true,
      targetRoomIdentifier: "",
    };

    let response: SignIn_res = {
      friendsList: friends_res.rows,
      addFriendRequests: addFriendRequests_res.rows,
      currentUser: req.session.currentUser,
      groupsList: groups_res.rows,
      groupInvitations: groupInvitaions_result.rows,
    };

    res.status(201).send(response);
  }
);
