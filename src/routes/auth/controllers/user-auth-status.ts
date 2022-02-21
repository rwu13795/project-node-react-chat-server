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
    }

    let friendsList: Friend_res[] = [];
    let groupsList: Group_res[] = [];
    let addFriendRequests: AddFriendRequest_res[] = [];
    let groupInvitations: GroupInvitation_res[] = [];
    if (req.session.currentUser.isLoggedIn) {
      const user_id = req.session.currentUser.user_id;
      const [
        friends,
        addFriendRequests_result,
        groups,
        groupInvitations_result,
      ] = await Promise.all([
        db_pool.query(get_friends_list(user_id)),
        db_pool.query(get_add_friend_request(user_id)),
        db_pool.query(get_groups_list(user_id)),
        db_pool.query(get_group_invitations(user_id)),
      ]);
      friendsList = friends.rows;
      addFriendRequests = addFriendRequests_result.rows;
      groupsList = groups.rows;
      groupInvitations = groupInvitations_result.rows;

      console.log(groupInvitations_result.rows);
    }

    let response: GetUserAuth_res = {
      currentUser: req.session.currentUser,
      friendsList,
      addFriendRequests,
      require_initialize,
      groupsList,
      groupInvitations,
    };

    res
      .status(200)
      .header("Access-Control-Allow-Credentials", "true")
      .send(response);
  }
);
