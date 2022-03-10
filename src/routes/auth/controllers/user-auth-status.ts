import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { db_pool } from "../../../utils/db-connection";
import { get_add_friend_request } from "../../../utils/queries/add-friend-request";
import { get_friends_list } from "../../../utils/queries/friends-pair";
import { get_groups_list } from "../../../utils/queries/groups";

import {
  AddFriendRequest_res,
  CurrentUser_res,
  Friend_res,
  GroupInvitation_res,
  Group_res,
} from "../../../utils/interfaces/response-interfaces";
import { get_group_invitations } from "../../../utils/queries/group-invitation";
import { find_existing_user } from "../../../utils/queries/users";
import { Users } from "../../../utils/interfaces/tables-columns";

interface GetUserAuth_res {
  currentUser: CurrentUser_res;
  friendsList: Friend_res[];
  addFriendRequests: AddFriendRequest_res[];
  groupsList: Group_res[];
  require_initialize: boolean;
  groupInvitations: GroupInvitation_res[];
}

export const getUserAuthStatus = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const initialize = req.query.initialize as string;

    let require_initialize = initialize === "yes" ? true : false;

    if (!req.session.currentUser) {
      req.session.currentUser = {
        username: "guest",
        email: "",
        user_id: "",
        isLoggedIn: false,
        targetRoomIdentifier: "",
      };

      return res
        .status(200)
        .header("Access-Control-Allow-Credentials", "true")
        .send({ currentUser: req.session.currentUser });
    }

    const user_id = req.session.currentUser.user_id;
    const [
      user,
      friends,
      addFriendRequests_result,
      groups,
      groupInvitations_result,
    ] = await Promise.all([
      db_pool.query(find_existing_user(req.session.currentUser.email)),
      db_pool.query(get_friends_list(user_id)),
      db_pool.query(get_add_friend_request(user_id)),
      db_pool.query(get_groups_list(user_id)),
      db_pool.query(get_group_invitations(user_id)),
    ]);
    let friendsList: Friend_res[] = friends.rows;
    let addFriendRequests: AddFriendRequest_res[] =
      addFriendRequests_result.rows;
    let groupsList: Group_res[] = groups.rows;
    let groupInvitations: GroupInvitation_res[] = groupInvitations_result.rows;

    // the user might have change username or avatar before a session has expired, update
    // the user info with the latest values
    const { username, email, avatar_url } = user.rows[0] as Users;
    req.session.currentUser = {
      username,
      email,
      user_id,
      avatar_url,
      isLoggedIn: true,
      targetRoomIdentifier: "",
    };

    let response: GetUserAuth_res = {
      currentUser: req.session.currentUser,
      friendsList,
      addFriendRequests,
      require_initialize,
      groupsList,
      groupInvitations,
    };

    return res.status(200).send(response);
  }
);
