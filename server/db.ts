import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in your environment variables");
}

// Initialize pool FIRST
const pool = postgres(process.env.DATABASE_URL, {  // Remove the ! since we already checked DATABASE_URL
  host: 'localhost',
  port: 5432,
  username: 'frauduser1',
  password: 'home2030', // Replace with actual password
  database: 'fraudshield',
  ssl: false,
  connection: {
    application_name: 'fraud-shield-app'
  }
});

// Then create db with the initialized pool
export const db = drizzle(pool, { schema });

// Optional: Export pool if needed elsewhere
export { pool };