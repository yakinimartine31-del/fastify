import * as feedService from './service.js'

export async function createFeedPost(fastify, request, body) {
  const userId = request.user.id
  const postId = await feedService.createPost(fastify.mysql, userId, body)
  return { postId }
}

export async function getFeed(fastify, request) {
  const limit = parseInt(request.query.limit as string) || 20
  const offset = parseInt(request.query.offset as string) || 0
  return feedService.getFeed(fastify.mysql, limit, offset)
}

export async function getPostById(fastify, request) {
  const { id } = request.params
  return feedService.getPost(fastify.mysql, parseInt(id))
}

export async function updateFeedPost(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return feedService.updatePost(fastify.mysql, parseInt(id), userId, request.body)
}

export async function deleteFeedPost(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return feedService.deletePost(fastify.mysql, parseInt(id), userId)
}

export async function likeFeedPost(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  const result = await feedService.toggleLike(fastify.mysql, parseInt(id), userId)
  if (result.liked && result.postUserId && result.postUserId !== userId) {
    const post = await feedService.getPost(fastify.mysql, parseInt(id))
    try {
      const [actor] = await fastify.mysql.query('SELECT name FROM users WHERE id = ?', [userId])
      const actorName = actor[0]?.name || 'Someone'
      const notificationsModule = await import('../notifications/service.js')
      await notificationsModule.sendNotification(
        fastify.mysql, result.postUserId, userId, 'like',
        'Someone liked your post',
        `${actorName} liked your post`,
        { post_id: parseInt(id), post_content: post.content?.substring(0, 100) }
      )
    } catch (e) {}
  }
  return { liked: result.liked, message: result.message }
}

export async function getPostComments(fastify, request) {
  const { id } = request.params
  const limit = parseInt(request.query.limit as string) || 50
  const offset = parseInt(request.query.offset as string) || 0
  return feedService.getComments(fastify.mysql, parseInt(id), limit, offset)
}

export async function addPostComment(fastify, request, body) {
  const userId = request.user.id
  const { id } = request.params
  const { content } = body
  const result = await feedService.addComment(fastify.mysql, parseInt(id), userId, content)
  if (result.postUserId && result.postUserId !== userId) {
    try {
      const [actor] = await fastify.mysql.query('SELECT name FROM users WHERE id = ?', [userId])
      const actorName = actor[0]?.name || 'Someone'
      const notificationsModule = await import('../notifications/service.js')
      await notificationsModule.sendNotification(
        fastify.mysql, result.postUserId, userId, 'comment',
        'Someone commented on your post',
        `${actorName} commented: "${content.substring(0, 50)}"`,
        { post_id: parseInt(id), comment_id: result.commentId }
      )
    } catch (e) {}
  }
  return { commentId: result.commentId, message: result.message }
}

export async function deletePostComment(fastify, request) {
  const userId = request.user.id
  const { id } = request.params
  return feedService.deleteComment(fastify.mysql, parseInt(id), userId)
}

export async function voteContestPost(fastify, request, body) {
  const userId = request.user.id
  const { id } = request.params
  const { contest_id } = body
  return feedService.voteContestPost(fastify.mysql, parseInt(id), userId, contest_id)
}

export async function getActiveContests(fastify) {
  return feedService.getContests(fastify.mysql)
}

export async function getContestPosts(fastify, request) {
  const { id } = request.params
  const limit = parseInt(request.query.limit as string) || 20
  return feedService.getContestPosts(fastify.mysql, parseInt(id), limit)
}
