export function insert_group_invitation(
  group_id: string,
  inviter_id: string,
  invitee_id: string
) {
  return {
    text: `INSERT INTO group_invitation(group_id, inviter_id, invitee_id)
             VALUES ($1, $2, $3)`,
    values: [group_id, inviter_id, invitee_id],
  };
}

export function get_group_invitations(invitee_id: string) {
  return {
    text: `SELECT 
                group_invitation.group_id::TEXT,
                group_invitation.was_responded,
                users.user_id::TEXT as "inviter_id",
                groups.group_name 
           FROM group_invitation
           INNER JOIN users
                ON group_invitation.inviter_id = users.user_id
           INNER JOIN groups
                    ON group_invitation.group_id = groups.group_id
           WHERE group_invitation.invitee_id = $1 and was_responded = $2`,
    values: [invitee_id, false],
  };
}

export function check_group_member(user_id: string, group_id: string) {
  return {
    text: `SELECT user_left, was_kicked, group_removed
             FROM users_in_groups
             WHERE user_id = $1 AND group_id = $2`,
    values: [user_id, group_id],
  };
}

export function delete_group_invitation(group_id: string, invitee_id: string) {
  return {
    text: `DELETE FROM group_invitation
             WHERE group_id = $1 and invitee_id = $2
             RETURNING *`,
    values: [group_id, invitee_id],
  };
}

export function delete_all_group_invitations(group_id: string) {
  return {
    text: `DELETE FROM group_invitation
             WHERE group_id = $1`,
    values: [group_id],
  };
}
