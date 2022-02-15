import { PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";
import crypto from "crypto";

import { s3Client } from "./s3-client";

interface Params {
  Bucket: string;
  Key: string;
  Body: string | Buffer;
}

export default async function uploadImageTo_S3(
  body: Buffer,
  sender_id: string,
  recipient_id: string
): Promise<string> {
  //   const categoryUrl = `${main_cat}/${sub_cat}/${urlTitle}`;
  //   const awsUrl = `https://${process.env.S3_BUCKET_NAME}.${process.env.S3_BUCKET_REGION}/${categoryUrl}`;
  const fileName = crypto.randomBytes(16).toString("hex");

  let params: Params = {
    Bucket: process.env.S3_BUCKET_NAME!, // The name of the bucket. For example, 'sample_bucket_101'.
    // The name of the object. For example, 'sample_upload.txt'. And the folder name will any
    // path in front of the file name, (testing_folder/xxxxx.txt)
    Key: fileName + ".jpg", // add the key dynamically for different images
    // The content of the object. For example, a string 'Hello world!" for txt file.
    // for image, put in the file-buffer created by the "multer"
    Body: body, // add the file-buffer dynamically for different images
  };

  // upload to S3
  try {
    await s3Client.send(new PutObjectCommand(params));
    console.log(`> > > uploaded image: ${fileName}`);
  } catch (err) {
    console.log(err);
  }

  return fileName;
}
