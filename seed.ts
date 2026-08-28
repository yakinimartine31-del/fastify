import mysql from 'mysql2/promise'
import { seedAll } from './seeds/index.ts'
import dbConfig from './config/database.ts'

const { promise: _promise, ...connectionConfig } = dbConfig

async function main() {
  let connection
  try {
    connection = await mysql.createConnection(connectionConfig)
    await seedAll(connection)
    console.log('✅ Seed data inserted successfully')
  } catch (err: any) {
    console.error('Error seeding data:', err.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

main()
