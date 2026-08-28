'use strict'

import * as icebreakersController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const icebreakerSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    user_id: { type: 'number' },
    receiver_id: { type: 'number' },
    message: { type: 'string' },
    is_read: { type: 'boolean' },
    sender_name: { type: 'string' },
    sender_photo: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/icebreakers', {
    schema: {
      description: 'Send an icebreaker message',
      tags: ['icebreakers'],
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
        200: { type: 'object', properties: { icebreakerId: { type: 'number' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return icebreakersController.sendIcebreaker(fastify, request, request.body)
  }))

  fastify.get('/icebreakers/inbox', {
    schema: {
      description: 'Get icebreakers received by me',
      tags: ['icebreakers'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: icebreakerSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return icebreakersController.getMyIcebreakers(fastify, request)
  }))

  fastify.get('/icebreakers/sent', {
    schema: {
      description: 'Get icebreakers I sent',
      tags: ['icebreakers'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: icebreakerSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return icebreakersController.getSentIcebreakers(fastify, request)
  }))

  fastify.put('/icebreakers/:id/read', {
    schema: {
      description: 'Mark icebreaker as read',
      tags: ['icebreakers'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return icebreakersController.markIcebreakerAsRead(fastify, request)
  }))

  fastify.get('/icebreakers/:id', {
    schema: {
      description: 'Get icebreaker by ID',
      tags: ['icebreakers'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: icebreakerSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return icebreakersController.getIcebreakerById(fastify, request)
  }))
}
