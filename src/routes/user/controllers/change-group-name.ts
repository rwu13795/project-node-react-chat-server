import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares";
import { db_pool } from "../../../utils/database/db-connection";
import { change_group_name } from "../../../utils/database/queries/__index";

interface Request_body {
  new_group_name: string;
  group_id: string;
}

interface Response_body extends Request_body {}

export const changeGroupName = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { new_group_name, group_id } = req.body as Request_body;

    await db_pool.query(change_group_name(group_id, new_group_name));

    const res_body: Response_body = { new_group_name, group_id };

    res.status(200).send(res_body);
  }
);
