import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { Request_Body_Validation_Error } from "../error-handler/request-body-validation-error";

export const requestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new Request_Body_Validation_Error(errors.array());
    // return res.status(400).send({ message: errors.array()[0].msg });
    // errors.array() is a method of the validationResult, to convert the errors into an array
  }

  return next();
};
