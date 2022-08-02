import { Request, Response, NextFunction } from "express";
import cloudFront_signer from "../utils/aws-s3/cloudFront-signer";

export const cloudFront_signedCookies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // this middleware will set a 1 hour signed cookies for both the private folder
  // and group folder whenever a auth-user send a request to the server.
  const currentUser = req.session.currentUser;

  if (!currentUser || !currentUser.isLoggedIn) {
    return next();
  }

  const folder_user = `${process.env.CLOUD_FRONT_URL}/users/${currentUser.user_id}/*`;
  const folder_groups = `${process.env.CLOUD_FRONT_URL}/groups/*`;

  const policy_user = createPolicy(folder_user);
  const policy_groups = createPolicy(folder_groups);

  const cookie_user = cloudFront_signer.getSignedCookie({
    policy: policy_user,
  });

  const cookie_groups = cloudFront_signer.getSignedCookie({
    policy: policy_groups,
  });

  // only set the "CloudFront-Key-Pair-Id" once since, it is the same for all the cookies
  res.cookie("CloudFront-Key-Pair-Id", cookie_user["CloudFront-Key-Pair-Id"], {
    domain: "reachat.live",
    httpOnly: true,
    // the root path of the CLOUD_FRONT_URL
    path: "/",
  });

  // user
  res.cookie("CloudFront-Policy", cookie_user["CloudFront-Policy"], {
    domain: "reachat.live",
    httpOnly: true,
    path: "/users",
  });
  res.cookie("CloudFront-Signature", cookie_user["CloudFront-Signature"], {
    domain: "reachat.live",
    httpOnly: true,
    path: "/users",
  });

  // groups
  res.cookie("CloudFront-Policy", cookie_groups["CloudFront-Policy"], {
    domain: "reachat.live",
    httpOnly: true,
    path: "/groups",
  });
  res.cookie("CloudFront-Signature", cookie_groups["CloudFront-Signature"], {
    domain: "reachat.live",
    httpOnly: true,
    path: "/groups",
  });

  next();
};

// NOTE //
// There can be only ONE statement in each policy for each resource path
// I have to set a cookie for each one of the policies
// the worst part is that the size of this pair of cookies is large, at most
// 5 policy-cookies can be set at the same time.

// since I could only set 5 signed-cookies, I could not set cookies for all
// the specific group folders. (Maybe I could use aws-lambda function to restrict the
// access for each individual group?)
function createPolicy(resourceFolder: string) {
  return JSON.stringify({
    Statement: [
      {
        Resource: resourceFolder,
        Condition: {
          DateLessThan: {
            "AWS:EpochTime":
              Math.floor(new Date().getTime() / 1000) + 60 * 60 * 1, // 1 hour
            // Current Time in UTC + time in seconds, (60 * 60 * 24 = 24 hours)
          },
        },
      },
    ],
  });
}
