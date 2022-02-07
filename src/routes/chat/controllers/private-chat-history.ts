import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { db_pool } from "../../../utils/db-connection";

export const privateChatHitory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const id_1 = req.query.id_1 as string;
    const id_2 = req.query.id_2 as string;

    const private_chat_history_query = {
      name: "private_chat_history_query",
      text: `SELECT 
                    users_private_messages.sender_id,
                    users_private_messages.recipient_id,
                    private_messages.body,
                    private_messages.created_at
               FROM private_messages     
               INNER JOIN users_private_messages
                  ON private_messages.msg_id = users_private_messages.msg_id
               WHERE (users_private_messages.sender_id = $1 and users_private_messages.recipient_id = $2)
                      or (users_private_messages.sender_id = $2 and users_private_messages.recipient_id = $1)`,
      values: [id_1, id_2],
    };
    const chat_history_result = await db_pool.query(private_chat_history_query);

    const chatHistory = chat_history_result.rows;

    res.status(200).send(chatHistory);
  }
);
