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
const books_1 = require("../models/books");
const store = new books_1.Books();
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const books = yield store.index();
        res.json(books);
    }
    catch (err) {
        console.log(err);
    }
});
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const book = yield store.create(req.body.title, req.body.author, req.body.isbn, req.body.available_quantity, req.body.shelf_location);
        res.json(book);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("Something went wrong while creating the book");
    }
});
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const book = yield store.update(id, req.body.title, req.body.author, req.body.isbn, req.body.available_quantity, req.body.shelf_location);
        if (book == null) {
            res.status(400);
            res.json("Please provide correct key names in body");
            return;
        }
        res.json(book);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("Cant update book");
    }
});
const delete_book = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        console.log(id);
        const book = yield store.delete(id);
        res.json(book);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("Cant delete book");
    }
});
const search_books = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, author, isbn } = req.query;
        const results = yield store.search_books(title, author, isbn);
        res.json(results);
    }
    catch (err) {
        res.status(500);
        console.log(err);
        res.json("something went wrong while searching books");
    }
});
const books_routes = (app) => {
    app.get("/books", index);
    app.get("/books/search", search_books);
    app.delete("/books/:id", delete_book);
    app.put("/books/:id", update);
    app.post("/books", create);
};
exports.default = books_routes;
