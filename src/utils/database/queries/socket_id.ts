export function update_socket_id(user_id: string, socket_id: string) {
  const savedID = user_id + "_" + socket_id;
  return {
    text: `UPDATE socket_id
                SET prev_socket_id = socket_id,
                    socket_id = $2
                WHERE user_id = $1
                RETURNING prev_socket_id`,
    values: [user_id, savedID],
  };
}

export function initialize_socket_id(user_id: string) {
  return {
    text: `INSERT INTO socket_id(user_id, socket_id, prev_socket_id) 
                VALUES($1, 'none', 'none')`,
    values: [user_id],
  };
}
