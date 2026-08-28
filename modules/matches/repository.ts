export async function likeUser(mysql, userId: number, likedUserId: number, isSuperLike: boolean = false) {
  const [existing] = await mysql.query('SELECT id FROM user_likes WHERE user_id = ? AND liked_user_id = ?', [userId, likedUserId])
  if (existing.length > 0) {
    await mysql.query('DELETE FROM user_likes WHERE user_id = ? AND liked_user_id = ?', [userId, likedUserId])
    const [existingMatch] = await mysql.query('SELECT id FROM matches WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)) AND is_active = TRUE', [userId, likedUserId, likedUserId, userId])
    if (existingMatch.length > 0) {
      await mysql.query('UPDATE matches SET is_active = FALSE WHERE id = ?', [existingMatch[0].id])
    }
    return { liked: false, matched: false }
  }
  await mysql.query('INSERT INTO user_likes (user_id, liked_user_id, is_super_like) VALUES (?, ?, ?)', [userId, likedUserId, isSuperLike])
  const [reverseLike] = await mysql.query('SELECT id FROM user_likes WHERE user_id = ? AND liked_user_id = ?', [likedUserId, userId])
  if (reverseLike.length > 0) {
    const user1 = Math.min(userId, likedUserId)
    const user2 = Math.max(userId, likedUserId)
    await mysql.query('INSERT IGNORE INTO matches (user1_id, user2_id) VALUES (?, ?)', [user1, user2])
    return { liked: true, matched: true }
  }
  return { liked: true, matched: false }
}

export async function getMatches(mysql, userId: number, limit: number = 50) {
  const [matches] = await mysql.query(`
    SELECT m.id, m.created_at,
           CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END as other_user_id,
           u.name as other_user_name, u.photo_url as other_user_photo, u.vip_status as other_vip_status
    FROM matches m
    JOIN users u ON (CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END) = u.id
    WHERE (m.user1_id = ? OR m.user2_id = ?) AND m.is_active = TRUE
    ORDER BY m.created_at DESC
    LIMIT ?
  `, [userId, userId, userId, userId, limit])
  return matches
}

export async function getMyLikes(mysql, userId: number) {
  const [likes] = await mysql.query(`
    SELECT ul.id, ul.created_at, u.id as liked_user_id, u.name, u.photo_url, u.vip_status
    FROM user_likes ul
    JOIN users u ON ul.liked_user_id = u.id
    WHERE ul.user_id = ?
    ORDER BY ul.created_at DESC
  `, [userId])
  return likes
}

export async function getWhoLikedMe(mysql, userId: number) {
  const [likes] = await mysql.query(`
    SELECT ul.id, ul.created_at, u.id as user_id, u.name, u.photo_url, u.vip_status, ul.is_super_like
    FROM user_likes ul
    JOIN users u ON ul.user_id = u.id
    WHERE ul.liked_user_id = ?
    ORDER BY ul.created_at DESC
  `, [userId])
  return likes
}

export async function isLikedBy(mysql, userId: number, otherUserId: number) {
  const [result] = await mysql.query('SELECT id FROM user_likes WHERE user_id = ? AND liked_user_id = ?', [otherUserId, userId])
  return result.length > 0
}
