'use strict'

import * as moodsController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const moodSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    user_id: { type: 'number' },
    mood: { type: 'string', enum: ['happy', 'excited', 'adventurous', 'romantic', 'chill', 'bored', 'flirty', 'curious'] },
    status_text: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const activeMoodSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    user_id: { type: 'number' },
    name: { type: 'string' },
    photo_url: { type: 'string' },
    age: { type: 'number' },
    location: { type: 'string' },
    mood: { type: 'string' },
    status_text: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/moods', {
    schema: {
      description: 'Set my current mood',
      tags: ['moods'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['mood'],
        properties: {
          mood: { type: 'string', enum: ['happy', 'excited', 'adventurous', 'romantic', 'chill', 'bored', 'flirty', 'curious'] },
          status_text: { type: 'string', maxLength: 255 },
          expires_hours: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { id: { type: 'number' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return moodsController.setMood(fastify, request, request.body)
  }))

  fastify.get('/moods/me', {
    schema: {
      description: 'Get my current mood',
      tags: ['moods'],
      security: [{ bearerAuth: [] }],
      response: {
        200: moodSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return moodsController.getMyMood(fastify, request)
  }))

  fastify.get('/moods/user/:id', {
    schema: {
      description: 'Get user mood',
      tags: ['moods'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: moodSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return moodsController.getUserMood(fastify, request)
  }))

  fastify.get('/moods/active', {
    schema: {
      description: 'Get users with active moods',
      tags: ['moods'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: activeMoodSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return moodsController.getActiveMoods(fastify, request)
  }))

  fastify.delete('/moods/:id', {
    schema: {
      description: 'Remove my mood',
      tags: ['moods'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return moodsController.deleteMood(fastify, request)
  }))
}
