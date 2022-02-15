import { S3Client } from "@aws-sdk/client-s3";

// you can find the region in the S3 management console
const REGION = "us-east-2";

// The credential is in the ".env" file, the AWS sdk will find that credential
// automatically while create the client
const s3Client = new S3Client({ region: REGION });

export { s3Client };
