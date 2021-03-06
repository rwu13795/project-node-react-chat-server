import { NextFunction, Request, Response } from "express";

import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import { db_pool } from "../../../utils/database/db-connection";
import { check_token } from "../../../utils/database/queries/__index";

interface Request_body {
  token: string;
  user_id: string;
}

export const checkToken = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, user_id } = req.body as Request_body;

    const result = await db_pool.query(check_token(user_id, token));

    if (result.rowCount < 1) {
      return next(new Bad_Request_Error("Reset link expired"));
    }

    const validToken = result.rows[0];
    const expirationInMS =
      new Date(validToken.token_expiration).getTime() - Date.now();

    res.status(200).send({
      isValid: true,
      expirationInMS,
    });
  }
);
