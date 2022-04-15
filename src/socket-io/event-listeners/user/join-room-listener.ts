import { Socket } from "socket.io";

import { chatType } from "..";

interface Data {
  user_id: string;
  group_ids: string[];
}

export function joinRoom_listener(socket: Socket) {
  socket.on("join-room", ({ user_id, group_ids }: Data) => {
    // the current user will join his/her private room after signing in
    // all private messages to this user will be sent to this private room directly.
    socket.join(`${chatType.private}_${user_id}`);

    const group_rooms = group_ids.map((id) => `${chatType.group}_${id}`);

    socket.join(group_rooms);
  });
}
