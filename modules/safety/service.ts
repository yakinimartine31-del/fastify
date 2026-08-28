import * as safetyRepository from './repository.js'

export async function reportUser(mysql, reporterId: number, reportedUserId: number, reason: string, description?: string) {
  if (reporterId === reportedUserId) {
    throw new Error('Cannot report yourself')
  }
  
  const [existing] = await mysql.query(
    'SELECT id FROM reports WHERE reporter_id = ? AND reported_user_id = ? AND status = ?',
    [reporterId, reportedUserId, 'pending']
  )
  
  if (existing.length > 0) {
    throw new Error('You have already reported this user')
  }
  
  const reportId = await safetyRepository.createReport(mysql, reporterId, reportedUserId, reason, description)
  
  if (reason === 'fake_profile' || reason === 'impersonation') {
    await safetyRepository.createScamAlert(mysql, reportedUserId, reason, `User reported for ${reason}`)
  }
  
  return { reportId, message: 'Report submitted successfully' }
}

export async function getAllReports(mysql, status?: string) {
  return safetyRepository.getReports(mysql, status)
}

export async function getReport(mysql, reportId: number) {
  const report = await safetyRepository.getReportById(mysql, reportId)
  if (!report) {
    throw new Error('Report not found')
  }
  return report
}

export async function moderateReport(mysql, reportId: number, status: string, moderatorId: number) {
  const report = await safetyRepository.updateReportStatus(mysql, reportId, status)
  if (!report) {
    throw new Error('Report not found')
  }
  
  await safetyRepository.createModerationLog(mysql, moderatorId, 'moderate', moderatorId, `Report ${reportId} marked as ${status}`)
  
  return { message: `Report marked as ${status}` }
}

export async function blockAUser(mysql, userId: number, blockedUserId: number) {
  if (userId === blockedUserId) {
    throw new Error('Cannot block yourself')
  }
  
  const blocked = await safetyRepository.blockUser(mysql, userId, blockedUserId)
  if (!blocked) {
    throw new Error('User is already blocked')
  }
  
  return { message: 'User blocked successfully' }
}

export async function unblockAUser(mysql, userId: number, blockedUserId: number) {
  const unblocked = await safetyRepository.unblockUser(mysql, userId, blockedUserId)
  if (!unblocked) {
    throw new Error('User was not blocked')
  }
  
  return { message: 'User unblocked successfully' }
}

export async function getMyBlockedUsers(mysql, userId: number) {
  return safetyRepository.getBlockedUsers(mysql, userId)
}

export async function checkIfBlocked(mysql, userId1: number, userId2: number) {
  const blocked = await safetyRepository.isBlocked(mysql, userId1, userId2)
  return { blocked }
}

export async function getSafetyTips() {
  return {
    tips: [
      'Never share personal information like your address or financial details',
      'Always meet in public places for the first time',
      'Report suspicious behavior immediately',
      'Use the platform messaging system instead of external apps',
      'Verify profiles through photo verification',
      'Trust your instincts - if something feels wrong, it probably is'
    ],
    resources: [
      { name: 'Online Safety Guide', url: 'https://example.com/safety' },
      { name: 'Report Abuse', url: 'https://example.com/report' },
      { name: 'Emergency Contacts', url: 'https://example.com/emergency' }
    ]
  }
}

export async function submitPhotoVerification(mysql, userId: number, photoUrl: string) {
  const [verification] = await mysql.query(
    'INSERT INTO verifications (user_id, type, document_url) VALUES (?, ?, ?)',
    [userId, 'photo', photoUrl]
  )
  
  await safetyRepository.createScamAlert(mysql, userId, 'fake_profile', 'Photo verification submitted for review')
  
  return { verificationId: verification.insertId, status: 'pending' }
}

export async function getSafetyAlerts(mysql, userId: number) {
  return safetyRepository.getScamAlerts(mysql, userId, false)
}

export async function dismissSafetyAlert(mysql, alertId: number, userId: number) {
  const dismissed = await safetyRepository.dismissScamAlert(mysql, alertId, userId)
  if (!dismissed) {
    throw new Error('Alert not found or already dismissed')
  }
  return { message: 'Alert dismissed' }
}

export async function getModerationLogs(mysql, userId: number) {
  return safetyRepository.getModerationLogs(mysql, userId)
}

export async function getAllModerationLogs(mysql, limit: number = 100, offset: number = 0) {
  return safetyRepository.getAllModerationLogs(mysql, limit, offset)
}

export async function moderateUser(mysql, userId: number, action: string, moderatorId: number, reason?: string) {
  const validActions = ['warn', 'suspend', 'ban', 'unsuspend', 'unban']
  if (!validActions.includes(action)) {
    throw new Error('Invalid moderation action')
  }
  
  const [user] = await mysql.query('SELECT vip_status, is_active FROM users WHERE id = ?', [userId])
  if (!user || user.length === 0) {
    throw new Error('User not found')
  }
  
  if (action === 'ban' || action === 'suspend') {
    await mysql.query('UPDATE users SET is_active = FALSE WHERE id = ?', [userId])
  } else if (action === 'unsuspend' || action === 'unban') {
    await mysql.query('UPDATE users SET is_active = TRUE WHERE id = ?', [userId])
  }
  
  const logId = await safetyRepository.createModerationLog(mysql, userId, action, moderatorId, reason)
  
  return { logId, message: `User ${action}ed successfully` }
}
