import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: 'postgresql://postgres:Postgresql@1729@db.lkphrbdsztbwfqllhdee.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
