
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in your environment variables",
  );
}

export const pool = postgres(process.env.DATABASE_URL);
export const db = drizzle(pool, { schema });
