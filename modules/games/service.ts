import * as gamesRepository from './repository.js'

export async function getMyLevel(mysql, userId: number) {
  const level = await gamesRepository.getUserLevel(mysql, userId)
  if (!level) {
    return { level: 1, xp: 0, title: 'Beginner' }
  }
  return level
}

export async function gainXp(mysql, userId: number, xpAmount: number) {
  return gamesRepository.createOrUpdateUserLevel(mysql, userId, xpAmount)
}

export async function getTasks(mysql, type?: string) {
  return gamesRepository.getAvailableTasks(mysql, type)
}

export async function getMyTasks(mysql, userId: number) {
  return gamesRepository.getUserTasks(mysql, userId)
}

export async function startTask(mysql, userId: number, taskId: number) {
  return gamesRepository.startTask(mysql, userId, taskId)
}

export async function updateTaskProgress(mysql, userId: number, taskId: number, progress: number) {
  return gamesRepository.updateTaskProgress(mysql, userId, taskId, progress)
}

export async function claimTaskReward(mysql, userId: number, taskId: number) {
  return gamesRepository.claimTaskReward(mysql, userId, taskId)
}

export async function getAvailableGames(mysql) {
  return gamesRepository.getAvailableGames(mysql)
}

export async function startGame(mysql, gameId: number, hostId: number) {
  return gamesRepository.createGameSession(mysql, gameId, hostId)
}

export async function joinGame(mysql, sessionId: number, userId: number) {
  return gamesRepository.joinGameSession(mysql, sessionId, userId)
}

export async function getGameSession(mysql, sessionId: number) {
  const session = await gamesRepository.getGameSession(mysql, sessionId)
  if (!session) {
    throw new Error('Game session not found')
  }
  return session
}

export async function submitGameScore(mysql, sessionId: number, userId: number, score: number) {
  await gamesRepository.updateGameScore(mysql, sessionId, userId, score)
  await gamesRepository.updateLeaderboard(mysql, userId, null, score)
  const [players] = await mysql.query('SELECT user_id, score FROM game_players WHERE session_id = ? ORDER BY score DESC', [sessionId])
  const rank = players.findIndex((p: any) => p.user_id === userId) + 1
  return { score, rank, total_players: players.length }
}

export async function finishGame(mysql, sessionId: number) {
  await gamesRepository.endGameSession(mysql, sessionId)
  return { message: 'Game ended' }
}

export async function getGlobalLeaderboard(mysql, limit: number = 100) {
  return gamesRepository.getGlobalLeaderboard(mysql, limit)
}

export async function getGameLeaderboard(mysql, gameId: number, limit: number = 100) {
  return gamesRepository.getGameLeaderboard(mysql, gameId, limit)
}

export async function getMyBadges(mysql, userId: number) {
  return gamesRepository.getUserBadges(mysql, userId)
}

export async function checkAndAwardBadges(mysql, userId: number) {
  const badges: any = {}
  const [userLevel] = await mysql.query('SELECT level FROM user_levels WHERE user_id = ?', [userId])
  if (userLevel.length > 0 && userLevel[0].level >= 5) {
    badges.level_5 = { badge_name: 'Level 5', badge_icon: '⭐', description: 'Reached level 5' }
  }
  
  const [postCount] = await mysql.query('SELECT COUNT(*) as count FROM posts WHERE user_id = ?', [userId])
  if (postCount[0].count >= 10) {
    badges.social_butterfly = { badge_name: 'Social Butterfly', badge_icon: '🦋', description: 'Created 10 posts' }
  }
  
  const [followersCount] = await mysql.query('SELECT followers_count FROM user_stats WHERE user_id = ?', [userId])
  if (followersCount.length > 0 && followersCount[0].followers_count >= 100) {
    badges.popular = { badge_name: 'Popular', badge_icon: '🌟', description: 'Reached 100 followers' }
  }
  
  for (const [key, badge] of Object.entries(badges as Record<string, { badge_name: string; badge_icon: string; description: string }>)) {
    await gamesRepository.awardBadge(mysql, userId, badge.badge_name, badge.badge_icon, badge.description)
  }
  
  return badges
}
