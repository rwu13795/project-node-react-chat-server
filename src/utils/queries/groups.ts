export function create_new_group(group_name: string, creator_user_id: string) {
  return {
    text: `INSERT INTO groups(group_name, creator_user_id) 
            VALUES($1, $2) RETURNING group_id`,
    values: [group_name, creator_user_id],
  };
}

export function get_groups_list(user_id: string) {
  return {
    text: `SELECT 
              groups.group_id, 
              groups.group_name, 
              groups.creator_user_id, 
              users_in_groups.user_kicked
          FROM groups INNER JOIN users_in_groups 
          ON groups.group_id = users_in_groups.group_id 
          WHERE users_in_groups.user_id = $1`,
    values: [user_id],
  };
}
