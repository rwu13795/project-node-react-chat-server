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
    text: `SELECT * FROM reset_password_token
              WHERE user_id = $1 
                AND token = $2
                AND token_expiration > CURRENT_TIMESTAMP
              `,
    values: [user_id, token],
  };
}
