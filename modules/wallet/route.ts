'use strict'

import * as walletController from './controller.js'
import { handleRoute } from '../../routeHelper.ts'

const walletSchema = {
  type: 'object',
  properties: {
    user_id: { type: 'number' },
    coins: { type: 'number' },
    points: { type: 'number' },
    balance: { type: 'number' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

const transactionSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    type: { type: 'string' },
    amount: { type: 'number' },
    currency: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string' },
    reference_id: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
}

const vipPlanSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    duration_days: { type: 'number' },
    price: { type: 'number' },
    features: { type: 'array', items: { type: 'string' } }
  }
}

const storeItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    type: { type: 'string' },
    price_coins: { type: 'number' },
    price_points: { type: 'number' },
    icon: { type: 'string' },
    description: { type: 'string' }
  }
}

const giftSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    price_coins: { type: 'number' },
    price_points: { type: 'number' },
    icon: { type: 'string' },
    animation: { type: 'string' }
  }
}

const inventorySchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    item_id: { type: 'number' },
    name: { type: 'string' },
    type: { type: 'string' },
    quantity: { type: 'number' },
    icon: { type: 'string' }
  }
}

export default async function (fastify, opts) {
  fastify.get('/wallet', {
    schema: {
      description: 'Get my wallet balance',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      response: {
        200: walletSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.getWalletInfo(fastify, request)
  }))

  fastify.post('/wallet/coins', {
    schema: {
      description: 'Add coins to wallet',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['amount', 'description'],
        properties: {
          amount: { type: 'number', minimum: 1 },
          description: { type: 'string' }
        }
      },
      response: {
        200: walletSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.addCoins(fastify, request, request.body)
  }))

  fastify.post('/wallet/points', {
    schema: {
      description: 'Add points to wallet',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['amount', 'description'],
        properties: {
          amount: { type: 'number', minimum: 1 },
          description: { type: 'string' }
        }
      },
      response: {
        200: walletSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.addPoints(fastify, request, request.body)
  }))

  fastify.get('/wallet/transactions', {
    schema: {
      description: 'Get transaction history',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          offset: { type: 'number' }
        }
      },
      response: {
        200: { type: 'array', items: transactionSchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.getTransactions(fastify, request)
  }))

  fastify.get('/wallet/vip/plans', {
    schema: {
      description: 'Get available VIP plans',
      tags: ['wallet'],
      response: {
        200: { type: 'array', items: vipPlanSchema }
      }
    }
  }, handleRoute(fastify, async () => {
    return walletController.getVipPlans(fastify)
  }))

  fastify.post('/wallet/vip/subscribe', {
    schema: {
      description: 'Subscribe to VIP plan',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['plan_id'],
        properties: {
          plan_id: { type: 'number' }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' }, plan_name: { type: 'string' }, end_date: { type: 'string', format: 'date-time' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.subscribeVip(fastify, request, request.body)
  }))

  fastify.get('/wallet/vip/status', {
    schema: {
      description: 'Get my VIP status',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      response: {
        200: vipPlanSchema,
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.getVipStatus(fastify, request)
  }))

  fastify.get('/store', {
    schema: {
      description: 'Browse store items',
      tags: ['wallet'],
      response: {
        200: { type: 'array', items: storeItemSchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return walletController.getStore(fastify)
  }))

  fastify.post('/store/buy', {
    schema: {
      description: 'Purchase store item',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['item_id', 'currency'],
        properties: {
          item_id: { type: 'number' },
          currency: { type: 'string', enum: ['coins', 'points'] }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' }, item_name: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.purchaseStoreItem(fastify, request, request.body)
  }))

  fastify.get('/inventory', {
    schema: {
      description: 'Get my inventory',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'array', items: inventorySchema },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.getInventory(fastify, request)
  }))

  fastify.get('/gifts', {
    schema: {
      description: 'Get available gifts',
      tags: ['wallet'],
      response: {
        200: { type: 'array', items: giftSchema }
      }
    }
  }, handleRoute(fastify, async (request) => {
    return walletController.getGifts(fastify)
  }))

  fastify.post('/gifts/send', {
    schema: {
      description: 'Send a gift to a user',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['receiver_id', 'gift_id', 'currency'],
        properties: {
          receiver_id: { type: 'number' },
          gift_id: { type: 'number' },
          currency: { type: 'string', enum: ['coins', 'points'] }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' }, gift_name: { type: 'string' }, points_earned: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.sendGift(fastify, request, request.body)
  }))

  fastify.post('/referrals', {
    schema: {
      description: 'Generate referral link',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'object', properties: { referral_id: { type: 'number' }, reward_coins: { type: 'number' }, reward_points: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.generateReferral(fastify, request)
  }))

  fastify.post('/referrals/:id/complete', {
    schema: {
      description: 'Complete referral',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'number' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' }, reward_coins: { type: 'number' }, reward_points: { type: 'number' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.completeReferral(fastify, request)
  }))

  fastify.get('/referrals/stats', {
    schema: {
      description: 'Get referral statistics',
      tags: ['wallet'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            referrals: { type: 'array' },
            stats: {
              type: 'object',
              properties: {
                total_referrals: { type: 'number' },
                completed_referrals: { type: 'number' },
                total_coins_earned: { type: 'number' }
              }
            }
          }
        },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    },
    preHandler: [fastify.authenticate]
  }, handleRoute(fastify, async (request) => {
    return walletController.getReferralStats(fastify, request)
  }))
}
