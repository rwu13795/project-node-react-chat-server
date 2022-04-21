import cloudFront from "./cloudFront-client";

export default async function createInvalidation_cloudFront(user_id: string) {
  const params = {
    DistributionId:
      process.env.CLOUD_FRONT_DISTRIBUTION_ID! /* required String*/,
    InvalidationBatch: {
      CallerReference:
        Date.now().toString() /* required String (unique string)*/,
      Paths: {
        Quantity: 1 /* required Integer*/,
        Items: [`/public/avatars/user_${user_id}/*`],
      },
    },
  };

  cloudFront.createInvalidation(params, (err, data) => {
    if (err) console.log(err, err.stack);
    // an error occurred
    else console.log("createInvalidation successful response --->", data); // successful response
  });
}

// NOTE //
/*

needed to add IAM policy https://us-east-1.console.aws.amazon.com/iamv2/home#/policies
in order to access the cloudFront "createInvalidation" API

*/
