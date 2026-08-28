'use strict'

import * as promptsController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const promptSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    prompt_text: { type: 'string' },
    answer: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/prompts', {
    schema: {
      description: 'Add a profile prompt',
      tags: ['prompts'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['prompt_text', 'answer'],
        properties: {
          prompt_text: { type: 'string' },
          answer: { type: 'string', maxLength: 500 }
        }
      },
      response: {
        200: { type: 'object', properties: { promptId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return promptsController.addPrompt(fastify, request, request.body)
  }))

  fastify.get('/prompts/me', {
    schema: {
      description: 'Get my profile prompts',
      tags: ['prompts'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: promptSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return promptsController.getMyPrompts(fastify, request)
  }))

  fastify.get('/prompts/user/:id', {
    schema: {
      description: 'Get user profile prompts',
      tags: ['prompts'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'array', items: promptSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return promptsController.getUserPrompts(fastify, request)
  }))

  fastify.put('/prompts/:id', {
    schema: {
      description: 'Update a profile prompt',
      tags: ['prompts'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['prompt_text', 'answer'],
        properties: {
          prompt_text: { type: 'string' },
          answer: { type: 'string', maxLength: 500 }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return promptsController.updatePrompt(fastify, request)
  }))

  fastify.delete('/prompts/:id', {
    schema: {
      description: 'Delete a profile prompt',
      tags: ['prompts'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return promptsController.deletePrompt(fastify, request)
  }))
}
