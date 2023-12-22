import pg from 'pg';
import 'dotenv/config';

console.log(process.env.DB_NAME);

const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: 5432,
});

export default pool;
