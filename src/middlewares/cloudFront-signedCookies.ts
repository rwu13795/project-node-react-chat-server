import { Request, Response, NextFunction } from "express";
import cloudFront_signer from "../utils/aws-s3/cloudFront-signer";

export const cloudFront_signedCookies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.session.currentUser;

  console.log(req.headers.cookie);

  if (!currentUser || !currentUser.isLoggedIn) {
    return next();
  }

  const folder_user = `${process.env.CLOUD_FRONT_URL}/users/${currentUser.user_id}`;

  const policy_user = createPolicy(folder_user);

  const cookie_user = cloudFront_signer.getSignedCookie({
    policy: policy_user,
  });
  // const cookie_test2 = cloudFront_signer.getSignedCookie({
  //   policy: policy_2,
  // });

  // only set the "CloudFront-Key-Pair-Id" once since, it is the same for the all cookies
  res.cookie("CloudFront-Key-Pair-Id", cookie_user["CloudFront-Key-Pair-Id"], {
    domain: "reachat.live",
    httpOnly: true,
    // the root path of the CLOUD_FRONT_UR
    path: "/",
  });

  // set Policy and Signature for the 2 differnt folders
  res.cookie("CloudFront-Policy", cookie_user["CloudFront-Policy"], {
    domain: "reachat.live",
    httpOnly: true,
    path: "/users",
  });
  // the corresponding path of which the img source in the client contains
  res.cookie("CloudFront-Signature", cookie_user["CloudFront-Signature"], {
    domain: "reachat.live",
    httpOnly: true,
    path: "/users",
  });
  // res.cookie("CloudFront-Policy", cookie_test2["CloudFront-Policy"], {
  //   domain: "reachat.live",
  //   httpOnly: true,
  //   path: "/testing-2",
  // });
  // res.cookie("CloudFront-Signature", cookie_test2["CloudFront-Signature"], {
  //   domain: "reachat.live",
  //   httpOnly: true,
  //   path: "/testing-2",
  // });

  console.log("res.cookie", res.cookie);

  next();
};

function createPolicy(resourceFolder: string) {
  return JSON.stringify({
    Statement: [
      {
        Resource: resourceFolder,
        Condition: {
          DateLessThan: {
            "AWS:EpochTime":
              Math.floor(new Date().getTime() / 1000) + 60 * 1 * 1,
            // Current Time in UTC + time in seconds, (60 * 60 * 24 = 24 hours)
          },
        },
      },
    ],
  });
}
