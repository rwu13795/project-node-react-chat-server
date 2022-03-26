import session from "express-session";
import connectPgSimple from "connect-pg-simple";

import { db_pool } from "../utils/database/db-connection";

const pgSession = connectPgSimple(session);

const createSession = session({
  store: new pgSession({
    // Insert connect-pg-simple options here
    pool: db_pool, // Connection pool
    tableName: "user_sessions", // Use another table-name than the default "session" one
    createTableIfMissing: true,
  }),
  // Insert express-session options here
  secret: "my-secret",
  resave: false,
  cookie: { maxAge: 1000 * 60 * 60 }, // 60 mins
  saveUninitialized: false, // NOTE //
  rolling: true, // Force the session identifier cookie to be set on every response
});

export default createSession;

// NOTE //
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
