import Fastify from 'fastify'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
})

const app = await import('./app.ts')
fastify.register(app.default, app.options)

fastify.get('/', async (request, reply) => {
  return {
    message: 'Welcome to the Dating Social API',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health',
    endpoints: {
      auth: '/auth',
      profile: '/profile',
      discover: '/discover',
      chat: '/chat',
      feed: '/feed',
      games: '/games',
      wallet: '/wallet',
      safety: '/safety',
      stories: '/stories',
      notifications: '/notifications',
      matches: '/matches',
      icebreakers: '/icebreakers',
      anonymous: '/anonymous',
      prompts: '/prompts',
      albums: '/albums',
      winks: '/winks',
      moods: '/moods'
    }
  }
})

fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
})

fastify.setErrorHandler((error: any, request, reply) => {
  request.log.error(error)
  reply.status(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
})

const start = async () => {
  try {
    const port = process.env.PORT || 3000
    const host = process.env.HOST || '0.0.0.0'
    await fastify.listen({ port, host } as any)
    console.log(`🚀 Server running on http://${host}:${port}`)
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🕒 Started at: ${new Date().toISOString()}`)
  } catch (err: any) {
    fastify.log.error(err)
    process.exit(1)
  }
}

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`)
  try {
    await fastify.close()
    console.log('Server closed successfully')
    process.exit(0)
  } catch (err: any) {
    console.error('Error during shutdown:', err)
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start()
