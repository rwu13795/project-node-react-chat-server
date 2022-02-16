export function insert_new_group_member(group_id: string, user_id: string) {
  return {
    text: `INSERT INTO users_in_groups(group_id, user_id) 
            VALUES($1, $2) RETURNING user_kicked`,
    values: [group_id, user_id],
  };
}
