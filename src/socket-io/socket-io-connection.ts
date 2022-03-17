import http from "http";
import { Server } from "socket.io";
import { setupWorker } from "@socket.io/sticky";
import { createAdapter } from "@socket.io/cluster-adapter";

import {
  addFriendRequest_listener,
  addFriendResponse_listener,
  blockFriend_listener,
  createNewGroup_listener,
  currentTargetRoom_listener,
  groupInvitationReqest_listener,
  groupInvitationResponse_listener,
  joinRoom_listener,
  kickedOutOfGroup_listener,
  kickMember_listener,
  leaveGroup_listener,
  messageToServer_listener,
  offline_listener,
  onlineEcho_listener,
  onlineStatusChange_listener,
  online_listener,
  changeAvatar_listener,
  log_out_listener,
} from "./event-listeners";

export interface Socket_currentUser {
  user_id: string;
  username: string;
  currentTargetRoom: string;
  friends_id: string[];
  friends_room_id: string[];
  onlineStatus: string;
}
export enum onlineStatus_enum {
  online = "Online",
  away = "Away",
  busy = "Busy",
  offline = "Offline",
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
    joinRoom_listener(socket, id);

    messageToServer_listener(socket, io);

    online_listener(socket);

    currentTargetRoom_listener(socket);

    onlineEcho_listener(socket);

    addFriendRequest_listener(socket, io);
    addFriendResponse_listener(socket);
    blockFriend_listener(socket);
    onlineStatusChange_listener(socket);
    changeAvatar_listener(socket);
    log_out_listener(socket);

    createNewGroup_listener(socket);
    groupInvitationReqest_listener(socket, io);
    groupInvitationResponse_listener(socket, io);
    leaveGroup_listener(socket, io);
    kickMember_listener(socket, io);
    kickedOutOfGroup_listener(socket);

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
