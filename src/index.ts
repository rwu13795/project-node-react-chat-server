// import os from "os";
import cluster from "cluster";
import http from "http";
import { setupMaster } from "@socket.io/sticky";
import { setupPrimary } from "@socket.io/cluster-adapter";
import "dotenv/config";

import { app } from "./app";
import { connectToDatabase } from "./utils/database/db-connection";
import connectSocketIO from "./socket-io/socket-io-connection";

connectToDatabase();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`> > > > >  Listening on port ${port}  < < < < <`);
});

connectSocketIO(server);
