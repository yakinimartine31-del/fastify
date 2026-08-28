'use strict'

import * as storiesController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const storySchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    user_id: { type: 'number' },
    user_name: { type: 'string' },
    user_photo: { type: 'string' },
    media_url: { type: 'string' },
    media_type: { type: 'string', enum: ['image', 'video'] },
    caption: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/stories', {
    schema: {
      description: 'Create a new story (expires in 24h)',
      tags: ['stories'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['media_url'],
        properties: {
          media_url: { type: 'string' },
          media_type: { type: 'string', enum: ['image', 'video'] },
          caption: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { storyId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return storiesController.createStory(fastify, request, request.body)
  }))

  fastify.get('/stories', {
    schema: {
      description: 'Get active stories from other users',
      tags: ['stories'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: storySchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return storiesController.getStories(fastify, request)
  }))

  fastify.get('/stories/my', {
    schema: {
      description: 'Get my active stories',
      tags: ['stories'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              media_url: { type: 'string' },
              media_type: { type: 'string' },
              caption: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              expires_at: { type: 'string', format: 'date-time' }
            }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return storiesController.getMyStories(fastify, request)
  }))

  fastify.delete('/stories/:id', {
    schema: {
      description: 'Delete my story',
      tags: ['stories'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return storiesController.deleteStory(fastify, request)
  }))

  fastify.get('/stories/:id', {
    schema: {
      description: 'Get story by ID',
      tags: ['stories'],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: storySchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return storiesController.getStoryById(fastify, request)
  }))
}
