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
Object.defineProperty(exports, "__esModule", { value: true });
const borrowed_books_1 = require("../models/borrowed_books");
const authorize_1 = require("../middlewares/authorize");
const format_1 = require("@fast-csv/format");
const stream_1 = require("stream");
const store = new borrowed_books_1.BorrowedBooks();
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const borrowed_books = yield store.index();
        res.json(borrowed_books);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("Couldn't get all borrowed books");
    }
});
const borrow_book = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const book_id = req.body.book_id;
        const user_id = req.body.user_id;
        const days = req.body.days;
        const borrowed_book = yield store.borrow_book(book_id, user_id, days);
        res.json(borrowed_book);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("couldnt borrow book");
    }
});
const return_book = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const book_id = parseInt(req.params.book_id);
    const user_id = req.body.user_id;
    try {
        const result = yield store.return_book(book_id, user_id);
        res.json(result);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("couldnt return book");
    }
});
const get_borrowed_books_by_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const borrowed_books = yield store.get_borrowed_book_by_user(req.body.user_id);
        res.json(borrowed_books);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("couldnt get borrowed books for user");
    }
});
const get_overdue_borrowed_books = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const borrowed_books = yield store.get_overdue_books();
        res.json(borrowed_books);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("couldnt get overdue borrowed books");
    }
});
const get_borrowing_processes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const from = new Date(req.query.from);
        const to = new Date(req.query.to);
        const borrowing_processes = yield store.get_borrowing_processes(from, to);
        export_to_csv(res, borrowing_processes, 'borrowing_processes');
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("couldnt get borrowed processes");
    }
});
const get_last_month_borrowing_processes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 0, 0, 0, 0);
        const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);
        const borrowing_processes = yield store.get_borrowing_processes(lastMonthStartDate, lastMonthEndDate);
        export_to_csv(res, borrowing_processes, 'borrowing_processes_last_month');
    }
    catch (err) {
        console.log(err);
        res.status(500).json("couldn't get last month's borrowed processes");
    }
});
const get_last_month_overdue_processes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 0, 0, 0, 0);
        const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);
        const overdue_processes = yield store.get_overdue_processes(lastMonthStartDate, lastMonthEndDate);
        export_to_csv(res, overdue_processes, 'overdue_processes_last_month');
    }
    catch (err) {
        console.log(err);
        res.status(500).json("couldn't get last month's overdue processes");
    }
});
const export_to_csv = (res, data, filename) => {
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    res.setHeader('Content-Type', 'text/csv');
    const csvStream = (0, format_1.format)({ headers: true });
    (0, stream_1.pipeline)(csvStream, res, (err) => {
        if (err) {
            console.error('Pipeline failed', err);
            res.status(500).send('Error exporting CSV');
        }
    });
    data.forEach((row) => csvStream.write(row));
    csvStream.end();
};
const borrowed_books_routes = (app) => {
    app.get("/borrow", index);
    app.get("/borrow/borrowed_books", authorize_1.authorization, get_borrowed_books_by_user);
    app.post("/borrow", authorize_1.authorization, borrow_book);
    app.post("/borrow/return/:book_id", authorize_1.authorization, return_book);
    app.get("/borrow/overdue", get_overdue_borrowed_books);
    app.get("/borrow/borrowing_processes", get_borrowing_processes);
    app.get("/borrow/borrowing_processes/last_month", get_last_month_borrowing_processes);
    app.get("/borrow/overdue_processes/last_month", get_last_month_overdue_processes);
};
exports.default = borrowed_books_routes;
