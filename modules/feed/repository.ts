export async function createPost(mysql, userId: number, data: { content?: string; media_urls?: string[]; type?: string }) {
  const [result] = await mysql.query(
    'INSERT INTO posts (user_id, content, media_urls, type) VALUES (?, ?, ?, ?)',
    [userId, data.content || '', JSON.stringify(data.media_urls || []), data.type || 'text']
  )
  return result.insertId
}

export async function getPosts(mysql, limit: number = 20, offset: number = 0) {
  const [posts] = await mysql.query(`
    SELECT p.id, p.user_id, p.content, p.media_urls, p.type, p.likes_count, p.comments_count, p.created_at,
           u.name as user_name, u.photo_url as user_photo
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE u.is_active = TRUE
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset])
  return posts
}

export async function getPostById(mysql, postId: number) {
  const [posts] = await mysql.query(`
    SELECT p.id, p.user_id, p.content, p.media_urls, p.type, p.likes_count, p.comments_count, p.created_at,
           u.name as user_name, u.photo_url as user_photo
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `, [postId])
  return posts[0] || null
}

export async function getUserPosts(mysql, userId: number, limit: number = 20, offset: number = 0) {
  const [posts] = await mysql.query(`
    SELECT p.id, p.user_id, p.content, p.media_urls, p.type, p.likes_count, p.comments_count, p.created_at,
           u.name as user_name, u.photo_url as user_photo
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ? AND u.is_active = TRUE
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset])
  return posts
}

export async function updatePost(mysql, postId: number, userId: number, data: { content?: string; media_urls?: string[]; type?: string }) {
  const [result] = await mysql.query(
    'UPDATE posts SET content = ?, media_urls = ?, type = ? WHERE id = ? AND user_id = ?',
    [data.content || '', JSON.stringify(data.media_urls || []), data.type || 'text', postId, userId]
  )
  return result.affectedRows > 0
}

export async function deletePost(mysql, postId: number, userId: number) {
  const [result] = await mysql.query('DELETE FROM posts WHERE id = ? AND user_id = ?', [postId, userId])
  return result.affectedRows > 0
}

export async function likePost(mysql, postId: number, userId: number) {
  const [post] = await mysql.query('SELECT user_id FROM posts WHERE id = ?', [postId])
  const postUserId = post[0]?.user_id
  
  const [existing] = await mysql.query('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId])
  if (existing.length > 0) {
    await mysql.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId])
    await mysql.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?', [postId])
    return { liked: false, postUserId }
  }
  await mysql.query('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, userId])
  await mysql.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId])
  return { liked: true, postUserId }
}

export async function getPostComments(mysql, postId: number, limit: number = 50, offset: number = 0) {
  const [comments] = await mysql.query(`
    SELECT pc.id, pc.post_id, pc.user_id, pc.content, pc.created_at,
           u.name as user_name, u.photo_url as user_photo
    FROM post_comments pc
    JOIN users u ON pc.user_id = u.id
    WHERE pc.post_id = ?
    ORDER BY pc.created_at DESC
    LIMIT ? OFFSET ?
  `, [postId, limit, offset])
  return comments.reverse()
}

export async function createComment(mysql, postId: number, userId: number, content: string) {
  const [post] = await mysql.query('SELECT user_id FROM posts WHERE id = ?', [postId])
  const postUserId = post[0]?.user_id
  
  const [result] = await mysql.query(
    'INSERT INTO post_comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [postId, userId, content]
  )
  await mysql.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [postId])
  return { commentId: result.insertId, postUserId }
}

export async function deleteComment(mysql, commentId: number, userId: number) {
  const [comment] = await mysql.query('SELECT post_id FROM post_comments WHERE id = ? AND user_id = ?', [commentId, userId])
  if (comment.length === 0) return false
  const postId = comment[0].post_id
  const [result] = await mysql.query('DELETE FROM post_comments WHERE id = ? AND user_id = ?', [commentId, userId])
  if (result.affectedRows > 0) {
    await mysql.query('UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?', [postId])
  }
  return result.affectedRows > 0
}

export async function votePost(mysql, postId: number, userId: number, contestId: number) {
  const [existing] = await mysql.query('SELECT id FROM post_votes WHERE post_id = ? AND user_id = ? AND contest_id = ?', [postId, userId, contestId])
  if (existing.length > 0) {
    await mysql.query('DELETE FROM post_votes WHERE post_id = ? AND user_id = ? AND contest_id = ?', [postId, userId, contestId])
    return false
  }
  await mysql.query('INSERT INTO post_votes (post_id, user_id, contest_id) VALUES (?, ?, ?)', [postId, userId, contestId])
  return true
}

export async function getActiveContests(mysql) {
  const [contests] = await mysql.query(`
    SELECT id, name, start_date, end_date, winner_id, status, created_at
    FROM contests
    WHERE status = 'active'
    ORDER BY start_date DESC
  `)
  return contests
}

export async function getContestPosts(mysql, contestId: number, limit: number = 20) {
  const [posts] = await mysql.query(`
    SELECT p.id, p.user_id, p.content, p.media_urls, p.type, p.likes_count, p.comments_count, p.created_at,
           u.name as user_name, u.photo_url as user_photo
    FROM posts p
    JOIN post_votes pv ON p.id = pv.post_id
    JOIN users u ON p.user_id = u.id
    WHERE pv.contest_id = ?
    ORDER BY pv.created_at DESC
    LIMIT ?
  `, [contestId, limit])
  return posts
}
