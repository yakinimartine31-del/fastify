import * as anonymousService from './service.js'
import * as genderUtil from '../shared/gender.js'

export async function sendAnonymousMessage(fastify, request, body) {
  const senderId = request.user.id
  const { receiver_id, message } = body
  if (!receiver_id || !message) {
    throw new Error('Receiver ID and message are required')
  }
  const compatible = await genderUtil.isGenderCompatible(fastify.mysql, senderId, receiver_id)
  if (!compatible) {
    throw new Error('You cannot send a message to this user due to gender preferences')
  }
  return anonymousService.sendMessage(fastify.mysql, receiver_id, message)
}

export async function getMyAnonymousMessages(fastify, request) {
  const userId = request.user.id
  return anonymousService.getMessages(fastify.mysql, userId)
}

export async function markAnonymousAsRead(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return anonymousService.markAsRead(fastify.mysql, parseInt(id), userId)
}

export async function getAnonymousMessage(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return anonymousService.getMessage(fastify.mysql, parseInt(id), userId)
}

export async function deleteAnonymousMessage(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return anonymousService.deleteMessage(fastify.mysql, parseInt(id), userId)
}
