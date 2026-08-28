import * as notificationsService from './service.js'

export async function getNotifications(fastify, request, query: any) {
  const userId = request.user.id
  const limit = parseInt(query.limit as string) || 50
  const offset = parseInt(query.offset as string) || 0
  return notificationsService.getUserNotifications(fastify.mysql, userId, limit, offset)
}

export async function getUnreadCount(fastify, request) {
  const userId = request.user.id
  return notificationsService.getUnreadNotificationsCount(fastify.mysql, userId)
}

export async function markAsRead(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return notificationsService.markNotificationAsRead(fastify.mysql, parseInt(id), userId)
}

export async function markAllAsRead(fastify, request) {
  const userId = request.user.id
  return notificationsService.markAllNotificationsAsRead(fastify.mysql, userId)
}

export async function deleteNotification(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return notificationsService.removeNotification(fastify.mysql, parseInt(id), userId)
}
