import { NextFunction, Request, Response } from "express";

import { asyncWrapper } from "../../../middlewares";

interface Request_body {
  status: string;
}

export const changeOnlineStatus = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body as Request_body;

    if (req.session.currentUser) {
      req.session.currentUser.onlineStatus = status;
    }

    console.log(req.session.currentUser?.onlineStatus);

    res.status(201).send("OK");
  }
);
