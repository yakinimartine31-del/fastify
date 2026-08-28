import * as authRepository from './repository.js'
import * as authUtils from './utils.js'

export async function registerUser(mysql, data: { email: string; password: string; name: string; age?: number; gender?: string; bio?: string; photo_url?: string; location?: string; gender_preference?: string }) {
  const existing = await authRepository.findByEmail(mysql, data.email)
  if (existing) {
    throw new Error('Email already registered')
  }

  const hashedPassword = await authUtils.hashPassword(data.password)
  const genderPreference = data.gender_preference || (data.gender === 'male' ? 'female' : data.gender === 'female' ? 'male' : 'none')
  const userId = await authRepository.createUser(mysql, {
    ...data,
    password: hashedPassword,
    gender_preference: genderPreference
  })

  const user = await authRepository.findById(mysql, userId)
  const { password: _, ...safeUser } = user
  return safeUser
}

export async function authenticateUser(mysql, email: string, password: string) {
  const user = await authRepository.findByEmail(mysql, email)
  if (!user) {
    throw new Error('Invalid email or password')
  }

  const isValid = await authUtils.comparePassword(password, user.password)
  if (!isValid) {
    throw new Error('Invalid email or password')
  }

  const { password: _, ...safeUser } = user
  return safeUser
}

export async function getCurrentUser(mysql, id: number) {
  const user = await authRepository.findById(mysql, id)
  if (!user) {
    throw new Error('User not found')
  }
  const { password: _, ...safeUser } = user
  return safeUser
}

export async function updateProfile(mysql, id: number, data: Record<string, unknown>) {
  const user = await authRepository.updateUser(mysql, id, data)
  if (!user) {
    throw new Error('User not found')
  }
  const { password: _, ...safeUser } = user
  return safeUser
}

export async function updateLastSeen(mysql, id: number) {
  await mysql.query('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?', [id])
  return { message: 'Last seen updated' }
}
