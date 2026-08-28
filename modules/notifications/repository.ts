export async function createNotification(mysql, userId: number, actorId: number, type: string, title: string, body: string, data: any) {
  const [result] = await mysql.query(
    'INSERT INTO notifications (user_id, actor_id, type, title, body, data) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, actorId, type, title, body, JSON.stringify(data || {})]
  )
  return result.insertId
}

export async function getNotifications(mysql, userId: number, limit: number = 50, offset: number = 0) {
  const [notifications] = await mysql.query(`
    SELECT n.id, n.type, n.title, n.body, n.data, n.is_read, n.created_at,
           u.name as actor_name, u.photo_url as actor_photo
    FROM notifications n
    LEFT JOIN users u ON n.actor_id = u.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset])
  return notifications
}

export async function getUnreadCount(mysql, userId: number) {
  const [result] = await mysql.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId]
  )
  return result[0]?.count || 0
}

export async function markAsRead(mysql, notificationId: number, userId: number) {
  await mysql.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [notificationId, userId])
  return true
}

export async function markAllAsRead(mysql, userId: number) {
  await mysql.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE', [userId])
  return true
}

export async function deleteNotification(mysql, notificationId: number, userId: number) {
  await mysql.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [notificationId, userId])
  return true
}
