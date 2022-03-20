import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares";
import { chatType } from "../../../socket-io/event-listeners";
import { db_pool } from "../../../utils/database/db-connection";
import { ChatHistory_res } from "../../../utils/interfaces/response-interfaces";
import {
  get_group_chat_history,
  get_limited_group_chat_history,
  get_private_chat_history,
} from "../../../utils/queries/__index";

export const chatHitory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // id_1 is the current user id
    const id_1 = req.query.id_1 as string;
    // id_2 can be user's or group's id
    const id_2 = req.query.id_2 as string;
    // type is the target-room type
    const type = req.query.type as string;
    // date_limit for the group member
    const date_limit = req.query.date_limit as string;

    // console.log("date_limit", date_limit);

    const page = parseInt(req.query.page as string) || 1;

    const MSG_PER_PAGE = 10;
    const offset = (page - 1) * MSG_PER_PAGE;

    let chatHistory: ChatHistory_res[] = [];
    // private chat //
    if (type === chatType.private) {
      const private_chat_history_result = await db_pool.query(
        get_private_chat_history(id_1, id_2, MSG_PER_PAGE, offset)
      );
      chatHistory = private_chat_history_result.rows;
    }
    // group chat //
    else {
      if (date_limit !== "" && date_limit !== undefined) {
        // the user was kicked out of or left the group, only show the old messages
        // of the days when the user was still a member
        const result = await db_pool.query(
          get_limited_group_chat_history(id_2, date_limit, MSG_PER_PAGE, offset)
        );
        chatHistory = result.rows;
      } else {
        const result = await db_pool.query(
          get_group_chat_history(id_2, MSG_PER_PAGE, offset)
        );
        chatHistory = result.rows;
      }
    }

    res.status(200).send(chatHistory);
  }
);
