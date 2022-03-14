import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../middlewares/__index";

export const signOut = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // if (req.session.currentUser?.isLoggedIn) {
    req.session.destroy(() => {});

    console.log("Signed out");
    // }

    res.status(201).send({ message: "Signed out" });
  }
);
