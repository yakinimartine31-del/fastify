import * as storiesService from './service.js'
import * as genderUtil from '../shared/gender.js'

export async function createStory(fastify, request, body) {
  const userId = request.user.id
  const { media_url, media_type, caption } = body
  if (!media_url) {
    throw new Error('Media URL is required')
  }
  return storiesService.addStory(fastify.mysql, userId, media_url, media_type || 'image', caption)
}

export async function getStories(fastify, request) {
  const userId = request.user.id
  const stories = await storiesService.getFeedStories(fastify.mysql, userId)
  const filtered: any[] = []
  for (const story of stories) {
    const compatible = await genderUtil.isGenderCompatible(fastify.mysql, userId, story.user_id)
    if (compatible) {
      filtered.push(story)
    }
  }
  return filtered
}

export async function getMyStories(fastify, request) {
  const userId = request.user.id
  return storiesService.getMyStories(fastify.mysql, userId)
}

export async function deleteStory(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return storiesService.removeStory(fastify.mysql, parseInt(id), userId)
}

export async function getStoryById(fastify, request) {
  const { id } = request.params
  return storiesService.getStory(fastify.mysql, parseInt(id))
}
