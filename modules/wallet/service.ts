import * as walletRepository from './repository.js'

export async function getMyWallet(mysql, userId: number) {
  let wallet = await walletRepository.getWallet(mysql, userId)
  if (!wallet) {
    wallet = await walletRepository.createOrUpdateWallet(mysql, userId, {})
  }
  return wallet
}

export async function addCoins(mysql, userId: number, amount: number, description: string) {
  if (amount <= 0) {
    throw new Error('Invalid amount')
  }
  await walletRepository.createOrUpdateWallet(mysql, userId, { coins: amount })
  await walletRepository.createTransaction(mysql, userId, {
    type: 'recharge',
    amount,
    currency: 'coins',
    description,
    status: 'completed'
  })
  return await walletRepository.getWallet(mysql, userId)
}

export async function addPoints(mysql, userId: number, amount: number, description: string) {
  if (amount <= 0) {
    throw new Error('Invalid amount')
  }
  await walletRepository.createOrUpdateWallet(mysql, userId, { points: amount })
  await walletRepository.createTransaction(mysql, userId, {
    type: 'reward',
    amount,
    currency: 'points',
    description,
    status: 'completed'
  })
  return await walletRepository.getWallet(mysql, userId)
}

export async function getTransactionHistory(mysql, userId: number, limit: number = 50, offset: number = 0) {
  return walletRepository.getTransactions(mysql, userId, limit, offset)
}

export async function subscribeToVip(mysql, userId: number, planId: number) {
  const result = await walletRepository.subscribeVip(mysql, userId, planId)
  await walletRepository.createTransaction(mysql, userId, {
    type: 'subscription',
    amount: 0,
    currency: 'usd',
    description: `VIP subscription: ${result.plan_name}`,
    status: 'completed'
  })
  return result
}

export async function getVipPlans(mysql) {
  return walletRepository.getVipPlans(mysql)
}

export async function getMyVipStatus(mysql, userId: number) {
  return walletRepository.getUserVip(mysql, userId)
}

export async function browseStore(mysql) {
  return walletRepository.getStoreItems(mysql)
}

export async function buyItem(mysql, userId: number, itemId: number, currency: string) {
  return walletRepository.purchaseItem(mysql, userId, itemId, currency)
}

export async function getMyInventory(mysql, userId: number) {
  return walletRepository.getInventory(mysql, userId)
}

export async function listGifts(mysql) {
  return walletRepository.getAvailableGifts(mysql)
}

export async function sendGiftToUser(mysql, senderId: number, receiverId: number, giftId: number, currency: string) {
  return walletRepository.sendGift(mysql, senderId, receiverId, giftId, currency)
}

export async function createReferral(mysql, referrerId: number, refereeId: number) {
  return walletRepository.createReferral(mysql, referrerId, refereeId)
}

export async function completeReferral(mysql, referralId: number) {
  return walletRepository.completeReferral(mysql, referralId)
}

export async function getReferralStats(mysql, userId: number) {
  return walletRepository.getReferralStats(mysql, userId)
}
