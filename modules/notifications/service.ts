import * as notificationsRepository from './repository.js'

export async function sendNotification(mysql, userId: number, actorId: number, type: string, title: string, body: string, data: any) {
  const notificationId = await notificationsRepository.createNotification(mysql, userId, actorId, type, title, body, data)
  return { notificationId }
}

export async function getUserNotifications(mysql, userId: number, limit: number = 50, offset: number = 0) {
  return notificationsRepository.getNotifications(mysql, userId, limit, offset)
}

export async function getUnreadNotificationsCount(mysql, userId: number) {
  return notificationsRepository.getUnreadCount(mysql, userId)
}

export async function markNotificationAsRead(mysql, notificationId: number, userId: number) {
  await notificationsRepository.markAsRead(mysql, notificationId, userId)
  return { message: 'Notification marked as read' }
}

export async function markAllNotificationsAsRead(mysql, userId: number) {
  await notificationsRepository.markAllAsRead(mysql, userId)
  return { message: 'All notifications marked as read' }
}

export async function removeNotification(mysql, notificationId: number, userId: number) {
  await notificationsRepository.deleteNotification(mysql, notificationId, userId)
  return { message: 'Notification deleted' }
}
