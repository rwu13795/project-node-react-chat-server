import { Socket } from "socket.io";
import { chatType } from "./messageToServer-listener";

interface Props {
  private_id: string;
  group_ids: string[];
}

export default function joinRoom_listener(
  socket: Socket,
  id: number | undefined
) {
  socket.on("join-room", ({ private_id, group_ids }: Props) => {
    console.log(
      `socket ${socket.id} has joined ${private_id}, using worker ${id}`
    );
    // the current user will join his/her private room after signing in
    // all private messages to this user will be sent to this private room directly.
    socket.join(private_id);

    const group_rooms = group_ids.map((id) => `${chatType.group}_${id}`);
    console.log(
      `socket ${socket.id} has joined ${group_rooms}, using worker ${id}`
    );
    socket.join(group_rooms);
  });
}
