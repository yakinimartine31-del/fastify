import * as discoverService from './service.js'
import * as matchesService from '../matches/service.js'

export async function getRecommendations(fastify, request) {
  const userId = request.user.id
  const limit = parseInt(request.query.limit as string) || 20
  const users = await discoverService.getRecommendations(fastify.mysql, userId, limit)
  const enriched = await Promise.all(users.map(async (user: any) => {
    const liked = await matchesService.checkIfLiked(fastify.mysql, userId, user.id)
    const matched = await matchesService.checkIfMatched(fastify.mysql, userId, user.id)
    return { ...user, liked_by_me: liked, matched_with_me: matched }
  }))
  return enriched
}

export async function getNearby(fastify, request) {
  const userId = request.user.id
  const latitude = parseFloat(request.query.latitude as string)
  const longitude = parseFloat(request.query.longitude as string)
  const radiusKm = parseFloat(request.query.radius as string) || 50
  const limit = parseInt(request.query.limit as string) || 20
  return discoverService.getNearbyUsers(fastify.mysql, userId, latitude, longitude, radiusKm, limit)
}

export async function getHotUsers(fastify, request) {
  const userId = request.user.id
  const limit = parseInt(request.query.limit as string) || 20
  return discoverService.getHotUsers(fastify.mysql, userId, limit)
}

export async function getNewcomers(fastify, request) {
  const userId = request.user.id
  const limit = parseInt(request.query.limit as string) || 20
  return discoverService.getNewcomers(fastify.mysql, userId, limit)
}

export async function getUserPosts(fastify, request) {
  const { id } = request.params
  const limit = parseInt(request.query.limit as string) || 20
  return discoverService.getUserPosts(fastify.mysql, parseInt(id), limit)
}
