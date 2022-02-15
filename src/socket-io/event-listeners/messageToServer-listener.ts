import { Socket, Server } from "socket.io";

import privateMessage_emitter from "../event-emitters/private-msg-emitter";

export enum chatType {
  public = "public",
  group = "group",
  private = "private",
}

export interface MessageObject {
  sender_id: string;
  sender_username: string;
  recipient_id: string;
  recipient_username: string;
  msg_body: string;
  msg_type: string;
  created_at: string;
  targetChatRoom_type: string;
  file_body?: Buffer;
  file_name?: string;
}

export default function messageToServer_listener(socket: Socket, io: Server) {
  socket.on("messageToServer", async (messageObject: MessageObject) => {
    console.log(
      `server received msg from socket ${messageObject.sender_username} ----> ${messageObject.body}`
    );

    console.log(messageObject.msg_type);

    // pass message to emitter
    switch (messageObject.targetChatRoom_type) {
      case chatType.private: {
        privateMessage_emitter(socket, messageObject);
        break;
      }
      case chatType.group: {
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
