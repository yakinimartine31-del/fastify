import * as safetyService from './service.js'

export async function reportAUser(fastify, request, body) {
  const reporterId = request.user.id
  const { user_id, reason, description } = body
  if (!user_id || !reason) {
    throw new Error('User ID and reason are required')
  }
  return safetyService.reportUser(fastify.mysql, reporterId, user_id, reason, description)
}

export async function getAllReports(fastify, request) {
  const status = request.query.status as string | undefined
  return safetyService.getAllReports(fastify.mysql, status)
}

export async function getReportById(fastify, request) {
  const { id } = request.params
  return safetyService.getReport(fastify.mysql, parseInt(id))
}

export async function moderateReport(fastify, request, body) {
  const { id } = request.params
  const { status } = body
  const moderatorId = request.user.id
  if (!status) {
    throw new Error('Status is required')
  }
  return safetyService.moderateReport(fastify.mysql, parseInt(id), status, moderatorId)
}

export async function blockUser(fastify, request, body) {
  const userId = request.user.id
  const { user_id } = body
  if (!user_id) {
    throw new Error('User ID is required')
  }
  return safetyService.blockAUser(fastify.mysql, userId, user_id)
}

export async function unblockUser(fastify, request, body) {
  const userId = request.user.id
  const { user_id } = body
  if (!user_id) {
    throw new Error('User ID is required')
  }
  return safetyService.unblockAUser(fastify.mysql, userId, user_id)
}

export async function getBlockedUsers(fastify, request) {
  const userId = request.user.id
  return safetyService.getMyBlockedUsers(fastify.mysql, userId)
}

export async function checkBlockStatus(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return safetyService.checkIfBlocked(fastify.mysql, userId, parseInt(id))
}

export async function getSafetyTips(fastify) {
  return safetyService.getSafetyTips()
}

export async function submitPhotoVerification(fastify, request, body) {
  const userId = request.user.id
  const { photo_url } = body
  if (!photo_url) {
    throw new Error('Photo URL is required')
  }
  return safetyService.submitPhotoVerification(fastify.mysql, userId, photo_url)
}

export async function getSafetyAlerts(fastify, request) {
  const userId = request.user.id
  return safetyService.getSafetyAlerts(fastify.mysql, userId)
}

export async function dismissAlert(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return safetyService.dismissSafetyAlert(fastify.mysql, parseInt(id), userId)
}

export async function getMyModerationLogs(fastify, request) {
  const userId = request.user.id
  return safetyService.getModerationLogs(fastify.mysql, userId)
}

export async function getAllModerationLogs(fastify, request) {
  const limit = parseInt(request.query.limit as string) || 100
  const offset = parseInt(request.query.offset as string) || 0
  return safetyService.getAllModerationLogs(fastify.mysql, limit, offset)
}

export async function moderateUser(fastify, request, body) {
  const { user_id, action, reason } = body
  const moderatorId = request.user.id
  if (!user_id || !action) {
    throw new Error('User ID and action are required')
  }
  return safetyService.moderateUser(fastify.mysql, user_id, action, moderatorId, reason)
}
