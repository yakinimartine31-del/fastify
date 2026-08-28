import * as walletService from './service.js'

export async function getWalletInfo(fastify, request) {
  const userId = request.user.id
  return walletService.getMyWallet(fastify.mysql, userId)
}

export async function addCoins(fastify, request, body) {
  const userId = request.user.id
  const { amount, description } = body
  if (!amount || !description) {
    throw new Error('Amount and description are required')
  }
  return walletService.addCoins(fastify.mysql, userId, amount, description)
}

export async function addPoints(fastify, request, body) {
  const userId = request.user.id
  const { amount, description } = body
  if (!amount || !description) {
    throw new Error('Amount and description are required')
  }
  return walletService.addPoints(fastify.mysql, userId, amount, description)
}

export async function getTransactions(fastify, request) {
  const userId = request.user.id
  const limit = parseInt(request.query.limit as string) || 50
  const offset = parseInt(request.query.offset as string) || 0
  return walletService.getTransactionHistory(fastify.mysql, userId, limit, offset)
}

export async function subscribeVip(fastify, request, body) {
  const userId = request.user.id
  const { plan_id } = body
  if (!plan_id) {
    throw new Error('Plan ID is required')
  }
  return walletService.subscribeToVip(fastify.mysql, userId, plan_id)
}

export async function getVipPlans(fastify) {
  return walletService.getVipPlans(fastify.mysql)
}

export async function getVipStatus(fastify, request) {
  const userId = request.user.id
  return walletService.getMyVipStatus(fastify.mysql, userId)
}

export async function getStore(fastify) {
  return walletService.browseStore(fastify.mysql)
}

export async function purchaseStoreItem(fastify, request, body) {
  const userId = request.user.id
  const { item_id, currency } = body
  if (!item_id || !currency) {
    throw new Error('Item ID and currency are required')
  }
  return walletService.buyItem(fastify.mysql, userId, item_id, currency)
}

export async function getInventory(fastify, request) {
  const userId = request.user.id
  return walletService.getMyInventory(fastify.mysql, userId)
}

export async function getGifts(fastify) {
  return walletService.listGifts(fastify.mysql)
}

export async function sendGift(fastify, request, body) {
  const senderId = request.user.id
  const { receiver_id, gift_id, currency } = body
  if (!receiver_id || !gift_id || !currency) {
    throw new Error('Receiver ID, gift ID, and currency are required')
  }
  return walletService.sendGiftToUser(fastify.mysql, senderId, receiver_id, gift_id, currency)
}

export async function generateReferral(fastify, request) {
  const userId = request.user.id
  return walletService.createReferral(fastify.mysql, userId, userId)
}

export async function completeReferral(fastify, request) {
  const { referral_id } = request.params
  return walletService.completeReferral(fastify.mysql, parseInt(referral_id))
}

export async function getReferralStats(fastify, request) {
  const userId = request.user.id
  return walletService.getReferralStats(fastify.mysql, userId)
}
