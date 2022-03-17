import { Request, Response, NextFunction } from "express";

import { db_pool } from "../../../utils/db-connection";
import {
  AddFriendRequest_res,
  CurrentUser_res,
  Friend_res,
  GroupInvitation_res,
  Group_res,
} from "../../../utils/interfaces/response-interfaces";
import { Users } from "../../../utils/interfaces/tables-columns";
import { asyncWrapper } from "../../../middlewares";
import {
  find_existing_user,
  get_add_friend_request,
  get_friends_list,
  get_groups_list,
  get_group_invitations,
} from "../../../utils/queries/__index";
import { onlineStatus_enum } from "../../../socket-io/socket-io-connection";

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

    if (!req.session.currentUser || !req.session.currentUser.isLoggedIn) {
      req.session.currentUser = {
        username: "guest",
        email: "",
        user_id: "",
        isLoggedIn: false,
        targetRoomIdentifier: "",
        onlineStatus: onlineStatus_enum.offline,
      };

      return res.status(200).send({ currentUser: req.session.currentUser });
    }

    const { user_id, email, onlineStatus } = req.session.currentUser;

    const [
      user,
      friends,
      addFriendRequests_result,
      groups,
      groupInvitations_result,
    ] = await Promise.all([
      db_pool.query(find_existing_user(email)),
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
    const { username, avatar_url } = user.rows[0] as Users;

    req.session.currentUser = {
      username,
      email,
      user_id,
      avatar_url,
      isLoggedIn: true,
      targetRoomIdentifier: "",
      onlineStatus,
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
