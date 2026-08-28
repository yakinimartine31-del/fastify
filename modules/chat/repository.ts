export async function createConversation(mysql, user1Id: number, user2Id: number) {
  const [existing] = await mysql.query(
    'SELECT id FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
    [user1Id, user2Id, user2Id, user1Id]
  )
  if (existing.length > 0) {
    return existing[0].id
  }
  const [result] = await mysql.query(
    'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
    [user1Id, user2Id]
  )
  return result.insertId
}

export async function getConversations(mysql, userId: number) {
  const [conversations] = await mysql.query(`
    SELECT c.id, c.last_message_at, c.created_at,
           CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END as other_user_id,
           u.name as other_user_name, u.photo_url as other_user_photo
    FROM conversations c
    JOIN users u ON (CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END) = u.id
    WHERE c.user1_id = ? OR c.user2_id = ?
    ORDER BY c.last_message_at DESC
  `, [userId, userId, userId, userId])
  return conversations
}

export async function getConversationById(mysql, conversationId: number, userId: number) {
  const [conversations] = await mysql.query(`
    SELECT c.id, c.user1_id, c.user2_id, c.last_message_at, c.created_at,
           CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END as other_user_id,
           u.name as other_user_name, u.photo_url as other_user_photo
    FROM conversations c
    JOIN users u ON (CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END) = u.id
    WHERE c.id = ? AND (c.user1_id = ? OR c.user2_id = ?)
  `, [userId, userId, conversationId, userId, userId])
  return conversations[0] || null
}

export async function sendMessage(mysql, conversationId: number, senderId: number, content: string, type: string = 'text') {
  const [conversation] = await mysql.query('SELECT user1_id, user2_id FROM conversations WHERE id = ?', [conversationId])
  const receiverId = conversation[0]?.user1_id === senderId ? conversation[0]?.user2_id : conversation[0]?.user1_id
  
  const [result] = await mysql.query(
    'INSERT INTO messages (conversation_id, sender_id, content, type) VALUES (?, ?, ?, ?)',
    [conversationId, senderId, content, type]
  )
  await mysql.query('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId])
  return { messageId: result.insertId, receiverId }
}

export async function getMessages(mysql, conversationId: number, limit: number = 50, offset: number = 0) {
  const [messages] = await mysql.query(`
    SELECT m.id, m.conversation_id, m.sender_id, m.content, m.type, m.read_at, m.created_at,
           u.name as sender_name, u.photo_url as sender_photo
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `, [conversationId, limit, offset])
  return messages.reverse()
}

export async function markMessagesAsRead(mysql, conversationId: number, userId: number) {
  await mysql.query(
    'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL',
    [conversationId, userId]
  )
  return true
}

export async function createGroupChat(mysql, name: string, createdBy: number, memberIds: number[]) {
  const [result] = await mysql.query(
    'INSERT INTO group_chats (name, created_by) VALUES (?, ?)',
    [name, createdBy]
  )
  const groupId = result.insertId
  await mysql.query('INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)', [groupId, createdBy, 'admin'])
  for (const memberId of memberIds) {
    if (memberId !== createdBy) {
      await mysql.query('INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)', [groupId, memberId, 'member'])
    }
  }
  return groupId
}

export async function getGroupChats(mysql, userId: number) {
  const [groups] = await mysql.query(`
    SELECT gc.id, gc.name, gc.created_by, gc.created_at,
           COUNT(gm.id) as member_count,
           u.name as creator_name
    FROM group_chats gc
    JOIN group_members gm ON gc.id = gm.group_id
    JOIN users u ON gc.created_by = u.id
    WHERE gm.user_id = ?
    GROUP BY gc.id
    ORDER BY gc.created_at DESC
  `, [userId])
  return groups
}

export async function getGroupMessages(mysql, groupId: number, limit: number = 50, offset: number = 0) {
  const [messages] = await mysql.query(`
    SELECT m.id, m.group_id, m.sender_id, m.content, m.type, m.read_at, m.created_at,
           u.name as sender_name, u.photo_url as sender_photo
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.group_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `, [groupId, limit, offset])
  return messages.reverse()
}

export async function sendGroupMessage(mysql, groupId: number, senderId: number, content: string, type: string = 'text') {
  const [result] = await mysql.query(
    'INSERT INTO messages (group_id, sender_id, content, type) VALUES (?, ?, ?, ?)',
    [groupId, senderId, content, type]
  )
  return result.insertId
}

export async function initiateVoiceCall(mysql, callerId: number, receiverId: number, callType: string = 'voice') {
  const [result] = await mysql.query(
    'INSERT INTO voice_calls (caller_id, receiver_id, status, call_type) VALUES (?, ?, ?, ?)',
    [callerId, receiverId, 'ringing', callType]
  )
  return result.insertId
}

export async function updateCallOffer(mysql, callId: number, userId: number, offerSdp: string) {
  await mysql.query('UPDATE voice_calls SET offer_sdp = ? WHERE id = ? AND (caller_id = ? OR receiver_id = ?)', [offerSdp, callId, userId, userId])
  return true
}

export async function updateCallAnswer(mysql, callId: number, userId: number, answerSdp: string) {
  await mysql.query('UPDATE voice_calls SET answer_sdp = ? WHERE id = ? AND (caller_id = ? OR receiver_id = ?)', [answerSdp, callId, userId, userId])
  return true
}

export async function addIceCandidate(mysql, callId: number, userId: number, candidate: any) {
  const [result] = await mysql.query('SELECT ice_candidates FROM voice_calls WHERE id = ?', [callId])
  const currentCandidates = result[0]?.ice_candidates || []
  currentCandidates.push({ candidate, userId, timestamp: Date.now() })
  await mysql.query('UPDATE voice_calls SET ice_candidates = ? WHERE id = ? AND (caller_id = ? OR receiver_id = ?)', [JSON.stringify(currentCandidates), callId, userId, userId])
  return true
}

export async function updateVoiceCallStatus(mysql, callId: number, status: string, userId: number) {
  const [result] = await mysql.query('UPDATE voice_calls SET status = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ? AND (caller_id = ? OR receiver_id = ?) AND status = ?', [status, callId, userId, userId, 'ringing'])
  if (result.affectedRows === 0) return false
  if (status === 'ended') {
    const [calls] = await mysql.query('SELECT started_at FROM voice_calls WHERE id = ?', [callId])
    if (calls.length > 0 && calls[0].started_at) {
      const duration = Math.floor((Date.now() - new Date(calls[0].started_at).getTime()) / 1000)
      await mysql.query('UPDATE voice_calls SET duration = ? WHERE id = ?', [duration, callId])
    }
  }
  return true
}

export async function getCallHistory(mysql, userId: number) {
  const [calls] = await mysql.query(`
    SELECT vc.id, vc.caller_id, vc.receiver_id, vc.status, vc.duration, vc.started_at, vc.ended_at, vc.call_type,
           u1.name as caller_name, u2.name as receiver_name
    FROM voice_calls vc
    JOIN users u1 ON vc.caller_id = u1.id
    JOIN users u2 ON vc.receiver_id = u2.id
    WHERE vc.caller_id = ? OR vc.receiver_id = ?
    ORDER BY vc.started_at DESC
    LIMIT 50
  `, [userId, userId])
  return calls
}
