import express from "express";
import { requestValidator, signUp_body } from "../../middlewares/__index";

import {
  getUserAuthStatus,
  signIn,
  signOut,
  signUp,
} from "./controllers/__index";

const router = express.Router();

router.get("/user-auth-status", getUserAuthStatus);

router.post("/sign-in", signIn);

router.post("/sign-up", signUp_body, requestValidator, signUp);

router.post("/sign-out", signOut);

// router.post("/sign-out", signOut);

export { router as authRouter };
