import * as profileService from './service.js'
import * as genderUtil from '../shared/gender.js'

export async function getMyProfile(fastify, request) {
  const userId = request.user.id
  return profileService.getUserFullProfile(fastify.mysql, userId)
}

export async function getUserProfileById(fastify, request) {
  const { id } = request.params
  const visitorId = request.user?.id
  if (visitorId && visitorId !== parseInt(id)) {
    const compatible = await genderUtil.isGenderCompatible(fastify.mysql, visitorId, parseInt(id))
    if (!compatible) {
      throw new Error('You cannot view this profile due to gender preferences')
    }
    await profileService.recordVisitor(fastify.mysql, visitorId, parseInt(id))
    try {
      const [actor] = await fastify.mysql.query('SELECT name FROM users WHERE id = ?', [visitorId])
      const actorName = actor[0]?.name || 'Someone'
      const notificationsModule = await import('../notifications/service.js')
      await notificationsModule.sendNotification(
        fastify.mysql, parseInt(id), visitorId, 'visit',
        'Profile visit',
        `${actorName} viewed your profile`,
        { visitor_id: visitorId }
      )
    } catch (e) {}
  }
  return profileService.getUserFullProfile(fastify.mysql, parseInt(id))
}

export async function updateMyProfile(fastify, request, body) {
  const userId = request.user.id
  const allowedFields = ['name', 'age', 'gender', 'bio', 'photo_url', 'location', 'latitude', 'longitude', 'gender_preference']
  const updateData: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      updateData[key] = body[key]
    }
  }
  return profileService.updateUserProfile(fastify.mysql, userId, updateData)
}

export async function addMyInterest(fastify, request, body) {
  const userId = request.user.id
  const { interest_tag } = body
  if (!interest_tag) {
    throw new Error('Interest tag is required')
  }
  return profileService.addInterest(fastify.mysql, userId, interest_tag)
}

export async function removeMyInterest(fastify, request, body) {
  const userId = request.user.id
  const { interest_tag } = body
  if (!interest_tag) {
    throw new Error('Interest tag is required')
  }
  return profileService.removeInterest(fastify.mysql, userId, interest_tag)
}

export async function getAllInterests(fastify) {
  return profileService.getAllInterests(fastify.mysql)
}

export async function followUser(fastify, request, body) {
  const followerId = request.user.id
  const { user_id } = body
  if (!user_id) {
    throw new Error('User ID is required')
  }
  const result = await profileService.followUser(fastify.mysql, followerId, user_id)
  if (user_id !== followerId) {
    try {
      const [actor] = await fastify.mysql.query('SELECT name FROM users WHERE id = ?', [followerId])
      const actorName = actor[0]?.name || 'Someone'
      const notificationsModule = await import('../notifications/service.js')
      await notificationsModule.sendNotification(
        fastify.mysql, user_id, followerId, 'follow',
        'New follower',
        `${actorName} started following you`,
        { follower_id: followerId }
      )
    } catch (e) {}
  }
  return result
}

export async function unfollowUser(fastify, request, body) {
  const followerId = request.user.id
  const { user_id } = body
  if (!user_id) {
    throw new Error('User ID is required')
  }
  return profileService.unfollowUser(fastify.mysql, followerId, user_id)
}

export async function getMyFollowers(fastify, request) {
  const userId = request.user.id
  return profileService.getFollowers(fastify.mysql, userId)
}

export async function getMyFollowing(fastify, request) {
  const userId = request.user.id
  return profileService.getFollowing(fastify.mysql, userId)
}

export async function getMyVisitors(fastify, request) {
  const userId = request.user.id
  return profileService.getVisitors(fastify.mysql, userId)
}

export async function submitVerification(fastify, request, body) {
  const userId = request.user.id
  const { type, document_url } = body
  if (!type || !document_url) {
    throw new Error('Type and document URL are required')
  }
  return profileService.submitVerification(fastify.mysql, userId, type, document_url)
}

export async function getMyVerifications(fastify, request) {
  const userId = request.user.id
  return profileService.getVerifications(fastify.mysql, userId)
}
