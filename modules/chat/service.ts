import * as chatRepository from './repository.js'

export async function startConversation(mysql, currentUserId: number, otherUserId: number) {
  if (currentUserId === otherUserId) {
    throw new Error('Cannot start conversation with yourself')
  }
  const conversationId = await chatRepository.createConversation(mysql, currentUserId, otherUserId)
  return { conversationId }
}

export async function getMyConversations(mysql, userId: number) {
  return chatRepository.getConversations(mysql, userId)
}

export async function getConversation(mysql, conversationId: number, userId: number) {
  const conversation = await chatRepository.getConversationById(mysql, conversationId, userId)
  if (!conversation) {
    throw new Error('Conversation not found')
  }
  return conversation
}

export async function sendMessageToConversation(mysql, conversationId: number, senderId: number, content: string, type: string = 'text') {
  const result = await chatRepository.sendMessage(mysql, conversationId, senderId, content, type)
  return { messageId: result.messageId, receiverId: result.receiverId }
}

export async function getConversationMessages(mysql, conversationId: number, limit: number = 50, offset: number = 0) {
  return chatRepository.getMessages(mysql, conversationId, limit, offset)
}

export async function markConversationAsRead(mysql, conversationId: number, userId: number) {
  await chatRepository.markMessagesAsRead(mysql, conversationId, userId)
  return { message: 'Messages marked as read' }
}

export async function createGroup(mysql, currentUserId: number, name: string, memberIds: number[]) {
  if (!name || memberIds.length === 0) {
    throw new Error('Group name and at least one member are required')
  }
  const groupId = await chatRepository.createGroupChat(mysql, name, currentUserId, memberIds)
  return { groupId }
}

export async function getMyGroups(mysql, userId: number) {
  return chatRepository.getGroupChats(mysql, userId)
}

export async function sendGroupMessage(mysql, groupId: number, senderId: number, content: string, type: string = 'text') {
  const messageId = await chatRepository.sendGroupMessage(mysql, groupId, senderId, content, type)
  return { messageId }
}

export async function getGroupMessages(mysql, groupId: number, limit: number = 50, offset: number = 0) {
  return chatRepository.getGroupMessages(mysql, groupId, limit, offset)
}

export async function startVoiceCall(mysql, callerId: number, receiverId: number, callType: string = 'voice') {
  if (callerId === receiverId) {
    throw new Error('Cannot call yourself')
  }
  const callId = await chatRepository.initiateVoiceCall(mysql, callerId, receiverId, callType)
  return { callId }
}

export async function updateCallOffer(mysql, callId: number, userId: number, offerSdp: string) {
  await chatRepository.updateCallOffer(mysql, callId, userId, offerSdp)
  return { message: 'Offer sent' }
}

export async function updateCallAnswer(mysql, callId: number, userId: number, answerSdp: string) {
  await chatRepository.updateCallAnswer(mysql, callId, userId, answerSdp)
  return { message: 'Answer sent' }
}

export async function addIceCandidate(mysql, callId: number, userId: number, candidate: any) {
  await chatRepository.addIceCandidate(mysql, callId, userId, candidate)
  return { message: 'ICE candidate added' }
}

export async function endVoiceCall(mysql, callId: number, userId: number, status: string = 'ended') {
  await chatRepository.updateVoiceCallStatus(mysql, callId, status, userId)
  return { message: 'Call ended' }
}

export async function getMyCallHistory(mysql, userId: number) {
  return chatRepository.getCallHistory(mysql, userId)
}
