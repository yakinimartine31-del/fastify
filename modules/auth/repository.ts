export async function createUser(mysql, data: { email: string; password: string; name: string; age?: number; gender?: string; bio?: string; photo_url?: string; location?: string; gender_preference?: string }) {
  const [result] = await mysql.query(
    'INSERT INTO users (email, password, name, age, gender, bio, photo_url, location, gender_preference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [data.email, data.password, data.name, data.age || null, data.gender || 'other', data.bio || null, data.photo_url || null, data.location || null, data.gender_preference || 'none']
  )
  const userId = result.insertId
  await mysql.query('INSERT INTO user_stats (user_id) VALUES (?)', [userId])
  return userId
}

export async function findByEmail(mysql, email: string) {
  const [rows] = await mysql.query('SELECT * FROM users WHERE email = ?', [email])
  return rows[0] || null
}

export async function findById(mysql, id: number) {
  const [rows] = await mysql.query('SELECT * FROM users WHERE id = ?', [id])
  return rows[0] || null
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
  return findById(mysql, id)
}
