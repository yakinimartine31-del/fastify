export async function getUserProfile(mysql, userId: number) {
  const [users] = await mysql.query('SELECT id, name, age, gender, bio, photo_url, location, vip_status, level, created_at FROM users WHERE id = ?', [userId])
  return users[0] || null
}

export async function getUserStats(mysql, userId: number) {
  const [stats] = await mysql.query('SELECT followers_count, following_count, visitors_count, posts_count FROM user_stats WHERE user_id = ?', [userId])
  return stats[0] || null
}

export async function getUserInterests(mysql, userId: number) {
  const [interests] = await mysql.query('SELECT interest_tag FROM user_interests WHERE user_id = ?', [userId])
  return interests.map(row => row.interest_tag)
}

export async function addUserInterest(mysql, userId: number, interestTag: string) {
  await mysql.query('INSERT IGNORE INTO user_interests (user_id, interest_tag) VALUES (?, ?)', [userId, interestTag])
  return true
}

export async function removeUserInterest(mysql, userId: number, interestTag: string) {
  await mysql.query('DELETE FROM user_interests WHERE user_id = ? AND interest_tag = ?', [userId, interestTag])
  return true
}

export async function getUserInterestsList(mysql) {
  const [interests] = await mysql.query('SELECT DISTINCT interest_tag FROM user_interests ORDER BY interest_tag')
  return interests.map(row => row.interest_tag)
}

export async function updateUser(mysql, id: number, data: Record<string, unknown>) {
  const fields: string[] = []
  const values: unknown[] = []
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
  }
  if (fields.length === 0) return null
  values.push(id)
  const [result]: any = await mysql.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values)
  if (result.affectedRows === 0) return null
  return getUserProfile(mysql, id)
}
