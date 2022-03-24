import { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";

// import { transporter } from "../../../utils/SendGrid-transporter";
import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import { db_pool } from "../../../utils/database/db-connection";
import {
  find_existing_user,
  insert_reset_token,
} from "../../../utils/database/queries/__index";

interface Req_body {
  email: string;
}

export const forgotPassword_Request = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body as Req_body;

    const result = await db_pool.query(find_existing_user(email));
    if (result.rowCount < 1) {
      return next(
        new Bad_Request_Error(
          "The email you provided does not exist in our record",
          "email"
        )
      );
    }

    const existingUser = result.rows[0];
    const token = randomBytes(32).toString("hex");

    // store the token into DB
    await db_pool.query(insert_reset_token(existingUser.user_id, token));

    // transporter.sendMail({
    //   from: "rwu13795.work@gmail.com",
    //   to: existingUser.email,
    //   subject: "Reachat - Link to reset your password",
    //   html: `<p>You requested a password reset</P>
    //     <p>
    //         Click this
    //         <a href="${process.env.CLIENT_HOST_URL}/auth/reset-password?token=${token}&user_id=${existingUser.user_id}">
    //             <strong>link</strong>
    //         </a>
    //         to set a new password
    //     </P>
    //     <p>This link will expire in 5 minutes</P>`,
    // });

    console.log(token);

    res.status(201).send("OK");
  }
);
