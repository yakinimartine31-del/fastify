import * as icebreakersService from './service.js'
import * as genderUtil from '../shared/gender.js'

export async function sendIcebreaker(fastify, request, body) {
  const userId = request.user.id
  const { receiver_id, message } = body
  if (!receiver_id || !message) {
    throw new Error('Receiver ID and message are required')
  }
  const compatible = await genderUtil.isGenderCompatible(fastify.mysql, userId, receiver_id)
  if (!compatible) {
    throw new Error('You cannot send an icebreaker to this user due to gender preferences')
  }
  return icebreakersService.sendIcebreaker(fastify.mysql, userId, receiver_id, message)
}

export async function getMyIcebreakers(fastify, request) {
  const userId = request.user.id
  return icebreakersService.getMyIcebreakers(fastify.mysql, userId)
}

export async function getSentIcebreakers(fastify, request) {
  const userId = request.user.id
  return icebreakersService.getSentIcebreakers(fastify.mysql, userId)
}

export async function markIcebreakerAsRead(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return icebreakersService.markAsRead(fastify.mysql, parseInt(id), userId)
}

export async function getIcebreakerById(fastify, request) {
  const { id } = request.params
  return icebreakersService.getIcebreaker(fastify.mysql, parseInt(id))
}
