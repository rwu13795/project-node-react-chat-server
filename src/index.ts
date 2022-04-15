// import os from "os";
import cluster from "cluster";
import http from "http";
import { setupMaster } from "@socket.io/sticky";
import { setupPrimary } from "@socket.io/cluster-adapter";
import "dotenv/config";

import { app } from "./app";
import { connectToDatabase } from "./utils/database/db-connection";
import connectSocketIO from "./socket-io/socket-io-connection";

// Heroku limit the number of connection to the DB, I have to use a fixed process number
// in dev mode to avoid getting error
// const num_processes = os.cpus().length;
const num_processes = 2;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  const httpServer = http.createServer();

  // setup sticky sessions
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  // setup connections between the workers
  setupPrimary();

  const port = process.env.PORT || 5000;
  httpServer.listen(port);

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

  /* NOTE from NodeJS
  server.listen(0) Normally, this will cause servers to listen on a random port. 
  However, in a cluster, each worker will receive the same "random" port each time 
  they do listen(0). In essence, the port is random the first time, but predictable 
  thereafter. To listen on a unique port, generate a port number based on the cluster
  worker ID.
   */
  const server = app.listen(0, () => {
    console.log("using worker", process.pid);
  });

  connectSocketIO(server);
}
