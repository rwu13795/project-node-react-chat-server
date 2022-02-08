import { Socket } from "socket.io";
import onlineEcho_emitter from "../event-emitters/online-echo-emitter";

export default function onlineEcho_listener(socket: Socket) {
  socket.on("online-echo", (friend_id) => {
    onlineEcho_emitter(socket, friend_id);
  });
}
