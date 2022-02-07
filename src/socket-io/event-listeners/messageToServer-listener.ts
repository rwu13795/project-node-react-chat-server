import { Socket, Server } from "socket.io";

import privateChat_emitter from "../event-emitters/private-chat-emitter";

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
  body: string;
  created_at: string;
  targetChatRoom_type: string;
}

export default function messageToServer_listener(socket: Socket, io: Server) {
  socket.on("messageToServer", async (messageObject: MessageObject) => {
    console.log(
      `server received msg from socket ${messageObject.sender_username} ----> ${messageObject.body}`
    );

    // pass message to emitter
    switch (messageObject.targetChatRoom_type) {
      case chatType.private: {
        privateChat_emitter(messageObject, io, socket);
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
