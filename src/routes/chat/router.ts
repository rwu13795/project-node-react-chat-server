import express from "express";
import { requireUserAuth } from "../../middlewares/require-auth";

import {
  clearNotifications,
  getNotifications,
  privateChatHitory,
} from "./controllers/_index";

const router = express.Router();

router.get("/private-chat-history", requireUserAuth, privateChatHitory);

router.get("/get-notifications", requireUserAuth, getNotifications);

router.post("/clear-notifications", requireUserAuth, clearNotifications);

export { router as chatRouter };
