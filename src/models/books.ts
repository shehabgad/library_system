import client from '../database';
import dotenv from 'dotenv';
dotenv.config();

export type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  available_quantity: number;
  shelf_location: string;
}

export class Books {
  async index(): Promise<Book[]> {
    try {
      const conn = await client.connect();
      const sql = 'SELECT * FROM books;';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`cannot get books ${err}`);
    }
  }
  async create(title: string, author: string, isbn: string, available_quantity: number, shelf_location: string): Promise<Book> {
    try {
      const conn = await client.connect();
      const sql = 'INSERT INTO books (title,author,isbn,available_quantity,shelf_location) VALUES ($1,$2,$3,$4,$5) RETURNING *';
      const result = await conn.query(sql, [
        title,
        author,
        isbn,
        available_quantity,
        shelf_location
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`cannot create book ${err}`);
    }
  }
  async search_by_title(title: string): Promise<Book[]> {
    try {
      const conn = await client.connect();
      const sql = `SELECT * FROM books WHERE title ILIKE %${title}%;`;
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`cannot get books with title ${title}: ${err}`);
    }
  }
  async get_by_id(book_id: number): Promise<Book> {
    try {
      const conn = await client.connect();
      const sql = `SELECT * FROM books WHERE id=${book_id};`;
      const result = await conn.query(sql);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`cannot get book with id ${book_id}: ${err}`);
    }
  }
  async get_by_isbn(isbn: string): Promise<Book> {
    try {
      const conn = await client.connect();
      const sql = `SELECT * FROM books WHERE isbn='${isbn}';`;
      const result = await conn.query(sql);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`cannot get book with isbn ${isbn}: ${err}`);
    }
  }

  async search_by_author(author: string): Promise<Book[]> {
    try {
      const conn = await client.connect();
      const sql = `SELECT * FROM books WHERE author ILIKE %${author}%;`;
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`cannot get books with author ${author}: ${err}`);
    }
  }

  async update(id: number, title: string, author: string, isbn: string, available_quantity: number, shelf_location: string): Promise<Book | null> {
    try {
      let values_to_update = this.get_values_to_update_array(title, author, isbn, available_quantity, shelf_location)
      if (values_to_update.length == 0) {
        return null
      }
      const conn = await client.connect()
      const sql = `UPDATE books SET ${values_to_update.join(', ')} WHERE id=${id} RETURNING *`
      console.log(sql)
      const result = await conn.query(sql)
      conn.release()
      return result.rows[0]
    } catch (err) {
      throw new Error(`cannot update book with id ${id}`)
    }
  }

  async delete(id: number): Promise<Book> {
    try {
      const conn = await client.connect();
      const sql = `DELETE FROM books WHERE id = ${id} RETURNING *`;
      const result = await conn.query(sql);
      conn.release()
      return result.rows[0];
    } catch (err) {
      throw new Error('cannot delete book');
    }
  }
  async decrement_quantity(book_id: number) {
    try {
      const conn = await client.connect();
      const sql = `UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ${book_id}`;
      const result = await conn.query(sql);
      conn.release()
      return result.rows[0];
    } catch (err) {
      console.log(err)
      throw new Error('cannot decrement book availble_quantity');
    }
  }

  async increment_quantity(book_id: number) {
    try {
      const conn = await client.connect();
      const sql = `
       UPDATE books
       SET available_quantity = available_quantity + 1
       WHERE id = ${book_id}`;
      const result = await conn.query(sql);
      conn.release()
      return result.rows[0];
    } catch (err) {
      throw new Error('cannot increment book availble_quantity');
    }
  }
  async search_books(title: string, author: string, isbn: string): Promise<Book[]> {
    try {
      const conn = await client.connect();
      const keys_to_search_by = this.get_keys_to_search_by(title, author, isbn)
      const conditions_query_part = keys_to_search_by.length > 0 ? 'WHERE ' + keys_to_search_by.join(' AND ') : ''
      const sql =
        `SELECT * FROM books ${conditions_query_part};`;
      console.log(sql)
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`cannot get books: ${err}`);
    }
  }

  private get_values_to_update_array(title: string, author: string, isbn: string, available_quantity: number, shelf_location: string) {
    let values_to_update: string[] = []
    if (title !== undefined) {
      values_to_update.push(`title='${title}'`)
    }
    if (author !== undefined) {
      values_to_update.push(`author='${author}'`)
    }
    if (isbn !== undefined) {
      values_to_update.push(`isbn='${isbn}'`)
    }
    if (available_quantity !== undefined) {
      values_to_update.push(`available_quantity=${available_quantity}`)
    }
    if (shelf_location !== undefined) {
      values_to_update.push(`shelf_location='${shelf_location}'`)
    }
    return values_to_update
  }

  private get_keys_to_search_by(title: string, author: string, isbn: string): string[] {
    const keys_to_search_by: string[] = []
    if (title !== undefined) {
      keys_to_search_by.push(`title ILIKE '%${title}%'`)
    }
    if (author !== undefined) {
      keys_to_search_by.push(`author ILIKE '%${author}%'`)
    }
    if (isbn !== undefined) {
      keys_to_search_by.push(`isbn='${isbn}'`)
    }
    return keys_to_search_by
  }

}
