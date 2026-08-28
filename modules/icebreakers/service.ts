import * as icebreakersRepository from './repository.js'
import * as notificationsService from '../notifications/service.js'

export async function sendIcebreaker(mysql, userId: number, receiverId: number, message: string) {
  const icebreakerId = await icebreakersRepository.createIcebreaker(mysql, userId, receiverId, message)
  await notificationsService.sendNotification(mysql, receiverId, userId, 'message',
    'New icebreaker',
    'Someone sent you an icebreaker message',
    { icebreaker_id: icebreakerId, content: message.substring(0, 100) }
  )
  return { icebreakerId, message: 'Icebreaker sent' }
}

export async function getMyIcebreakers(mysql, userId: number) {
  return icebreakersRepository.getMyIcebreakers(mysql, userId)
}

export async function getSentIcebreakers(mysql, userId: number) {
  return icebreakersRepository.getSentIcebreakers(mysql, userId)
}

export async function markAsRead(mysql, icebreakerId: number, userId: number) {
  await icebreakersRepository.markIcebreakerAsRead(mysql, icebreakerId, userId)
  return { message: 'Icebreaker marked as read' }
}

export async function getIcebreaker(mysql, icebreakerId: number) {
  const icebreaker = await icebreakersRepository.getIcebreakerById(mysql, icebreakerId)
  if (!icebreaker) {
    throw new Error('Icebreaker not found')
  }
  return icebreaker
}
