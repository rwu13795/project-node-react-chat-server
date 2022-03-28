import express from "express";

import {
  createNewGroup_Body,
  requestValidator,
  requireUserAuth,
} from "../../middlewares";
import {
  createNewGroup,
  getMembersList,
  removeGroup,
  searchUser,
} from "./controllers";

const router = express.Router();

router.post("/search-user", requireUserAuth, searchUser);

router.post(
  "/create-new-group",
  requireUserAuth,
  createNewGroup_Body,
  requestValidator,
  createNewGroup
);

router.get("/get-members-list", requireUserAuth, getMembersList);

router.post("/remove-group", requireUserAuth, removeGroup);

export { router as userRouter };
