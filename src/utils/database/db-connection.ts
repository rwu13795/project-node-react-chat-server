import "dotenv/config";
import pg from "pg";

import { Database_Connection_Error } from "../../middlewares/error-handler/db-connection-error";

const connectionString = process.env.DATABASE_URL;
const config = {
  connectionString,

  // need to add the property below in order to connect to the postgres DB in Heroku
  /* 
  Note from Heroku
  Alternatively, you can omit the ssl configuration object if you specify the 
  PGSSLMODE config var: heroku config:set PGSSLMODE=no-verify.
  */
  ssl: {
    rejectUnauthorized: false,
  },
};

export const db_pool = new pg.Pool(config);

export async function connectToDatabase() {
  try {
    await db_pool.connect();
    console.log("> > > > >  Connected to Postgres  < < < < <");
  } catch (err) {
    console.log(err);
    throw new Database_Connection_Error();
  }
}
