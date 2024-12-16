import { User, Users } from '../../models/users';
import client from '../../database';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();
const store = new Users();
let user: User;
describe('Users model ', () => {
  beforeAll(async () => {
    const conn = await client.connect();
    const sql =
      'INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING *';
    const salt_rounds: string = '' + process.env.SALT_ROUNDS;
    const hash: string = bcrypt.hashSync(
      'password123' + process.env.PEPPER,
      parseInt(salt_rounds)
    );
    const result = await conn.query(sql, ['shehabgad', 'shehabgad@gmail', hash]);
    user = result.rows[0];
    conn.release();
  });
  afterAll(async () => {
    try {
      const conn = await client.connect();
      let sql =
        'DELETE FROM users;\nALTER SEQUENCE users_id_seq RESTART WITH 1;';
      await conn.query(sql);
      conn.release();
    } catch (err) {
      throw new Error(err + '');
    }
  });
  it('should have an index method', () => {
    expect(store.index).toBeDefined();
  });
  it('should have a get_user method', () => {
    expect(store.get_user).toBeDefined();
  });
  it('should have an create method', () => {
    expect(store.create).toBeDefined();
  });
  it('should have an update method', () => {
    expect(store.update).toBeDefined();
  });
  it('should have a login method', () => {
    expect(store.login).toBeDefined();
  });
  it('index method should return a list of all users', async () => {
    const result = await store.index();
    expect(result).toEqual([user]);
  });
  it('get_user method should return a user with the provided username', async () => {
    const result = await store.get_user('shehabgad');
    expect(result).toEqual(user);
  });
  it('create method should create a new user and return the data of the created user', async () => {
    const result = await store.create(
      'tarekgad',
      'tarek@gmail.com',
      'password321'
    );
    expect(result).toBeDefined();
  });
  it('update method should update user with a certain email,password and return the updated data of the user', async () => {
    const result = await store.update(
      'shehabgad',
      'shehabgad56565@gmail.com',
      '56533711',
    );
    expect(result).toBeDefined();
  });
  it('login method should return a user provided the username and password', async () => {
    const result = await store.login('shehabgad', '56533711');
    expect(result).not.toBeNull();
  });
});