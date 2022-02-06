import { Request, Response, NextFunction } from "express";
import { CustomError } from "./custom-error";

// if there are 4 arguments in a function, express will treat this
// function as an error handling function automatically

// whenever an error is thrown inside the routes, this errorHandler will be
// tiggered to handle the error
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction // to handle async error handling
) => {
  // an ValidationError array is passed in Request_Validation_Error in signup.ts

  // the instanceof applies to all the CustomError's subclass, so we don't need
  // to check each custom error handler manually
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  // the error which no handler can handle
  return res.status(400).send({
    message: "Something went worng badly",
  });
};
