import { CustomError } from "./custom-error";

export class Database_Connection_Error extends CustomError {
  statusCode = 500;
  reason = "Unable to connect to the database";

  constructor() {
    super("Unable to connect to the database");

    Object.setPrototypeOf(this, Database_Connection_Error.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
