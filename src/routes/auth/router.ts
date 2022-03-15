import express from "express";
import nodemailer from "nodemailer";
import nodemailerSendgrid from "nodemailer-sendgrid";

import { requestValidator, signUp_body, resetPW_body } from "../../middlewares";
import {
  checkToken,
  forgotPassword_Request,
  forgotPassword_Reset,
  getUserAuthStatus,
  signIn,
  signOut,
  signUp,
} from "./controllers";

export const transporter = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY,
  })
);

const router = express.Router();

router.get("/user-auth-status", getUserAuthStatus);

router.post("/sign-in", signIn);

router.post("/sign-up", signUp_body, requestValidator, signUp);

router.post("/sign-out", signOut);

router.post("/forgot-pw-request", forgotPassword_Request);

router.post("/check-token", checkToken);

router.post("/reset-pw", resetPW_body, requestValidator, forgotPassword_Reset);

export { router as authRouter };
