import AWS from "aws-sdk";
import "dotenv/config";

const cloudFront = new AWS.CloudFront();

export default cloudFront;
