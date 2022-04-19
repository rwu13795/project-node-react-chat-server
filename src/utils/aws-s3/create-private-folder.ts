import { PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

import { s3Client } from "./s3-client";

interface Params {
  Bucket: string;
  Key: string;
  Body: string | Buffer;
}

export default async function createPrivateFolder_S3(
  user_id: string
): Promise<void> {
  // create a new folder on S3 for the new user
  const params_user_1: Params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `users/${user_id}/initialize.txt`,
    Body: `user@${user_id}`,
  };

  try {
    await s3Client.send(new PutObjectCommand(params_user_1));
  } catch (err) {
    console.log(err);
  }
}
