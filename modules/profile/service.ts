import * as profileRepository from './repository.js'

export async function getUserProfile(mysql, userId: number) {
  const profile = await profileRepository.getUserProfile(mysql, userId)
  if (!profile) {
    throw new Error('User not found')
  }
  return profile
}

export async function getUserFullProfile(mysql, userId: number) {
  const profile = await profileRepository.getUserProfile(mysql, userId)
  if (!profile) {
    throw new Error('User not found')
  }
  const [stats, interests, prompts, photos, mood] = await Promise.all([
    profileRepository.getUserStats(mysql, userId).catch(() => null),
    profileRepository.getUserInterests(mysql, userId).catch(() => []),
    mysql.query('SELECT id, prompt_text, answer, created_at FROM profile_prompts WHERE user_id = ? ORDER BY created_at DESC', [userId]).catch(() => [[]]),
    mysql.query('SELECT id, photo_url, caption, is_primary, sort_order, created_at FROM photo_albums WHERE user_id = ? ORDER BY sort_order ASC', [userId]).catch(() => [[]]),
    mysql.query('SELECT id, mood, status_text, expires_at, created_at FROM user_moods WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC LIMIT 1', [userId]).catch(() => [[]]),
  ])
  return { ...profile, stats, interests, prompts: prompts[0] || [], photos: photos[0] || [], mood: mood[0] || null }
}

export async function updateUserProfile(mysql, userId: number, data: Record<string, unknown>) {
  const allowedFields = ['name', 'age', 'gender', 'bio', 'photo_url', 'location', 'latitude', 'longitude']
  const updateData: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      updateData[key] = data[key]
    }
  }
  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update')
  }
  const user = await profileRepository.updateUser(mysql, userId, updateData)
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

export async function addInterest(mysql, userId: number, interestTag: string) {
  await profileRepository.addUserInterest(mysql, userId, interestTag.toLowerCase())
  return { message: 'Interest added successfully' }
}

export async function removeInterest(mysql, userId: number, interestTag: string) {
  await profileRepository.removeUserInterest(mysql, userId, interestTag.toLowerCase())
  return { message: 'Interest removed successfully' }
}

export async function getAllInterests(mysql) {
  return profileRepository.getUserInterestsList(mysql)
}

export async function followUser(mysql, followerId: number, followingId: number) {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself')
  }
  await mysql.query('INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, followingId])
  await mysql.query('UPDATE user_stats SET following_count = following_count + 1 WHERE user_id = ?', [followerId])
  await mysql.query('UPDATE user_stats SET followers_count = followers_count + 1 WHERE user_id = ?', [followingId])
  return { message: 'Followed successfully' }
}

export async function unfollowUser(mysql, followerId: number, followingId: number) {
  const [result] = await mysql.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId])
  if (result.affectedRows > 0) {
    await mysql.query('UPDATE user_stats SET following_count = following_count - 1 WHERE user_id = ?', [followerId])
    await mysql.query('UPDATE user_stats SET followers_count = followers_count - 1 WHERE user_id = ?', [followingId])
  }
  return { message: 'Unfollowed successfully' }
}

export async function getFollowers(mysql, userId: number) {
  const [rows] = await mysql.query(`
    SELECT u.id, u.name, u.photo_url, u.vip_status, u.level 
    FROM follows f 
    JOIN users u ON f.follower_id = u.id 
    WHERE f.following_id = ?
    ORDER BY f.created_at DESC
  `, [userId])
  return rows
}

export async function getFollowing(mysql, userId: number) {
  const [rows] = await mysql.query(`
    SELECT u.id, u.name, u.photo_url, u.vip_status, u.level 
    FROM follows f 
    JOIN users u ON f.following_id = u.id 
    WHERE f.follower_id = ?
    ORDER BY f.created_at DESC
  `, [userId])
  return rows
}

export async function recordVisitor(mysql, visitorId: number, visitedId: number) {
  if (visitorId === visitedId) {
    throw new Error('Cannot visit your own profile')
  }
  const [existing] = await mysql.query('SELECT id FROM user_visitors WHERE visitor_id = ? AND visited_id = ?', [visitorId, visitedId])
  if (existing.length === 0) {
    await mysql.query('INSERT INTO user_visitors (visitor_id, visited_id) VALUES (?, ?)', [visitorId, visitedId])
    await mysql.query('UPDATE user_stats SET visitors_count = visitors_count + 1 WHERE user_id = ?', [visitedId])
  }
  return { message: 'Visit recorded' }
}

export async function getVisitors(mysql, userId: number) {
  const [rows] = await mysql.query(`
    SELECT u.id, u.name, u.photo_url, u.vip_status, u.level, v.created_at as visited_at 
    FROM user_visitors v 
    JOIN users u ON v.visitor_id = u.id 
    WHERE v.visited_id = ?
    ORDER BY v.created_at DESC
    LIMIT 50
  `, [userId])
  return rows
}

export async function submitVerification(mysql, userId: number, type: string, documentUrl: string) {
  const [result] = await mysql.query(
    'INSERT INTO verifications (user_id, type, document_url) VALUES (?, ?, ?)',
    [userId, type, documentUrl]
  )
  return { verificationId: result.insertId, status: 'pending' }
}

export async function getVerifications(mysql, userId: number) {
  const [verifications] = await mysql.query('SELECT * FROM verifications WHERE user_id = ? ORDER BY created_at DESC', [userId])
  return verifications
}
