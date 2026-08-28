import mysql from 'mysql2/promise'
import dbConfig from './config/database.js'
import { migrate } from './migrations/001_initial_schema.js'

async function main() {
  let connection
  try {
    connection = await mysql.createConnection(dbConfig)
    console.log('Connected to MySQL')
    
    await migrate(connection)
    console.log('✅ Migration completed successfully')
    
    await connection.end()
    console.log('Database connection closed')
  } catch (err: any) {
    console.error('Error:', err.message)
    if (connection) {
      await connection.end()
    }
    process.exit(1)
  }
}

main()
