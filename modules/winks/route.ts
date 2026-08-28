'use strict'

import * as winksController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const winkSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    sender_id: { type: 'number' },
    sender_name: { type: 'string' },
    sender_photo: { type: 'string' },
    message: { type: 'string' },
    is_read: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/winks', {
    schema: {
      description: 'Send a wink to a user',
      tags: ['winks'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['receiver_id'],
        properties: {
          receiver_id: { type: 'number' },
          message: { type: 'string', maxLength: 200 }
        }
      },
      response: {
        200: { type: 'object', properties: { winked: { type: 'boolean' }, id: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return winksController.sendWink(fastify, request, request.body)
  }))

  fastify.get('/winks/inbox', {
    schema: {
      description: 'Get winks I received',
      tags: ['winks'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: winkSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return winksController.getReceivedWinks(fastify, request)
  }))

  fastify.get('/winks/sent', {
    schema: {
      description: 'Get winks I sent',
      tags: ['winks'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: winkSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return winksController.getSentWinks(fastify, request)
  }))

  fastify.put('/winks/:id/read', {
    schema: {
      description: 'Mark wink as read',
      tags: ['winks'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return winksController.markWinkAsRead(fastify, request)
  }))

  fastify.get('/winks/:id', {
    schema: {
      description: 'Get wink by ID',
      tags: ['winks'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: winkSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return winksController.getWink(fastify, request)
  }))

  fastify.delete('/winks/:id', {
    schema: {
      description: 'Delete wink',
      tags: ['winks'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return winksController.deleteWink(fastify, request)
  }))
}
