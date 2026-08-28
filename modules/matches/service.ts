import * as matchesRepository from './repository.js'
import * as notificationsService from '../notifications/service.js'

export async function sendLike(mysql, userId: number, targetUserId: number, isSuperLike: boolean = false) {
  const result = await matchesRepository.likeUser(mysql, userId, targetUserId, isSuperLike)
  if (result.matched) {
    await notificationsService.sendNotification(mysql, targetUserId, userId, 'match',
      'You have a new match!',
      'You matched with someone! Start chatting now.',
      { match_user_id: userId }
    )
  }
  return result
}

export async function getMatches(mysql, userId: number, limit: number = 50) {
  return matchesRepository.getMatches(mysql, userId, limit)
}

export async function getSentLikes(mysql, userId: number) {
  return matchesRepository.getMyLikes(mysql, userId)
}

export async function getReceivedLikes(mysql, userId: number) {
  return matchesRepository.getWhoLikedMe(mysql, userId)
}

export async function checkIfMatched(mysql, userId: number, otherUserId: number) {
  const [result] = await mysql.query('SELECT id FROM matches WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)) AND is_active = TRUE', [userId, otherUserId, otherUserId, userId])
  return result.length > 0
}

export async function checkIfLiked(mysql, userId: number, otherUserId: number) {
  return matchesRepository.isLikedBy(mysql, userId, otherUserId)
}

export async function boostProfile(mysql, userId: number, durationHours: number = 24) {
  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)
  await mysql.query('INSERT INTO profile_boosts (user_id, expires_at) VALUES (?, ?)', [userId, expiresAt])
  return { message: `Profile boosted for ${durationHours} hours`, expires_at: expiresAt.toISOString() }
}

export async function getActiveBoost(mysql, userId: number) {
  const [result] = await mysql.query('SELECT id, expires_at FROM profile_boosts WHERE user_id = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1', [userId])
  return result[0] || null
}
