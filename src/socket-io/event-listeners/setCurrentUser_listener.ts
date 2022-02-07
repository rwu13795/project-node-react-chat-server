import { Socket } from "socket.io";

import { Socket_currentUser } from "../socket-io-connection";

// when the user has signed in, the client will emit the current user
// info back to server, so that user's info can be access in the socket
export default function currentTargetRoom_listener(socket: Socket) {
  socket.on("setCurrentUser", (currentUser: Socket_currentUser) => {
    socket.currentUser = currentUser;
  });
}
