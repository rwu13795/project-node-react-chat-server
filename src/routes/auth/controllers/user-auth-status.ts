import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { db_pool } from "../../../utils/db-connection";
import { get_friends_list } from "../../../utils/db-queries";
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
      const friends = await db_pool.query(
        get_friends_list(req.session.currentUser.user_id)
      );
      friendsList = friends.rows;
    }

    res.status(200).header("Access-Control-Allow-Credentials", "true").send({
      currentUser: req.session.currentUser,
      friendsList,
    });
  }
);
