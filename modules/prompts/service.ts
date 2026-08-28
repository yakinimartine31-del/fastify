import * as promptsRepository from './repository.js'

export async function addPrompt(mysql, userId: number, promptText: string, answer: string) {
  const promptId = await promptsRepository.addPrompt(mysql, userId, promptText, answer)
  return { promptId }
}

export async function getUserPrompts(mysql, userId: number) {
  return promptsRepository.getUserPrompts(mysql, userId)
}

export async function updatePrompt(mysql, promptId: number, userId: number, promptText: string, answer: string) {
  await promptsRepository.updatePrompt(mysql, promptId, userId, promptText, answer)
  return { message: 'Prompt updated' }
}

export async function deletePrompt(mysql, promptId: number, userId: number) {
  await promptsRepository.deletePrompt(mysql, promptId, userId)
  return { message: 'Prompt deleted' }
}

export async function getPrompt(mysql, promptId: number) {
  const [prompts] = await mysql.query('SELECT * FROM profile_prompts WHERE id = ?', [promptId])
  return prompts[0] || null
}
