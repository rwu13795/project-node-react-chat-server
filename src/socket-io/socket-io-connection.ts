import http from "http";
import { Server, Socket } from "socket.io";

import { setupWorker } from "@socket.io/sticky";
import { createAdapter } from "@socket.io/cluster-adapter";

import joinRoom_listener from "./event-listeners/joinRoom-listener";
import messageToServer_listener from "./event-listeners/messageToServer-listener";
import online_listener from "./event-listeners/online-listener";
import onlineEcho_listener from "./event-listeners/online-echo-listener";
import offline_listener from "./event-listeners/offline-listener";

export interface FriendsOnlineStatus {
  friends_id: string[];
  rooms_id: string[];
  status: { [friend_id: string]: boolean };
}
export interface Socket_currentUser {
  username: string;
  user_id: string;
  friendsOnlineStatus: FriendsOnlineStatus;
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

    online_listener(socket);
    //////////////////////////////////
    onlineEcho_listener(socket);

    offline_listener(socket);
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