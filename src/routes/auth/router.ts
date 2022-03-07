import express from "express";
import { getUserAuthStatus, signIn, signUp } from "./controllers/__index";

const router = express.Router();

router.get("/user-auth-status", getUserAuthStatus);

router.post("/sign-in", signIn);

router.post("/sign-up", signUp);

// router.post("/sign-out", signOut);

export { router as authRouter };
