import { Socket } from "socket.io";

import createInvalidation_cloudFront from "../../../utils/aws-cloudFront/create-invalidation";
import changeAvatarImage_S3 from "../../../utils/aws-s3/change-avatar";
import { db_pool } from "../../../utils/database/db-connection";
import { update_user_avatar } from "../../../utils/database/queries/__index";
import { changeAvatar_emitter } from "../../event-emitters";

interface Data {
  buffer: Buffer;
  type: string;
}

export function changeAvatar_listener(socket: Socket) {
  socket.on("change-avatar", async ({ buffer, type }: Data) => {
    const { user_id, friends_room_id } = socket.currentUser;
    const extension = type.split("/")[1];
    const avatar_url = await changeAvatarImage_S3(buffer, extension, user_id);

    // cloudFront always uses cached images from the Bucket, I have to manually make
    // the cloudFront load the latest image (the updated avatar) from the Bucket by
    // calling the "create-invalidation" function in the utils
    await Promise.all([
      db_pool.query(update_user_avatar(user_id, avatar_url)),
      createInvalidation_cloudFront(user_id),
    ]);

    changeAvatar_emitter(socket, friends_room_id, {
      sender_id: user_id,
      new_avatar_url: avatar_url,
    });
  });
}
