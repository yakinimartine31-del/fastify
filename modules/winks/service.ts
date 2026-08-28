import * as winksRepository from './repository.js'
import * as notificationsService from '../notifications/service.js'

export async function sendWink(mysql, senderId: number, receiverId: number, message: string) {
  const result = await winksRepository.sendWink(mysql, senderId, receiverId, message)
  if (result.winked) {
    await notificationsService.sendNotification(mysql, receiverId, senderId, 'like',
      'You got a wink!',
      'Someone winked at you',
      { wink_id: result.id, message: message?.substring(0, 100) }
    )
  }
  return result
}

export async function getReceivedWinks(mysql, userId: number, limit: number = 50) {
  return winksRepository.getReceivedWinks(mysql, userId, limit)
}

export async function getSentWinks(mysql, userId: number, limit: number = 50) {
  return winksRepository.getSentWinks(mysql, userId, limit)
}

export async function markAsRead(mysql, winkId: number, userId: number) {
  await winksRepository.markWinkAsRead(mysql, winkId, userId)
  return { message: 'Wink marked as read' }
}

export async function getWink(mysql, winkId: number, userId: number) {
  const wink = await winksRepository.getWinkById(mysql, winkId, userId)
  if (!wink) {
    throw new Error('Wink not found')
  }
  return wink
}

export async function deleteWink(mysql, winkId: number, userId: number) {
  await winksRepository.deleteWink(mysql, winkId, userId)
  return { message: 'Wink deleted' }
}
