"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Books = void 0;
const database_1 = __importDefault(require("../database"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Books {
    index() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = 'SELECT * FROM books;';
                const result = yield conn.query(sql);
                conn.release();
                return result.rows;
            }
            catch (err) {
                throw new Error(`cannot get books ${err}`);
            }
        });
    }
    create(title, author, isbn, available_quantity, shelf_location) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = 'INSERT INTO books (title,author,isbn,available_quantity,shelf_location) VALUES ($1,$2,$3,$4,$5) RETURNING *';
                const result = yield conn.query(sql, [
                    title,
                    author,
                    isbn,
                    available_quantity,
                    shelf_location
                ]);
                conn.release();
                return result.rows[0];
            }
            catch (err) {
                throw new Error(`cannot create book ${err}`);
            }
        });
    }
    search_by_title(title) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `SELECT * FROM books WHERE title ILIKE %${title}%;`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows;
            }
            catch (err) {
                throw new Error(`cannot get books with title ${title}: ${err}`);
            }
        });
    }
    get_by_id(book_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `SELECT * FROM books WHERE id=${book_id};`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows[0];
            }
            catch (err) {
                throw new Error(`cannot get book with id ${book_id}: ${err}`);
            }
        });
    }
    get_by_isbn(isbn) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `SELECT * FROM books WHERE isbn='${isbn}';`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows[0];
            }
            catch (err) {
                throw new Error(`cannot get book with isbn ${isbn}: ${err}`);
            }
        });
    }
    search_by_author(author) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `SELECT * FROM books WHERE author ILIKE %${author}%;`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows;
            }
            catch (err) {
                throw new Error(`cannot get books with author ${author}: ${err}`);
            }
        });
    }
    update(id, title, author, isbn, available_quantity, shelf_location) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let values_to_update = this.get_values_to_update_array(title, author, isbn, available_quantity, shelf_location);
                if (values_to_update.length == 0) {
                    return null;
                }
                const conn = yield database_1.default.connect();
                const sql = `UPDATE books SET ${values_to_update.join(', ')} WHERE id=${id} RETURNING *`;
                console.log(sql);
                const result = yield conn.query(sql);
                conn.release();
                return result.rows[0];
            }
            catch (err) {
                throw new Error(`cannot update book with id ${id}`);
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `DELETE FROM books WHERE id = ${id} RETURNING *`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows[0];
            }
            catch (err) {
                throw new Error('cannot delete book');
            }
        });
    }
    decrement_quantity(book_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ${book_id}`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows[0];
            }
            catch (err) {
                console.log(err);
                throw new Error('cannot decrement book availble_quantity');
            }
        });
    }
    increment_quantity(book_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `
       UPDATE books
       SET available_quantity = available_quantity + 1
       WHERE id = ${book_id}`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows[0];
            }
            catch (err) {
                throw new Error('cannot increment book availble_quantity');
            }
        });
    }
    search_books(title, author, isbn) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const keys_to_search_by = this.get_keys_to_search_by(title, author, isbn);
                const conditions_query_part = keys_to_search_by.length > 0 ? 'WHERE ' + keys_to_search_by.join(' AND ') : '';
                const sql = `SELECT * FROM books ${conditions_query_part};`;
                console.log(sql);
                const result = yield conn.query(sql);
                conn.release();
                return result.rows;
            }
            catch (err) {
                throw new Error(`cannot get books: ${err}`);
            }
        });
    }
    get_values_to_update_array(title, author, isbn, available_quantity, shelf_location) {
        let values_to_update = [];
        if (title !== undefined) {
            values_to_update.push(`title='${title}'`);
        }
        if (author !== undefined) {
            values_to_update.push(`author='${author}'`);
        }
        if (isbn !== undefined) {
            values_to_update.push(`isbn='${isbn}'`);
        }
        if (available_quantity !== undefined) {
            values_to_update.push(`available_quantity=${available_quantity}`);
        }
        if (shelf_location !== undefined) {
            values_to_update.push(`shelf_location='${shelf_location}'`);
        }
        return values_to_update;
    }
    get_keys_to_search_by(title, author, isbn) {
        const keys_to_search_by = [];
        if (title !== undefined) {
            keys_to_search_by.push(`title ILIKE '%${title}%'`);
        }
        if (author !== undefined) {
            keys_to_search_by.push(`author ILIKE '%${author}%'`);
        }
        if (isbn !== undefined) {
            keys_to_search_by.push(`isbn='${isbn}'`);
        }
        return keys_to_search_by;
    }
}
exports.Books = Books;
