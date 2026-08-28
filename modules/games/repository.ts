export async function getUserLevel(mysql, userId: number) {
  const [levels] = await mysql.query('SELECT level, xp, title, updated_at FROM user_levels WHERE user_id = ?', [userId])
  return levels[0] || null
}

export async function createOrUpdateUserLevel(mysql, userId: number, xpGained: number) {
  const [existing] = await mysql.query('SELECT * FROM user_levels WHERE user_id = ?', [userId])
  let newXp = (existing[0]?.xp || 0) + xpGained
  const newLevel = Math.floor(newXp / 1000) + 1
  const titles = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Grandmaster']
  const title = titles[Math.min(newLevel - 1, titles.length - 1)]
  
  if (existing.length > 0) {
    await mysql.query('UPDATE user_levels SET xp = ?, level = ?, title = ? WHERE user_id = ?', [newXp, newLevel, title, userId])
  } else {
    await mysql.query('INSERT INTO user_levels (user_id, level, xp, title) VALUES (?, ?, ?, ?)', [userId, newLevel, newXp, title])
  }
  return { level: newLevel, xp: newXp, title }
}

export async function getAvailableTasks(mysql, type?: string) {
  let query = 'SELECT id, type, title, description, reward_xp, reward_coins, difficulty, created_at FROM tasks WHERE is_active = TRUE'
  const params: any[] = []
  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }
  const [tasks] = await mysql.query(query, params)
  return tasks
}

export async function getUserTasks(mysql, userId: number) {
  const [userTasks] = await mysql.query(`
    SELECT ut.id, ut.user_id, ut.task_id, ut.status, ut.progress, ut.completed_at, ut.claimed_at, ut.created_at,
           t.title, t.description, t.reward_xp, t.reward_coins, t.difficulty, t.type
    FROM user_tasks ut
    JOIN tasks t ON ut.task_id = t.id
    WHERE ut.user_id = ?
    ORDER BY ut.created_at DESC
  `, [userId])
  return userTasks
}

export async function startTask(mysql, userId: number, taskId: number) {
  const [existing] = await mysql.query('SELECT id FROM user_tasks WHERE user_id = ? AND task_id = ?', [userId, taskId])
  if (existing.length > 0) {
    return existing[0].id
  }
  const [result] = await mysql.query('INSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)', [userId, taskId])
  return result.insertId
}

export async function updateTaskProgress(mysql, userId: number, taskId: number, progress: number) {
  const [task] = await mysql.query('SELECT progress FROM user_tasks WHERE user_id = ? AND task_id = ?', [userId, taskId])
  if (task.length === 0) {
    throw new Error('Task not started')
  }
  const newProgress = Math.max(task[0].progress, progress)
  const [tasks] = await mysql.query('SELECT * FROM tasks WHERE id = ?', [taskId])
  if (tasks.length === 0) {
    throw new Error('Task not found')
  }
  const taskData = tasks[0]
  
  if (newProgress >= 100) {
    await mysql.query('UPDATE user_tasks SET progress = ?, status = ?, completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND task_id = ?', [newProgress, 'completed', userId, taskId])
    await createOrUpdateUserLevel(mysql, userId, taskData.reward_xp)
    await mysql.query('UPDATE users SET coins = coins + ? WHERE id = ?', [taskData.reward_coins, userId])
    return { completed: true, reward_xp: taskData.reward_xp, reward_coins: taskData.reward_coins }
  }
  
  await mysql.query('UPDATE user_tasks SET progress = ? WHERE user_id = ? AND task_id = ?', [newProgress, userId, taskId])
  return { completed: false, progress: newProgress }
}

export async function claimTaskReward(mysql, userId: number, taskId: number) {
  const [userTask] = await mysql.query('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ? AND status = ?', [userId, taskId, 'completed'])
  if (userTask.length === 0) {
    throw new Error('Task not completed or already claimed')
  }
  await mysql.query('UPDATE user_tasks SET status = ?, claimed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND task_id = ?', ['claimed', userId, taskId])
  return { message: 'Reward claimed successfully' }
}

export async function getAvailableGames(mysql) {
  const [games] = await mysql.query('SELECT id, name, type, description, min_players, max_players, reward_coins, reward_xp FROM games WHERE is_active = TRUE')
  return games
}

export async function createGameSession(mysql, gameId: number, hostId: number) {
  const [result] = await mysql.query('INSERT INTO game_sessions (game_id, host_id) VALUES (?, ?)', [gameId, hostId])
  await mysql.query('INSERT INTO game_players (session_id, user_id) VALUES (?, ?)', [result.insertId, hostId])
  return result.insertId
}

export async function joinGameSession(mysql, sessionId: number, userId: number) {
  const [existing] = await mysql.query('SELECT id FROM game_players WHERE session_id = ? AND user_id = ?', [sessionId, userId])
  if (existing.length > 0) {
    throw new Error('Already joined this session')
  }
  await mysql.query('INSERT INTO game_players (session_id, user_id) VALUES (?, ?)', [sessionId, userId])
  return true
}

export async function getGameSession(mysql, sessionId: number) {
  const [sessions] = await mysql.query(`
    SELECT gs.id, gs.game_id, gs.host_id, gs.status, gs.started_at, gs.ended_at, gs.created_at,
           g.name as game_name, u.name as host_name
    FROM game_sessions gs
    JOIN games g ON gs.game_id = g.id
    JOIN users u ON gs.host_id = u.id
    WHERE gs.id = ?
  `, [sessionId])
  return sessions[0] || null
}

export async function updateGameScore(mysql, sessionId: number, userId: number, score: number) {
  await mysql.query('UPDATE game_players SET score = ? WHERE session_id = ? AND user_id = ?', [score, sessionId, userId])
  return true
}

export async function endGameSession(mysql, sessionId: number) {
  const [players] = await mysql.query('SELECT user_id, score FROM game_players WHERE session_id = ? ORDER BY score DESC', [sessionId])
  for (let i = 0; i < players.length; i++) {
    await mysql.query('UPDATE game_players SET player_rank = ? WHERE session_id = ? AND user_id = ?', [i + 1, sessionId, players[i].user_id])
  }
  await mysql.query('UPDATE game_sessions SET status = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?', ['finished', sessionId])
  return true
}

export async function getGlobalLeaderboard(mysql, limit: number = 100) {
  const [leaderboard] = await mysql.query(`
    SELECT u.id, u.name, u.photo_url, u.level, u.vip_status,
           COALESCE(SUM(lb.score), 0) as total_score,
           COUNT(lb.id) as games_played
    FROM users u
    LEFT JOIN leaderboards lb ON u.id = lb.user_id
    WHERE u.is_active = TRUE
    GROUP BY u.id
    ORDER BY total_score DESC
    LIMIT ?
  `, [limit])
  return leaderboard
}

export async function getGameLeaderboard(mysql, gameId: number, limit: number = 100) {
  const [leaderboard] = await mysql.query(`
    SELECT u.id, u.name, u.photo_url, u.level, u.vip_status, lb.score, lb.period, lb.leaderboard_rank
    FROM leaderboards lb
    JOIN users u ON lb.user_id = u.id
    WHERE lb.game_id = ? AND u.is_active = TRUE
    ORDER BY lb.score DESC
    LIMIT ?
  `, [gameId, limit])
  return leaderboard
}

export async function updateLeaderboard(mysql, userId: number, gameId: number | null, score: number) {
  const [existing] = await mysql.query('SELECT id FROM leaderboards WHERE user_id = ? AND game_id IS NULL AND period = ?', [userId, 'all_time'])
  if (existing.length > 0) {
    await mysql.query('UPDATE leaderboards SET score = score + ? WHERE id = ?', [score, existing[0].id])
  } else {
    await mysql.query('INSERT INTO leaderboards (user_id, game_id, score, period) VALUES (?, ?, ?, ?)', [userId, gameId, score, 'all_time'])
  }
  return true
}

export async function getUserBadges(mysql, userId: number) {
  const [badges] = await mysql.query('SELECT badge_name, badge_icon, description, earned_at FROM user_badges WHERE user_id = ?', [userId])
  return badges
}

export async function awardBadge(mysql, userId: number, badgeName: string, badgeIcon: string, description: string) {
  try {
    await mysql.query('INSERT INTO user_badges (user_id, badge_name, badge_icon, description) VALUES (?, ?, ?, ?)', [userId, badgeName, badgeIcon, description])
    return true
  } catch (err) {
    return false
  }
}
