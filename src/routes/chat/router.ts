import express from "express";

import { requireUserAuth } from "../../middlewares";
import {
  clearNotifications,
  getNotifications,
  chatHitory,
} from "./controllers";

const router = express.Router();

router.get("/chat-history", requireUserAuth, chatHitory);

router.get("/get-notifications", requireUserAuth, getNotifications);

router.post("/clear-notifications", requireUserAuth, clearNotifications);

export { router as chatRouter };
