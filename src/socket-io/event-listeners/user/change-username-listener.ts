import { Socket } from "socket.io";

import { changeUsername_emitter } from "../../event-emitters";

interface Data {
  new_name: string;
}

export function changeUsername_listener(socket: Socket) {
  socket.on("change-username", async ({ new_name }: Data) => {
    const { friends_room_id, user_id } = socket.currentUser;

    // let all the friends know that this user changed username
    if (friends_room_id.length > 0) {
      // only emit if the user has at least one friend, otherwise
      // the socket will emit to every one globally if the array is emtpy
      changeUsername_emitter(socket, friends_room_id, {
        sender_id: user_id,
        new_name,
      });
    }
  });
}
