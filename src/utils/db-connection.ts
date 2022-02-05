import "dotenv/config";
import pg from "pg";

const connectionString = process.env.PG_URI;
const config = {
  // user: "postgres",
  // password: "13795",
  // database: "sql_course",
  connectionString,
};

export const db_pool = new pg.Pool(config);

export async function connectToDatabase() {
  try {
    await db_pool.connect();
    console.log("> > > > >  Connected to Postgres  < < < < <");
  } catch (err) {
    console.log(err);
  }
}
