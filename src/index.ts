import os from "os";
import cluster from "cluster";
import http from "http";
import { setupMaster } from "@socket.io/sticky";
import { setupPrimary } from "@socket.io/cluster-adapter";

import { app } from "./app";
import { connectToDatabase } from "./utils/db-connection";
import connectSocketIO from "./socket-io/socket-io-connection";
import { Server } from "socket.io";

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

  connectToDatabase();

  const server = app.listen(0, "localhost");

  connectSocketIO(server, cluster.worker?.id);
}
