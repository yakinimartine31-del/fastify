export async function getGenderPreference(mysql, userId: number) {
  const [user] = await mysql.query('SELECT gender_preference, gender FROM users WHERE id = ?', [userId])
  return user[0] || null
}

export async function isGenderCompatible(mysql, userId: number, targetUserId: number) {
  const [user] = await mysql.query('SELECT gender_preference, gender FROM users WHERE id = ?', [userId])
  const [target] = await mysql.query('SELECT gender FROM users WHERE id = ?', [targetUserId])
  
  if (!user[0] || !target[0]) return false
  
  const preference = user[0].gender_preference
  const userGender = user[0].gender
  const targetGender = target[0].gender
  
  if (preference === 'both') return true
  if (userGender === 'male' && targetGender === 'female') return true
  if (userGender === 'female' && targetGender === 'male') return true
  if (preference === 'none') return false
  if (preference === 'male' && targetGender === 'male') return true
  if (preference === 'female' && targetGender === 'female') return true
  
  return false
}
