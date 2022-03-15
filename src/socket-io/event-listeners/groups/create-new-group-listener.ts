import { Socket } from "socket.io";

import { chatType } from "..";

interface Props {
  group_id: string;
}

export function createNewGroup_listener(socket: Socket) {
  socket.on("create-new-group", ({ group_id }: Props) => {
    socket.join(`${chatType.group}_${group_id}`);
  });
}
