// import { NextFunction, Request, Response } from "express";
// import { asyncWrapper, Bad_Request_Error } from "../../../middlewares/__index";

// export const forgotPassword_Reset = asyncWrapper(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { token, userId, new_password } = req.body;

//     const userWithValidToken: UserDoc = await User.findOne({
//       userId,
//       resetToken: token,
//       isValidToken: true,
//       resetTokenExpiration: { $gt: Date.now() },
//       // the Mongoose will convert the DB timestamp to the local Node server time for comparison
//     });

//     if (!userWithValidToken) {
//       return next(new Bad_Request_Error("Reset link expired", "expired-link"));
//     }

//     userWithValidToken.password = new_password;
//     // set "isValidToken" to false after user resetting the PW, so that user will not be
//     // able to use the same token which is not yet expired again
//     userWithValidToken.isValidToken = false;
//     await userWithValidToken.save();

//     res.status(201).send();
//   }
// );
