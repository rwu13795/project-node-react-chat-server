import { PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

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
  type: string
): Promise<void> {
  //   const categoryUrl = `${main_cat}/${sub_cat}/${urlTitle}`;
  //   const awsUrl = `https://${process.env.S3_BUCKET_NAME}.${process.env.S3_BUCKET_REGION}/${categoryUrl}`;

  if (type === chatType.private) {
  } else if (type === chatType.group) {
  } else {
  }

  // upload the image to both users' private folder
  const params_user_1: Params = {
    Bucket: process.env.S3_BUCKET_NAME!, // The name of the bucket. For example, 'sample_bucket_101'.
    // The name of the object. For example, 'sample_upload.txt'. And the folder name will any
    // path in front of the file name, (testing_folder/xxxxx.txt)
    Key: `users/${sender_id}/${file_name}`, // add the key dynamically for different images
    // The content of the object. For example, a string 'Hello world!" for txt file.
    // for image, put in the file-buffer created by the "multer"
    Body: file_body, // add the file-buffer dynamically for different images
  };
  const params_user_2: Params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `users/${recipient_id}/${file_name}`,
    Body: file_body,
  };

  console.log(params_user_1);

  // upload to S3
  try {
    await Promise.all([
      s3Client.send(new PutObjectCommand(params_user_1)),
      s3Client.send(new PutObjectCommand(params_user_2)),
    ]);
  } catch (err) {
    console.log(err);
  }
}
