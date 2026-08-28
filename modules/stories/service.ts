import * as storiesRepository from './repository.js'

export async function addStory(mysql, userId: number, mediaUrl: string, mediaType: string, caption: string) {
  const storyId = await storiesRepository.createStory(mysql, userId, mediaUrl, mediaType, caption)
  return { storyId }
}

export async function getFeedStories(mysql, userId: number, limit: number = 20) {
  return storiesRepository.getActiveStories(mysql, userId, limit)
}

export async function getMyStories(mysql, userId: number) {
  return storiesRepository.getMyStories(mysql, userId)
}

export async function removeStory(mysql, storyId: number, userId: number) {
  await storiesRepository.deleteStory(mysql, storyId, userId)
  return { message: 'Story deleted' }
}

export async function getStory(mysql, storyId: number) {
  const story = await storiesRepository.getStoryById(mysql, storyId)
  if (!story) {
    throw new Error('Story not found')
  }
  return story
}
