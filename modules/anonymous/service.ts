import * as anonymousRepository from './repository.js'

export async function sendMessage(mysql, receiverId: number, message: string) {
  const messageId = await anonymousRepository.sendAnonymousMessage(mysql, receiverId, message)
  return { messageId, message: 'Anonymous message sent' }
}

export async function getMessages(mysql, userId: number, limit: number = 50) {
  return anonymousRepository.getMyAnonymousMessages(mysql, userId, limit)
}

export async function markAsRead(mysql, messageId: number, userId: number) {
  await anonymousRepository.markAnonymousAsRead(mysql, messageId, userId)
  return { message: 'Message marked as read' }
}

export async function getMessage(mysql, messageId: number, userId: number) {
  const msg = await anonymousRepository.getAnonymousMessage(mysql, messageId, userId)
  if (!msg) {
    throw new Error('Anonymous message not found')
  }
  return msg
}

export async function deleteMessage(mysql, messageId: number, userId: number) {
  await anonymousRepository.deleteAnonymousMessage(mysql, messageId, userId)
  return { message: 'Anonymous message deleted' }
}
