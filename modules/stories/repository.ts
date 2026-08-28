export async function createStory(mysql, userId: number, mediaUrl: string, mediaType: string, caption: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const [result] = await mysql.query(
    'INSERT INTO stories (user_id, media_url, media_type, caption, expires_at) VALUES (?, ?, ?, ?, ?)',
    [userId, mediaUrl, mediaType, caption || null, expiresAt]
  )
  return result.insertId
}

export async function getActiveStories(mysql, userId: number, limit: number = 20) {
  const [stories] = await mysql.query(`
    SELECT s.id, s.user_id, s.media_url, s.media_type, s.caption, s.created_at,
           u.name as user_name, u.photo_url as user_photo
    FROM stories s
    JOIN users u ON s.user_id = u.id
    WHERE s.expires_at > NOW()
      AND s.user_id != ?
    ORDER BY s.created_at DESC
    LIMIT ?
  `, [userId, limit])
  return stories
}

export async function getMyStories(mysql, userId: number) {
  const [stories] = await mysql.query(`
    SELECT id, media_url, media_type, caption, created_at, expires_at
    FROM stories
    WHERE user_id = ? AND expires_at > NOW()
    ORDER BY created_at DESC
  `, [userId])
  return stories
}

export async function deleteStory(mysql, storyId: number, userId: number) {
  await mysql.query('DELETE FROM stories WHERE id = ? AND user_id = ?', [storyId, userId])
  return true
}

export async function getStoryById(mysql, storyId: number) {
  const [stories] = await mysql.query(`
    SELECT s.id, s.user_id, s.media_url, s.media_type, s.caption, s.created_at,
           u.name as user_name, u.photo_url as user_photo
    FROM stories s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > NOW()
  `, [storyId])
  return stories[0] || null
}
