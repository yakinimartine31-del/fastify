'use strict'

import * as authController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

export default async function (fastify, opts) {
  fastify.post('/auth/register', {
    schema: {
      description: 'Register a new user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' },
          age: { type: 'number' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          gender_preference: { type: 'string', enum: ['male', 'female', 'both', 'none'] },
          bio: { type: 'string' },
          photo_url: { type: 'string' },
          location: { type: 'string' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            age: { type: 'number' },
            gender: { type: 'string' },
            bio: { type: 'string' },
            photo_url: { type: 'string' },
            location: { type: 'string' },
            vip_status: { type: 'string' },
            level: { type: 'number' }
          }
        },
        409: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, handleRoute(fastify, async (request, reply) => {
    const user = await authController.register(fastify, request.body)
    return reply.status(201).send(user)
  }))

  fastify.post('/auth/login', {
    schema: {
      description: 'Login user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            token: { type: 'string' },
            vip_status: { type: 'string' },
            level: { type: 'number' }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, handleRoute(fastify, async (request, reply) => {
    const result = await authController.login(fastify, request.body)
    return reply.send(result)
  }))

  fastify.get('/auth/me', {
    schema: {
      description: 'Get current user profile',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            age: { type: 'number' },
            gender: { type: 'string' },
            gender_preference: { type: 'string', enum: ['male', 'female', 'both', 'none'] },
            bio: { type: 'string' },
            photo_url: { type: 'string' },
            location: { type: 'string' },
            vip_status: { type: 'string' },
            level: { type: 'number' },
            coins: { type: 'number' },
            points: { type: 'number' }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, handleRoute(fastify, async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const user = await authController.me(fastify, request)
    return reply.send(user)
  }))

  fastify.post('/auth/ping', {
    schema: {
      description: 'Update last seen status (online indicator)',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return authController.updateLastSeen(fastify, request)
  }))

  fastify.put('/auth/me', {
    schema: {
      description: 'Update current user profile',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          bio: { type: 'string' },
          photo_url: { type: 'string' },
          location: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            name: { type: 'string' },
            age: { type: 'number' },
            gender: { type: 'string' },
            bio: { type: 'string' },
            photo_url: { type: 'string' },
            location: { type: 'string' }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, handleRoute(fastify, async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const user = await authController.updateMyProfile(fastify, request, request.body)
    return reply.send(user)
  }))
}
