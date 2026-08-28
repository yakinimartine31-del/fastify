export async function getRecommendations(mysql, userId: number, limit: number = 20) {
  const [userInterests] = await mysql.query('SELECT interest_tag FROM user_interests WHERE user_id = ?', [userId])
  const interestTags = userInterests.map((row: any) => row.interest_tag)
  
  const [currentUser] = await mysql.query('SELECT gender FROM users WHERE id = ?', [userId])
  const gender = currentUser[0]?.gender
  const oppositeGender = gender === 'male' ? 'female' : gender === 'female' ? 'male' : null
  
  let genderFilter = ''
  const params: any[] = []
  
  if (oppositeGender) {
    genderFilter = 'AND u.gender = ?'
    params.push(oppositeGender)
  }
  
  if (interestTags.length === 0) {
    const [newUsers] = await mysql.query(`
      SELECT id, name, age, gender, bio, photo_url, location, vip_status, level, last_seen, created_at 
      FROM users u
      WHERE u.id != ? AND u.is_active = TRUE ${genderFilter}
      ORDER BY u.created_at DESC 
      LIMIT ?
    `, [userId, ...params, limit])
    return newUsers
  }

  const placeholders = interestTags.map(() => '?').join(',')
  const [matchedUsers] = await mysql.query(`
    SELECT DISTINCT u.id, u.name, u.age, u.gender, u.bio, u.photo_url, u.location, u.vip_status, u.level, u.last_seen, u.created_at,
           COUNT(ui.interest_tag) as shared_interests
    FROM users u
    JOIN user_interests ui ON u.id = ui.user_id
    WHERE ui.interest_tag IN (${placeholders})
      AND u.id != ?
      AND u.is_active = TRUE
      ${genderFilter}
    GROUP BY u.id
    ORDER BY shared_interests DESC
    LIMIT ?
  `, [...interestTags, userId, ...params, limit])

  return matchedUsers
}

export async function getNearbyUsers(mysql, userId: number, latitude: number, longitude: number, radiusKm: number = 50, limit: number = 20) {
  const [currentUser] = await mysql.query('SELECT gender FROM users WHERE id = ?', [userId])
  const gender = currentUser[0]?.gender
  const oppositeGender = gender === 'male' ? 'female' : gender === 'female' ? 'male' : null

  let genderFilter = ''
  const params: any[] = [latitude, longitude, latitude, userId]

  if (oppositeGender) {
    genderFilter = 'AND u.gender = ?'
    params.push(oppositeGender)
  }

  params.push(radiusKm, limit)

  const [users] = await mysql.query(`
    SELECT id, name, age, gender, bio, photo_url, location, vip_status, level, last_seen, created_at,
           (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
    FROM users u
    WHERE id != ?
      AND is_active = TRUE
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      ${genderFilter}
    HAVING distance < ?
    ORDER BY distance ASC
    LIMIT ?
  `, params)

  return users
}

export async function getHotUsers(mysql, userId: number, limit: number = 20) {
  const [currentUser] = await mysql.query('SELECT gender FROM users WHERE id = ?', [userId])
  const oppositeGender = currentUser[0]?.gender === 'male' ? 'female' : currentUser[0]?.gender === 'female' ? 'male' : null
  const genderFilter = oppositeGender ? 'AND u.gender = ?' : ''
  const [users] = await mysql.query(`
    SELECT u.id, u.name, u.age, u.gender, u.bio, u.photo_url, u.location, u.vip_status, u.level, u.last_seen, u.created_at,
           COALESCE(us.followers_count, 0) as followers_count,
           COALESCE(us.posts_count, 0) as posts_count
    FROM users u
    LEFT JOIN user_stats us ON u.id = us.user_id
    WHERE u.is_active = TRUE AND u.id != ? ${genderFilter}
    ORDER BY followers_count DESC, posts_count DESC
    LIMIT ?
  `, [userId, ...(oppositeGender ? [oppositeGender] : []), limit])

  return users
}

export async function getNewcomers(mysql, userId: number, limit: number = 20) {
  const [currentUser] = await mysql.query('SELECT gender FROM users WHERE id = ?', [userId])
  const oppositeGender = currentUser[0]?.gender === 'male' ? 'female' : currentUser[0]?.gender === 'female' ? 'male' : null
  const genderFilter = oppositeGender ? 'AND gender = ?' : ''
  const [users] = await mysql.query(`SELECT id, name, age, gender, bio, photo_url, location, vip_status, level, last_seen, created_at FROM users WHERE is_active = TRUE AND id != ? ${genderFilter} ORDER BY created_at DESC LIMIT ?`, [userId, ...(oppositeGender ? [oppositeGender] : []), limit])
  return users
}

export async function getUserPosts(mysql, userId: number, limit: number = 20) {
  const [posts] = await mysql.query(`
    SELECT p.id, p.user_id, p.content, p.media_urls, p.type, p.likes_count, p.comments_count, p.created_at,
           u.name as user_name, u.photo_url as user_photo
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
      AND u.is_active = TRUE
    ORDER BY p.created_at DESC
    LIMIT ?
  `, [userId, limit])
  return posts
}
