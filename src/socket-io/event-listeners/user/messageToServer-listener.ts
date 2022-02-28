import { Socket, Server } from "socket.io";

import groupMessage_emitter from "../../event-emitters/group-msg-emitter";
import privateMessage_emitter from "../../event-emitters/private-msg-emitter";

export enum chatType {
  public = "public",
  group = "group",
  private = "private",
}

export interface MessageObject {
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  msg_body: string;
  msg_type: string;
  created_at: string;
  file_body?: Buffer;
  file_type?: string;
  file_name?: string;
}

interface Props {
  messageObject: MessageObject;
  room_type: string;
}

export default function messageToServer_listener(socket: Socket, io: Server) {
  socket.on("messageToServer", async ({ messageObject, room_type }: Props) => {
    // console.log(
    //   `server received msg from socket ${messageObject.sender_name}
    //   ----> ${messageObject.msg_body}`
    // );

    console.log(messageObject);

    // pass message to emitter
    switch (room_type) {
      case chatType.private: {
        privateMessage_emitter(socket, messageObject, room_type);
        break;
      }
      case chatType.group: {
        groupMessage_emitter(socket, messageObject, room_type);
        break;
      }
      case chatType.public: {
        break;
      }
      default:
        break;
    }
  });
}
