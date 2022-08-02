import express from "express";

import {
  requestValidator,
  signUp_body,
  resetPW_body,
  changeUsername_Body,
  requireUserAuth,
} from "../../middlewares";
import {
  changeOnlineStatus,
  changePassword,
  changeUsername,
  checkToken,
  forgotPassword_Request,
  forgotPassword_Reset,
  getUserAuthStatus,
  getUserAuthStatus_mobile,
  googleSignIn,
  signIn,
  signOut,
  signUp,
} from "./controllers";

const router = express.Router();

router.get("/user-auth-status", getUserAuthStatus);

router.get("/user-auth-status-mobile", getUserAuthStatus_mobile);

router.post("/sign-in", signIn);

router.post("/google-sign-in", googleSignIn);

router.post("/sign-up", signUp_body, requestValidator, signUp);

router.post("/sign-out", signOut);

router.post("/change-status", requireUserAuth, changeOnlineStatus);

router.post("/forgot-pw-request", forgotPassword_Request);

router.post("/check-token", checkToken);

router.post("/reset-pw", resetPW_body, requestValidator, forgotPassword_Reset);

router.post(
  "/change-username",
  requireUserAuth,
  changeUsername_Body,
  requestValidator,
  changeUsername
);

router.post(
  "/change-pw",
  requireUserAuth,
  resetPW_body,
  requestValidator,
  changePassword
);

export { router as authRouter };
