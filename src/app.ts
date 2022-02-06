import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import createSession from "./middlewares/create-session";
import { authRouter } from "./routes/auth/router";
import { errorHandler } from "./middlewares/error-handler/error-handler";

declare module "express-session" {
  interface SessionData {
    currentUser: {
      username: string;
      email: string;
      user_id: string;
      isLoggedIn: boolean;
    };
  }
}

const app = express();

app.use(express.json());
// app.set("trust proxy", 1);
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
  })
);

app.use(createSession);
app.use(helmet());
app.use(compression());

app.use("/api/auth", authRouter);

app.use(errorHandler);

export { app };
