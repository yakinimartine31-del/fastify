'use strict'

import * as matchesController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const matchSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    other_user_id: { type: 'number' },
    other_user_name: { type: 'string' },
    other_user_photo: { type: 'string' },
    other_vip_status: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/matches/like', {
    schema: {
      description: 'Like or super-like a user',
      tags: ['matches'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['user_id'],
        properties: {
          user_id: { type: 'number' },
          is_super_like: { type: 'boolean' }
        }
      },
      response: {
        200: { type: 'object', properties: { liked: { type: 'boolean' }, matched: { type: 'boolean' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return matchesController.likeUser(fastify, request, request.body)
  }))

  fastify.get('/matches', {
    schema: {
      description: 'Get my matches',
      tags: ['matches'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: matchSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return matchesController.getMatches(fastify, request)
  }))

  fastify.get('/matches/sent-likes', {
    schema: {
      description: 'Get users I liked',
      tags: ['matches'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              user_id: { type: 'number' },
              liked_user_id: { type: 'number' },
              name: { type: 'string' },
              photo_url: { type: 'string' },
              vip_status: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' }
            }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return matchesController.getSentLikes(fastify, request)
  }))

  fastify.get('/matches/received-likes', {
    schema: {
      description: 'Get users who liked me',
      tags: ['matches'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              user_id: { type: 'number' },
              name: { type: 'string' },
              photo_url: { type: 'string' },
              vip_status: { type: 'string' },
              is_super_like: { type: 'boolean' },
              created_at: { type: 'string', format: 'date-time' }
            }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return matchesController.getReceivedLikes(fastify, request)
  }))

  fastify.get('/matches/check/:user_id', {
    schema: {
      description: 'Check if matched with a user',
      tags: ['matches'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { user_id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { matched: { type: 'boolean' }, liked: { type: 'boolean' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return matchesController.checkMatch(fastify, request)
  }))

  fastify.post('/matches/boost', {
    schema: {
      description: 'Boost profile visibility',
      tags: ['matches'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          duration_hours: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' }, expires_at: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return matchesController.boostProfile(fastify, request, request.body)
  }))

  fastify.get('/matches/boost', {
    schema: {
      description: 'Check active profile boost',
      tags: ['matches'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'object', properties: { boost: { type: 'object' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return matchesController.getMyBoost(fastify, request)
  }))
}
