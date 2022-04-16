import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import "dotenv/config";

import createSession from "./middlewares/create-session";
import { errorHandler } from "./middlewares/error-handler/error-handler";
import { authRouter } from "./routes/auth/router";
import { chatRouter } from "./routes/chat/router";
import { userRouter } from "./routes/user/router";

declare module "express-session" {
  interface SessionData {
    currentUser: {
      username: string;
      email: string;
      user_id: string;
      isLoggedIn: boolean;
      targetRoomIdentifier: string;
      onlineStatus: string;
      avatar_url?: string;
      loggedInWithGoogle?: boolean;
    };
  }
}

const app = express();

app.use(express.json());
// app.set("trust proxy", 1);
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://www.reachat.live"],
    preflightContinue: true,
  })
);

app.use(createSession);
app.use(helmet());
app.use(compression());

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/user", userRouter);

app.use(errorHandler);

export { app };
