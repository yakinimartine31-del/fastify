import { tasks, games } from './gameSeed.ts'
import { vipPlans, storeItems, gifts } from './walletSeed.ts'

export async function seedTasks(mysql) {
  for (const task of tasks) {
    await mysql.query(
      'INSERT IGNORE INTO tasks (type, title, description, reward_xp, reward_coins, difficulty) VALUES (?, ?, ?, ?, ?, ?)',
      [task.type, task.title, task.description, task.reward_xp, task.reward_coins, task.difficulty]
    )
  }
}

export async function seedGames(mysql) {
  for (const game of games) {
    await mysql.query(
      'INSERT IGNORE INTO games (name, type, description, min_players, max_players, reward_coins, reward_xp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [game.name, game.type, game.description, game.min_players, game.max_players, game.reward_coins, game.reward_xp]
    )
  }
}

export async function seedVipPlans(mysql) {
  for (const plan of vipPlans) {
    await mysql.query(
      'INSERT IGNORE INTO vip_plans (name, duration_days, price, features) VALUES (?, ?, ?, ?)',
      [plan.name, plan.duration_days, plan.price, JSON.stringify(plan.features)]
    )
  }
}

export async function seedStoreItems(mysql) {
  for (const item of storeItems) {
    await mysql.query(
      'INSERT IGNORE INTO store_items (name, type, price_coins, price_points, icon, description) VALUES (?, ?, ?, ?, ?, ?)',
      [item.name, item.type, item.price_coins, item.price_points, item.icon, item.description]
    )
  }
}

export async function seedGifts(mysql) {
  for (const gift of gifts) {
    await mysql.query(
      'INSERT IGNORE INTO gifts (name, price_coins, price_points, icon, animation) VALUES (?, ?, ?, ?, ?)',
      [gift.name, gift.price_coins, gift.price_points, gift.icon, gift.animation]
    )
  }
}

export async function seedAll(mysql) {
  await seedTasks(mysql)
  await seedGames(mysql)
  await seedVipPlans(mysql)
  await seedStoreItems(mysql)
  await seedGifts(mysql)
}
