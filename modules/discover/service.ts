import * as discoverRepository from './repository.js'

export async function getRecommendations(mysql, userId: number, limit: number = 20) {
  return discoverRepository.getRecommendations(mysql, userId, limit)
}

export async function getNearbyUsers(mysql, userId: number, latitude: number, longitude: number, radiusKm: number = 50, limit: number = 20) {
  if (!latitude || !longitude) {
    throw new Error('Latitude and longitude are required')
  }
  return discoverRepository.getNearbyUsers(mysql, userId, latitude, longitude, radiusKm, limit)
}

export async function getHotUsers(mysql, userId: number, limit: number = 20) {
  return discoverRepository.getHotUsers(mysql, userId, limit)
}

export async function getNewcomers(mysql, userId: number, limit: number = 20) {
  return discoverRepository.getNewcomers(mysql, userId, limit)
}

export async function getUserPosts(mysql, userId: number, limit: number = 20) {
  return discoverRepository.getUserPosts(mysql, userId, limit)
}
