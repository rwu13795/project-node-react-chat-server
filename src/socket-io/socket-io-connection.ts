import http from "http";
import { Server, Socket } from "socket.io";

import { setupWorker } from "@socket.io/sticky";
import { createAdapter } from "@socket.io/cluster-adapter";

import joinRoom_listener from "./event-listeners/joinRoom-listener";
import messageToServer_listener from "./event-listeners/messageToServer-listener";
import currentTargetRoom_listener from "./event-listeners/setCurrentUser_listener";

// export interface ExSocket extends Socket {
//   currentTargetRoom: string;
// }
export interface Socket_currentUser {
  currentTargetRoom?: string;
  user_id: string;
  username: string;
}

declare module "socket.io" {
  interface Socket {
    currentUser: Socket_currentUser;
  }
}

export default function connectSocketIO(
  server: http.Server,
  id: number | undefined
) {
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });

  io.adapter(createAdapter());
  setupWorker(io);

  io.on("connection", (socket) => {
    console.log(`client ${socket.id} is connected to worker: ${id}`);
    joinRoom_listener(socket, id);

    messageToServer_listener(socket, io);

    currentTargetRoom_listener(socket);

    //////////////////////////////////
    socket.on("online", function () {
      // the query has current user's name, id, email and friendList
      // emit the "online" message to all the friends to let their
      // client update the online status.
      console.log("online", socket.handshake.query);

      // saving userId to object with socket ID
    });

    socket.on("disconnect", function (data) {
      console.log("offline", socket.handshake.query);
      // emit the "offline" message to all the friends of this socket
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
