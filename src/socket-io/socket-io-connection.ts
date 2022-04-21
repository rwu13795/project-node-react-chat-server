import http from "http";
import { Server } from "socket.io";

import {
  addFriendRequest_listener,
  addFriendResponse_listener,
  blockFriend_listener,
  createNewGroup_listener,
  changeTargetRoom_listener,
  groupInvitationReqest_listener,
  groupInvitationResponse_listener,
  joinRoom_listener,
  kickedOutOfGroup_listener,
  kickMember_listener,
  leaveGroup_listener,
  messageToServer_listener,
  offline_listener,
  onlineEcho_listener,
  changeOnlineStatus_listener,
  online_listener,
  changeAvatar_listener,
  log_out_listener,
  changeUsername_listener,
} from "./event-listeners";
import { disconnectSameUser_emitter } from "./event-emitters";

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

export default function connectSocketIO(server: http.Server) {
  const io = new Server(server, {
    // the max buffer size that can be transmitted in a single message
    // (5e6 = 6MB)  if the size is above the maximun, the socket will be disconnected
    // if the client is trying to send such file
    maxHttpBufferSize: 6e6,
    cors: {
      origin: ["http://localhost:3000", "https://www.reachat.live"],
      methods: ["GET", "POST"],
    },
    // I tried to use the option below to fix the cors error, but to no avail.
    // but it can override the cors and allow the socket to be connected in normal circumstance
    // keep it for future reference
    allowRequest: (req, cb) => {
      let isAllowed: boolean = false;
      if (
        req.headers.origin === "https://www.reachat.live" ||
        req.headers.origin === "http://localhost:3000"
      ) {
        isAllowed = true;
      }
      cb(null, isAllowed);
    },
  });

  io.on("connection", async (socket) => {
    disconnectSameUser_emitter(io, socket);

    joinRoom_listener(socket);

    messageToServer_listener(socket, io);

    online_listener(socket);

    changeTargetRoom_listener(socket);

    onlineEcho_listener(socket);

    addFriendRequest_listener(socket, io);
    addFriendResponse_listener(socket, io);
    blockFriend_listener(socket);
    changeOnlineStatus_listener(socket);
    changeAvatar_listener(socket);
    log_out_listener(socket);
    changeUsername_listener(socket);

    createNewGroup_listener(socket);
    groupInvitationReqest_listener(socket, io);
    groupInvitationResponse_listener(socket, io);
    leaveGroup_listener(socket, io);
    kickMember_listener(socket, io);
    kickedOutOfGroup_listener(socket);

    offline_listener(socket);
  });
}
