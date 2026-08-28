export async function createReport(mysql, reporterId: number, reportedUserId: number, reason: string, description?: string) {
  const [result] = await mysql.query(
    'INSERT INTO reports (reporter_id, reported_user_id, reason, description) VALUES (?, ?, ?, ?)',
    [reporterId, reportedUserId, reason, description || null]
  )
  return result.insertId
}

export async function getReports(mysql, status?: string, limit: number = 50, offset: number = 0) {
  let query = `
    SELECT r.id, r.reporter_id, r.reported_user_id, r.reason, r.description, r.status, r.created_at,
           u1.name as reporter_name, u2.name as reported_user_name
    FROM reports r
    JOIN users u1 ON r.reporter_id = u1.id
    JOIN users u2 ON r.reported_user_id = u2.id
  `
  const params: any[] = []
  
  if (status) {
    query += ' WHERE r.status = ?'
    params.push(status)
  }
  
  query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  const [reports] = await mysql.query(query, params)
  return reports
}

export async function getReportById(mysql, reportId: number) {
  const [reports] = await mysql.query(`
    SELECT r.id, r.reporter_id, r.reported_user_id, r.reason, r.description, r.status, r.created_at,
           u1.name as reporter_name, u2.name as reported_user_name
    FROM reports r
    JOIN users u1 ON r.reporter_id = u1.id
    JOIN users u2 ON r.reported_user_id = u2.id
    WHERE r.id = ?
  `, [reportId])
  return reports[0] || null
}

export async function updateReportStatus(mysql, reportId: number, status: string) {
  const [result] = await mysql.query('UPDATE reports SET status = ? WHERE id = ?', [status, reportId])
  return result.affectedRows > 0
}

export async function blockUser(mysql, userId: number, blockedUserId: number) {
  const [result] = await mysql.query(
    'INSERT IGNORE INTO blocks (user_id, blocked_user_id) VALUES (?, ?)',
    [userId, blockedUserId]
  )
  return result.affectedRows > 0
}

export async function unblockUser(mysql, userId: number, blockedUserId: number) {
  const [result] = await mysql.query('DELETE FROM blocks WHERE user_id = ? AND blocked_user_id = ?', [userId, blockedUserId])
  return result.affectedRows > 0
}

export async function getBlockedUsers(mysql, userId: number) {
  const [blocks] = await mysql.query(`
    SELECT b.id, b.blocked_user_id, b.created_at, u.name, u.photo_url, u.vip_status
    FROM blocks b
    JOIN users u ON b.blocked_user_id = u.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `, [userId])
  return blocks
}

export async function isBlocked(mysql, userId1: number, userId2: number) {
  const [blocks] = await mysql.query(`
    SELECT id FROM blocks 
    WHERE (user_id = ? AND blocked_user_id = ?) OR (user_id = ? AND blocked_user_id = ?)
  `, [userId1, userId2, userId2, userId1])
  return blocks.length > 0
}

export async function createScamAlert(mysql, userId: number, alertType: string, message: string) {
  const [result] = await mysql.query(
    'INSERT INTO scam_alerts (user_id, alert_type, message) VALUES (?, ?, ?)',
    [userId, alertType, message]
  )
  return result.insertId
}

export async function getScamAlerts(mysql, userId: number, dismissed: boolean = false) {
  const [alerts] = await mysql.query(`
    SELECT id, user_id, alert_type, message, dismissed, created_at
    FROM scam_alerts
    WHERE user_id = ? AND dismissed = ?
    ORDER BY created_at DESC
  `, [userId, dismissed])
  return alerts
}

export async function dismissScamAlert(mysql, alertId: number, userId: number) {
  const [result] = await mysql.query('UPDATE scam_alerts SET dismissed = TRUE WHERE id = ? AND user_id = ?', [alertId, userId])
  return result.affectedRows > 0
}

export async function createModerationLog(mysql, userId: number, action: string, moderatorId?: number, reason?: string) {
  const [result] = await mysql.query(
    'INSERT INTO moderation_logs (user_id, action, moderator_id, reason) VALUES (?, ?, ?, ?)',
    [userId, action, moderatorId || null, reason || null]
  )
  return result.insertId
}

export async function getModerationLogs(mysql, userId: number) {
  const [logs] = await mysql.query(`
    SELECT ml.id, ml.user_id, ml.action, ml.moderator_id, ml.reason, ml.created_at, u.name as user_name
    FROM moderation_logs ml
    JOIN users u ON ml.user_id = u.id
    WHERE ml.user_id = ?
    ORDER BY ml.created_at DESC
  `, [userId])
  return logs
}

export async function getAllModerationLogs(mysql, limit: number = 100, offset: number = 0) {
  const [logs] = await mysql.query(`
    SELECT ml.id, ml.user_id, ml.action, ml.moderator_id, ml.reason, ml.created_at, u.name as user_name
    FROM moderation_logs ml
    JOIN users u ON ml.user_id = u.id
    ORDER BY ml.created_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset])
  return logs
}
