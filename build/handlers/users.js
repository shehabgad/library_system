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
const users_1 = require("../models/users");
const authorize_1 = require("../middlewares/authorize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const store = new users_1.Users();
const TOKEN_SECRET = process.env.TOKEN_SECRET + '';
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield store.index();
        res.json(users);
    }
    catch (err) {
        console.log(err);
        throw new Error("something went wrong");
    }
});
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield store.create(req.body.username, req.body.email, req.body.password);
        const token = jsonwebtoken_1.default.sign({ User: user }, TOKEN_SECRET);
        res.json(token);
    }
    catch (err) {
        res.status(400);
        res.json("Bad Request: you entered a duplicate username or email");
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield store.login(req.body.username, req.body.password);
        if (user !== null) {
            const token = jsonwebtoken_1.default.sign({ User: user }, TOKEN_SECRET);
            res.json(token);
        }
        else {
            res.json('username or password is incorrect');
        }
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("cant login");
    }
});
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.body.username;
        const user = yield store.update(username, req.body.email, req.body.password);
        res.json(user);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("Cant update user");
    }
});
const delete_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.body.username;
        console.log(username);
        const user = yield store.delete(username);
        res.json(user);
    }
    catch (err) {
        console.log(err);
        res.status(500);
        res.json("Cant delete user");
    }
});
const users_routes = (app) => {
    app.post('/users/signup', signup);
    app.post('/users/login', login);
    app.put('/users', authorize_1.authorization, update);
    app.delete('/users', authorize_1.authorization, delete_user);
    app.get("/users", index);
};
exports.default = users_routes;
