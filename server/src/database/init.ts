import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
}

export async function initDatabase() {
  const db = getPool();

  // Create users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_email (email)
    )
  `);

  // Create player_stats table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS player_stats (
      user_id VARCHAR(36) PRIMARY KEY,
      games_played INT DEFAULT 0,
      wins INT DEFAULT 0,
      losses INT DEFAULT 0,
      kills INT DEFAULT 0,
      deaths INT DEFAULT 0,
      time_played INT DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables initialized');
}
