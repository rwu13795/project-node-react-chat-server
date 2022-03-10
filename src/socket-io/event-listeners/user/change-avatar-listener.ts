import { Socket } from "socket.io";
import createInvalidation_cloudFront from "../../../utils/aws-cloudFront/create-invalidation";

import changeAvatarImage_S3 from "../../../utils/aws-s3/change-avatar";
import { db_pool } from "../../../utils/db-connection";
import { update_user_avatar } from "../../../utils/queries/users";

interface ImageObject {
  buffer: Buffer;
  type: string;
}

export function changeAvatar_listener(socket: Socket) {
  socket.on("change-avatar", async ({ buffer, type }: ImageObject) => {
    console.log(buffer);
    console.log(type);

    const user_id = socket.currentUser.user_id;
    const extension = type.split("/")[1];
    const avatar_url = await changeAvatarImage_S3(buffer, extension, user_id);

    console.log(avatar_url);
    console.log(user_id);

    // cloudFront uses cached images from the Bucket, I have to manually make the
    // cloudFront load the latest image (the updated avatar) from the Bucket

    await Promise.all([
      db_pool.query(update_user_avatar(user_id, avatar_url)),
      createInvalidation_cloudFront(user_id),
    ]);
  });
}
