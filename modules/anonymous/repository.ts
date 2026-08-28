export async function sendAnonymousMessage(mysql, receiverId: number, message: string) {
  const [result] = await mysql.query(
    'INSERT INTO anonymous_messages (receiver_id, message) VALUES (?, ?)',
    [receiverId, message]
  )
  return result.insertId
}

export async function getMyAnonymousMessages(mysql, userId: number, limit: number = 50) {
  const [messages] = await mysql.query(`
    SELECT id, message, is_read, created_at
    FROM anonymous_messages
    WHERE receiver_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `, [userId, limit])
  return messages
}

export async function markAnonymousAsRead(mysql, messageId: number, userId: number) {
  await mysql.query('UPDATE anonymous_messages SET is_read = TRUE WHERE id = ? AND receiver_id = ?', [messageId, userId])
  return true
}

export async function getAnonymousMessage(mysql, messageId: number, userId: number) {
  const [messages] = await mysql.query('SELECT id, message, is_read, created_at FROM anonymous_messages WHERE id = ? AND receiver_id = ?', [messageId, userId])
  return messages[0] || null
}

export async function deleteAnonymousMessage(mysql, messageId: number, userId: number) {
  await mysql.query('DELETE FROM anonymous_messages WHERE id = ? AND receiver_id = ?', [messageId, userId])
  return true
}
