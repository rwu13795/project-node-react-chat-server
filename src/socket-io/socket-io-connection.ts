import http from "http";
import { Server } from "socket.io";

import { setupWorker } from "@socket.io/sticky";
import { createAdapter } from "@socket.io/cluster-adapter";

import currentTargetRoom_listener from "./event-listeners/user/current-target-room-listener";
import addFriendRequest_listener from "./event-listeners/friends/add-friend-request-listener";
import createNewGroup_listener from "./event-listeners/groups/create-new-group-listener";
import joinRoom_listener from "./event-listeners/user/join-room-listener";
import messageToServer_listener from "./event-listeners/user/messageToServer-listener";
import online_listener from "./event-listeners/user/online-listener";
import onlineEcho_listener from "./event-listeners/user/online-echo-listener";
import addFriendResponse_listener from "./event-listeners/friends/add-friend-response-listener";
import groupInvitationReqest_listener from "./event-listeners/groups/group-invitation-request-listener";
import groupInvitationResponse_listener from "./event-listeners/groups/group-invitation-response-listener";
import leaveGroup_listener from "./event-listeners/groups/leave-group-listener";
import kickMember_listener from "./event-listeners/groups/kick-member-listener";
import kickedOutOfGroup_listener from "./event-listeners/groups/kicked-out-of-group-listener";
import offline_listener from "./event-listeners/user/offline-listener";
import blockFriend_listener from "./event-listeners/friends/block-friend-listener";
import onlineStatusChange_listener from "./event-listeners/user/online-status-change-listener";

export interface Socket_currentUser {
  user_id: string;
  username: string;
  currentTargetRoom: string;
  friends_id: string[];
  friends_room_id: string[];
  onlineStatus: string;
}
export enum onlineStatus_enum {
  available = "Available",
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
