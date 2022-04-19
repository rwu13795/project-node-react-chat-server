import AWS from "aws-sdk";
import "dotenv/config";

const publicAccessId = process.env.CF_PUBLIC_ACCESS_ID;

const privateKey = process.env.CF_PRIVATE_KEY;

const cloudFront_signer = new AWS.CloudFront.Signer(
  publicAccessId!,
  privateKey!
);

export default cloudFront_signer;
