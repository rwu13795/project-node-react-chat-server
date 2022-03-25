export function create_new_group(group_name: string, admin_user_id: string) {
  return {
    text: `INSERT INTO groups(group_name, admin_user_id) 
            VALUES($1, $2) RETURNING group_id`,
    values: [group_name, admin_user_id],
  };
}

export function get_groups_list(user_id: string) {
  return {
    text: `SELECT 
              groups.group_id, 
              groups.group_name, 
              groups.admin_user_id, 
              users_in_groups.was_kicked,
              users_in_groups.user_left_at,
              users_in_groups.user_left
          FROM groups 
          INNER JOIN users_in_groups 
              ON groups.group_id = users_in_groups.group_id 
          WHERE users_in_groups.user_id = $1
              AND users_in_groups.group_removed = false`,
    values: [user_id],
  };
}

export function group_counts_for_each_user(user_id: string) {
  return {
    text: `SELECT group_id
           FROM groups
           WHERE admin_user_id = $1`,
    values: [user_id],
  };
}

export function insert_new_group_member(group_id: string, invitee_id: string) {
  return {
    text: `INSERT INTO users_in_groups(group_id, user_id) 
            VALUES($1, $2)
            ON CONFLICT ON CONSTRAINT users_in_groups_pkey
            DO 
              UPDATE SET user_left = false, 
                         user_left_at = NULL,
                         was_kicked = false`,
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

export function group_member_left(
  group_id: string,
  user_id: string,
  was_kicked: boolean
) {
  return {
    text: `UPDATE users_in_groups
            SET was_kicked = $3, 
                user_left = true,
                user_left_at = CURRENT_TIMESTAMP
            WHERE group_id = $1 AND user_id = $2`,
    values: [group_id, user_id, was_kicked],
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
              AND users.user_id = users_in_groups.user_id
              AND users_in_groups.user_left = false`,
    values: [group_id],
  };
}

export function mark_group_as_removed(group_id: string, user_id: string) {
  return {
    text: `UPDATE users_in_groups
            SET group_removed = true
            WHERE group_id = $1 AND user_id = $2`,
    values: [group_id, user_id],
  };
}

export function get_next_admin(group_id: string) {
  return {
    text: `SELECT 
              users.user_id, 
              users.username
          FROM users
          INNER JOIN users_in_groups
              ON users_in_groups.group_id = $1
          WHERE users_in_groups.group_id = $1 
              AND users.user_id = users_in_groups.user_id
              AND users_in_groups.user_left = false 
          ORDER BY users_in_groups.joined_at ASC
          LIMIT 1`,
    values: [group_id],
  };
}

export function update_group_admin(group_id: string, user_id: string) {
  return {
    text: `UPDATE groups
            SET admin_user_id = $2
            WHERE group_id = $1`,
    values: [group_id, user_id],
  };
}

export function disband_group(group_id: string) {
  return {
    text: `UPDATE FROM groups
            SET disbanded_at = CURRENT_TIMESTAMP, 
            WHERE group_id = $1
            RETURNING disbanded_at`,
    values: [group_id],
  };
}
