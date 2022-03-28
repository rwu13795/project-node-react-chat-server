export function search_user(user_id: string, user_email: string) {
  let text: string;
  let value: string;
  if (user_id === "") {
    text = "email";
    value = user_email;
  } else {
    text = "user_id";
    value = user_id;
  }
  return {
    text: `SELECT user_id, username, avatar_url FROM users 
             WHERE ${text} = $1`,
    values: [value],
  };
}

export function find_existing_user(req_email: string) {
  return {
    text: `SELECT user_id, 
              username, password, 
              email, avatar_url FROM users 
           WHERE email = $1`,
    values: [req_email],
  };
}
export function find_existing_user_email(req_email: string) {
  return {
    text: "SELECT email FROM users WHERE email = $1",
    values: [req_email],
  };
}

export function register_new_user(
  req_email: string,
  req_username: string,
  hashedPassword: string
) {
  return {
    name: "register_new_user",
    text: `INSERT INTO users(email, username, password) VALUES($1, $2, $3) RETURNING *`,
    values: [req_email, req_username, hashedPassword],
  };
}

export function update_user_avatar(user_id: string, avatar_url: string) {
  return {
    text: `UPDATE users
            SET avatar_url = $2
            WHERE user_id = $1`,
    values: [user_id, avatar_url],
  };
}

export function change_password(user_id: string, password: string) {
  return {
    text: `UPDATE users
             SET password = $2
             WHERE user_id = $1`,
    values: [user_id, password],
  };
}

export function change_username(user_id: string, username: string) {
  return {
    text: `UPDATE users
             SET username = $2
             WHERE user_id = $1`,
    values: [user_id, username],
  };
}
