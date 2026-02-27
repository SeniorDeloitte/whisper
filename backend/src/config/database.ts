import "dotenv/config";
import { Pool } from "pg";

// Database connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Connection string from environment variables
  ssl: { rejectUnauthorized: false }, // Disable SSL verification (not recommended for production)
});

// Connect to the database
export async function connectDB() {
  await pool.connect(); // Connect to the database using the connection pool
}
