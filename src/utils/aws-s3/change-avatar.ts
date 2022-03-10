import { PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

import { s3Client } from "./s3-client";

interface Params {
  Bucket: string;
  Key: string;
  Body: string | Buffer;
}

export default async function changeAvatarImage_S3(
  file_body: Buffer,
  file_type: string,
  user_id: string
): Promise<string> {
  const url = `user_${user_id}_avatar.${file_type}`;
  const key = `public/avatars/user_${user_id}/${url}`;

  console.log("url", url);

  const params: Params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: file_body,
  };
  try {
    await s3Client.send(new PutObjectCommand(params));
  } catch (err) {
    console.log(err);
  }

  console.log("avatar changed !!!!");

  return process.env.CLOUD_FRONT_URL + `/${key}`;
}
