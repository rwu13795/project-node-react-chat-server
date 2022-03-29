export function insert_reset_token(user_id: string, token: string) {
  return {
    text: `INSERT INTO reset_password_token(user_id, token)
            VALUES($1, $2)
            ON CONFLICT ON CONSTRAINT reset_password_token_pkey
            DO
              UPDATE SET token = $2, 
                         token_expiration = CURRENT_TIMESTAMP + INTERVAL '5 minutes'`,
    values: [user_id, token],
  };
}

export function check_token(user_id: string, token: string) {
  return {
    text: `SELECT user_id::TEXT, token, token_expiration FROM reset_password_token
              WHERE user_id = $1 
                AND token = $2
                AND token_expiration > CURRENT_TIMESTAMP
              `,
    values: [user_id, token],
  };
}

export function delete_reset_token(user_id: string) {
  return {
    text: `UPDATE reset_password_token
             SET token = ''
             WHERE user_id = $1`,
    values: [user_id],
  };
}
