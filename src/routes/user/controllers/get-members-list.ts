import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { db_pool } from "../../../utils/db-connection";
import { get_members_list } from "../../../utils/queries/groups";

export const getMembersList = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const group_id = req.query.group_id as string;

    const members_result = await db_pool.query(get_members_list(group_id));

    console.log(members_result.rows);

    res.status(200).send(members_result.rows);
  }
);
