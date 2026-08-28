import * as matchesService from './service.js'
import * as genderUtil from '../shared/gender.js'

export async function likeUser(fastify, request, body) {
  const userId = request.user.id
  const { user_id, is_super_like } = body
  if (!user_id) {
    throw new Error('User ID is required')
  }
  const compatible = await genderUtil.isGenderCompatible(fastify.mysql, userId, user_id)
  if (!compatible) {
    throw new Error('You cannot like this user due to gender preferences')
  }
  return matchesService.sendLike(fastify.mysql, userId, user_id, is_super_like || false)
}

export async function getMatches(fastify, request) {
  const userId = request.user.id
  return matchesService.getMatches(fastify.mysql, userId)
}

export async function getSentLikes(fastify, request) {
  const userId = request.user.id
  return matchesService.getSentLikes(fastify.mysql, userId)
}

export async function getReceivedLikes(fastify, request) {
  const userId = request.user.id
  return matchesService.getReceivedLikes(fastify.mysql, userId)
}

export async function checkMatch(fastify, request) {
  const userId = request.user.id
  const { user_id } = request.params
  const matched = await matchesService.checkIfMatched(fastify.mysql, userId, parseInt(user_id))
  const liked = await matchesService.checkIfLiked(fastify.mysql, userId, parseInt(user_id))
  return { matched, liked }
}

export async function boostProfile(fastify, request, body) {
  const userId = request.user.id
  const { duration_hours } = body
  return matchesService.boostProfile(fastify.mysql, userId, duration_hours || 24)
}

export async function getMyBoost(fastify, request) {
  const userId = request.user.id
  const boost = await matchesService.getActiveBoost(fastify.mysql, userId)
  return { boost }
}
