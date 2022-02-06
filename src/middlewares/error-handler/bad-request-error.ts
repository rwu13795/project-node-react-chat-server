import { CustomError } from "./custom-error";

export class Bad_Request_Error extends CustomError {
  statusCode = 400;

  // the message is passed here when the Bad_Request_Error("message") is thrown
  constructor(public message: string, public field?: string) {
    super(message);

    Object.setPrototypeOf(this, Bad_Request_Error.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, field: this.field }];
  }
}
