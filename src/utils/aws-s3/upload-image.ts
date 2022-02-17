import { PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";
import crypto from "crypto";

import { s3Client } from "./s3-client";
import { chatType } from "../../socket-io/event-listeners/messageToServer-listener";

interface Params {
  Bucket: string;
  Key: string;
  Body: string | Buffer;
}

export default async function uploadImageTo_S3(
  file_body: Buffer,
  file_name: string,
  sender_id: string,
  recipient_id: string,
  chat_type: string
): Promise<{ type: string; url: string }> {
  const type = file_name.split(".")[1];
  // generate a random key for the url
  const url = crypto.randomBytes(16).toString("hex") + `.${type}`;

  if (chat_type === chatType.private) {
    // upload the image to both users' private folder
    const params_user_1: Params = {
      Bucket: process.env.S3_BUCKET_NAME!, // The name of the bucket. For example, 'sample_bucket_101'.
      // The name of the object. For example, 'sample_upload.txt'. And the folder name will any
      // path in front of the file name, (testing_folder/xxxxx.txt)
      Key: `users/${sender_id}/${url}`, // add the key dynamically for different images
      // The content of the object. For example, a string 'Hello world!" for txt file.
      // for image, put in the file-buffer created by the "multer"
      Body: file_body, // add the file-buffer dynamically for different images
    };
    const params_user_2: Params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `users/${recipient_id}/${url}`,
      Body: file_body,
    };
    // upload to S3
    try {
      await Promise.all([
        s3Client.send(new PutObjectCommand(params_user_1)),
        s3Client.send(new PutObjectCommand(params_user_2)),
      ]);
    } catch (err) {
      console.log(err);
    }
  } else {
    const folder = chat_type === chatType.group ? "groups" : "public";
    const params: Params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${folder}/${recipient_id}/${url}`,
      Body: file_body,
    };
    try {
      await s3Client.send(new PutObjectCommand(params));
    } catch (err) {
      console.log(err);
    }
  }

  return { type, url };
}
