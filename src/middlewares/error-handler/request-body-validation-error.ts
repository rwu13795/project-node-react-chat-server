import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class Request_Body_Validation_Error extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    // this string will be passed to super class CustomError, then from there it will be passed
    // to the super class of CustomError, the Error class
    super("Invalid request parameters");

    // the code below is needed only because we are extending a built in class
    Object.setPrototypeOf(this, Request_Body_Validation_Error.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return { message: err.msg, field: err.param };
    });
  }
}
