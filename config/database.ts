export default {
  promise: true,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'iROCeFLUaymQmMoDETfUwdCrVRxkAbYr',
  database: process.env.DB_NAME || 'fastify_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  connectionLimit: 10
}

export const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
