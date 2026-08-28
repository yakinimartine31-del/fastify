export async function setMood(mysql, userId: number, mood: string, statusText: string, expiresHours: number = 24) {
  const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000)
  const [existing] = await mysql.query('SELECT id FROM user_moods WHERE user_id = ?', [userId])
  if (existing.length > 0) {
    await mysql.query(
      'UPDATE user_moods SET mood = ?, status_text = ?, expires_at = ? WHERE user_id = ?',
      [mood, statusText || null, expiresAt, userId]
    )
    return { id: existing[0].id }
  }
  const [result] = await mysql.query(
    'INSERT INTO user_moods (user_id, mood, status_text, expires_at) VALUES (?, ?, ?, ?)',
    [userId, mood, statusText || null, expiresAt]
  )
  return { id: result.insertId }
}

export async function getMyMood(mysql, userId: number) {
  const [moods] = await mysql.query(
    'SELECT id, mood, status_text, expires_at, created_at FROM user_moods WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC LIMIT 1',
    [userId]
  )
  return moods[0] || null
}

export async function getUserMood(mysql, userId: number) {
  const [moods] = await mysql.query(
    'SELECT id, mood, status_text, expires_at, created_at FROM user_moods WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC LIMIT 1',
    [userId]
  )
  return moods[0] || null
}

export async function getActiveMoods(mysql, limit: number = 50) {
  const [moods] = await mysql.query(`
    SELECT um.id, um.user_id, um.mood, um.status_text, um.created_at,
           u.name, u.photo_url, u.age, u.location
    FROM user_moods um
    JOIN users u ON um.user_id = u.id
    WHERE um.expires_at > NOW() OR um.expires_at IS NULL
    ORDER BY um.created_at DESC
    LIMIT ?
  `, [limit])
  return moods
}

export async function deleteMood(mysql, moodId: number, userId: number) {
  await mysql.query('DELETE FROM user_moods WHERE id = ? AND user_id = ?', [moodId, userId])
  return true
}
