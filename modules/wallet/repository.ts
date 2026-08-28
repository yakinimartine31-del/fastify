export async function getWallet(mysql, userId: number) {
  const [wallets] = await mysql.query('SELECT user_id, coins, points, balance, updated_at FROM wallets WHERE user_id = ?', [userId])
  return wallets[0] || null
}

export async function createOrUpdateWallet(mysql, userId: number, data: { coins?: number; points?: number; balance?: number }) {
  const [existing] = await mysql.query('SELECT * FROM wallets WHERE user_id = ?', [userId])
  
  if (existing.length > 0) {
    const updates: string[] = []
    const values: any[] = []
    
    if (data.coins !== undefined) {
      updates.push('coins = coins + ?')
      values.push(data.coins)
    }
    if (data.points !== undefined) {
      updates.push('points = points + ?')
      values.push(data.points)
    }
    if (data.balance !== undefined) {
      updates.push('balance = balance + ?')
      values.push(data.balance)
    }
    
    if (updates.length > 0) {
      values.push(userId)
      await mysql.query(`UPDATE wallets SET ${updates.join(', ')} WHERE user_id = ?`, values)
    }
  } else {
    await mysql.query(
      'INSERT INTO wallets (user_id, coins, points, balance) VALUES (?, ?, ?, ?)',
      [userId, data.coins || 0, data.points || 0, data.balance || 0]
    )
  }
  
  return getWallet(mysql, userId)
}

export async function getTransactions(mysql, userId: number, limit: number = 50, offset: number = 0) {
  const [transactions] = await mysql.query(`
    SELECT id, user_id, type, amount, currency, description, status, reference_id, created_at
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset])
  return transactions
}

export async function createTransaction(mysql, userId: number, data: { type: string; amount: number; currency: string; description: string; status?: string; referenceId?: string }) {
  const [result] = await mysql.query(
    'INSERT INTO transactions (user_id, type, amount, currency, description, status, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, data.type, data.amount, data.currency, data.description, data.status || 'pending', data.referenceId || null]
  )
  return result.insertId
}

export async function getVipPlans(mysql) {
  const [plans] = await mysql.query('SELECT id, name, duration_days, price, features, created_at FROM vip_plans WHERE is_active = TRUE')
  return plans
}

export async function getUserVip(mysql, userId: number) {
  const [vip] = await mysql.query(`
    SELECT uv.user_id, uv.plan_id, uv.start_date, uv.end_date, uv.status, vp.name as plan_name, vp.duration_days, vp.price, vp.features
    FROM user_vip uv
    JOIN vip_plans vp ON uv.plan_id = vp.id
    WHERE uv.user_id = ?
  `, [userId])
  return vip[0] || null
}

export async function subscribeVip(mysql, userId: number, planId: number) {
  const [plans] = await mysql.query('SELECT * FROM vip_plans WHERE id = ? AND is_active = TRUE', [planId])
  if (plans.length === 0) {
    throw new Error('VIP plan not found')
  }
  
  const plan = plans[0]
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + plan.duration_days)
  
  await mysql.query('INSERT INTO user_vip (user_id, plan_id, end_date) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE plan_id = ?, end_date = ?, status = ?', 
    [userId, planId, endDate, planId, endDate, 'active'])
  await mysql.query("UPDATE users SET vip_status = 'vip' WHERE id = ?", [userId])
  
  return { message: 'VIP subscription activated', plan_name: plan.name, end_date: endDate }
}

export async function getStoreItems(mysql) {
  const [items] = await mysql.query('SELECT id, name, type, price_coins, price_points, icon, description FROM store_items WHERE is_active = TRUE')
  return items
}

export async function purchaseItem(mysql, userId: number, itemId: number, currency: string) {
  const [items] = await mysql.query('SELECT * FROM store_items WHERE id = ? AND is_active = TRUE', [itemId])
  if (items.length === 0) {
    throw new Error('Item not found')
  }
  
  const item = items[0]
  const price = currency === 'points' ? item.price_points : item.price_coins
  
  if (price <= 0) {
    throw new Error('Invalid item price')
  }
  
  const [wallet] = await mysql.query(`SELECT ${currency} as balance FROM wallets WHERE user_id = ?`, [userId])
  if (!wallet || wallet[0].balance < price) {
    throw new Error('Insufficient balance')
  }
  
  await mysql.query(`UPDATE wallets SET ${currency} = ${currency} - ? WHERE user_id = ?`, [price, userId])
  
  const [existing] = await mysql.query('SELECT id FROM user_inventory WHERE user_id = ? AND item_id = ?', [userId, itemId])
  if (existing.length > 0) {
    await mysql.query('UPDATE user_inventory SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?', [userId, itemId])
  } else {
    await mysql.query('INSERT INTO user_inventory (user_id, item_id) VALUES (?, ?)', [userId, itemId])
  }
  
  await createTransaction(mysql, userId, {
    type: 'purchase',
    amount: price,
    currency: currency,
    description: `Purchased ${item.name}`,
    status: 'completed'
  })
  
  return { message: 'Item purchased successfully', item_name: item.name }
}

export async function getInventory(mysql, userId: number) {
  const [inventory] = await mysql.query(`
    SELECT ui.id, ui.item_id, ui.quantity, ui.acquired_at, si.name, si.type, si.icon, si.description
    FROM user_inventory ui
    JOIN store_items si ON ui.item_id = si.id
    WHERE ui.user_id = ?
    ORDER BY ui.acquired_at DESC
  `, [userId])
  return inventory
}

export async function getAvailableGifts(mysql) {
  const [gifts] = await mysql.query('SELECT id, name, price_coins, price_points, icon, animation FROM gifts WHERE is_active = TRUE')
  return gifts
}

export async function sendGift(mysql, senderId: number, receiverId: number, giftId: number, currency: string) {
  const [gifts] = await mysql.query('SELECT * FROM gifts WHERE id = ? AND is_active = TRUE', [giftId])
  if (gifts.length === 0) {
    throw new Error('Gift not found')
  }
  
  const gift = gifts[0]
  const price = currency === 'points' ? gift.price_points : gift.price_coins
  
  const [senderWallet] = await mysql.query(`SELECT ${currency} as balance FROM wallets WHERE user_id = ?`, [senderId])
  if (!senderWallet || senderWallet[0].balance < price) {
    throw new Error('Insufficient balance')
  }
  
  await mysql.query(`UPDATE wallets SET ${currency} = ${currency} - ? WHERE user_id = ?`, [price, senderId])
  
  const [receiverWallet] = await mysql.query('SELECT * FROM wallets WHERE user_id = ?', [receiverId])
  if (receiverWallet.length === 0) {
    await mysql.query('INSERT INTO wallets (user_id, coins, points) VALUES (?, ?, ?)', [receiverId, 0, 0])
  }
  
  const pointsEarned = Math.floor(price * 0.5)
  await mysql.query(`UPDATE wallets SET coins = coins + ? WHERE user_id = ?`, [price, receiverId])
  
  await createTransaction(mysql, senderId, {
    type: 'gift_sent',
    amount: price,
    currency: currency,
    description: `Sent ${gift.name} to user ${receiverId}`,
    status: 'completed'
  })
  
  await createTransaction(mysql, receiverId, {
    type: 'gift_received',
    amount: price,
    currency: currency,
    description: `Received ${gift.name} from user ${senderId}`,
    status: 'completed'
  })
  
  return { message: 'Gift sent successfully', gift_name: gift.name, points_earned: pointsEarned }
}

export async function createReferral(mysql, referrerId: number, refereeId: number) {
  const [existing] = await mysql.query('SELECT id FROM referrals WHERE referee_id = ?', [refereeId])
  if (existing.length > 0) {
    throw new Error('User already referred')
  }
  
  const [result] = await mysql.query(
    'INSERT INTO referrals (referrer_id, referee_id, reward_coins, reward_points) VALUES (?, ?, ?, ?)',
    [referrerId, refereeId, 100, 50]
  )
  
  return { referral_id: result.insertId, reward_coins: 100, reward_points: 50 }
}

export async function completeReferral(mysql, referralId: number) {
  const [referral] = await mysql.query('SELECT * FROM referrals WHERE id = ? AND status = ?', [referralId, 'pending'])
  if (referral.length === 0) {
    throw new Error('Referral not found or already completed')
  }
  
  const ref = referral[0]
  await mysql.query('UPDATE referrals SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?', ['completed', referralId])
  
  await createOrUpdateWallet(mysql, ref.referrer_id, { coins: ref.reward_coins, points: ref.reward_points })
  
  await createTransaction(mysql, ref.referrer_id, {
    type: 'referral',
    amount: ref.reward_coins,
    currency: 'coins',
    description: `Referral bonus for user ${ref.referee_id}`,
    status: 'completed'
  })
  
  return { message: 'Referral completed', reward_coins: ref.reward_coins, reward_points: ref.reward_points }
}

export async function getReferralStats(mysql, userId: number) {
  const [referrals] = await mysql.query(`
    SELECT r.id, r.referee_id, u.name as referee_name, r.reward_coins, r.reward_points, r.status, r.created_at
    FROM referrals r
    JOIN users u ON r.referee_id = u.id
    WHERE r.referrer_id = ?
    ORDER BY r.created_at DESC
  `, [userId])
  
  const [stats] = await mysql.query(`
    SELECT COUNT(*) as total_referrals, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_referrals,
           SUM(CASE WHEN status = 'completed' THEN reward_coins ELSE 0 END) as total_coins_earned
    FROM referrals
    WHERE referrer_id = ?
  `, [userId])
  
  return { referrals, stats: stats[0] }
}
