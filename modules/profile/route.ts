'use strict'

import * as profileController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const profileSchema = {
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

const userStatsSchema = {
  type: 'object',
  properties: {
    followers_count: { type: 'number' },
    following_count: { type: 'number' },
    visitors_count: { type: 'number' },
    posts_count: { type: 'number' }
  }
}

const fullProfileSchema = {
  type: 'object',
  properties: {
    ...profileSchema.properties,
    stats: userStatsSchema,
    interests: { type: 'array', items: { type: 'string' } }
  }
}

export default async function (fastify, opts) {
  fastify.post('/users/me/photo-upload', {
    schema: {
      description: 'Upload my profile photo',
      tags: ['users'],
      security: [{ bearerAuth: [] }]
    },
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const file = await request.file()
    if (!file) return reply.status(400).send({ error: 'Image file is required' })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return reply.status(400).send({ error: 'Only JPEG, PNG, and WEBP images are allowed' })
    }

    const extension = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg'
    const filename = `${crypto.randomUUID()}.${extension}`
    const uploadsDir = path.join(process.cwd(), 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    await writeFile(path.join(uploadsDir, filename), await file.toBuffer())

    const photoUrl = `http://localhost:3000/uploads/${filename}`
    await fastify.mysql.query('UPDATE users SET photo_url = ? WHERE id = ?', [photoUrl, request.user.id])
    return reply.send({ photo_url: photoUrl })
  })

  fastify.get('/users/me/profile', {
    schema: {
      description: 'Get my full profile with stats and interests',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      response: {
        200: fullProfileSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.getMyProfile(fastify, request)
  }))

  fastify.get('/users/:id/profile', {
    schema: {
      description: 'Get user profile by ID',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: fullProfileSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.getUserProfileById(fastify, request)
  }))

  fastify.put('/users/me/profile', {
    schema: {
      description: 'Update my profile',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          gender_preference: { type: 'string', enum: ['male', 'female', 'both', 'none'] },
          bio: { type: 'string' },
          photo_url: { type: 'string' },
          location: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' }
        }
      },
      response: {
        200: profileSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request, reply) => {
    const user = await profileController.updateMyProfile(fastify, request, request.body)
    return reply.send(user)
  }))

  fastify.post('/users/me/interests', {
    schema: {
      description: 'Add interest to my profile',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['interest_tag'],
        properties: {
          interest_tag: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.addMyInterest(fastify, request, request.body)
  }))

  fastify.delete('/users/me/interests', {
    schema: {
      description: 'Remove interest from my profile',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['interest_tag'],
        properties: {
          interest_tag: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.removeMyInterest(fastify, request, request.body)
  }))

  fastify.get('/interests', {
    schema: {
      description: 'Get all available interests',
      tags: ['users'],
      response: {
        200: { type: 'array', items: { type: 'string' } }
      }
    }
  }, handleRoute(fastify, async () => {
    return profileController.getAllInterests(fastify)
  }))

  fastify.post('/users/:id/follow', {
    schema: {
      description: 'Follow a user',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['user_id'],
        properties: {
          user_id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.followUser(fastify, request, request.body)
  }))

  fastify.delete('/users/:id/follow', {
    schema: {
      description: 'Unfollow a user',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['user_id'],
        properties: {
          user_id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.unfollowUser(fastify, request, request.body)
  }))

  fastify.get('/users/me/followers', {
    schema: {
      description: 'Get my followers',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              photo_url: { type: 'string' },
              vip_status: { type: 'string' },
              level: { type: 'number' }
            }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.getMyFollowers(fastify, request)
  }))

  fastify.get('/users/me/following', {
    schema: {
      description: 'Get users I am following',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              photo_url: { type: 'string' },
              vip_status: { type: 'string' },
              level: { type: 'number' }
            }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.getMyFollowing(fastify, request)
  }))

  fastify.get('/users/me/visitors', {
    schema: {
      description: 'Get who visited my profile',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              photo_url: { type: 'string' },
              vip_status: { type: 'string' },
              level: { type: 'number' },
              visited_at: { type: 'string', format: 'date-time' }
            }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.getMyVisitors(fastify, request)
  }))

  fastify.post('/users/me/verifications', {
    schema: {
      description: 'Submit photo verification',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['type', 'document_url'],
        properties: {
          type: { type: 'string', enum: ['photo', 'id', 'video'] },
          document_url: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { verificationId: { type: 'number' }, status: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.submitVerification(fastify, request, request.body)
  }))

  fastify.get('/users/me/verifications', {
    schema: {
      description: 'Get my verifications',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              type: { type: 'string' },
              status: { type: 'string' },
              document_url: { type: 'string' },
              verified_at: { type: 'string', format: 'date-time' },
              created_at: { type: 'string', format: 'date-time' }
            }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return profileController.getMyVerifications(fastify, request)
  }))
}
