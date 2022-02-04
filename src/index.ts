import express from "express";
import pg from "pg";
import cors from "cors";
import "dotenv/config";

import os from "os";
import cluster from "cluster";
import http from "http";
import { Server } from "socket.io";

import { setupMaster, setupWorker } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";

import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const pgSession = connectPgSimple(session);

const connectionString = process.env.PG_URI;

const num_processes = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  const httpServer = http.createServer();

  // setup sticky sessions
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  // setup connections between the workers
  setupPrimary();

  httpServer.listen(5000);

  for (let i = 0; i < num_processes; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  //////////////////////////////////////////////////////
  const app = express();

  app.use(express.json());
  // app.set("trust proxy", 1);
  app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:3000"],
    })
  );

  const config = {
    // user: "postgres",
    // password: "13795",
    // database: "sql_course",
    connectionString,
  };

  const pool = new pg.Pool(config);

  //////////// session
  app.use(
    session({
      store: new pgSession({
        pool: pool, // Connection pool
        tableName: "user_sessions", // Use another table-name than the default "session" one
        // Insert connect-pg-simple options here
        createTableIfMissing: true,
      }),
      secret: "my-secret",
      resave: false,
      cookie: { maxAge: 60 * 1000 * 5 }, // 5 mins
      // Insert express-session options here
    })
  );

  app.get("/", async (req, res) => {
    let result = await pool.query("SELECT * FROM testing");
    console.log(`using worker ${cluster.worker?.id}`, result.rows);
    res.send("<h1>OK</h1>");
  });

  const start = async () => {
    try {
      await pool.connect();
      console.log("> > > > >  Connected to Postgres  < < < < <");
    } catch (err) {
      console.log(err);
    }
  };
  start();
  // the worker should listen to the port which is allocted by the Master
  const server = app.listen(0, "localhost");

  ////////////////////////////////////////////////////

  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });

  io.adapter(createAdapter());
  setupWorker(io);

  io.on("connection", function (socket) {
    // console.log(
    //   `client ${socket.id} is connected to worker: ${cluster.worker}`
    // );

    socket.on("joinRoom", (roomName) => {
      console.log(
        `socket ${socket.id} has joined ${roomName}, using worker ${cluster.worker?.id}`
      );
      socket.join(roomName);
    });
    socket.on("messageToServer", async ({ sendTo, msg }) => {
      console.log(`server received msg from socket ${socket.id} ----> ${msg}`);

      ///////// testing database insertion
      try {
        const text = "INSERT INTO testing(name) VALUES($1)";
        const values = [msg];
        await pool.query(text, values);
        console.log("insert into db");
      } catch (err) {
        console.log(err);
      }

      io.to(sendTo).emit(
        "messageToClients",
        `message sent from client socket ${socket.id} using worker ${cluster.worker?.id}, ${msg}`
      );
    });
  });

  process.on("message", function (message, connection: any) {
    if (message !== "sticky-session:connection") {
      return;
    }
    // Emulate a connection event on the server by emitting the
    // event with the connection the master sent us.
    server.emit("connection", connection);

    connection.resume();
  });
}
