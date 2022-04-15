import { Socket, Server } from "socket.io";
import { msgType } from "../../../utils/enums/message-type";

import {
  privateMessage_emitter,
  groupMessage_emitter,
} from "../../event-emitters";

export enum chatType {
  group = "group",
  private = "private",
}

export interface MessageObject {
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  msg_body: string;
  msg_type: msgType;
  created_at: string;
  file_body?: Buffer;
  file_type?: string;
  file_name?: string;
}

interface Data {
  messageObject: MessageObject;
  room_type: string;
}

export function messageToServer_listener(socket: Socket, io: Server) {
  socket.on("message-to-server", async ({ messageObject, room_type }: Data) => {
    switch (room_type) {
      case chatType.private: {
        privateMessage_emitter(socket, messageObject);
        break;
      }
      case chatType.group: {
        groupMessage_emitter(socket, messageObject);
        break;
      }
      default:
        break;
    }
  });
}
