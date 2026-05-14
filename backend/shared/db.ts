import { Pool } from 'pg';
import Redis from 'ioredis';

const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT || '5432');
const POSTGRES_USER = process.env.POSTGRES_USER || 'ecommerce';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'secretpassword';
const POSTGRES_DB = process.env.POSTGRES_DB || 'ecommerce';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

let dbPool: Pool | null = null;
let redisClient: Redis | null = null;

export function getDbConnection(): Pool {
  if (!dbPool) {
    if (!POSTGRES_HOST || !POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
      throw new Error('Missing required PostgreSQL environment variables');
    }
    dbPool = new Pool({
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return dbPool;
}

export function getRedisConnection(): Redis {
  if (!redisClient) {
    const port = parseInt(String(REDIS_PORT));
    if (isNaN(port)) {
      throw new Error('Invalid REDIS_PORT value');
    }
    redisClient = new Redis({
      host: REDIS_HOST,
      port: port,
    });
  }
  return redisClient;
}

export async function closeDbConnection(): Promise<void> {
  if (dbPool) {
    await dbPool.end();
    dbPool = null;
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export function closeAllConnections(): Promise<void> {
  return Promise.all([closeDbConnection(), closeRedisConnection()]).then(() => {});
}