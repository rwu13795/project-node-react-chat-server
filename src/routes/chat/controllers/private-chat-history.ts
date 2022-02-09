import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { db_pool } from "../../../utils/db-connection";
import { get_private_chat_history } from "../../../utils/db-queries";

export const privateChatHitory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const id_1 = req.query.id_1 as string;
    const id_2 = req.query.id_2 as string;
    const page = parseInt(req.query.page as string) || 1;
    const MSG_PER_PAGE = 10;

    console.log("page", page);

    const offset = (page - 1) * MSG_PER_PAGE;

    const chat_history_result = await db_pool.query(
      get_private_chat_history(id_1, id_2, MSG_PER_PAGE, offset)
    );

    const chatHistory = chat_history_result.rows;

    res.status(200).send(chatHistory);
  }
);
