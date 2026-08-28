'use strict'

import * as albumsController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const photoSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    photo_url: { type: 'string' },
    caption: { type: 'string' },
    is_primary: { type: 'boolean' },
    sort_order: { type: 'number' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/albums', {
    schema: {
      description: 'Add photo to my album',
      tags: ['albums'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['photo_url'],
        properties: {
          photo_url: { type: 'string' },
          caption: { type: 'string' },
          is_primary: { type: 'boolean' }
        }
      },
      response: {
        200: { type: 'object', properties: { photoId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return albumsController.addPhoto(fastify, request, request.body)
  }))

  fastify.get('/albums/me', {
    schema: {
      description: 'Get my photo album',
      tags: ['albums'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: photoSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return albumsController.getMyPhotos(fastify, request)
  }))

  fastify.get('/albums/user/:id', {
    schema: {
      description: 'Get user photo album',
      tags: ['albums'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'array', items: photoSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return albumsController.getUserPhotos(fastify, request)
  }))

  fastify.put('/albums/:id', {
    schema: {
      description: 'Update photo',
      tags: ['albums'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        properties: {
          caption: { type: 'string' },
          is_primary: { type: 'boolean' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return albumsController.updatePhoto(fastify, request)
  }))

  fastify.delete('/albums/:id', {
    schema: {
      description: 'Delete photo',
      tags: ['albums'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return albumsController.deletePhoto(fastify, request)
  }))

  fastify.put('/albums/:id/primary', {
    schema: {
      description: 'Set photo as primary',
      tags: ['albums'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return albumsController.setPrimaryPhoto(fastify, request)
  }))
}
