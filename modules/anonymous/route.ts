'use strict'

import * as anonymousController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const anonymousMessageSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    message: { type: 'string' },
    is_read: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/anonymous', {
    schema: {
      description: 'Send an anonymous message to a user',
      tags: ['anonymous'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['receiver_id', 'message'],
        properties: {
          receiver_id: { type: 'number' },
          message: { type: 'string', maxLength: 500 }
        }
      },
      response: {
        200: { type: 'object', properties: { messageId: { type: 'number' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return anonymousController.sendAnonymousMessage(fastify, request, request.body)
  }))

  fastify.get('/anonymous', {
    schema: {
      description: 'Get my anonymous messages',
      tags: ['anonymous'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: anonymousMessageSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return anonymousController.getMyAnonymousMessages(fastify, request)
  }))

  fastify.put('/anonymous/:id/read', {
    schema: {
      description: 'Mark anonymous message as read',
      tags: ['anonymous'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return anonymousController.markAnonymousAsRead(fastify, request)
  }))

  fastify.get('/anonymous/:id', {
    schema: {
      description: 'Get anonymous message by ID',
      tags: ['anonymous'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: anonymousMessageSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return anonymousController.getAnonymousMessage(fastify, request)
  }))

  fastify.delete('/anonymous/:id', {
    schema: {
      description: 'Delete anonymous message',
      tags: ['anonymous'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return anonymousController.deleteAnonymousMessage(fastify, request)
  }))
}
