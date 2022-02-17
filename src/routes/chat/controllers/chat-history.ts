import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { chatType } from "../../../socket-io/event-listeners/messageToServer-listener";
import { db_pool } from "../../../utils/db-connection";
import { ChatHistory_res } from "../../../utils/interfaces/response-interfaces";
import { get_group_chat_history } from "../../../utils/queries/group-messages";
import { get_private_chat_history } from "../../../utils/queries/private-messages";

export const chatHitory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // id_1 is the current user id
    const id_1 = req.query.id_1 as string;
    // id_2 can be user's, group's or public-channel's id
    const id_2 = req.query.id_2 as string;
    // type is the target-room type
    const type = req.query.type as string;

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
    else if (type === chatType.group) {
      const group_chat_history_result = await db_pool.query(
        get_group_chat_history(id_2, MSG_PER_PAGE, offset)
      );
      chatHistory = group_chat_history_result.rows;
    }
    // public chat //
    else {
    }

    res.status(200).send(chatHistory);
  }
);
