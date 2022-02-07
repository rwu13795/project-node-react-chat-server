import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { db_pool } from "../../../utils/db-connection";
import { Friends_row } from "../../../utils/tables-rows-interfaces";

export const getUserAuthStatus = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
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
    if (req.session.currentUser.isLoggedIn) {
      const get_friends_list = {
        name: "get_friends_list",
        text: `SELECT users.user_id as "friend_id", users.username as "friend_username", users.email as "friend_email" FROM users 
               INNER JOIN friends_pair
                  ON friends_pair.friend_id = $1
                      AND friends_pair.user_id = users.user_id`,
        values: [req.session.currentUser.user_id],
      };
      const friends = await db_pool.query(get_friends_list);
      friendsList = friends.rows;
    }

    res.status(200).header("Access-Control-Allow-Credentials", "true").send({
      currentUser: req.session.currentUser,
      friendsList,
    });
  }
);
