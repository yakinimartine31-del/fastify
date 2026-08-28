import * as feedRepository from './repository.js'

export async function createPost(mysql, userId: number, data: { content?: string; media_urls?: string[]; type?: string }) {
  if (!data.content && (!data.media_urls || data.media_urls.length === 0)) {
    throw new Error('Content or media is required')
  }
  return feedRepository.createPost(mysql, userId, data)
}

export async function getFeed(mysql, limit: number = 20, offset: number = 0) {
  return feedRepository.getPosts(mysql, limit, offset)
}

export async function getPost(mysql, postId: number) {
  const post = await feedRepository.getPostById(mysql, postId)
  if (!post) {
    throw new Error('Post not found')
  }
  return post
}

export async function updatePost(mysql, postId: number, userId: number, data: { content?: string; media_urls?: string[]; type?: string }) {
  const updated = await feedRepository.updatePost(mysql, postId, userId, data)
  if (!updated) {
    throw new Error('Post not found or unauthorized')
  }
  return feedRepository.getPostById(mysql, postId)
}

export async function deletePost(mysql, postId: number, userId: number) {
  const deleted = await feedRepository.deletePost(mysql, postId, userId)
  if (!deleted) {
    throw new Error('Post not found or unauthorized')
  }
  return { message: 'Post deleted successfully' }
}

export async function toggleLike(mysql, postId: number, userId: number) {
  const result = await feedRepository.likePost(mysql, postId, userId)
  return { liked: result.liked, message: result.liked ? 'Post liked' : 'Post unliked', postUserId: result.postUserId }
}

export async function getComments(mysql, postId: number, limit: number = 50, offset: number = 0) {
  return feedRepository.getPostComments(mysql, postId, limit, offset)
}

export async function addComment(mysql, postId: number, userId: number, content: string) {
  if (!content.trim()) {
    throw new Error('Comment content is required')
  }
  const result = await feedRepository.createComment(mysql, postId, userId, content)
  return { commentId: result.commentId, message: 'Comment added', postUserId: result.postUserId }
}

export async function deleteComment(mysql, commentId: number, userId: number) {
  const deleted = await feedRepository.deleteComment(mysql, commentId, userId)
  if (!deleted) {
    throw new Error('Comment not found or unauthorized')
  }
  return { message: 'Comment deleted' }
}

export async function voteContestPost(mysql, postId: number, userId: number, contestId: number) {
  const voted = await feedRepository.votePost(mysql, postId, userId, contestId)
  return { voted, message: voted ? 'Vote recorded' : 'Vote removed' }
}

export async function getContests(mysql) {
  return feedRepository.getActiveContests(mysql)
}

export async function getContestPosts(mysql, contestId: number, limit: number = 20) {
  return feedRepository.getContestPosts(mysql, contestId, limit)
}
