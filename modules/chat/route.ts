'use strict'

import * as chatController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const conversationSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    other_user_id: { type: 'number' },
    other_user_name: { type: 'string' },
    other_user_photo: { type: 'string' },
    last_message_at: { type: 'string', format: 'date-time' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const messageSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    conversation_id: { type: 'number' },
    group_id: { type: 'number' },
    sender_id: { type: 'number' },
    sender_name: { type: 'string' },
    sender_photo: { type: 'string' },
    content: { type: 'string' },
    type: { type: 'string' },
    read_at: { type: 'string', format: 'date-time' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const groupSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    created_by: { type: 'number' },
    creator_name: { type: 'string' },
    member_count: { type: 'number' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const callSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    caller_id: { type: 'number' },
    receiver_id: { type: 'number' },
    caller_name: { type: 'string' },
    receiver_name: { type: 'string' },
    status: { type: 'string' },
    duration: { type: 'number' },
    call_type: { type: 'string', enum: ['voice', 'video'] },
    started_at: { type: 'string', format: 'date-time' },
    ended_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/chat/upload', {
    schema: {
      description: 'Upload an image for a chat message',
      tags: ['chat'],
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

    return reply.send({ url: `http://localhost:3000/uploads/${filename}` })
  })

  fastify.post('/chat/conversations', {
    schema: {
      description: 'Start a new conversation with a user',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['user_id'],
        properties: {
          user_id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { conversationId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.createConversation(fastify, request, request.body)
  }))

  fastify.get('/chat/conversations', {
    schema: {
      description: 'Get my conversations list',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: conversationSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.getConversations(fastify, request)
  }))

  fastify.get('/chat/conversations/:id/messages', {
    schema: {
      description: 'Get messages in a conversation',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          offset: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: messageSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.getConversationMessages(fastify, request)
  }))

  fastify.post('/chat/messages', {
    schema: {
      description: 'Send a message in a conversation',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['conversation_id', 'content'],
        properties: {
          conversation_id: { type: 'number' },
          content: { type: 'string' },
          type: { type: 'string', enum: ['text', 'image', 'video', 'audio'] }
        }
      },
      response: {
        200: { type: 'object', properties: { messageId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.sendMessage(fastify, request, request.body)
  }))

  fastify.post('/chat/conversations/:id/read', {
    schema: {
      description: 'Mark messages as read',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.markAsRead(fastify, request)
  }))

  fastify.post('/chat/groups', {
    schema: {
      description: 'Create a group chat',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'member_ids'],
        properties: {
          name: { type: 'string' },
          member_ids: { type: 'array', items: { type: 'number' } }
        }
      },
      response: {
        200: { type: 'object', properties: { groupId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.createGroup(fastify, request, request.body)
  }))

  fastify.get('/chat/groups', {
    schema: {
      description: 'Get my group chats',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: groupSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.getGroups(fastify, request)
  }))

  fastify.get('/chat/groups/:id/messages', {
    schema: {
      description: 'Get messages in a group chat',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          offset: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: messageSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.getGroupMessages(fastify, request)
  }))

  fastify.post('/chat/groups/:id/messages', {
    schema: {
      description: 'Send a message in a group chat',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string' },
          type: { type: 'string', enum: ['text', 'image', 'video', 'audio'] }
        }
      },
      response: {
        200: { type: 'object', properties: { messageId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.sendGroupMessage(fastify, request, request.body)
  }))

  fastify.post('/chat/calls', {
    schema: {
      description: 'Initiate a voice or video call',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['receiver_id'],
        properties: {
          receiver_id: { type: 'number' },
          call_type: { type: 'string', enum: ['voice', 'video'] }
        }
      },
      response: {
        200: { type: 'object', properties: { callId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.initiateCall(fastify, request, request.body)
  }))

  fastify.post('/chat/calls/:id/offer', {
    schema: {
      description: 'Send WebRTC offer for voice or video call',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['offer_sdp'],
        properties: {
          offer_sdp: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.sendCallOffer(fastify, request, request.body)
  }))

  fastify.post('/chat/calls/:id/answer', {
    schema: {
      description: 'Send WebRTC answer for voice or video call',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['answer_sdp'],
        properties: {
          answer_sdp: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.sendCallAnswer(fastify, request, request.body)
  }))

  fastify.post('/chat/calls/:id/ice', {
    schema: {
      description: 'Send ICE candidate for voice or video call',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['candidate'],
        properties: {
          candidate: { type: 'object' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.sendIceCandidate(fastify, request, request.body)
  }))

  fastify.post('/chat/calls/:id/end', {
    schema: {
      description: 'End a voice or video call',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.endCall(fastify, request)
  }))

  fastify.get('/chat/calls/history', {
    schema: {
      description: 'Get my call history',
      tags: ['chat'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: callSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return chatController.getCallHistory(fastify, request)
  }))
}
