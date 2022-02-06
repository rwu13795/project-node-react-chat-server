import { scrypt, randomBytes } from "crypto"; // built-in library of Node
import { promisify } from "util";

// convert the callback implementation of the scrypt into a promise
const scrptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    // get a random string which is a key to decrypt/encrypt the hashed password
    const salt = randomBytes(8).toString("hex");

    const buf = (await scrptAsync(password, salt, 64)) as Buffer;

    // return the hashed password + the salt
    return `${buf.toString("hex")}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    // use the stored salt key to convert the supplied password into a hashed password
    const buf = (await scrptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString("hex") === hashedPassword;
  }
}
