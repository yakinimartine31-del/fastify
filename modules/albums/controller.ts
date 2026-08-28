import * as albumsService from './service.js'

export async function addPhoto(fastify, request, body) {
  const userId = request.user.id
  const { photo_url, caption, is_primary } = body
  if (!photo_url) {
    throw new Error('Photo URL is required')
  }
  return albumsService.addPhoto(fastify.mysql, userId, photo_url, caption || '', is_primary || false)
}

export async function getMyPhotos(fastify, request) {
  const userId = request.user.id
  return albumsService.getMyPhotos(fastify.mysql, userId)
}

export async function getUserPhotos(fastify, request) {
  const { id } = request.params
  return albumsService.getUserPhotos(fastify.mysql, parseInt(id))
}

export async function updatePhoto(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  const { caption, is_primary } = request.body
  await albumsService.updatePhoto(fastify.mysql, parseInt(id), userId, caption || '', is_primary || false)
  return { message: 'Photo updated' }
}

export async function deletePhoto(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  await albumsService.deletePhoto(fastify.mysql, parseInt(id), userId)
  return { message: 'Photo deleted' }
}

export async function setPrimaryPhoto(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  await albumsService.setPrimary(fastify.mysql, parseInt(id), userId)
  return { message: 'Primary photo updated' }
}
