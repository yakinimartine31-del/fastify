export async function sendWink(mysql, senderId: number, receiverId: number, message: string) {
  const [existing] = await mysql.query('SELECT id FROM winks WHERE sender_id = ? AND receiver_id = ?', [senderId, receiverId])
  if (existing.length > 0) {
    await mysql.query('UPDATE winks SET message = ?, is_read = FALSE, created_at = CURRENT_TIMESTAMP WHERE id = ?', [message || null, existing[0].id])
    return { winked: true, id: existing[0].id }
  }
  const [result] = await mysql.query(
    'INSERT INTO winks (sender_id, receiver_id, message) VALUES (?, ?, ?)',
    [senderId, receiverId, message || null]
  )
  return { winked: true, id: result.insertId }
}

export async function getReceivedWinks(mysql, userId: number, limit: number = 50) {
  const [winks] = await mysql.query(`
    SELECT w.id, w.message, w.is_read, w.created_at,
           u.id as sender_id, u.name as sender_name, u.photo_url as sender_photo
    FROM winks w
    JOIN users u ON w.sender_id = u.id
    WHERE w.receiver_id = ?
    ORDER BY w.created_at DESC
    LIMIT ?
  `, [userId, limit])
  return winks
}

export async function getSentWinks(mysql, userId: number, limit: number = 50) {
  const [winks] = await mysql.query(`
    SELECT w.id, w.message, w.is_read, w.created_at,
           u.id as receiver_id, u.name as receiver_name, u.photo_url as receiver_photo
    FROM winks w
    JOIN users u ON w.receiver_id = u.id
    WHERE w.sender_id = ?
    ORDER BY w.created_at DESC
    LIMIT ?
  `, [userId, limit])
  return winks
}

export async function markWinkAsRead(mysql, winkId: number, userId: number) {
  await mysql.query('UPDATE winks SET is_read = TRUE WHERE id = ? AND receiver_id = ?', [winkId, userId])
  return true
}

export async function getWinkById(mysql, winkId: number, userId: number) {
  const [winks] = await mysql.query(`
    SELECT w.id, w.sender_id, w.receiver_id, w.message, w.is_read, w.created_at,
           u.name as sender_name, u.photo_url as sender_photo
    FROM winks w
    JOIN users u ON w.sender_id = u.id
    WHERE w.id = ? AND (w.sender_id = ? OR w.receiver_id = ?)
  `, [winkId, userId, userId])
  return winks[0] || null
}

export async function deleteWink(mysql, winkId: number, userId: number) {
  await mysql.query('DELETE FROM winks WHERE id = ? AND (sender_id = ? OR receiver_id = ?)', [winkId, userId, userId])
  return true
}
