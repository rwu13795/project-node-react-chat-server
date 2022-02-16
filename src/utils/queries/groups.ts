export function create_new_group(group_name: string, creator_user_id: string) {
  return {
    text: `INSERT INTO groups(group_name, creator_user_id) 
            VALUES($1, $2) RETURNING group_id`,
    values: [group_name, creator_user_id],
  };
}
