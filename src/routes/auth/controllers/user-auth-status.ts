import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { db_pool } from "../../../utils/db-connection";
import { get_add_friend_request } from "../../../utils/queries/add-friend-request";
import { get_friends_list } from "../../../utils/queries/friends-pair";

import { Friends_row } from "../../../utils/tables-rows-interfaces";

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

    let friendsList: Friends_row[] = [];
    let addFriendRequests: any[] = [];
    if (req.session.currentUser.isLoggedIn) {
      const user_id = req.session.currentUser.user_id;
      const [friends, addFriendRequests_result] = await Promise.all([
        db_pool.query(get_friends_list(user_id)),
        db_pool.query(get_add_friend_request(user_id)),
      ]);
      friendsList = friends.rows;
      addFriendRequests = addFriendRequests_result.rows;
    }

    res.status(200).header("Access-Control-Allow-Credentials", "true").send({
      currentUser: req.session.currentUser,
      friendsList,
      addFriendRequests,
      require_initialize,
    });
  }
);
