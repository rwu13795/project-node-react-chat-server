import { Request, Response, NextFunction } from "express";
import { Not_Authorized_Error } from "./error-handler/not-auth-error";

export const requireUserAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.currentUser || !req.session.currentUser.isLoggedIn) {
    throw new Not_Authorized_Error();
  }
  next();
};
