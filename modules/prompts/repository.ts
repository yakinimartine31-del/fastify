export async function addPrompt(mysql, userId: number, promptText: string, answer: string) {
  const [result] = await mysql.query(
    'INSERT INTO profile_prompts (user_id, prompt_text, answer) VALUES (?, ?, ?)',
    [userId, promptText, answer]
  )
  return result.insertId
}

export async function getUserPrompts(mysql, userId: number) {
  const [prompts] = await mysql.query(
    'SELECT id, prompt_text, answer, created_at FROM profile_prompts WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  )
  return prompts
}

export async function getPromptsByIds(mysql, promptIds: number[]) {
  if (promptIds.length === 0) return []
  const placeholders = promptIds.map(() => '?').join(',')
  const [prompts] = await mysql.query(
    `SELECT id, user_id, prompt_text, answer, created_at FROM profile_prompts WHERE id IN (${placeholders})`,
    promptIds
  )
  return prompts
}

export async function updatePrompt(mysql, promptId: number, userId: number, promptText: string, answer: string) {
  await mysql.query(
    'UPDATE profile_prompts SET prompt_text = ?, answer = ? WHERE id = ? AND user_id = ?',
    [promptText, answer, promptId, userId]
  )
  return true
}

export async function deletePrompt(mysql, promptId: number, userId: number) {
  await mysql.query('DELETE FROM profile_prompts WHERE id = ? AND user_id = ?', [promptId, userId])
  return true
}

export async function getAllPrompts(mysql) {
  const [prompts] = await mysql.query('SELECT id, prompt_text FROM profile_prompts ORDER BY created_at DESC')
  return prompts
}
