import express from "express";
import { requireUserAuth } from "../../middlewares/require-auth";

import { searchUser } from "./controllers/_index";

const router = express.Router();

router.post("/search-user", requireUserAuth, searchUser);

export { router as userRouter };
