import { Server, Socket } from "socket.io";
import { chatType } from "../../event-listeners";

interface MessageObject_for_client {
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  msg_body: string;
  msg_type: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  file_localUrl?: string;
  warning?: boolean;
}

interface Body {
  messageObject: MessageObject_for_client;
  room_type: string;
  group_id: string;
  newAdmin?: string;
}

export function groupAdminNotification_emitter(
  emitter: Server | Socket,
  { messageObject, room_type, group_id, newAdmin }: Body
) {
  emitter.to(`${chatType.group}_${group_id}`).emit("group-admin-notification", {
    messageObject,
    room_type,
    group_id,
    newAdmin,
  });
}
