import dotenv from 'dotenv'
import { Pool } from 'pg';

dotenv.config()

const { PG_HOST, PG_DB, PG_DB_TEST, PG_USER, PG_PASSWORD, ENV } = process.env;
const PG_PORT: string = process.env.PG_PORT + ''
const client = new Pool({
  host: PG_HOST,
  user: PG_USER,
  password: PG_PASSWORD,
  database: ENV === 'test' ? PG_DB_TEST : PG_DB,
  port: parseInt(PG_PORT),
});

export default client;