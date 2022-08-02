import jwt from "jsonwebtoken";

export interface UserInfo {
  user_id: string;
  email: string;
  username: string;
}

export function signJWT(userInfo: UserInfo) {
  return jwt.sign(
    {
      // 60 * 60 * 1= 1 hour
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 1,
      data: userInfo,
    },
    process.env.JWT_KEY!
  );
}
