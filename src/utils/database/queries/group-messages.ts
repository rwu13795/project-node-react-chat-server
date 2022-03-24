export function insert_new_group_msg(
  group_id: string,
  user_id: string,
  msg_body: string,
  msg_type: string,
  file_name: string = "none",
  file_type: string = "none",
  file_url: string = "none"
) {
  return {
    text: `INSERT INTO group_messages
                    (group_id, user_id, msg_body, 
                    msg_type, file_name, file_type, file_url) 
            VALUES($1, $2, $3, $4, $5, $6, $7)`,
    values: [
      group_id,
      user_id,
      msg_body,
      msg_type,
      file_name,
      file_type,
      file_url,
    ],
  };
}

export function get_group_chat_history(
  group_id: string,
  MSG_PER_PAGE: number,
  offset: number
) {
  return {
    text: `SELECT 
                group_id AS recipient_id,
                user_id AS sender_id,
                msg_body,
                msg_type,
                created_at,
                file_type,
                file_url,
                file_name
            FROM group_messages     
            WHERE group_id = $1 
            ORDER BY 5 DESC      
            Limit ${MSG_PER_PAGE} OFFSET ${offset}`,
    values: [group_id],
  };
}

export function get_limited_group_chat_history(
  group_id: string,
  date_limit: string,
  MSG_PER_PAGE: number,
  offset: number
) {
  // covert the timestamp string to seconds inside the DB, add 0.5 second
  // to the time in order to make the chat history include the last "left" message
  // then convert the seconds back to timestamp for comparison
  return {
    text: `SELECT 
                group_id AS recipient_id,
                user_id AS sender_id,
                msg_body,
                msg_type,
                created_at,
                file_type,
                file_url,
                file_name
            FROM group_messages    
            WHERE group_id = $1 
              AND created_at <= to_timestamp(EXTRACT(EPOCH FROM TIMESTAMP '${date_limit}') + 0.5)
            ORDER BY 5 DESC      
            Limit ${MSG_PER_PAGE} OFFSET ${offset}`,
    values: [group_id],
  };
}
