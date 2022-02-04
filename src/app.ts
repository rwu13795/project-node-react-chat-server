// import express from "express";
// import pg from "pg";

// const connectionString = process.env.PG_URI;

// const app = express();

// app.use(express.json());
// // app.set("trust proxy", 1);
// // app.use(
// //   cors({
// //     credentials: true,
// //     origin: ["http://localhost:3000", "https://www.node-next-shop-rw.store"],
// //   })
// // );

// const config = {
//   // user: "postgres",
//   // password: "13795",
//   // database: "sql_course",
//   connectionString,
// };

// const pool = new pg.Pool(config);

// const start = async () => {
//   try {
//     await pool.connect();
//     console.log("> > > > >  Connected to Postgres  < < < < <");
//   } catch (err) {
//     console.log(err);
//   }
// };

// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   console.log(`> > > > >  Listening on port ${port}  < < < < <`);
// });

// start();

// app.get("/", async (req, res) => {
//   let result = await pool.query("SELECT * FROM testing");
//   console.log(result.rows);
//   res.send("<h1>OK</h1>");
// })
