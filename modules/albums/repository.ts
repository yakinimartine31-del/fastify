export async function addPhoto(mysql, userId: number, photoUrl: string, caption: string, isPrimary: boolean = false) {
  if (isPrimary) {
    await mysql.query('UPDATE photo_albums SET is_primary = FALSE WHERE user_id = ?', [userId])
  }
  const [maxOrder] = await mysql.query('SELECT MAX(sort_order) as max_order FROM photo_albums WHERE user_id = ?', [userId])
  const nextOrder = (maxOrder[0]?.max_order || 0) + 1
  const [result] = await mysql.query(
    'INSERT INTO photo_albums (user_id, photo_url, caption, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
    [userId, photoUrl, caption || null, isPrimary, nextOrder]
  )
  return result.insertId
}

export async function getUserPhotos(mysql, userId: number) {
  const [photos] = await mysql.query(
    'SELECT id, photo_url, caption, is_primary, sort_order, created_at FROM photo_albums WHERE user_id = ? ORDER BY sort_order ASC',
    [userId]
  )
  return photos
}

export async function getPhotoById(mysql, photoId: number) {
  const [photos] = await mysql.query('SELECT * FROM photo_albums WHERE id = ?', [photoId])
  return photos[0] || null
}

export async function updatePhoto(mysql, photoId: number, userId: number, caption: string, isPrimary: boolean) {
  if (isPrimary) {
    await mysql.query('UPDATE photo_albums SET is_primary = FALSE WHERE user_id = ?', [userId])
  }
  await mysql.query(
    'UPDATE photo_albums SET caption = ?, is_primary = ? WHERE id = ? AND user_id = ?',
    [caption, isPrimary, photoId, userId]
  )
  return true
}

export async function deletePhoto(mysql, photoId: number, userId: number) {
  await mysql.query('DELETE FROM photo_albums WHERE id = ? AND user_id = ?', [photoId, userId])
  return true
}

export async function setPrimaryPhoto(mysql, photoId: number, userId: number) {
  await mysql.query('UPDATE photo_albums SET is_primary = FALSE WHERE user_id = ?', [userId])
  await mysql.query('UPDATE photo_albums SET is_primary = TRUE WHERE id = ? AND user_id = ?', [photoId, userId])
  return true
}
