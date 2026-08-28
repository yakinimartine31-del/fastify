'use strict'

import * as discoverController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const userCardSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    age: { type: 'number' },
    gender: { type: 'string' },
    bio: { type: 'string' },
    photo_url: { type: 'string' },
    location: { type: 'string' },
    vip_status: { type: 'string' },
    level: { type: 'number' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const nearbyUserSchema = {
  type: 'object',
  properties: {
    ...userCardSchema.properties,
    distance: { type: 'number' }
  }
}

const postSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    user_id: { type: 'number' },
    user_name: { type: 'string' },
    user_photo: { type: 'string' },
    content: { type: 'string' },
    media_urls: { type: 'array', items: { type: 'string' } },
    type: { type: 'string' },
    likes_count: { type: 'number' },
    comments_count: { type: 'number' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.get('/discover/recommendations', {
    schema: {
      description: 'Get recommended users based on interests',
      tags: ['discover'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: userCardSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return discoverController.getRecommendations(fastify, request)
  }))

  fastify.get('/discover/nearby', {
    schema: {
      description: 'Get nearby users based on GPS location',
      tags: ['discover'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          radius: { type: 'number' },
          limit: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: nearbyUserSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        400: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return discoverController.getNearby(fastify, request)
  }))

  fastify.get('/discover/hot', {
    schema: {
      description: 'Get hot/popular users',
      tags: ['discover'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: userCardSchema }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return discoverController.getHotUsers(fastify, request)
  }))

  fastify.get('/discover/newcomers', {
    schema: {
      description: 'Get newly joined users',
      tags: ['discover'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: userCardSchema }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return discoverController.getNewcomers(fastify, request)
  }))

  fastify.get('/users/:id/posts', {
    schema: {
      description: 'Get posts from a specific user',
      tags: ['discover'],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: postSchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return discoverController.getUserPosts(fastify, request)
  }))
}
