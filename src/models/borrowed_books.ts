import client from '../database';
import dotenv from 'dotenv';
import { Books } from './books';
dotenv.config();

const books_store = new Books()

export type BorrowedBook = {
  book_id: number;
  user_id: number;
  borrowed_date: Date;
  due_date: Date
}

export class BorrowedBooks {
  async index(): Promise<BorrowedBook[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM borrowed_books;';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`cannot get borrowed books ${err}`);
    }
  }

  async get_borrowed_book(book_id: number, user_id: number): Promise<BorrowedBook> {
    try {
      const conn = await client.connect();
      const sql = `SELECT * FROM borrowed_books WHERE book_id=${book_id} AND user_id=${user_id} AND is_returned = FALSE;`;
      const result = await conn.query(sql);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`cannot get borrowed book with book_id ${book_id} and user_id ${user_id} ${err}`);
    }
  }

  async get_borrowed_book_by_user(user_id: number): Promise<BorrowedBook[]> {
    try {
      const conn = await client.connect();
      const sql = `SELECT * FROM borrowed_books WHERE user_id=${user_id} AND is_returned = FALSE;`;
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`cannot get borrowed books for user ${user_id} ${err}`);
    }
  }

  async borrow_book(book_id: number, user_id: number, days: number): Promise<BorrowedBook | null> {
    try {
      const existing_borrowed_book = await this.get_borrowed_book(book_id, user_id)
      if (existing_borrowed_book !== undefined) {
        return existing_borrowed_book
      }
      const book = await books_store.get_by_id(book_id)
      if (book.available_quantity == 0) {
        return null
      }
      const borrowed_date = new Date(Date.now())
      const due_date = new Date(borrowed_date.getTime() + days * 24 * 60 * 60 * 1000)
      await books_store.decrement_quantity(book_id)
      const borrowed_book = await this.create(book_id, user_id, borrowed_date, due_date)
      return borrowed_book
    } catch (err) {
      throw new Error("Cannot create borrowed book")
    }
  }

  async create(book_id: number, user_id: number, borrowed_date: Date, due_date: Date): Promise<BorrowedBook> {
    try {
      const conn = await client.connect();
      const sql = 'INSERT INTO borrowed_books (book_id,user_id,borrowed_date,due_date) VALUES ($1,$2,$3,$4) RETURNING *';
      const result = await conn.query(sql, [
        book_id,
        user_id,
        borrowed_date,
        due_date
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      console.log(err)
      throw new Error(`cannot create borrowed book record: ${err}`);
    }
  }

  async return_book(book_id: number, user_id: number) {
    try {
      const borrowed_book = await this.get_borrowed_book(book_id, user_id)
      if (borrowed_book == null) {
        return "You don't have this book"
      }
      await books_store.increment_quantity(book_id)
      await this.mark_returned(book_id, user_id)
      return "Book returned successfully !!"
    } catch (err) {
      console.log(err)
      throw new Error(`cannot return book with id ${book_id}, ${err}`)
    }
  }

  async mark_returned(book_id: number, user_id: number) {
    try {
      const conn = await client.connect()
      const sql = `UPDATE borrowed_books SET is_returned = TRUE WHERE user_id = ${user_id} AND book_id = ${book_id} AND is_returned = FALSE;`
      await conn.query(sql)
      conn.release()
    } catch (err) {
      console.log(err)
      throw new Error("Can't update borrowed book record")
    }
  }

  async delete(book_id: number, user_id: number) {
    try {
      const conn = await client.connect();
      const sql = `DELETE FROM borrowed_books WHERE book_id = ${book_id} AND user_id = ${user_id}`;
      await conn.query(sql);
      conn.release()
    } catch (err) {
      throw new Error('cannot delete borrowed book');
    }
  }

  async get_overdue_books(): Promise<BorrowedBooks[]> {
    try {
      const conn = await client.connect()
      const sql = `SELECT * FROM borrowed_books WHERE due_date <= now() AND is_returned = FALSE`
      const result = await conn.query(sql)
      conn.release()
      return result.rows
    } catch (err) {
      throw new Error('cannot get overdue borrowed books');
    }
  }

  async get_borrowing_processes(from: Date, to: Date) {
    try {
      const conn = await client.connect()
      const sql = `SELECT * FROM borrowed_books WHERE borrowed_date >= '${from.toISOString()}' AND borrowed_date <= '${to.toISOString()}'`
      console.log(sql)
      const result = await conn.query(sql)
      conn.release()
      return result.rows
    } catch (err) {
      console.log(err)
      throw new Error("cannot get borrowing processes")
    }
  }

  async get_overdue_processes(from: Date, to: Date) {
    try {
      const conn = await client.connect()
      const sql = `SELECT * FROM borrowed_books WHERE borrowed_date >= '${from.toISOString()}' AND borrowed_date <= '${to.toISOString()}' 
      AND is_returned = FALSE AND due_date <= now()`
      console.log(sql)
      const result = await conn.query(sql)
      conn.release()
      return result.rows
    } catch (err) {
      console.log(err)
      throw new Error("cannot get overdue processes")
    }
  }
}