'use strict'

import * as safetyController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const reportSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    reporter_id: { type: 'number' },
    reporter_name: { type: 'string' },
    reported_user_id: { type: 'number' },
    reported_user_name: { type: 'string' },
    reason: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const blockSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    blocked_user_id: { type: 'number' },
    name: { type: 'string' },
    photo_url: { type: 'string' },
    vip_status: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const scamAlertSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    alert_type: { type: 'string' },
    message: { type: 'string' },
    dismissed: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const moderationLogSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    user_id: { type: 'number' },
    user_name: { type: 'string' },
    action: { type: 'string' },
    moderator_id: { type: 'number' },
    reason: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.post('/safety/reports', {
    schema: {
      description: 'Report a user',
      tags: ['safety'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['user_id', 'reason'],
        properties: {
          user_id: { type: 'number' },
          reason: { type: 'string', enum: ['fake_profile', 'harassment', 'spam', 'inappropriate_content', 'financial_scam', 'impersonation', 'other'] },
          description: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { reportId: { type: 'number' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return safetyController.reportAUser(fastify, request, request.body)
  }))

  fastify.get('/safety/reports', {
    schema: {
      description: 'Get all reports (admin)',
      tags: ['safety'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'reviewed', 'resolved'] }
        }
      },
      response: {
        200: { type: 'array', items: reportSchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return safetyController.getAllReports(fastify, request)
  }))

  fastify.get('/safety/reports/:id', {
    schema: {
      description: 'Get report by ID',
      tags: ['safety'],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: reportSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return safetyController.getReportById(fastify, request)
  }))

  fastify.put('/safety/reports/:id', {
    schema: {
      description: 'Update report status (admin)',
      tags: ['safety'],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['pending', 'reviewed', 'resolved'] }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return safetyController.moderateReport(fastify, request, request.body)
  }))

  fastify.post('/safety/block', {
    schema: {
      description: 'Block a user',
      tags: ['safety'],
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
    return safetyController.blockUser(fastify, request, request.body)
  }))

  fastify.post('/safety/unblock', {
    schema: {
      description: 'Unblock a user',
      tags: ['safety'],
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
    return safetyController.unblockUser(fastify, request, request.body)
  }))

  fastify.get('/safety/blocks', {
    schema: {
      description: 'Get my blocked users',
      tags: ['safety'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: blockSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return safetyController.getBlockedUsers(fastify, request)
  }))

  fastify.get('/safety/blocks/:id', {
    schema: {
      description: 'Check if user is blocked',
      tags: ['safety'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { blocked: { type: 'boolean' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return safetyController.checkBlockStatus(fastify, request)
  }))

  fastify.get('/safety/tips', {
    schema: {
      description: 'Get safety tips and resources',
      tags: ['safety'],
      response: {
        200: {
          type: 'object',
          properties: {
            tips: { type: 'array', items: { type: 'string' } },
            resources: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return safetyController.getSafetyTips(fastify)
  }))

  fastify.post('/safety/verifications', {
    schema: {
      description: 'Submit photo verification',
      tags: ['safety'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['photo_url'],
        properties: {
          photo_url: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { verificationId: { type: 'number' }, status: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return safetyController.submitPhotoVerification(fastify, request, request.body)
  }))

  fastify.get('/safety/alerts', {
    schema: {
      description: 'Get my scam alerts',
      tags: ['safety'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: scamAlertSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return safetyController.getSafetyAlerts(fastify, request)
  }))

  fastify.post('/safety/alerts/:id/dismiss', {
    schema: {
      description: 'Dismiss scam alert',
      tags: ['safety'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return safetyController.dismissAlert(fastify, request)
  }))

  fastify.get('/safety/logs/me', {
    schema: {
      description: 'Get my moderation logs',
      tags: ['safety'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: moderationLogSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return safetyController.getMyModerationLogs(fastify, request)
  }))

  fastify.get('/safety/logs', {
    schema: {
      description: 'Get all moderation logs (admin)',
      tags: ['safety'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          offset: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: moderationLogSchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return safetyController.getAllModerationLogs(fastify, request)
  }))

  fastify.post('/safety/moderate', {
    schema: {
      description: 'Moderate a user (admin)',
      tags: ['safety'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['user_id', 'action'],
        properties: {
          user_id: { type: 'number' },
          action: { type: 'string', enum: ['warn', 'suspend', 'ban', 'unsuspend', 'unban'] },
          reason: { type: 'string' }
        }
      },
      response: {
        200: { type: 'object', properties: { logId: { type: 'number' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return safetyController.moderateUser(fastify, request, request.body)
  }))
}
