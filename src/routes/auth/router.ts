import express from "express";
import { getUserAuthStatus, signIn, signUp } from "./controllers/_index";

const router = express.Router();

router.get("/user-auth-status", getUserAuthStatus);

router.post("/sign-in", signIn);

// router.post("/sign-out", signOut);

router.post("/sign-up", signUp);

export { router as authRouter };
