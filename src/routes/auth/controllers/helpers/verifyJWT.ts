import jwt from "jsonwebtoken";

import { UserInfo } from "./signJWT";

interface UserInfoPayload {
  data: UserInfo;
}

export function verifyJWT(token: string): UserInfoPayload | null {
  try {
    const payload = jwt.verify(token, process.env.JWT_KEY!) as UserInfoPayload;
    return payload;
  } catch (err) {
    console.log("JWT verify error --------->", err);
    return null;
  }
}
