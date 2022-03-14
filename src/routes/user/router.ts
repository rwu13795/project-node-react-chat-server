import express from "express";
import { requireUserAuth } from "../../middlewares/__index";

import {
  createNewGroup,
  getMembersList,
  removeGroup,
  searchUser,
} from "./controllers/__index";

const router = express.Router();

router.post("/search-user", requireUserAuth, searchUser);

router.post("/create-new-group", requireUserAuth, createNewGroup);

router.get("/get-members-list", requireUserAuth, getMembersList);

router.post("/remove-group", requireUserAuth, removeGroup);

export { router as userRouter };
