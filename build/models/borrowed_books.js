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
exports.BorrowedBooks = void 0;
const database_1 = __importDefault(require("../database"));
const dotenv_1 = __importDefault(require("dotenv"));
const books_1 = require("./books");
dotenv_1.default.config();
const books_store = new books_1.Books();
class BorrowedBooks {
    index() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = 'SELECT * FROM borrowed_books;';
                const result = yield conn.query(sql);
                conn.release();
                return result.rows;
            }
            catch (err) {
                throw new Error(`cannot get borrowed books ${err}`);
            }
        });
    }
    get_borrowed_book(book_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `SELECT * FROM borrowed_books WHERE book_id=${book_id} AND user_id=${user_id} AND is_returned = FALSE;`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows[0];
            }
            catch (err) {
                throw new Error(`cannot get borrowed book with book_id ${book_id} and user_id ${user_id} ${err}`);
            }
        });
    }
    get_borrowed_book_by_user(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `SELECT * FROM borrowed_books WHERE user_id=${user_id} AND is_returned = FALSE;`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows;
            }
            catch (err) {
                throw new Error(`cannot get borrowed books for user ${user_id} ${err}`);
            }
        });
    }
    borrow_book(book_id, user_id, days) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existing_borrowed_book = yield this.get_borrowed_book(book_id, user_id);
                if (existing_borrowed_book !== undefined) {
                    return existing_borrowed_book;
                }
                const book = yield books_store.get_by_id(book_id);
                if (book.available_quantity == 0) {
                    return null;
                }
                const borrowed_date = new Date(Date.now());
                const due_date = new Date(borrowed_date.getTime() + days * 24 * 60 * 60 * 1000);
                yield books_store.decrement_quantity(book_id);
                const borrowed_book = yield this.create(book_id, user_id, borrowed_date, due_date);
                return borrowed_book;
            }
            catch (err) {
                throw new Error("Cannot create borrowed book");
            }
        });
    }
    create(book_id, user_id, borrowed_date, due_date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = 'INSERT INTO borrowed_books (book_id,user_id,borrowed_date,due_date) VALUES ($1,$2,$3,$4) RETURNING *';
                const result = yield conn.query(sql, [
                    book_id,
                    user_id,
                    borrowed_date,
                    due_date
                ]);
                conn.release();
                return result.rows[0];
            }
            catch (err) {
                console.log(err);
                throw new Error(`cannot create borrowed book record: ${err}`);
            }
        });
    }
    return_book(book_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const borrowed_book = yield this.get_borrowed_book(book_id, user_id);
                if (borrowed_book == null) {
                    return "You don't have this book";
                }
                yield books_store.increment_quantity(book_id);
                yield this.mark_returned(book_id, user_id);
                return "Book returned successfully !!";
            }
            catch (err) {
                console.log(err);
                throw new Error(`cannot return book with id ${book_id}, ${err}`);
            }
        });
    }
    mark_returned(book_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `UPDATE borrowed_books SET is_returned = TRUE WHERE user_id = ${user_id} AND book_id = ${book_id} AND is_returned = FALSE;`;
                yield conn.query(sql);
                conn.release();
            }
            catch (err) {
                console.log(err);
                throw new Error("Can't update borrowed book record");
            }
        });
    }
    delete(book_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `DELETE FROM borrowed_books WHERE book_id = ${book_id} AND user_id = ${user_id}`;
                yield conn.query(sql);
                conn.release();
            }
            catch (err) {
                throw new Error('cannot delete borrowed book');
            }
        });
    }
    get_overdue_books() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `SELECT * FROM borrowed_books WHERE due_date <= now() AND is_returned = FALSE`;
                const result = yield conn.query(sql);
                conn.release();
                return result.rows;
            }
            catch (err) {
                throw new Error('cannot get overdue borrowed books');
            }
        });
    }
    get_borrowing_processes(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `SELECT * FROM borrowed_books WHERE borrowed_date >= '${from.toISOString()}' AND borrowed_date <= '${to.toISOString()}'`;
                console.log(sql);
                const result = yield conn.query(sql);
                conn.release();
                return result.rows;
            }
            catch (err) {
                console.log(err);
                throw new Error("cannot get borrowing processes");
            }
        });
    }
    get_overdue_processes(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield database_1.default.connect();
                const sql = `SELECT * FROM borrowed_books WHERE borrowed_date >= '${from.toISOString()}' AND borrowed_date <= '${to.toISOString()}' 
      AND is_returned = FALSE AND due_date <= now()`;
                console.log(sql);
                const result = yield conn.query(sql);
                conn.release();
                return result.rows;
            }
            catch (err) {
                console.log(err);
                throw new Error("cannot get overdue processes");
            }
        });
    }
}
exports.BorrowedBooks = BorrowedBooks;
