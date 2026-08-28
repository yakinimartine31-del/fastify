'use strict'

import * as feedController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

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

const commentSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    post_id: { type: 'number' },
    user_id: { type: 'number' },
    user_name: { type: 'string' },
    user_photo: { type: 'string' },
    content: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const contestSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    start_date: { type: 'string', format: 'date-time' },
    end_date: { type: 'string', format: 'date-time' },
    winner_id: { type: 'number' },
    status: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.get('/feed', {
    schema: {
      description: 'Get community feed',
      tags: ['feed'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          offset: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: postSchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return feedController.getFeed(fastify, request)
  }))

  fastify.post('/feed', {
    schema: {
      description: 'Create a new post',
      tags: ['feed'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string' },
          media_urls: { type: 'array', items: { type: 'string' } },
          type: { type: 'string', enum: ['text', 'photo', 'video'] }
        }
      },
      response: {
        200: { type: 'object', properties: { postId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return feedController.createFeedPost(fastify, request, request.body)
  }))

  fastify.get('/feed/:id', {
    schema: {
      description: 'Get a specific post',
      tags: ['feed'],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: postSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return feedController.getPostById(fastify, request)
  }))

  fastify.put('/feed/:id', {
    schema: {
      description: 'Update my post',
      tags: ['feed'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          media_urls: { type: 'array', items: { type: 'string' } },
          type: { type: 'string', enum: ['text', 'photo', 'video'] }
        }
      },
      response: {
        200: postSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return feedController.updateFeedPost(fastify, request)
  }))

  fastify.delete('/feed/:id', {
    schema: {
      description: 'Delete my post',
      tags: ['feed'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return feedController.deleteFeedPost(fastify, request)
  }))

  fastify.post('/feed/:id/like', {
    schema: {
      description: 'Like or unlike a post',
      tags: ['feed'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { liked: { type: 'boolean' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return feedController.likeFeedPost(fastify, request)
  }))

  fastify.get('/feed/:id/comments', {
    schema: {
      description: 'Get comments on a post',
      tags: ['feed'],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          offset: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: commentSchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return feedController.getPostComments(fastify, request)
  }))

  fastify.post('/feed/:id/comments', {
    schema: {
      description: 'Add a comment to a post',
      tags: ['feed'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { commentId: { type: 'number' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return feedController.addPostComment(fastify, request, request.body)
  }))

  fastify.delete('/feed/comments/:id', {
    schema: {
      description: 'Delete a comment',
      tags: ['feed'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return feedController.deletePostComment(fastify, request)
  }))

  fastify.post('/feed/:id/vote', {
    schema: {
      description: 'Vote for a post in a contest',
      tags: ['feed'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['contest_id'],
        properties: {
          contest_id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { voted: { type: 'boolean' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return feedController.voteContestPost(fastify, request, request.body)
  }))

  fastify.get('/contests', {
    schema: {
      description: 'Get active contests',
      tags: ['feed'],
      response: {
        200: { type: 'array', items: contestSchema }
      }
    }
  }, handleRoute(fastify, async () => {
    return feedController.getActiveContests(fastify)
  }))

  fastify.get('/contests/:id/posts', {
    schema: {
      description: 'Get posts in a contest',
      tags: ['feed'],
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
    return feedController.getContestPosts(fastify, request)
  }))
}
