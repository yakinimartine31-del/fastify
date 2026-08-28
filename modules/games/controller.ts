import * as gamesService from './service.js'

export async function getMyLevel(fastify, request) {
  const userId = request.user.id
  return gamesService.getMyLevel(fastify.mysql, userId)
}

export async function gainXp(fastify, request, body) {
  const userId = request.user.id
  const { xp } = body
  if (!xp || xp <= 0) {
    throw new Error('Valid XP amount is required')
  }
  return gamesService.gainXp(fastify.mysql, userId, xp)
}

export async function getTasks(fastify) {
  const type = fastify.query.type as string | undefined
  return gamesService.getTasks(fastify.mysql, type)
}

export async function getMyTasks(fastify, request) {
  const userId = request.user.id
  return gamesService.getMyTasks(fastify.mysql, userId)
}

export async function startTask(fastify, request, body) {
  const userId = request.user.id
  const { task_id } = body
  if (!task_id) {
    throw new Error('Task ID is required')
  }
  return gamesService.startTask(fastify.mysql, userId, task_id)
}

export async function updateProgress(fastify, request, body) {
  const userId = request.user.id
  const { task_id, progress } = body
  if (!task_id || progress === undefined) {
    throw new Error('Task ID and progress are required')
  }
  return gamesService.updateTaskProgress(fastify.mysql, userId, task_id, progress)
}

export async function claimReward(fastify, request) {
  const userId = request.user.id
  const { task_id } = request.params
  return gamesService.claimTaskReward(fastify.mysql, userId, parseInt(task_id))
}

export async function getGames(fastify) {
  return gamesService.getAvailableGames(fastify.mysql)
}

export async function createGameSession(fastify, request, body) {
  const userId = request.user.id
  const { game_id } = body
  if (!game_id) {
    throw new Error('Game ID is required')
  }
  const sessionId = await gamesService.startGame(fastify.mysql, game_id, userId)
  return { session_id: sessionId }
}

export async function joinGameSession(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  await gamesService.joinGame(fastify.mysql, parseInt(id), userId)
  return { message: 'Joined game successfully' }
}

export async function getGameSession(fastify, request) {
  const { id } = request.params
  return gamesService.getGameSession(fastify.mysql, parseInt(id))
}

export async function submitScore(fastify, request, body) {
  const userId = request.user.id
  const { id } = request.params
  const { score } = body
  if (score === undefined) {
    throw new Error('Score is required')
  }
  return gamesService.submitGameScore(fastify.mysql, parseInt(id), userId, score)
}

export async function finishGame(fastify, request) {
  const { id } = request.params
  return gamesService.finishGame(fastify.mysql, parseInt(id))
}

export async function getGlobalLeaderboard(fastify, request) {
  const limit = parseInt(request.query.limit as string) || 100
  return gamesService.getGlobalLeaderboard(fastify.mysql, limit)
}

export async function getGameLeaderboard(fastify, request) {
  const { id } = request.params
  const limit = parseInt(request.query.limit as string) || 100
  return gamesService.getGameLeaderboard(fastify.mysql, parseInt(id), limit)
}

export async function getMyBadges(fastify, request) {
  const userId = request.user.id
  return gamesService.getMyBadges(fastify.mysql, userId)
}

export async function checkBadges(fastify, request) {
  const userId = request.user.id
  const badges = await gamesService.checkAndAwardBadges(fastify.mysql, userId)
  return { badges, message: 'Badge check completed' }
}
