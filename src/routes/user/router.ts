import express from "express";

import {
  changeGroupName_Body,
  createNewGroup_Body,
  requestValidator,
  requireUserAuth,
} from "../../middlewares";
import {
  changeGroupName,
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

router.post(
  "/change-group-name",
  requireUserAuth,
  changeGroupName_Body,
  requestValidator,
  changeGroupName
);

export { router as userRouter };
