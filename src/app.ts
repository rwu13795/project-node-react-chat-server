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
import { CurrentUser } from "./utils/interfaces/CurrentUser";
// import { cloudFront_signedCookies } from "./middlewares";

declare module "express-session" {
  interface SessionData {
    currentUser: CurrentUser;
  }
}

const app = express();

app.use(express.json());
// app.set("trust proxy", 1);
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000", // react
      "https://www.reachat.live",
      "http://localhost:19006", // react-native web
      // "http://localhost:19000", // android
    ],
  })
);

app.use(createSession);
// app.use(cloudFront_signedCookies);
app.use(helmet());
app.use(compression());

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/user", userRouter);

app.use(errorHandler);

export { app };
