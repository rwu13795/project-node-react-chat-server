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
          FROM groups 
          INNER JOIN users_in_groups 
              ON groups.group_id = users_in_groups.group_id 
          WHERE users_in_groups.user_id = $1 
              AND users_in_groups.user_kicked = false`,
    values: [user_id],
  };
}

export function group_counts_for_each_user(user_id: string) {
  return {
    text: `SELECT group_id
           FROM groups
           WHERE creator_user_id = $1`,
    values: [user_id],
  };
}

export function insert_new_group_member(group_id: string, invitee_id: string) {
  return {
    text: `INSERT INTO users_in_groups(group_id, user_id) 
            VALUES($1, $2)`,
    values: [group_id, invitee_id],
  };
}

export function delete_group_member(group_id: string, user_id: string) {
  return {
    text: `DELETE FROM users_in_groups
            WHERE group_id = $1 AND user_id = $2`,
    values: [group_id, user_id],
  };
}

export function get_members_list(group_id: string) {
  return {
    text: `SELECT 
              users.user_id, 
              users.username,
              users.email, 
              users.avatar_url
          FROM users
          INNER JOIN users_in_groups
              ON users_in_groups.group_id = $1
          WHERE users_in_groups.group_id = $1 
              AND users.user_id = users_in_groups.user_id`,
    values: [group_id],
  };
}
