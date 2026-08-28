import * as moodsService from './service.js'

export async function setMood(fastify, request, body) {
  const userId = request.user.id
  const { mood, status_text, expires_hours } = body
  if (!mood) {
    throw new Error('Mood is required')
  }
  return moodsService.setMood(fastify.mysql, userId, mood, status_text || '', expires_hours || 24)
}

export async function getMyMood(fastify, request) {
  const userId = request.user.id
  return moodsService.getMyMood(fastify.mysql, userId)
}

export async function getUserMood(fastify, request) {
  const { id } = request.params
  return moodsService.getUserMood(fastify.mysql, parseInt(id))
}

export async function getActiveMoods(fastify, request) {
  return moodsService.getActiveMoods(fastify.mysql)
}

export async function deleteMood(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  await moodsService.deleteMood(fastify.mysql, parseInt(id), userId)
  return { message: 'Mood removed' }
}
