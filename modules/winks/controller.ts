import * as winksService from './service.js'
import * as genderUtil from '../shared/gender.js'

export async function sendWink(fastify, request, body) {
  const senderId = request.user.id
  const { receiver_id, message } = body
  if (!receiver_id) {
    throw new Error('Receiver ID is required')
  }
  const compatible = await genderUtil.isGenderCompatible(fastify.mysql, senderId, receiver_id)
  if (!compatible) {
    throw new Error('You cannot wink at this user due to gender preferences')
  }
  return winksService.sendWink(fastify.mysql, senderId, receiver_id, message || '')
}

export async function getReceivedWinks(fastify, request) {
  const userId = request.user.id
  return winksService.getReceivedWinks(fastify.mysql, userId)
}

export async function getSentWinks(fastify, request) {
  const userId = request.user.id
  return winksService.getSentWinks(fastify.mysql, userId)
}

export async function markWinkAsRead(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  await winksService.markAsRead(fastify.mysql, parseInt(id), userId)
  return { message: 'Wink marked as read' }
}

export async function getWink(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return winksService.getWink(fastify.mysql, parseInt(id), userId)
}

export async function deleteWink(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  await winksService.deleteWink(fastify.mysql, parseInt(id), userId)
  return { message: 'Wink deleted' }
}
