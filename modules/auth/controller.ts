import * as authService from './service.js'

export async function register(fastify, body) {
  const { email, password, name, age, gender, bio, photo_url, location, gender_preference } = body
  if (!email || !password || !name) {
    throw new Error('Email, password, and name are required')
  }
  return authService.registerUser(fastify.mysql, { email, password, name, age, gender, bio, photo_url, location, gender_preference })
}

export async function login(fastify, body) {
  const { email, password } = body
  if (!email || !password) {
    throw new Error('Email and password are required')
  }
  const user = await authService.authenticateUser(fastify.mysql, email, password)
  const token = fastify.jwt.sign({ id: user.id, email: user.email })
  return { ...user, token }
}

export async function me(fastify, request) {
  const userId = request.user.id
  return authService.getCurrentUser(fastify.mysql, userId)
}

export async function updateMyProfile(fastify, request, body) {
  const userId = request.user.id
  const allowedFields = ['name', 'age', 'gender', 'bio', 'photo_url', 'location', 'latitude', 'longitude']
  const updateData: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      updateData[key] = body[key]
    }
  }
  return authService.updateProfile(fastify.mysql, userId, updateData)
}

export async function updateLastSeen(fastify, request) {
  const userId = request.user.id
  return authService.updateLastSeen(fastify.mysql, userId)
}
