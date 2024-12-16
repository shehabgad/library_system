import client from '../database';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();

const { SALT_ROUNDS, PEPPER } = process.env;

export type User = {
  id: number;
  username: string;
  email: string
  password: string
  registered_date: Date
}

export class Users {
  async index(): Promise<User[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM users;';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`cannot get users ${err}`);
    }
  }
  async get_user(username: string): Promise<User> {
    try {
      const conn = await client.connect();
      const sql = `SELECT * FROM users WHERE username = '${username}';`;
      const result = await conn.query(sql);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`cannot get product ${err}`);
    }
  }
  async create(username: string, email: string, password: string): Promise<User> {
    try {
      const conn = await client.connect();
      const sql = 'INSERT INTO users (username,password,email) VALUES ($1,$2,$3) RETURNING *';
      const salt_rounds: string = '' + SALT_ROUNDS;
      const hash = bcrypt.hashSync(password + PEPPER, parseInt(salt_rounds));
      const result = await conn.query(sql, [
        username,
        hash,
        email
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`cannot create user ${err}`);
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    const conn = await client.connect();
    const sql = 'SELECT * from users WHERE userName = ($1)';
    const result = await conn.query(sql, [username]);
    if (result.rows.length) {
      const user = result.rows[0];
      if (bcrypt.compareSync(password + PEPPER, user.password)) {
        return user;
      }
    }
    conn.release();
    return null;
  }
  async update(username: string, email: string, password: string): Promise<User> {
    try {
      let values_to_update = this.get_values_to_update_array(email, password)
      const conn = await client.connect()
      const sql = `UPDATE users SET ${values_to_update.join(', ')} WHERE username='${username}' RETURNING *`
      console.log(sql)
      const result = await conn.query(sql)
      conn.release()
      return result.rows[0]
    } catch (err) {
      throw new Error(`cannot update user with username`)
    }
  }
  private get_values_to_update_array(email: string, password: string): string[] {
    let values_to_update: string[] = []
    if (email !== undefined) {
      values_to_update.push(`email='${email}'`)
    }
    if (password !== undefined) {
      const salt_rounds: string = '' + SALT_ROUNDS;
      const hash = bcrypt.hashSync(password + PEPPER, parseInt(salt_rounds));
      values_to_update.push(`password='${hash}'`)
    }
    return values_to_update
  }

  async delete(username: string) {
    try {
      const conn = await client.connect();
      const sql = `DELETE FROM users WHERE username='${username}' RETURNING *`;
      const result = await conn.query(sql);
      conn.release()
      return result.rows[0];
    } catch (err) {
      throw new Error(`cannot delete user ${err}`);
    }
  }
}