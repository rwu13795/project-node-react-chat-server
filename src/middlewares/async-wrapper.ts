import { Request, Response, NextFunction } from "express";

export const asyncWrapper = (callback: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // invoke the controller function that is passed to the wrapper
      await callback(req, res, next);
    } catch (error) {
      console.log(error);
      // any un-catched error int the controller will be passed to the
      // default error handler
      next(error);
    }
  };
};
