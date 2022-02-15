import http from "http";
import { Server } from "socket.io";

import { setupWorker } from "@socket.io/sticky";
import { createAdapter } from "@socket.io/cluster-adapter";

import joinPrivateRoom_listener from "./event-listeners/joinPrivateRoom-listener";
import messageToServer_listener from "./event-listeners/messageToServer-listener";
import online_listener from "./event-listeners/online-listener";
import onlineEcho_listener from "./event-listeners/online-echo-listener";
import offline_listener from "./event-listeners/offline-listener";
import currentTargetRoom_listener from "./event-listeners/current-target-room-listener";
import addFriendRequest_listener from "./event-listeners/add-friend-request-listener";
import addFriendResponse_listener from "./event-listeners/add-friend-response-listener";
import uploadImageTo_S3 from "../utils/aws-s3/upload-image";

export interface Socket_currentUser {
  user_id: string;
  currentTargetRoom: string;
  friends_id: string[];
  rooms_id: string[];
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
    // the max buffer size that can be transmitted in a single message
    // 5e6 = 5MB  if the size is above the maximun, the socket will be disconnected
    // if the client is trying to send such file
    maxHttpBufferSize: 5e6,
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });

  io.adapter(createAdapter());
  setupWorker(io);

  io.on("connection", (socket) => {
    console.log(`client ${socket.id} is connected to worker: ${id}`);
    joinPrivateRoom_listener(socket, id);

    messageToServer_listener(socket, io);

    online_listener(socket);

    currentTargetRoom_listener(socket);

    onlineEcho_listener(socket);

    addFriendRequest_listener(socket, io);
    addFriendResponse_listener(socket);

    offline_listener(socket);

    //////////////////////////
    socket.on("imageToServer", ({ body, messageType, fileName }) => {
      console.log("messageType", messageType);

      socket.emit("imageToClient");
      // uploadImageTo_S3(fileName, body);
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
