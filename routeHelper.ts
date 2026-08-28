export function handleRoute(fastify, handler) {
  return async function (request, reply) {
    try {
      return await handler(request, reply)
    } catch (err: any) {
      fastify.log.error(err)
      if (err.message === 'Unauthorized') {
        return reply.status(401).send({ error: 'Unauthorized' })
      }
      const clientError = /required|yourself|already|not found|cannot|invalid|allowed/i.test(err.message)
      reply.status(clientError ? 400 : 500).send({ error: clientError ? 'Bad Request' : 'Internal Server Error', message: err.message })
    }
  }
}
