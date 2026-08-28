import * as moodsRepository from './repository.js'

export async function setMood(mysql, userId: number, mood: string, statusText: string, expiresHours: number = 24) {
  const result = await moodsRepository.setMood(mysql, userId, mood, statusText, expiresHours)
  return { ...result, message: 'Mood updated' }
}

export async function getMyMood(mysql, userId: number) {
  return moodsRepository.getMyMood(mysql, userId)
}

export async function getUserMood(mysql, userId: number) {
  return moodsRepository.getUserMood(mysql, userId)
}

export async function getActiveMoods(mysql, limit: number = 50) {
  return moodsRepository.getActiveMoods(mysql, limit)
}

export async function deleteMood(mysql, moodId: number, userId: number) {
  await moodsRepository.deleteMood(mysql, moodId, userId)
  return { message: 'Mood removed' }
}
