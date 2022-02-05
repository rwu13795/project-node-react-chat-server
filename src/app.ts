import express from "express";
// import pg from "pg";
import cors from "cors";
import createSession from "./middlewares/create-session";
import { db_pool } from "./utils/db-connection";

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

app.get("/", async (req, res) => {
  let result = await db_pool.query("SELECT * FROM testing");
  console.log(` to test API "/"`);

  // when the "saveUninitialized" option in express-session is set to false
  // I have to initialize a session manually by editing the session
  // Example, when a guest user has accepted the "cookies-policy-thing", I will
  // change the session and the express-session will "initialize"
  // this session and save it to the DB
  // more NOTE from doc //
  /*
      saveUninitialized
      Forces a session that is "uninitialized" to be saved to the store. 
      A session is uninitialized when it is new but not modified. Choosing false 
      is useful for implementing login sessions, reducing server storage usage, 
      or complying with laws that require permission before setting a cookie. 
      Choosing false will also help with race conditions where a client makes 
      multiple parallel requests without a session.
    */
  req.session.currentUser = "ray";

  res.send("OK");
});

export { app };
