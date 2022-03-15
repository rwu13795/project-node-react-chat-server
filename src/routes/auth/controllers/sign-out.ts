import { NextFunction, Request, Response } from "express";

import { asyncWrapper } from "../../../middlewares";

export const signOut = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy(() => {});

    res.status(201).send({ message: "Signed out" });
  }
);
