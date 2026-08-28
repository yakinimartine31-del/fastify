export async function createIcebreaker(mysql, userId: number, receiverId: number, message: string) {
  const [result] = await mysql.query(
    'INSERT INTO icebreakers (user_id, receiver_id, message) VALUES (?, ?, ?)',
    [userId, receiverId, message]
  )
  return result.insertId
}

export async function getMyIcebreakers(mysql, userId: number) {
  const [icebreakers] = await mysql.query(`
    SELECT ib.id, ib.message, ib.is_read, ib.created_at,
           u.name as sender_name, u.photo_url as sender_photo
    FROM icebreakers ib
    JOIN users u ON ib.user_id = u.id
    WHERE ib.receiver_id = ?
    ORDER BY ib.created_at DESC
    LIMIT 50
  `, [userId])
  return icebreakers
}

export async function getSentIcebreakers(mysql, userId: number) {
  const [icebreakers] = await mysql.query(`
    SELECT ib.id, ib.message, ib.is_read, ib.created_at,
           u.name as receiver_name, u.photo_url as receiver_photo
    FROM icebreakers ib
    JOIN users u ON ib.receiver_id = u.id
    WHERE ib.user_id = ?
    ORDER BY ib.created_at DESC
    LIMIT 50
  `, [userId])
  return icebreakers
}

export async function markIcebreakerAsRead(mysql, icebreakerId: number, userId: number) {
  await mysql.query('UPDATE icebreakers SET is_read = TRUE WHERE id = ? AND receiver_id = ?', [icebreakerId, userId])
  return true
}

export async function getIcebreakerById(mysql, icebreakerId: number) {
  const [icebreakers] = await mysql.query(`
    SELECT ib.id, ib.user_id, ib.receiver_id, ib.message, ib.is_read, ib.created_at,
           u.name as sender_name, u.photo_url as sender_photo
    FROM icebreakers ib
    JOIN users u ON ib.user_id = u.id
    WHERE ib.id = ?
  `, [icebreakerId])
  return icebreakers[0] || null
}
