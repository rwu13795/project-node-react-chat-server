import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { db_pool } from "../../../utils/database/db-connection";
import { Password } from "../../../utils/hash-password";
import { Friend_res } from "../../../utils/interfaces/response-interfaces";
import { Users } from "../../../utils/interfaces/tables-columns";
import { asyncWrapper, Bad_Request_Error } from "../../../middlewares";
import {
  find_existing_user,
  get_add_friend_request,
  get_friends_list,
  get_groups_list,
  get_group_invitations,
  register_new_user,
} from "../../../utils/database/queries/__index";
import { onlineStatus_enum } from "../../../socket-io/socket-io-connection";
import { googleAuthClient } from "../../../utils/goolge/auth-client";
import { Response_body_signIn } from "./sign-in";
import { Response_body_signUp } from "./sign-up";
import { addNewUserAsFriend } from "./helpers/add-new-user-as-friend";

interface Request_body {
  appearOffline: boolean;
  token: string;
}

interface GoogleNewUser_res extends Response_body_signUp {
  isNewUser: boolean;
}

export const googleSignIn = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, appearOffline }: Request_body = req.body;

    // verify the user with the google auth
    const ticket = await googleAuthClient.verifyIdToken({
      idToken: token,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return next(
        new Bad_Request_Error("Google authorization error", "google_auth")
      );
    }

    const { name, email: req_email, picture } = payload;
    if (!req_email || !name) {
      return next(
        new Bad_Request_Error("Google authorization error", "google_auth")
      );
    }

    const existingUser = await db_pool.query(find_existing_user(req_email));

    const onlineStatus = appearOffline
      ? onlineStatus_enum.offline
      : onlineStatus_enum.online;

    // -------------------------------------------------------------------------- //
    // if user exists, fetch the user data the same way I do in the normal sign-in
    if (existingUser.rowCount >= 1) {
      const { username, email, user_id, avatar_url } = existingUser
        .rows[0] as Users;

      const [
        friends_res,
        addFriendRequests_res,
        groups_res,
        groupInvitaions_result,
      ] = await Promise.all([
        db_pool.query(get_friends_list(user_id)),
        db_pool.query(get_add_friend_request(user_id)),
        db_pool.query(get_groups_list(user_id)),
        db_pool.query(get_group_invitations(user_id)),
      ]);

      req.session.currentUser = {
        username,
        email,
        user_id,
        avatar_url,
        isLoggedIn: true,
        targetRoomIdentifier: "",
        onlineStatus,
        loggedInWithGoogle: true,
      };

      let response: Response_body_signIn = {
        friendsList: friends_res.rows,
        addFriendRequests: addFriendRequests_res.rows,
        currentUser: req.session.currentUser,
        groupsList: groups_res.rows,
        groupInvitations: groupInvitaions_result.rows,
      };

      res.status(201).send(response);
    }

    // --------------------------------------------------- //
    // if user is NOT existed, create a new account for him
    else {
      // generate a random 16 characters password for new user since this user will
      // only login using google auth
      const password = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await Password.toHash(password);

      const result = await db_pool.query(
        register_new_user(req_email, name, hashedPassword, picture)
      );
      const newUser = result.rows[0] as Users;

      // add the new user as my friend (rwu13795@gmail.com) automatically
      const friendsList: Friend_res[] = await addNewUserAsFriend(
        newUser.user_id
      );

      req.session.currentUser = {
        username: name,
        email: req_email,
        user_id: newUser.user_id,
        avatar_url: picture,
        isLoggedIn: true,
        targetRoomIdentifier: "",
        onlineStatus,
        loggedInWithGoogle: true,
      };
      let response: GoogleNewUser_res = {
        friendsList,
        currentUser: req.session.currentUser,
        isNewUser: true,
      };

      res.status(201).send(response);
    }
  }
);
