import * as chatService from './service.js'
import * as genderUtil from '../shared/gender.js'

export async function createConversation(fastify, request, body) {
  const currentUserId = request.user.id
  const { user_id } = body
  if (!user_id) {
    throw new Error('User ID is required')
  }
  if (user_id === currentUserId) {
    throw new Error('Cannot start conversation with yourself')
  }
  const compatible = await genderUtil.isGenderCompatible(fastify.mysql, currentUserId, user_id)
  if (!compatible) {
    throw new Error('You cannot start a conversation with this user due to gender preferences')
  }
  return chatService.startConversation(fastify.mysql, currentUserId, user_id)
}

export async function getConversations(fastify, request) {
  const userId = request.user.id
  return chatService.getMyConversations(fastify.mysql, userId)
}

export async function getConversationMessages(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return chatService.getConversationMessages(fastify.mysql, parseInt(id))
}

export async function sendMessage(fastify, request, body) {
  const senderId = request.user.id
  const { conversation_id, content, type } = body
  if (!conversation_id || !content) {
    throw new Error('Conversation ID and content are required')
  }
  const result = await chatService.sendMessageToConversation(fastify.mysql, conversation_id, senderId, content, type)
  if (result.receiverId && result.receiverId !== senderId) {
    try {
      const [actor] = await fastify.mysql.query('SELECT name FROM users WHERE id = ?', [senderId])
      const actorName = actor[0]?.name || 'Someone'
      const notificationsModule = await import('../notifications/service.js')
      await notificationsModule.sendNotification(
        fastify.mysql, result.receiverId, senderId, 'message',
        'New message',
        `${actorName} sent you a message`,
        { conversation_id, message_id: result.messageId, content: content.substring(0, 100) }
      )
    } catch (e) {}
  }
  return { messageId: result.messageId }
}

export async function markAsRead(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return chatService.markConversationAsRead(fastify.mysql, parseInt(id), userId)
}

export async function createGroup(fastify, request, body) {
  const currentUserId = request.user.id
  const { name, member_ids } = body
  return chatService.createGroup(fastify.mysql, currentUserId, name, member_ids)
}

export async function getGroups(fastify, request) {
  const userId = request.user.id
  return chatService.getMyGroups(fastify.mysql, userId)
}

export async function sendGroupMessage(fastify, request, body) {
  const senderId = request.user.id
  const { group_id, content, type } = body
  if (!group_id || !content) {
    throw new Error('Group ID and content are required')
  }
  return chatService.sendGroupMessage(fastify.mysql, group_id, senderId, content, type)
}

export async function getGroupMessages(fastify, request) {
  const { id } = request.params
  const limit = parseInt(request.query.limit as string) || 50
  const offset = parseInt(request.query.offset as string) || 0
  return chatService.getGroupMessages(fastify.mysql, parseInt(id), limit, offset)
}

export async function initiateCall(fastify, request, body) {
  const callerId = request.user.id
  const { receiver_id, call_type } = body
  if (!receiver_id) {
    throw new Error('Receiver ID is required')
  }
  return chatService.startVoiceCall(fastify.mysql, callerId, receiver_id, call_type)
}

export async function sendCallOffer(fastify, request, body) {
  const userId = request.user.id
  const { id } = request.params
  const { offer_sdp } = body
  if (!offer_sdp) {
    throw new Error('Offer SDP is required')
  }
  return chatService.updateCallOffer(fastify.mysql, parseInt(id), userId, offer_sdp)
}

export async function sendCallAnswer(fastify, request, body) {
  const userId = request.user.id
  const { id } = request.params
  const { answer_sdp } = body
  if (!answer_sdp) {
    throw new Error('Answer SDP is required')
  }
  return chatService.updateCallAnswer(fastify.mysql, parseInt(id), userId, answer_sdp)
}

export async function sendIceCandidate(fastify, request, body) {
  const userId = request.user.id
  const { id } = request.params
  const { candidate } = body
  if (!candidate) {
    throw new Error('ICE candidate is required')
  }
  return chatService.addIceCandidate(fastify.mysql, parseInt(id), userId, candidate)
}

export async function endCall(fastify, request) {
  const { id } = request.params
  return chatService.endVoiceCall(fastify.mysql, parseInt(id), request.user.id)
}

export async function getCallHistory(fastify, request) {
  const userId = request.user.id
  return chatService.getMyCallHistory(fastify.mysql, userId)
}
