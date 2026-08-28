import * as promptsService from './service.js'

export async function addPrompt(fastify, request, body) {
  const userId = request.user.id
  const { prompt_text, answer } = body
  if (!prompt_text || !answer) {
    throw new Error('Prompt text and answer are required')
  }
  return promptsService.addPrompt(fastify.mysql, userId, prompt_text, answer)
}

export async function getMyPrompts(fastify, request) {
  const userId = request.user.id
  return promptsService.getUserPrompts(fastify.mysql, userId)
}

export async function getUserPrompts(fastify, request) {
  const { id } = request.params
  return promptsService.getUserPrompts(fastify.mysql, parseInt(id))
}

export async function updatePrompt(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  const { prompt_text, answer } = request.body
  if (!prompt_text || !answer) {
    throw new Error('Prompt text and answer are required')
  }
  await promptsService.updatePrompt(fastify.mysql, parseInt(id), userId, prompt_text, answer)
  return { message: 'Prompt updated' }
}

export async function deletePrompt(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  await promptsService.deletePrompt(fastify.mysql, parseInt(id), userId)
  return { message: 'Prompt deleted' }
}
