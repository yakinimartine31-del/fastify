'use strict'

import * as gamesController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const levelSchema = {
  type: 'object',
  properties: {
    level: { type: 'number' },
    xp: { type: 'number' },
    title: { type: 'string' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

const taskSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    type: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    reward_xp: { type: 'number' },
    reward_coins: { type: 'number' },
    difficulty: { type: 'string' }
  }
}

const userTaskSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    task_id: { type: 'number' },
    status: { type: 'string' },
    progress: { type: 'number' },
    title: { type: 'string' },
    description: { type: 'string' },
    reward_xp: { type: 'number' },
    reward_coins: { type: 'number' }
  }
}

const gameSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    type: { type: 'string' },
    description: { type: 'string' },
    min_players: { type: 'number' },
    max_players: { type: 'number' },
    reward_coins: { type: 'number' },
    reward_xp: { type: 'number' }
  }
}

const gameSessionSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    game_id: { type: 'number' },
    game_name: { type: 'string' },
    host_id: { type: 'number' },
    host_name: { type: 'string' },
    status: { type: 'string' },
    started_at: { type: 'string', format: 'date-time' },
    ended_at: { type: 'string', format: 'date-time' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const leaderboardEntrySchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    photo_url: { type: 'string' },
    level: { type: 'number' },
    vip_status: { type: 'string' },
    total_score: { type: 'number' },
    games_played: { type: 'number' }
  }
}

const badgeSchema = {
  type: 'object',
  properties: {
    badge_name: { type: 'string' },
    badge_icon: { type: 'string' },
    description: { type: 'string' },
    earned_at: { type: 'string', format: 'date-time' }
  }
}

export default async function (fastify, opts) {
  fastify.get('/games/level', {
    schema: {
      description: 'Get my level and XP',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      response: {
        200: levelSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.getMyLevel(fastify, request)
  }))

  fastify.post('/games/level/xp', {
    schema: {
      description: 'Add XP to my level',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['xp'],
        properties: {
          xp: { type: 'number' }
        }
      },
      response: {
        200: levelSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.gainXp(fastify, request, request.body)
  }))

  fastify.get('/games/tasks', {
    schema: {
      description: 'Get available tasks',
      tags: ['games'],
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['daily', 'weekly', 'achievement'] }
        }
      },
      response: {
        200: { type: 'array', items: taskSchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return gamesController.getTasks(fastify)
  }))

  fastify.get('/games/tasks/me', {
    schema: {
      description: 'Get my task progress',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: userTaskSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.getMyTasks(fastify, request)
  }))

  fastify.post('/games/tasks/start', {
    schema: {
      description: 'Start a task',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['task_id'],
        properties: {
          task_id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { taskId: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.startTask(fastify, request, request.body)
  }))

  fastify.post('/games/tasks/progress', {
    schema: {
      description: 'Update task progress',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['task_id', 'progress'],
        properties: {
          task_id: { type: 'number' },
          progress: { type: 'number', minimum: 0, maximum: 100 }
        }
      },
      response: {
        200: { type: 'object', properties: { completed: { type: 'boolean' }, progress: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.updateProgress(fastify, request, request.body)
  }))

  fastify.post('/games/tasks/:id/claim', {
    schema: {
      description: 'Claim task reward',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.claimReward(fastify, request)
  }))

  fastify.get('/games', {
    schema: {
      description: 'Get available games',
      tags: ['games'],
      response: {
        200: { type: 'array', items: gameSchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return gamesController.getGames(fastify)
  }))

  fastify.post('/games/sessions', {
    schema: {
      description: 'Create a game session',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['game_id'],
        properties: {
          game_id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { session_id: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.createGameSession(fastify, request, request.body)
  }))

  fastify.post('/games/sessions/:id/join', {
    schema: {
      description: 'Join a game session',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.joinGameSession(fastify, request)
  }))

  fastify.get('/games/sessions/:id', {
    schema: {
      description: 'Get game session details',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: gameSessionSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.getGameSession(fastify, request)
  }))

  fastify.post('/games/sessions/:id/score', {
    schema: {
      description: 'Submit game score',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      body: {
        type: 'object',
        required: ['score'],
        properties: {
          score: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { score: { type: 'number' }, rank: { type: 'number' }, total_players: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.submitScore(fastify, request, request.body)
  }))

  fastify.post('/games/sessions/:id/end', {
    schema: {
      description: 'End game session',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.finishGame(fastify, request)
  }))

  fastify.get('/games/leaderboards', {
    schema: {
      description: 'Get global leaderboard',
      tags: ['games'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: leaderboardEntrySchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return gamesController.getGlobalLeaderboard(fastify, request)
  }))

  fastify.get('/games/leaderboards/:id', {
    schema: {
      description: 'Get game-specific leaderboard',
      tags: ['games'],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: leaderboardEntrySchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return gamesController.getGameLeaderboard(fastify, request)
  }))

  fastify.get('/games/badges', {
    schema: {
      description: 'Get my badges',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: badgeSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.getMyBadges(fastify, request)
  }))

  fastify.post('/games/badges/check', {
    schema: {
      description: 'Check and award new badges',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'object', properties: { badges: { type: 'object' }, message: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return gamesController.checkBadges(fastify, request)
  }))
}
