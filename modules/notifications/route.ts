'use strict'

import * as notificationsController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const notificationSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    type: { type: 'string', enum: ['like', 'match', 'message', 'comment', 'follow', 'system'] },
    title: { type: 'string' },
    body: { type: 'string' },
    data: { type: 'object' },
    is_read: { type: 'boolean' },
    actor_name: { type: 'string' },
    actor_photo: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.get('/notifications', {
    schema: {
      description: 'Get my notifications',
      tags: ['notifications'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          offset: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: notificationSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return notificationsController.getNotifications(fastify, request, request.query)
  }))

  fastify.get('/notifications/unread-count', {
    schema: {
      description: 'Get unread notifications count',
      tags: ['notifications'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'object', properties: { count: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return notificationsController.getUnreadCount(fastify, request)
  }))

  fastify.put('/notifications/:id/read', {
    schema: {
      description: 'Mark notification as read',
      tags: ['notifications'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return notificationsController.markAsRead(fastify, request)
  }))

  fastify.put('/notifications/read-all', {
    schema: {
      description: 'Mark all notifications as read',
      tags: ['notifications'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return notificationsController.markAllAsRead(fastify, request)
  }))

  fastify.delete('/notifications/:id', {
    schema: {
      description: 'Delete notification',
      tags: ['notifications'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return notificationsController.deleteNotification(fastify, request)
  }))
}
