import express from "express";

import { privateChatHitory } from "./controllers/_index";

const router = express.Router();

router.get("/private-chat-history", privateChatHitory);

export { router as chatRouter };
