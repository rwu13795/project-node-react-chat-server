import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares";
import { db_pool } from "../../../utils/database/db-connection";
import { get_members_list } from "../../../utils/database/queries/__index";

export const getMembersList = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const group_id = req.query.group_id as string;

    const members_result = await db_pool.query(get_members_list(group_id));

    console.log("getting member list after entering a room");

    res.status(200).send(members_result.rows);
  }
);
