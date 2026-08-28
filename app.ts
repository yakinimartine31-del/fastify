'use strict'

import path from 'node:path'
import AutoLoad from '@fastify/autoload'
import { fileURLToPath } from 'node:url'
import mysql from '@fastify/mysql'
import dbConfig from './config/database.js'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import fastifyStatic from '@fastify/static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const options: Record<string, unknown> = {}

export default async function (fastify: any, opts: Record<string, unknown>) {
  fastify.register(cors, { origin: '*' })
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'uploads'),
    prefix: '/uploads/'
  })
  fastify.register((await import('@fastify/multipart')).default, {
    limits: { fileSize: 5 * 1024 * 1024 }
  })

  fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Dating Social API',
        description: 'Dating and Social Networking Platform API',
        version: '1.0.0'
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Development server' }
      ],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'users', description: 'User profile endpoints' },
        { name: 'discover', description: 'Discovery and matching' },
        { name: 'chat', description: 'Messaging and calls' },
        { name: 'feed', description: 'Social feed posts' },
        { name: 'games', description: 'Games and entertainment' },
        { name: 'wallet', description: 'Virtual currency and VIP' },
        { name: 'safety', description: 'Safety and moderation' },
        { name: 'stories', description: '24h disappearing stories' },
        { name: 'notifications', description: 'Push notifications' },
        { name: 'matches', description: 'Likes, matches, and profile boosts' },
        { name: 'icebreakers', description: 'Fun conversation starters' },
        { name: 'anonymous', description: 'Anonymous messages' },
        { name: 'prompts', description: 'Profile prompts and Q&A' },
        { name: 'albums', description: 'Photo albums' },
        { name: 'winks', description: 'Winks and flirts' },
        { name: 'moods', description: 'User mood status' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  })

  fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  })

  fastify.register(jwt, {
    secret: 'your-secret-key-change-in-production'
  })

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' })
      throw new Error('Unauthorized')
    }
  })

  fastify.register(mysql, dbConfig)

  const authModule = await import('./modules/auth/route.ts')
  fastify.register(authModule.default)

  const profileModule = await import('./modules/profile/route.ts')
  fastify.register(profileModule.default)

  const discoverModule = await import('./modules/discover/route.ts')
  fastify.register(discoverModule.default)

  const chatModule = await import('./modules/chat/route.ts')
  fastify.register(chatModule.default)

  const feedModule = await import('./modules/feed/route.ts')
  fastify.register(feedModule.default)

  const gamesModule = await import('./modules/games/route.ts')
  fastify.register(gamesModule.default)

  const walletModule = await import('./modules/wallet/route.ts')
  fastify.register(walletModule.default)

  const safetyModule = await import('./modules/safety/route.ts')
  fastify.register(safetyModule.default)

  const storiesModule = await import('./modules/stories/route.ts')
  fastify.register(storiesModule.default)

  const notificationsModule = await import('./modules/notifications/route.ts')
  fastify.register(notificationsModule.default)

  const matchesModule = await import('./modules/matches/route.ts')
  fastify.register(matchesModule.default)

  const icebreakersModule = await import('./modules/icebreakers/route.ts')
  fastify.register(icebreakersModule.default)

  const anonymousModule = await import('./modules/anonymous/route.ts')
  fastify.register(anonymousModule.default)

  const promptsModule = await import('./modules/prompts/route.ts')
  fastify.register(promptsModule.default)

  const albumsModule = await import('./modules/albums/route.ts')
  fastify.register(albumsModule.default)

  const winksModule = await import('./modules/winks/route.ts')
  fastify.register(winksModule.default)

  const moodsModule = await import('./modules/moods/route.ts')
  fastify.register(moodsModule.default)

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })
}