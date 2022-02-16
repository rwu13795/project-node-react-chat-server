import express from "express";
import { requireUserAuth } from "../../middlewares/require-auth";

import { createNewGroup, searchUser } from "./controllers/_index";

const router = express.Router();

router.post("/search-user", requireUserAuth, searchUser);

router.post("/create-new-group", requireUserAuth, createNewGroup);

export { router as userRouter };
