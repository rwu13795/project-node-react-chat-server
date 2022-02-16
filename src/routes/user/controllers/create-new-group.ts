import { Request, Response, NextFunction } from "express";

import { asyncWrapper } from "../../../middlewares/async-wrapper";
import { db_pool } from "../../../utils/db-connection";
import { create_new_group } from "../../../utils/queries/groups";
import { insert_new_group_member } from "../../../utils/queries/users-in-groups";

export interface NewGroup {
  group_id: string;
  group_name: string;
  creator_user_id: string;
  user_kicked: boolean;
}

export const createNewGroup = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const group_name = req.body.group_name as string;
    const creator_user_id = req.body.creator_user_id as string;

    // check how many groups this user has created. If more than 20,
    // then throw error to the client

    // create a new group
    const createNewGroup_result = await db_pool.query(
      create_new_group(group_name, creator_user_id)
    );
    const group_id = createNewGroup_result.rows[0].group_id;

    // add the creator as member
    const newMember_result = await db_pool.query(
      insert_new_group_member(group_id, creator_user_id)
    );
    const user_kicked = newMember_result.rows[0].user_kicked;

    let newGroup: NewGroup = {
      group_id,
      group_name,
      creator_user_id,
      user_kicked,
    };

    res.status(201).send(newGroup);
  }
);
