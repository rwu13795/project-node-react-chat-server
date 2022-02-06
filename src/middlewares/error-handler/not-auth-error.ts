import { CustomError } from "./custom-error";

export class Not_Authorized_Error extends CustomError {
  statusCode = 401;

  constructor() {
    super("Not authorized");

    Object.setPrototypeOf(this, Not_Authorized_Error.prototype);
  }

  serializeErrors() {
    return [{ message: "Not authorized" }];
  }
}
